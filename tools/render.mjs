// Render pages without the app's browser pane: a headless Chrome of its own (its own profile folder, its own port),
// so several can run at once and nothing depends on a visible tab.
//   node tools/render.mjs "page=verse2&t=1,5.5"            stills  -> <frames>/verse2_t1_00.png ...
//   node tools/render.mjs "page=verse2&capture=1"          the whole page -> <frames>/verse2/f%05d.png
//   node tools/render.mjs "page=a&t=1" "page=b&t=2"        several, one after another in the same Chrome
// The preview server must be up (python web/serve.py; it is what saves the PNGs, into ./frames or $KOKORO_FRAMES).
// Exit code 1 on a page error. Environment: CHROME (path to chrome), BASE (default http://localhost:8765/page.html?).
// Node 22 or later (global fetch and WebSocket). The clean-up at the end uses PowerShell (Windows).
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE || 'http://localhost:8765/page.html?';
const jobs = process.argv.slice(2); if (!jobs.length) { console.error('usage: node tools/render.mjs "page=NAME&t=..." ...'); process.exit(2); }
const port = 9300 + Math.floor(Math.random() * 600), dir = mkdtempSync(join(tmpdir(), 'kokoro-render-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, '--window-size=1920,1080', '--no-first-run', '--no-default-browser-check',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let code = 0;
try {
  let list = null;
  for (let i = 0; i < 60 && !list; i++) { await sleep(250); try { list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch (e) { /* not up yet */ } }
  if (!list) throw new Error('Chrome did not start');
  for (const job of jobs) {
    const t0 = Date.now(), tab = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = no; });
    let id = 0; const wait = new Map(), errs = [];
    ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && wait.has(d.id)) { wait.get(d.id)(d.result); wait.delete(d.id); }
      if (d.method === 'Runtime.exceptionThrown') errs.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
      if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errs.push(d.params.args.map(a => a.value ?? a.description).join(' ')); };
    const send = (method, params = {}) => new Promise(ok => { wait.set(++id, ok); ws.send(JSON.stringify({ id, method, params })); });
    await send('Runtime.enable'); await send('Page.enable');
    await send('Page.navigate', { url: BASE + job });
    let done = false, hud = '';
    for (let i = 0; i < 2400 && !done && !errs.length; i++) {               // up to 20 minutes
      await sleep(500);
      const r = await send('Runtime.evaluate', { expression: 'JSON.stringify([!!(window.film && window.film.done), document.getElementById("hud")?.textContent || ""])', returnByValue: true });
      try { [done, hud] = JSON.parse(r.result.value); } catch (e) { /* page still loading */ }
    }
    console.log(`${job}: ${done ? 'ok' : 'FAILED'}  ${hud}  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
    for (const e of errs) console.log('   error: ' + String(e).split('\n').slice(0, 3).join(' | '));
    if (!done) code = 1;
    ws.close(); await fetch(`http://127.0.0.1:${port}/json/close/${tab.id}`).catch(() => {});
  }
} catch (e) { console.error(String(e)); code = 1; }
// close the browser itself (the process we started is only a launcher: killing it leaves the real browser and its children,
// and hundreds piled up once); then stop anything still running on this run's own profile folder
try { const v = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); const bw = new WebSocket(v.webSocketDebuggerUrl); await new Promise((ok, no) => { bw.onopen = ok; bw.onerror = no; }); bw.send(JSON.stringify({ id: 1, method: 'Browser.close' })); await sleep(700); } catch (e) { /* already gone */ }
const tag = dir.split(/[\/]/).pop();
await new Promise(r => { const k = spawn('powershell', ['-NoProfile', '-Command', `Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { $_.CommandLine -like '*${tag}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`], { stdio: 'ignore' }); k.on('exit', r); k.on('error', r); });
chrome.kill(); await sleep(1200);
await new Promise(r => { const k = spawn('powershell', ['-NoProfile', '-Command', `Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { $_.CommandLine -like '*${tag}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`], { stdio: 'ignore' }); k.on('exit', r); k.on('error', r); });
await sleep(400); try { rmSync(dir, { recursive: true, force: true }); } catch (e) { /* Chrome may still hold a file: the folder is in the temp directory */ }
process.exit(code);
