// Record which character cards every frame of the pages draws (for tools/audit_swaps.py).
//   node tools/audit_swaps.mjs [page ...]        (no names: every page; each page in its own headless Chrome, all at once -
//                                                 on a machine short of memory give one page at a time)
// Needs the preview server (python web/serve.py; URL in $KOKORO_URL, default http://localhost:8765). Nothing is saved but
// the records: <frames>/audit/cards_<page>.json  (<frames>: ./frames or $KOKORO_FRAMES)
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(process.env.KOKORO_FRAMES || resolve(HERE, '..', 'frames'), 'audit');
const URL0 = (process.env.KOKORO_URL || 'http://localhost:8765').replace(/\/$/, '');
const PAGES = ['open', 'verse1', 'ages', 'know', 'chorus1', 'wonder', 'verse2', 'say', 'thanks', 'finale', 'outro'];
const want = process.argv.slice(2).length ? process.argv.slice(2) : PAGES;
const probe = readFileSync(join(HERE, 'audit_swaps_probe.js'), 'utf8');
mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function one(name) {
  const port = 9300 + Math.floor(Math.random() * 600), dir = mkdtempSync(join(tmpdir(), 'kokoro-audit-'));
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, '--window-size=1920,1080', '--no-first-run', '--no-default-browser-check',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });
  const t0 = Date.now(); let ok = false;
  try {
    let list = null;
    for (let i = 0; i < 60 && !list; i++) { await sleep(250); try { list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch (e) { } }
    if (!list) throw new Error('Chrome did not start');
    const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise((a, b) => { ws.onopen = a; ws.onerror = b; });
    let id = 0; const wait = new Map();
    ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && wait.has(d.id)) { wait.get(d.id)(d); wait.delete(d.id); } };
    const send = (method, params = {}) => new Promise(a => { wait.set(++id, a); ws.send(JSON.stringify({ id, method, params })); });
    await send('Page.enable');
    await send('Page.navigate', { url: `${URL0}/__audit_blank` }); await sleep(1500);
    const r = await send('Runtime.evaluate', { expression: `(${probe})(${JSON.stringify(name)}, 24)`, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 600));
    const s = r.result?.result?.value; if (!s) throw new Error('no result ' + JSON.stringify(r).slice(0, 400));
    writeFileSync(join(OUT, `cards_${name}.json`), s);
    const j = JSON.parse(s); ok = true;
    console.log(`${name}: ${j.frames.length} frames, ${j.errors.length} draw errors, 3D ${JSON.stringify(j.dbg)} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    for (const e of j.errors.slice(0, 3)) console.log('   ' + e.join(' '));
    ws.close();
  } catch (e) { console.log(`${name}: FAILED ${e}`); }
  try { const v = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); const bw = new WebSocket(v.webSocketDebuggerUrl); await new Promise((a, b) => { bw.onopen = a; bw.onerror = b; }); bw.send(JSON.stringify({ id: 1, method: 'Browser.close' })); await sleep(700); } catch (e) { }
  const tag = dir.split(/[\\/]/).pop();
  await new Promise(r => { const k = spawn('powershell', ['-NoProfile', '-Command', `Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { $_.CommandLine -like '*${tag}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`], { stdio: 'ignore' }); k.on('exit', r); k.on('error', r); });
  chrome.kill(); await sleep(500); try { rmSync(dir, { recursive: true, force: true }); } catch (e) { }
  return ok;
}
const res = await Promise.all(want.map(one));
process.exit(res.every(Boolean) ? 0 : 1);
