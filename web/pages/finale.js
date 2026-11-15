// The fourth アリガトウ, and what the band plays after it (227.4 - 253.8 s): the heart, all of it lit.
//   F1  (k484 - 500) the room the heart first moved in, all lit. From her face (thanks.js ends on it) the camera draws
//       back to her knees: she opens her arms, lifts them, opens them to us (the wind moves her once), puts a hand to her heart and looks up.
//       The two lines stand on dark tapes at the frame's sides: アリガトウ / 永遠に歌う.
//   k500 the page turns: the room is turned over from the right like a leaf, and under it is a page of his drawings.
//   F2  navy, the blueprint grid, a floor. The character is drawn on the page as a plan, four hatched strokes. She walks
//       in; the sheets of his record go past her and fill the plan a stroke a bar: 心 - all but the last stroke.
//       (k516, nearer) she holds up his last sheet under the empty stroke; she lets it go; it flies up into it; and
//       from there the whole character turns yellow, at once (a flash, a knock, rings). She puts her hands to her heart.
//       It beats with the band; after the last chord by itself, three times, slower and weaker. The camera comes up
//       behind her: the character stays the size it is on the page, she grows.
//   F3  (k537.5, the music box's first note) the character comes apart from the top down and its sheets flow to her
//       and into her, into her chest; when the last is in, her heart lights once; she looks back over her shoulder.
//       (Cut to her face: outro.js)
// The room, the sheets and the tools are chorus 1's (chorus1.js: stage). Beats: 20.016 + k * 0.42858 s.
import { W, H, K, clamp, mix, smooth, out3, out5, rnd, hit, lyrics, line, column, text, grid, shake, img, pic, fig, dayMark, windFrame, echoTimes, stampOf, ariReps, ARI_T } from './kit.js';
import { prepare as prepareStage, stage as G } from './chorus1.js';
import { prepareHeart, drawHeart, handWorld } from './finale_heart.js';
import { drawReport } from './report.js';
import { drawRa, arrived, T_LAST } from './finale_ra.js';
export const name = 'finale';
const { kt, kbOf } = G, PB = 0.42858, F1B = 1 / 24 / PB;       // a frame, in beats
export const start = kt(484);
const T_END = 253.80, T_BOX = 250.38;
export const duration = T_END - start;
const KF2 = 500, KLAND = [504, 508, 512], KUP = 516, KTOSS = 518, KLIT = 520, KHANDS = 522, KOUT = 528, KEV = 502, KTURN = 0.75;
const KBOX = (T_BOX - 20.016) / PB;                             // 537.5: the music box's first note
const KGLOW = KBOX, KBACK = KBOX;                               // the last sheet is in on the music box's first note: her heart lights; she looks back
const LATE = [[528, 0.15]];                                     // the last chord: the last large beat
const T_FLOW = kt(528) + 0.2, FLOWDUR = 2.95, KSIDE = 532, KPRESS = 535, KFACE = 522;   // k522 - 528: her face, near, under its light   // half way, the side of her: she takes it in her hands (fh_1); then to her chest (fh_2)                   // then at once it goes into her, from the top down; its edge torn, not straight
const HS = 0.6, CW = 0.18, CH = 0.255, ROWS = 48, ZH = -9, YH = 10;     // a sheet's scale; a square of the character (m); its rows; its plane; its centre's height
const HX = 960, HY = 322, HPX = 522;                           // where the character stands on the page, and how tall: it does not move
const S1 = HPX / (ROWS * CH);                                  // pixels a metre in the character's plane
// F1: her acting, one line that never goes back to a drawing it has left, every drawing at least two beats;
// r11 (fix11, 3): in every held pose (marked ~) the wind goes through her hair, bow, scarf and skirt as a drawn loop of
// eight, three frames each, unbroken (kit.js windFrame; the drawings are loaded with chorus1's stage); up_w1 / cb_w1 gone
const SHE = [[484, 'up_a~'], [486, 'up_b'], [488, 'up0~'], [492.5, 'cd_a~'], [494.5, 'cb_out~']];
const TBW = ['tb_c1', 'tb_c1p1', 'tb_p1', 'tb_p1c2', 'tb_c2', 'tb_c2p2', 'tb_p2', 'tb_p2c1'];
const KWALK = [500, 508], ZWALK = 2.0;                          // she walks in, two drawings a beat, and stops on the second stroke
const pick = (A, kb) => { let n = A[0][1]; for (const [k, v] of A) if (kb >= k - 1e-6) n = v; return n; };
let AR = [], AREP = [], LA = [], LU = [], EV = [], CELLS = [], V2 = null, GL = null, OC = null, OL = null, MK = null;
export async function prepare() {
  await prepareStage(); const all = await lyrics();
  AR = all.filter(l => l.text.replace(/[\s　]/g, '').startsWith('アリガトウ')).map(l => l.chars.filter(ch => ch.c.trim() && ch.c !== '　'))[3].slice(0, 5);
  EV = line('永遠に歌う');
  // v12b: measured on the vocal stem - the fourth アリガトウ sung the second time, then after 永遠に歌う the pair twice
  // (234 - 238 s): each typed again on its tape, a square a syllable
  AREP = [...ariReps(AR, ARI_T[3].slice(1)), ...ariReps(AR, ARI_T[4])];   // v12c: line 4's 2nd - 4th times, then the pair twice (234 s), as tapped
  // then she sings without words: ラ ラ ラ ラ ラ (238.4) and ウ ラ ラ ウ ラー (241.8; the last ラ held to 247.4): on the right tape
  LA = [238.45, 238.78, 239.02, 239.30, 239.62].map(t => ({ c: 'ラ', t }));
  LU = [['ウ', 241.77], ['ラ', 242.23], ['ラ', 242.60], ['ウ', 243.47], ['ラ', 244.35], ['ー', 244.95]].map(([c, t]) => ({ c, t }));
  V2 = await (await fetch('data/cards/v2.json?' + Date.now())).json();
  heart();
  for (const n of [...TBW, 'tb0', 'tr_2', 'tr0', 'tk_h', 'tk_l2', 'en_s', 'en_c']) { for (let r = 0; ; r++) { try { await img(n); break; } catch (e) { if (r > 3) throw e; await new Promise(z => setTimeout(z, 400)); } } }
  await prepareHeart({ kt, PB, KLAND, KUP, KTOSS, KLIT, KOUT, T_FLOW, FLOWDUR, V2 });
  for (const n of ['cb_up', 'cb_down', 'fh_1', 'fh_2', 'en_o', 'en_s', 'en_c', 'en_n']) { try { await img(n); } catch (e) { /* not drawn yet */ } }
  OC = document.createElement('canvas'); OC.width = W; OC.height = H;
  OL = document.createElement('canvas'); OL.width = W; OL.height = H; MK = document.createElement('canvas'); MK.width = W; MK.height = H;
}

// ---- 心: the character (Mincho X), measured once. GL holds it as pictures the size of its box:
//   yellow (the whole of it, smooth), plan[k] (stroke k as a plan: hatched, outlined), plan dashed (two phases), and
//   CELLS: the squares of a grid over it that are ink -> [x, y (m, in its plane), stroke, screen x, screen y]
function heart() {
  const S = 1600, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d');
  x.fillStyle = '#fff'; x.font = `400 ${S * 0.8}px "Mincho X"`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('心', S / 2, S / 2);
  const d = x.getImageData(0, 0, S, S).data; let x0 = S, x1 = 0, y0 = S, y1 = 0;
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) if (d[(j * S + i) * 4 + 3] > 128) { x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, j); y1 = Math.max(y1, j); }
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1, COLS = Math.round(bw / bh * ROWS * CH / CW);
  const inkAt = (px, py) => d[(Math.floor(py) * S + Math.floor(px)) * 4 + 3] > 128;
  const on = [];
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
    let s = 0; for (let v = 0; v < 4; v++) for (let u = 0; u < 4; u++) s += inkAt(x0 + (i + (u + 0.5) / 4) * bw / COLS, y0 + (j + (v + 0.5) / 4) * bh / ROWS) ? 1 : 0;
    on.push(s >= 8);
  }
  const lab = on.map(() => -1), groups = [];
  for (let s = 0; s < on.length; s++) if (on[s] && lab[s] < 0) {
    const q = [s], g = []; lab[s] = groups.length;
    while (q.length) { const p = q.pop(), i = p % COLS, j = Math.floor(p / COLS); g.push([i, j]); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) { const u = i + a, v = j + b, r = v * COLS + u; if (u >= 0 && u < COLS && v >= 0 && v < ROWS && on[r] && lab[r] < 0) { lab[r] = groups.length; q.push(r); } } }
    groups.push(g);
  }
  const big = groups.filter(g => g.length >= 12), cx = g => g.reduce((s, q) => s + q[0], 0) / g.length;
  big.sort((a, b) => b.length - a.length);
  const hook = big[0], dots = big.slice(1, 4).sort((a, b) => cx(a) - cx(b));
  const order = [dots[0], hook, dots[1], dots[2]];             // left dot, the hook, the top dot, the right dot: the order it is written
  const Wpx = COLS * CW * S1, Hpx = ROWS * CH * S1;
  CELLS = [];
  order.forEach((g, k) => g.forEach(([i, j]) => CELLS.push([(i - COLS / 2 + 0.5) * CW, YH + (ROWS / 2 - j - 0.5) * CH, k, HX + (i + 0.5 - COLS / 2) * CW * S1, HY + (j + 0.5 - ROWS / 2) * CH * S1])));
  // each stroke's own area of the picture: its squares' hull, a square wider all round
  const hulls = order.map(g => {
    const P = []; for (const [i, j] of g) for (const [a, b] of [[-1, -1], [2, -1], [2, 2], [-1, 2]]) P.push([(i + a) * bw / COLS, (j + b) * bh / ROWS]);
    P.sort((p, q) => p[0] - q[0] || p[1] - q[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = []; for (const p of P) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of P.slice().reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  });
  const pic = (fill, k) => { const c = document.createElement('canvas'); c.width = bw; c.height = bh; const y = c.getContext('2d');
    if (k != null) { y.beginPath(); hulls[k].forEach(([a, b], n) => n ? y.lineTo(a, b) : y.moveTo(a, b)); y.closePath(); y.clip(); }
    y.drawImage(cv, -x0, -y0); y.globalCompositeOperation = 'source-in'; fill(y); return c; };
  const yellow = pic(y => { y.fillStyle = K.yellow; y.fillRect(0, 0, bw, bh); });
  // a plan of a stroke: K.blue, hatched across in navy, its edge in a line (solid, or dashed in two phases)
  const sc = bw / Wpx;                                          // picture pixels a screen pixel
  const plan = (k, dash) => {
    const body = pic(y => { y.fillStyle = K.blue; y.fillRect(0, 0, bw, bh); y.globalCompositeOperation = 'source-atop'; y.strokeStyle = K.navy; y.lineWidth = 3 * sc; for (let t = -bh; t < bw; t += 14 * sc) { y.beginPath(); y.moveTo(t, bh); y.lineTo(t + bh, 0); y.stroke(); } }, k);
    // the edge: the stroke's ink less the same ink moved in by the line's width, in yellow
    const c = document.createElement('canvas'); c.width = bw; c.height = bh; const y = c.getContext('2d');
    const m = pic(z => { z.fillStyle = K.yellow; z.fillRect(0, 0, bw, bh); }, k);
    const E = document.createElement('canvas'); E.width = bw; E.height = bh; const ex = E.getContext('2d'), e = 3 * sc;
    ex.drawImage(m, 0, 0); ex.globalCompositeOperation = 'destination-in';
    for (const [a, b] of [[e, 0], [-e, 0], [0, e], [0, -e], [e * 0.7, e * 0.7], [-e * 0.7, -e * 0.7], [e * 0.7, -e * 0.7], [-e * 0.7, e * 0.7]]) ex.drawImage(m, a, b);
    y.drawImage(m, 0, 0); y.globalCompositeOperation = 'destination-out'; y.drawImage(E, 0, 0);
    if (dash != null) { y.globalCompositeOperation = 'destination-out'; y.fillStyle = '#000'; const L = 13 * sc; for (let t = -bh + dash * L; t < bw + bh; t += 2 * L) { y.beginPath(); y.moveTo(t, 0); y.lineTo(t + L, 0); y.lineTo(t + L - bh, bh); y.lineTo(t - bh, bh); y.closePath(); y.fill(); } }
    const out = document.createElement('canvas'); out.width = bw; out.height = bh; const o = out.getContext('2d'); o.drawImage(body, 0, 0); o.drawImage(c, 0, 0); out.rim = c; return out;
  };
  GL = { bw, bh, Wpx, Hpx, yellow, white: pic(y => { y.fillStyle = K.white; y.fillRect(0, 0, bw, bh); }), plans: [0, 1, 2].map(k => plan(k)), empty: [plan(3, 0), plan(3, 1)], dotFill: pic(y => { y.fillStyle = K.yellow; y.fillRect(0, 0, bw, bh); }, 3) };
  const last = CELLS.filter(q => q[2] === 3);
  GL.dot = [last.reduce((s, q) => s + q[0], 0) / last.length, last.reduce((s, q) => s + q[1], 0) / last.length];
  GL.dotS = [last.reduce((s, q) => s + q[3], 0) / last.length, last.reduce((s, q) => s + q[4], 0) / last.length];
  GL.dotW = (Math.max(...last.map(q => q[0])) - Math.min(...last.map(q => q[0])) + CW);
  // the paper the strokes are made of: whole sheets, of several sizes and angles, laid over each stroke (a sheet for
  // every few squares, on a square of it chosen at random); the outline trims them
  GL.pieces = []; CELLS.forEach((q, i) => { if (rnd(i * 1.7 + 3) > 0.12) return; GL.pieces.push([q[3] + (rnd(i + 31) - 0.5) * 8, q[4] + (rnd(i + 32) - 0.5) * 8, 26 + 34 * rnd(i + 33), (rnd(i + 34) - 0.5) * 1.2, q[2], i]); });
}
const drawGL = (c, im, sc = 1) => { c.save(); c.translate(HX, HY); c.scale(sc, sc); c.drawImage(im, -GL.Wpx / 2, -GL.Hpx / 2, GL.Wpx, GL.Hpx); c.restore(); };

// ---- the lines on their tapes (screen space): the tape runs down with the characters as they are sung
function tape(c, chars, T, x, y0, size, font, side, wipe = 0) {
  const lead = 1.08, pad = size * 0.32, tw = size * 1.42;
  let len = 0;
  chars.forEach((ch, i) => { const a = T - ch.t; if (a >= 0) len = Math.max(len, mix(i * size * lead, (i + 1) * size * lead, out3(a / 0.12)) + pad * 2); });
  if (len <= 0) return;
  const top = y0 - pad, keep = len * (1 - out3(wipe));
  if (keep <= 1) return;
  c.save(); c.beginPath(); c.rect(x - tw / 2 - 10, top + len - keep, tw + 20, keep + 4); c.clip();
  c.fillStyle = K.navy; c.fillRect(x - tw / 2, top, tw, len);
  c.fillStyle = K.yellow; c.fillRect(side > 0 ? x + tw / 2 : x - tw / 2 - 6, top, 6, len);
  column(c, chars, T, x, y0, size, { font, color: K.yellow, lead, amt: 0.3 });
  if (chars === AR) chars.forEach((ch, n) => {                  // v12: typed again while she holds the note: a knock, white, back to yellow
    const st = stampOf(AR, n, AREP, T); if (!st || !st.rep || st.age > 0.3) return;
    const y = y0 + size / 2 + n * size * lead, k = 1 + 0.25 * Math.exp(-st.age * 12);
    c.save(); c.translate(x, y); c.scale(k, k); c.fillStyle = K.navy; c.fillRect(-tw / 2 + 6, -size * lead / 2, tw - 12, size * lead);
    text(c, ch.c, 0, 0, size, { font, color: st.age < 0.14 ? K.paper : K.yellow, align: 'center', base: 'middle' }); c.restore();
  });
  c.restore();
}
const TX = [236, 1684], TY = 150, TS = 92;                    // the two tapes: where, from where down, how large

function f1(c, kb, T, tapes = true) {
  const u = clamp((kb - 484) / 4), v = clamp((kb - 488) / 12);
  // from her face, straight back to her knees in a bar; then nearer, slowly
  const fy = 1.6414 - 0.28;                                     // r11: her face as before (the redrawn up canvas is taller: hair)
  // v8b: back to the whole of her, her boots and 0.1 m of floor in the frame (not cut at the shins); then a little nearer
  const H1 = 2.3, H2 = 2.2, h = kb < 488 ? mix(0.8, H1, out3(u)) : mix(H1, H2, smooth(v)), cy = kb < 488 ? mix(fy, H1 / 2 - 0.1, out3(u)) : h / 2 - 0.1;
  G.cam.clearViewOffset();
  G.frontal(36, 0, cy, h, 0, cy);
  const p = pick(SHE, kb + F1B), n = p.endsWith('~') ? windFrame(p.slice(0, -1), T, G.has) : p;
  G.setHer(n, 0, 0); G.shadow.material.color.set(K.navy); G.shadow.material.opacity = 0.4;
  // few sheets, and none near her: an oval round her drawing (its size from v2.json) and 0.5 m more is kept clear
  const S = V2[n.split('_')[0].replace(/\d+$/, '')], hw = S.h * S.px[0] / S.px[1], c0 = G.proj(0, S.h * 0.55, 0), c1 = G.proj(hw * 0.5 + 0.5, S.h * 0.55 + S.h * 0.5 + 0.5, 0);
  const rx = Math.abs(c1[0] - c0[0]), ry = Math.abs(c1[1] - c0[1]);
  const clear = s => { const q = G.proj(...s.p); return ((q[0] - c0[0]) / rx) ** 2 + ((q[1] - c0[1]) / ry) ** 2 > 1; };
  const st = G.stormT(1.6 + (kb - 484) * PB, true, -1), back = st.back.filter((s, i) => i % 8 === 0 && clear(s));
  G.roomLit(c, back, true);
  G.mid(c, -0.3, () => { G.heartLine(c, kb, 114, K.yellow, 1.6); G.rings(c, kb, 0, -114, 56, K.yellow, 1.6); });
  G.pass(c, { her: true });
  const front = st.front.filter(clear); if (front.length) G.pass(c, { sheets: front });
  if (tapes) { tape(c, AR, T, TX[0], TY, TS, 'Dela', 1); tape(c, EV, T, TX[1], TY, TS, 'Mincho X', -1); }
}

// ---- F2: the camera is worked out from where things are to be on the page. The character stands still on the page
// (HX, HY, HPX); she is hp pixels tall with her feet at yf; she stands zh metres from its plane's front.
function herOnPage(kb) {                                       // -> [her height px, her head's top]
  const seg = (k0, k1, a, b, f = smooth) => { const e = f(clamp((kb - k0) / (k1 - k0))); return [mix(a[0], b[0], e), mix(a[1], b[1], e)]; };
  if (kb < 508) return seg(500, 508, [724, 326], [332, 688], e => e);
  if (kb < 515) return seg(508, 515, [332, 688], [300, 708]);
  if (kb < KUP + 0.5) return seg(515, KUP + 0.5, [850, 714], [880, 712]);         // v8b: cut in on 515 to her and his last sheet (a push through her shins read as feet cut off), then slowly nearer
  if (kb < KLIT) return seg(KUP + 0.5, KLIT, [880, 712], [905, 706], e => e);
  if (kb < KOUT) return seg(KLIT, KOUT, [905, 706], [1180, 610]);            // up behind her; there on the last chord
  if (kb < KBOX) return seg(KOUT, KBOX, [1180, 610], [1040, 640]);           // back a little: the sheets go into her
  return seg(KBOX, 545.6, [1750, 260], [2050, 170]);              // v8: (a cut from the side) near behind her, her head and shoulders filling the frame, not small at its foot
}
const herZ = kb => ZWALK * (1 - clamp((kb - KWALK[0]) / (KWALK[1] - KWALK[0])));
let CAM = null;
function camera(kb) {
  const [hp, ht] = herOnPage(kb), zh = herZ(kb), yf = ht + hp, s2 = hp / V2.tb.h;
  const zc = (s2 * zh - ZH * S1) / (s2 - S1), F = S1 * (zc - ZH), yc = (yf - HY - YH * S1) / (s2 - S1), cy = yf - yc * s2;
  const cam = G.cam; cam.fov = 2 * Math.atan(H / 2 / F) * 180 / Math.PI; cam.position.set(0, yc, zc); cam.lookAt(0, yc, zc - 1);
  cam.setViewOffset(W, H, 0, H / 2 - cy, W, H); cam.updateMatrixWorld();
  CAM = { zc, F, yc, cy, zh, yf, hp, s2 };
}
// his last sheet on its way from her hand (a = 0) to the empty stroke (a = 1)
function tossAt(a) {
  const e = smooth(a), P0 = [0.234, 1.693, CAM.zh];
  return [mix(P0[0], GL.dot[0], e) + 0.9 * Math.sin(a * Math.PI), mix(P0[1], GL.dot[1], Math.pow(a, 0.8)) + 0.6 * Math.sin(a * Math.PI), mix(P0[2], ZH + 0.05, e)];
}
// a sheet of the character, let go tf seconds ago, on its way into her: down past her side, then in at the height of her
// chest, from the side, behind her; it reaches her in d seconds and is gone inside her outline
function inflow(q, i, tf, d) {
  const e = smooth(clamp(tf / d)), sg = q[0] + (rnd(i + 41) - 0.5) * 2 < 0 ? -1 : 1, ch = [sg * 0.1, 1.12 + 0.08 * rnd(i + 45), CAM.zh - 0.1];
  const m = [sg * (0.95 + 0.55 * rnd(i + 42)), 1.05 + 0.3 * rnd(i + 43), CAM.zh - 0.35 - 0.4 * rnd(i + 44)], u = 1 - e;
  const p = [0, 1, 2].map(a => u * u * [q[0], q[1], ZH][a] + 2 * u * e * m[a] + e * e * ch[a]);
  return { p, r: [0.5 * Math.sin(tf * 3 + i), 0.7 * Math.sin(tf * 2.3 + i), 0.6 * Math.sin(tf * 1.7 + i)], s: HS * (1 - 0.5 * e) };
}
// a sheet drawn flat: cream paper with a yellow edge (not the colour of her hair)
function flatSheet(c, sh) {
  const [rx, ry, rz] = sh.r, a = 0.15 * sh.s / HS * 0.42, b = 0.21 * sh.s / HS * 0.42, P = [];
  for (const [x0, y0] of [[-a, -b], [a, -b], [a, b], [-a, b]]) {
    let x = x0 * Math.cos(rz) - y0 * Math.sin(rz), y = x0 * Math.sin(rz) + y0 * Math.cos(rz), z = 0;
    [x, z] = [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)];
    [y, z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)];
    P.push(G.proj(sh.p[0] + x, sh.p[1] + y, sh.p[2] + z));
  }
  c.beginPath(); P.forEach((q, j) => j ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath();
  c.fillStyle = K.white; c.fill(); c.strokeStyle = K.yellow; c.lineWidth = 2.5; c.stroke();
}

function f2(c, kb, T) {
  camera(kb);
  const lit = kb >= KLIT, box = T >= T_FLOW;
  const sk = lit ? shake((kb - KLIT) * PB, 16) : [0, 0];
  c.fillStyle = K.navy; c.fillRect(0, 0, W, H);
  c.save(); c.translate(sk[0], sk[1]);
  grid(c, K.paper, 40, 0.07);
  // the floor she stands on, and her shadow on it
  const yf = Math.round(CAM.yf);
  if (yf < H + 40) { c.fillStyle = K.deep; c.fillRect(-40, yf, W + 80, H - yf + 40); c.fillStyle = K.paper; c.globalAlpha = 0.45; c.fillRect(-40, yf - 1, W + 80, 3); c.globalAlpha = 1;
    c.fillStyle = K.navy; c.beginPath(); c.ellipse(HX, yf + 4, 0.32 * CAM.s2, 0.05 * CAM.s2, 0, 0, 7); c.fill(); }
  // the beat: with the band from the beat after it lit; then by itself, three times
  let pulse = 0, ringAt = [];
  if (kb >= KLIT + 1 && kb < KOUT) pulse = 0.08 * Math.exp(-((kb - KLIT) % 1) * 5);
  for (const [k, a] of LATE) if (kb >= k && !box) pulse += a * Math.exp(-(kb - k) * PB * 4);
  const sc = 1 + pulse;
  // ---- the plan, and the sheets filling it
  if (kb >= KEV - 1) {
    const a = clamp((kb - (KEV - 1)) / 1);
    c.save(); c.globalAlpha = a;
    GL.plans.forEach((p, k) => { if (kb < KLAND[k]) drawGL(c, p); });
    if (!lit) drawGL(c, GL.empty[Math.floor(kb * 2) % 2]);
    c.restore();
  }
  const far = [], near = [];
  const R = lit ? out3((T - kt(KLIT)) / 0.45) * 1100 : -1;   // how far from the stroke she filled the yellow has gone (screen px)
  const kept = [], keptSet = new Set(), flowing = [], landed = [];
  CELLS.forEach((q, i) => {
    const k = q[2];
    if (box) {
      // it lets go from the top down; the edge where it lets go is torn (each square a little earlier or later)
      const yf = (q[4] - (HY - GL.Hpx / 2)) / GL.Hpx, torn = 0.07 * Math.sin(q[3] * 0.045 + 1.3) + 0.05 * Math.sin(q[3] * 0.13) + 0.06 * rnd(i + 5);
      const rel = T_FLOW + clamp(yf + torn) * FLOWDUR, tf = T - rel, d = 0.6 + 0.35 * rnd(i + 6);
      if (tf > 0) { if (tf < d && i % 2 === 0) flowing.push(inflow(q, i, tf, d)); return; }
      kept.push(q); keptSet.add(i); return;
    }
    if (k === 3) return;                                       // the last stroke is hers
    if (lit && Math.hypot(q[3] - GL.dotS[0], q[4] - GL.dotS[1]) < R) return;
    const t1 = kt(KLAND[k]) - 0.3 * rnd(i + 0.7), dep = t1 - 1.6 - 1.0 * rnd(i + 0.3), ee = clamp((T - dep) / (t1 - dep)), a = Math.pow(ee, 2.6), sw = (1 - a) * (1 - a);
    const sx = (rnd(i + 1) < 0.5 ? -1 : 1) * (5.2 + rnd(i + 1.5) * 4), sy = 0.3 + rnd(i + 2) * 4.5, sz = -2.5 + rnd(i + 3) * 3.5;
    const here = ee >= 1, hk = here ? 1 + 0.4 * Math.exp(-(T - t1) * 9) : 1;
    // in its place a sheet lies a little askew, a little larger than its square (the outline of the character trims them)
    const s = { p: [mix(sx, q[0], a) + sw * 0.9 * Math.sin(T * 1.7 + i), mix(sy, q[1], a) + sw * 0.6 * Math.cos(T * 1.3 + i * 2), mix(sz, ZH, a)], r: here ? [0, 0, (rnd(i + 9) - 0.5) * 0.6] : [(1 - a) * 0.7 * Math.sin(i + T * 3), (1 - a) * 0.9 * Math.sin(i * 2 + T * 2.2), (1 - a) * Math.sin(i)], s: HS * hk * (here ? 1.25 : 1), v: Math.floor(rnd(i + 11) * 3), lit: true };
    if (here) landed.push(s); else (s.p[2] > CAM.zh - 0.3 ? near : far).push(s);
  });
  for (let i = 0; i < 40; i++) far.push({ p: [(rnd(i + 80) - 0.5) * 30, 1 + ((rnd(i + 81) * 19 + T * (0.2 + 0.3 * rnd(i + 82))) % 19), -5 - rnd(i + 83) * 12], r: [T * 0.7 + i, T * 0.5 + i * 2, i], s: HS, v: i % 3, lit: true });   // others, adrift
  G.pass(c, { sheets: far, shade: K.yellow });
  // the sheets in their places, trimmed to the outline of the character
  if (kb >= KLAND[0] - 1 && !(lit && T - kt(KLIT) > 0.45)) {            // (once the yellow has run over the whole character the paper under it is not drawn: when the yellow lets go, nothing is left behind)
    const o = OL.getContext('2d'); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-over'; o.clearRect(0, 0, W, H);
    let any = false;
    GL.pieces.forEach(([x, y, w, a, k, i]) => {
      if (k === 3 && !lit) return;
      const t1 = kt(KLAND[Math.min(k, 2)] ?? KLIT) - 0.3 * rnd(i + 0.7); if (k < 3 && T < t1) return; any = true;
      const sc = k < 3 ? hit(T - t1, 0.3, 10) || 1 : 1, h = w * 1.414;
      o.save(); o.translate(x, y); o.rotate(a); o.scale(sc, sc);
      o.fillStyle = K.white; o.fillRect(-w / 2, -h / 2, w, h); o.strokeStyle = K.blue; o.lineWidth = 1.5; o.strokeRect(-w / 2, -h / 2, w, h);
      o.fillStyle = K.blue; o.globalAlpha = 0.7; o.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h * 0.1); o.globalAlpha = 0.35; for (let j = 0; j < 3; j++) o.fillRect(-w / 2 + 5, -h / 2 + h * (0.3 + j * 0.16), (w - 10) * (j % 2 ? 0.6 : 0.9), 1.6); o.globalAlpha = 1;
      if (i % 5 === 0) { o.strokeStyle = K.red; o.lineWidth = 1.5; o.strokeRect(w * 0.05, h * 0.22, w * 0.36, h * 0.14); }
      o.restore();
    });
    if (any) { o.globalCompositeOperation = 'destination-in'; drawGL(o, GL.yellow); o.globalCompositeOperation = 'source-over'; c.drawImage(OL, 0, 0); }
  }
  // before she lifts it, the empty stroke shows where it is to go: it flashes twice
  if (!lit && [511.5, 513.5].some(k => kb >= k && kb < k + 0.25)) drawGL(c, GL.dotFill);
  // a stroke that is filled keeps its drawn edge: the sheets sit inside a clean line
  if (!lit && kb >= KEV - 1) GL.plans.forEach((p, k) => { if (kb >= KLAND[k]) drawGL(c, p.rim); });
  // ---- the character, lit: the whole of it, smooth and flat; it spreads from the stroke she filled
  if (lit && !box) {
    c.save();
    if (R < 1100) { c.beginPath(); c.arc(GL.dotS[0], GL.dotS[1], Math.max(1, R), 0, 7); c.clip(); }
    drawGL(c, T < kt(KLIT) + 0.09 ? GL.white : GL.yellow, sc); c.restore();
  } else if (box && kept.length) {
    // what is left of it: the character, smooth, where its squares are still in place (the torn edge is theirs)
    const o = MK.getContext('2d'); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-over'; o.clearRect(0, 0, W, H);
    o.fillStyle = '#000'; CELLS.forEach((q, i) => { if (!keptSet.has(i)) return; const a = (rnd(i + 21) - 0.5) * 0.9, w = CW * S1 * 1.5, h = CH * S1 * 1.5; o.save(); o.translate(q[3], q[4]); o.rotate(a); o.fillRect(-w / 2, -h / 2, w, h); o.restore(); });
    o.globalCompositeOperation = 'source-in'; drawGL(o, GL.yellow); o.globalCompositeOperation = 'source-over';
    c.drawImage(MK, 0, 0);
  }
  // the sheets on their way into her: drawn before her, so that she is in front of them
  for (const sh of flowing) flatSheet(c, sh);
  // the number of his last sheet, by the empty stroke, until it is filled: then OK
  if (kb >= KUP && kb < KLIT + 2) {
    const set = lit, k = hit(T - kt(KUP), 0.4, 12), x = GL.dotS[0] + GL.dotW * S1 * 0.5 + 40, y = GL.dotS[1] - 40;
    c.save(); c.globalAlpha = 1 - clamp((kb - KLIT - 1) / 1); c.translate(x, y); c.scale(k, k);
    c.fillStyle = set ? K.yellow : K.paper; c.fillRect(-30, -1.5, 22, 3);
    text(c, set ? 'OK' : 'No. 021169', 0, 11, 34, { font: set ? 'Dot' : 'Mono', color: set ? K.yellow : K.paper });
    c.restore();
  }
  // the way his sheet goes, drawn as it goes (dashed, as on his drawings); gone a beat after it lands
  if (false && kb >= KTOSS && kb < KLIT + 1.5) {              // v8b: not drawn - it ran through the character and looped wide; the sheet flies alone
    const a1 = clamp((kb - KTOSS) / (KLIT - KTOSS)), fade = 1 - clamp((kb - KLIT) / 1.5);
    c.save(); c.globalAlpha = fade; c.strokeStyle = K.yellow; c.lineWidth = 4; c.setLineDash([14, 10]); c.lineDashOffset = -T * 60; c.beginPath();
    for (let j = 0; j <= 40; j++) { const q = G.proj(...tossAt(a1 * j / 40)); j ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }
    c.stroke(); c.restore();
  }
  // rings: from the stroke she filled; the band's from the heart; the last chord's, large
  if (lit && T < T_FLOW + 2) {
    for (let j = 0; j < 3; j++) { const g = (kb - KLIT - j * 0.33) / 2.5; if (g < 0 || g >= 1) continue; c.save(); c.globalAlpha = 1 - g; c.strokeStyle = K.yellow; c.lineWidth = 10 * (1 - g) + 2; c.beginPath(); c.arc(GL.dotS[0], GL.dotS[1], 40 + g * 1000, 0, 7); c.stroke(); c.restore(); }
    if (kb >= KLIT + 1 && kb < KOUT) G.rings(c, kb, HX, HY, 420, K.yellow, 6);
    for (const [k, a] of LATE) { const g = (kb - k) / 4; if (g < 0 || g >= 1) continue; c.save(); c.globalAlpha = (1 - g) * clamp(a / 0.1); c.strokeStyle = K.yellow; c.lineWidth = 14 * (1 - g) * a / 0.15 + 2; c.beginPath(); c.arc(HX, HY, 300 + g * 1300, 0, 7); c.stroke(); c.restore(); }
  }
  // her heart lights when the last is in: a light behind her, seen round her outline
  if (kb >= KGLOW && kb < KGLOW + 4) {
    const g = (kb - KGLOW) / 4, p = G.proj(0, 1.15, CAM.zh - 0.05), r = 30 + 330 * Math.sin(Math.min(1, g * 2.2) * Math.PI / 2) * (1 - smooth((g - 0.35) / 0.4));
    for (let j = 0; j < 2; j++) { const gg = g - j * 0.2; if (gg < 0 || gg >= 1) continue; c.strokeStyle = K.yellow; c.lineWidth = 10 * (1 - gg) + 1; c.beginPath(); c.arc(p[0], p[1], 200 + gg * 700, 0, 7); c.stroke(); }
  }
  // ---- her
  let n = 'tb0', y0 = 0;
  if (kb < KWALK[1]) { n = TBW[Math.floor((kb - KWALK[0]) * 2 + 1e-6) % 8]; y0 = -(V2.tb.low[n] ?? 0); }
  else if (kb >= KUP && kb < KTOSS) n = 'tr_2';
  else if (kb >= KTOSS && kb < KHANDS) n = 'tr0';
  else if (kb >= KHANDS && kb < KBACK) n = 'tk_h';
  else if (kb >= KBACK) n = 'tk_l2';
  if (kb >= KTOSS && !lit) {                                    // his sheet, in flight: yellow, blank side to us, growing to the stroke's size
    const a = clamp((kb - KTOSS) / (KLIT - KTOSS));
    near.push({ p: tossAt(a), r: [0.3 * Math.sin(a * 9) * (1 - a), Math.PI + 0.5 * Math.sin(a * 6) * (1 - a), 0.25 * Math.sin(a * 7) * (1 - a)], s: mix(0.53, GL.dotW / 0.3 * 0.7, a * a), v: 0, lit: true, col: a > 0.45 ? K.yellow : null });   // paper as it leaves her hand; yellow half way
  }
  G.setHer(n, 0, y0, CAM.zh);
  G.pass(c, { her: true, shadow: false, sheets: near, shade: K.yellow });
  // (tr_2 is drawn with his last sheet printed in her hand: nothing is laid over it)
  c.restore();
  dayMark(c, 182621, { edge: K.navy });
  // the flash, when it lights (as the notes flash at the beginning)
  
  // the last line, carried over the page's edge; it goes when it has been sung out
  if (kb < KEV + 0.6) tape(c, EV, T, TX[1], TY, TS, 'Mincho X', -1, clamp((kb - KEV) / 0.5));
  G.cam.clearViewOffset();
}

// k532 - 537.5: from the side. She faces the character (to the left, above, out of the frame) with her head up and her
// hands held out together; the sheets come down to her hands and are gone into them; on k535 her hands go to her chest
// (fh_2) and the last of them go in there, and her chest lights, from behind her outline. (fh_1 / fh_2 by a10; until
// they are drawn cb_up / cb_down stand in.)
// k522 - 528: her face, near, from the front, looking up into the light of it: in tears; she smiles, she laughs, she
// shuts her eyes (r8, R2: three drawings, two beats each). The light comes down from above, a ring on every beat
const FACE_SEQ = [[522, 'en_n'], [524, 'en_s'], [526, 'en_c']];
function faceNear(c, kb, T) {
  c.fillStyle = K.navy; c.fillRect(0, 0, W, H); grid(c, K.paper, 40, 0.07);
  for (let j = 0; j < 3; j++) { const g = (((kb - KFACE) % 1) + j) / 3; if (kb - KFACE < j) continue; c.save(); c.globalAlpha = 1 - g; c.strokeStyle = K.yellow; c.lineWidth = 8 * (1 - g) + 1.5; c.beginPath(); c.arc(960, -260, 420 + g * 900, 0, 7); c.stroke(); c.restore(); }
  let n = FACE_SEQ[0][1]; for (const [k, m] of FACE_SEQ) if (kb >= k - 1e-6) n = m;
  if (!pic(n)) n = 'en_o';
  const z = mix(1.02, 1.08, (kb - KFACE) / (KOUT - KFACE)), h = 1420 * z;
  fig(c, n, 960, 1440 + (z - 1) * 520 + 20, h);
  dayMark(c, 182621, { edge: K.navy });
}
// fh (a10): 694 x 2097, boots centred at x 336, soles at y 2092. Her cupped hands in fh_1 at (75, 612); her hands on
// her chest in fh_2 at (250, 645). Waist up, large: the frame's bottom is about her waist
// (r9 redraw, 692 x 2099: boots centred at x 336, soles at y 2094; cupped hands (70, 620); hands on her chest (250, 642))
const FH = { boot: [336, 2094], hands: [70, 620], chest: [250, 642], px: [692, 2099] }, SIDE = { ppm: 1000, x: 1250, feet: 1947 };
function side(c, kb, T) {
  c.fillStyle = K.navy; c.fillRect(0, 0, W, H); grid(c, K.paper, 40, 0.07);
  const press = kb >= KPRESS, fh = !!pic('fh_1') && !!pic('fh_2'), n = fh ? (press ? 'fh_2' : 'fh_1') : (press ? 'cb_down' : 'cb_up');
  const z = mix(1.0, 1.05, (kb - KSIDE) / (KBOX - KSIDE)), k = SIDE.ppm * 0.000759240759 * z, bx = SIDE.x, by = SIDE.feet + (z - 1) * 700;
  const P = ([u, v]) => [bx + (u - FH.boot[0]) * k, by - (FH.boot[1] - v) * k];
  const hands = fh ? P(FH.hands) : [bx - 0.2 * SIDE.ppm, by - 1.2 * SIDE.ppm], chest = fh ? P(FH.chest) : [bx - 0.08 * SIDE.ppm, by - 1.17 * SIDE.ppm], to = press ? chest : hands;
  // her chest lights, behind her: the light comes round the front of her
  // rings from her chest, a ring a beat, thinner and fainter as they go out (behind her)
  if (press) for (let j = 0; j < 3; j++) { const g = (kb - KPRESS - j) / 2.2; if (g < 0 || g >= 1) continue; c.save(); c.globalAlpha = 1 - g; c.strokeStyle = K.yellow; c.lineWidth = 6 * (1 - g) + 1; c.beginPath(); c.arc(chest[0], chest[1], 40 + g * 520, 0, 7); c.stroke(); c.restore(); }
  if (fh) fig(c, n, bx + (FH.px[0] / 2 - FH.boot[0]) * k, by + (FH.px[1] - FH.boot[1]) * k, FH.px[1] * k);
  else { const g = V2[n.split('_')[0]]; fig(c, n, bx, by, g.h * SIDE.ppm * z); }
  if (press) { c.fillStyle = K.yellow; c.beginPath(); c.arc(chest[0] - 4, chest[1] + 34 * k / 0.76, 7, 0, 7); c.fill(); }   // the light: a small point under her hands
  // what she holds: the sheets that have come to her hands lie in them, a few; when her hands go to her chest they go with them
  const flown = i => kt(KSIDE) - 0.6 + i * 0.085 + 0.05 * rnd(i + 7) + 0.75 + 0.3 * rnd(i + 8);
  if (!press) { let m = 0; for (let i = 0; i < 46; i++) if (T > flown(i)) m++; for (let j = 0; j < Math.min(5, Math.ceil(m / 6)); j++) { c.save(); c.translate(hands[0] + 6 - j * 7, hands[1] - 8 - j * 4); c.rotate(-0.4 + j * 0.25); c.fillStyle = j % 2 ? '#dda93b' : K.yellow; c.fillRect(-20, -14, 40, 28); c.restore(); } }
  // the sheets: from up there (where the character was) to her hands, then her chest; smaller as they come; gone as they reach her
  for (let i = 0; i < 46; i++) {
    const t0 = kt(KSIDE) - 0.6 + i * 0.085 + 0.05 * rnd(i + 7), d = 0.75 + 0.3 * rnd(i + 8), a = (T - t0) / d;
    if (a < 0 || a >= 1) continue;
    const e = smooth(a), sx = -120 + 620 * rnd(i + 9), sy = -140 + 120 * rnd(i + 10), mx = mix(sx, to[0], 0.55) - 160 * rnd(i + 11), my = mix(sy, to[1], 0.2) + 80;
    const x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * mx + e * e * to[0], y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * my + e * e * to[1];
    const w = mix(80, 26, e), h = w * 1.4, r = 0.8 * Math.sin(T * 2.4 + i) * (1 - e);
    const cs = Math.cos(T * 1.9 + i); c.save(); c.translate(x, y); c.rotate(r); c.scale(Math.max(0.2, Math.abs(cs)), 1);
    c.fillStyle = cs > 0 ? K.yellow : '#dda93b'; c.fillRect(-w / 2, -h / 2, w, h); c.restore();   // c2: the heart's sheets, yellow side out (finale_heart.js), two tones as they turn
  }
  dayMark(c, 182621, { edge: K.navy });
}

// c2: k500 - 532 (but the face, k522 - 528): the sheets gather into 心 in the air above her (finale_heart.js)
const ZW2 = 0.7;
function f2h(c, kb, T) {
  let n = 'tb0', set = 'tb', low = V2.tb.low.tb0 ?? 0, hz = ZW2 * (1 - clamp((kb - KWALK[0]) / (KWALK[1] - KWALK[0])));
  if (kb < KWALK[1]) { n = TBW[Math.floor((kb - KWALK[0]) * 2 + 1e-6) % 8]; low = V2.tb.low[n] ?? 0; }
  else if (kb >= KUP && kb < KTOSS) { n = 'tr_2'; set = 'tr'; }
  else if (kb >= KTOSS && kb < KHANDS) { n = 'tr0'; set = 'tr'; }
  else if (kb >= KHANDS) { n = 'tk_h'; set = 'tk'; }
  if (set !== 'tb') low = V2[set].low[n] ?? 0;
  drawHeart(c, { kb, T, pose: n, set, low, herZ: hz, hand: handWorld(V2.tr, 0, 0, V2.tr.low.tr_2 ?? 0) });
  dayMark(c, 182621, { edge: K.navy });
  if (kb < KEV + 0.6) tape(c, EV, T, TX[1], TY, TS, 'Mincho X', -1, clamp((kb - KEV) / 0.5));
}


// ---------------------------------------------------------------- v12: the heart written in her song (finale_ra.js)
// One axis: the character over her, she under it. A (k500-516) wide: she walks in and stands; each note writes a stroke.
// B (516-522) nearer: ウ ラ ラ ウ light the strokes. C (522-528) her face, singing the last ラ, the character behind her.
// D (528 - the music box) it comes apart from the top down and runs into her. E (the music box) her heart lights; she looks back.
function raStage(c, kb, T) {
  c.fillStyle = K.navy; c.fillRect(0, 0, W, H); grid(c, K.paper, 40, 0.07);
  // one locked frame for A, B and D (a slow push in B): the character over her, she small under it on the centre line
  const RA = [960, 398, 640], ME = [960, 1016, 272];
  if (kb < 522 || (kb >= 528 && kb < KBOX)) {
    const z = kb < 516 ? 1 : kb < 522 ? mix(1, 1.035, smooth((kb - 516) / 6)) : 1;
    c.save(); c.translate(960, 560); c.scale(z, z); c.translate(-960, -560);
    if (kb < 522) {
      drawRa(c, RA[0], RA[1], RA[2], { T, plan: clamp((kb - 500.5) / 1.5) });
      let n = 'tb0', h = ME[2], yb = ME[1];
      if (kb < 504) { n = TBW[Math.floor((kb - 500) * 2 + 1e-6) % 8]; const u = smooth(clamp((kb - 500) / 4)); h = mix(430, ME[2], u); yb = mix(1170, ME[1], u); }
      fig(c, n, ME[0], yb, h);
    } else {
      const tx = ME[0], ty = ME[1] - ME[2] * 0.7, got = arrived(T);
      fig(c, 'tk_h', ME[0], ME[1], ME[2]);
      drawRa(c, RA[0], RA[1], RA[2], { T, target: [tx, ty] });
      if (got > 0) for (let j = 0; j < 2; j++) { const g = ((T * 1.2) + j / 2) % 1; c.save(); c.globalAlpha = (0.2 + 0.6 * got) * (1 - g); c.strokeStyle = K.yellow; c.lineWidth = 2 + 4 * got; c.beginPath(); c.arc(tx, ty, 20 + g * (60 + 120 * got), 0, 7); c.stroke(); c.restore(); }
    }
    c.restore();
    dayMark(c, 182621, { edge: K.navy });
  } else if (kb < 528) {
    // C: her face, singing the last ラ, then smiling; nothing behind her but the grid and the light coming down
    for (let j = 0; j < 3; j++) { const g = (((kb - 522) % 1) + j) / 3; if (kb - 522 < j) continue; c.save(); c.globalAlpha = 1 - g; c.strokeStyle = K.yellow; c.lineWidth = 8 * (1 - g) + 1.5; c.beginPath(); c.arc(960, -260, 420 + g * 900, 0, 7); c.stroke(); c.restore(); }
    const z = mix(1.0, 1.06, (kb - 522) / 6);
    fig(c, T < T_LAST + 1.25 ? 'en_s' : 'en_c', 960, 1440 + (z - 1) * 520 + 20, 1420 * z);
  } else {
    const a = T - T_BOX, z = mix(1, 1.04, clamp(a / 3.4)), h = 1900 * z, top = 170 - (z - 1) * 300, cx = 960, cy = top + h * 0.3;
    for (let j = 0; j < 3; j++) { const g = (a * 0.6 + j / 3) % 1; if (a < j * 0.55) continue; c.save(); c.globalAlpha = (1 - g) * 0.8; c.strokeStyle = K.yellow; c.lineWidth = 10 * (1 - g) + 2; c.beginPath(); c.arc(cx, cy, 160 + g * 900, 0, 7); c.stroke(); c.restore(); }
    fig(c, 'tk_l2', cx, top + h, h);
  }
  if (kb < KEV + 0.6) tape(c, EV, T, TX[1], TY, TS, 'Mincho X', -1, clamp((kb - KEV) / 0.5));
  lyricTapes(c, T);
}
// v12b: the アリガトウ tape stays on the left through the pair sung twice after 永遠に歌う; the ラ come on the right
function lyricTapes(c, T) {
  if (T < 238.35) tape(c, AR, T, TX[0], TY, TS, 'Dela', 1, clamp((T - 238.0) / 0.3));
  if (T >= 238.3 && T < 241.65) tape(c, LA, T, TX[1], TY, TS, 'Dela', -1, clamp((T - 241.3) / 0.3));
  if (T >= 241.6 && T < 246.3) tape(c, LU, T, TX[1], TY, TS, 'Dela', -1, clamp((T - 246.0) / 0.3));
}

// k500: the page turns over from the right. Under it, the page of his drawings (F2); the room is the leaf going over.
function turn(c, kb, T) {
  const e = smooth(clamp((kb - KF2) / KTURN)), fx = W + 60 - e * (W + 520), bw = Math.min(260, (W - fx) * 0.45);
  const o = OC.getContext('2d'); o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1;
  f1(o, KF2 - 0.001, kt(KF2 - 0.001), false);
  raStage(c, kb, T);
  c.save(); c.beginPath(); c.rect(0, 0, Math.max(0, fx - bw), H); c.clip(); c.drawImage(OC, 0, 0); c.restore();
  // the back of the leaf: plain paper, its ruled edge, a line where it folds
  if (fx - bw < W) {
    c.fillStyle = K.paper; c.fillRect(fx - bw, 0, bw, H);
    c.fillStyle = K.blue; c.globalAlpha = 0.5; for (let y = 60; y < H; y += 40) c.fillRect(fx - bw + 18, y, Math.max(0, bw - 36), 2); c.globalAlpha = 1;
    c.fillStyle = K.navy; c.fillRect(fx - bw - 3, 0, 6, H); c.fillRect(fx - 2, 0, 4, H);
  }
  tape(c, EV, T, TX[1], TY, TS, 'Mincho X', -1);
  tape(c, AR, T, TX[0], TY, TS, 'Dela', 1);
}

export function draw(c, t) {
  const T = t + start, kb = kbOf(T);
  if (kb < KF2) f1(c, kb, T); else if (kb < KF2 + KTURN) turn(c, kb, T); else raStage(c, kb, T);   // v12: the old sheets (f2h / faceNear / side / f2) are no longer drawn
}
