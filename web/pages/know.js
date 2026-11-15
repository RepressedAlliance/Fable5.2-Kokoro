// "I want to know" (74.87 - 94.5 s), in the archive the chorus happens in: blueprint, no light yet.
//   W1  from behind: she walks to the wall of his record, a step a beat;                          知リタイ アノ人が
//       F1  (k 131.5) her face, seen from inside the shelf: she looks up at all of it.
//   CL  (k 139.5) one volume, close: its label is his record, 記録 No.000001; 失敗 is stamped on it; the view pulls
//       back and the next labels go red one after another.                                        命の
//   W2  close behind her shoulder: her eyes go along the shelves, volume by volume; every one gets its red mark,
//       faster and faster - the 記録 No. counts his whole life. Twice her face again (F2 eyes along the row, F3 eyes
//       down: so many).                                                                           終りまで 私に作ってた
//   W3  the last volume has no mark - the only yellow thing in the room; she looks up at it;     「ココロ」
//       up on her toes she takes it down (kn_reach); the volume back in its place, its sheet held up (tr_2); her eyes read it.
//   W4  the sheet itself (the same sheet, upright, as in her hands and in the chorus): his last one, 最終稿. The view goes
//       down it to 結果: empty (the 成功 is thanks' to stamp); the cursor waits.                  (the bar before the chorus)
// The room, her back-view drawings and the tools are the chorus's (chorus1.js: stage). Type: Mincho X and Dela only.
import { W, H, K, clamp, mix, smooth, out3, out5, hit, img, pic, fig, lyrics, line, row, text, stamp } from './kit.js';
import { prepare as prepareStage, stage as G } from './chorus1.js';
import { drawReport, REPORT } from './report.js';
export const name = 'know';
const { kt, kbOf } = G;
export const start = kt(128);
export const duration = kt(174) - start;
const KW2 = 139.5, KW3 = 155.5, KCL2 = 158.5, KTAKE = 160.5, KREAD = [163, 165], KGROW = 167.5, KW4 = 168, LASTNO = 21169, VOLS = 2117;   // VOLS: how many volumes his record fills (記録 No. is the volume, never a day)
const F1 = [131.5, 134.5, 'oe_o'], F2 = [143.5, 145.5, 'oe_l'], F3 = [149.5, 151.5, 'oe_d'], KCL = 141.5;
const TB_LOW = { tb0: 0.0048, tb_c1: 0.0048, tb_c2: 0.004, tb_p1: 0.004, tb_p2: 0.0048, tb_c1p1: 0.0514, tb_p1c2: 0.004, tb_c2p2: 0.0193, tb_p2c1: 0.0032 };   // v2.json tb.low
const WALK = ['tb_c1', 'tb_c1p1', 'tb_p1', 'tb_p1c2', 'tb_c2', 'tb_c2p2', 'tb_p2', 'tb_p2c1'];
let SCAN = [], NMAX = 1, REST = [];                             // the volumes her eyes go along, in order (the last is the one); REST: [a volume the close view does not show, the step its row is done at]
let L = {};
export async function prepare() {
  await prepareStage(); await lyrics();
  for (const n of ['oe_o', 'oe_l', 'oe_d', 'tr_2']) await img(n);
  const rowOf = b => Math.floor((b[1] - b[3] / 2 - 0.02) / 0.42 + 0.5), inRow = j => G.BOOKS.filter(b => rowOf(b) === j && b[0] > -2.3 && b[0] < 2.4).sort((p, q) => p[0] - q[0]);
  const top = inRow(4), last = top.reduce((p, q) => Math.abs(q[0] - 0.24) < Math.abs(p[0] - 0.24) ? q : p);
  // only volumes left of the type's columns (x < 1.15 m is left of x = 1600 px in the shoulder view)
  const vis = b => b[0] > -1.15 && b[0] < 1.15, rows = [inRow(2), inRow(3), top.filter(b => b[0] <= last[0])];
  SCAN = []; REST = []; for (const r of rows) { SCAN.push(...r.filter(vis)); for (const b of r) if (!vis(b)) REST.push([b, SCAN.length]); }
  NMAX = SCAN.length - 1;
  L = { a: line('知リタイアノ人が'), b: line('命の終りまで'), c: line('私に作ってた'), d: line('「ココロ」') };
}
// how many volumes are marked by beat kb: the first at k = 140 (the close-up's stamp), then faster and faster
const stepAt = kb => kb < 140 ? 0 : Math.max(1, Math.min(NMAX, 1 + Math.floor((NMAX - 1) * (0.9 * (kb - 140.5) + 0.55 * Math.max(0, kb - 140.5) ** 2) / 145)));
const stepQ = kb => stepAt(Math.floor(kb * 4 + 1e-6) / 4);       // the frame moves on the quarter beat
// which way her head is turned (on the half-beat): the volume her eyes are on, left of her, before her, right of her
// R2 (fix8): her head no longer follows every step of her eyes (it went left-middle-right-middle-right-left, a turn a
// half-beat). One turn, left to right, over the whole wall: one drawing for each stretch of W2 between the face inserts
// (k 141.5 left, 145.5 before her, 151.5 right), each held two beats or more; the yellow outline shows the volume.
const headOf = kb => kb < 145.5 ? 'tk_l' : kb < 151.5 ? 'tk0' : 'tk_r';
const recNo = n => 1 + Math.round((VOLS - 1) * n / NMAX);

// a rectangle on the wall (metres, centre) drawn where it really is on the screen
function quad(c, x, y, w, h, grow = 0) {
  const z = -0.652, q = [G.proj(x - w / 2 - grow, y + h / 2 + grow, z), G.proj(x + w / 2 + grow, y + h / 2 + grow, z), G.proj(x + w / 2 + grow, y - h / 2 - grow, z), G.proj(x - w / 2 - grow, y - h / 2 - grow, z)];
  c.beginPath(); c.moveTo(q[0][0], q[0][1]); for (let i = 1; i < 4; i++) c.lineTo(q[i][0], q[i][1]); c.closePath();
}
// draw in a rectangle of the wall as in a unit square (x right, y down)
function onWall(c, x, y, w, h, fn) {
  const z = -0.652, p0 = G.proj(x - w / 2, y + h / 2, z), p1 = G.proj(x + w / 2, y + h / 2, z), p2 = G.proj(x - w / 2, y - h / 2, z);
  c.save(); c.transform(p1[0] - p0[0], p1[1] - p0[1], p2[0] - p0[0], p2[1] - p0[1], p0[0], p0[1]); fn(); c.restore();
}
// the volumes she has looked at: their labels are red (失敗). The one she is looking at is lit and outlined.
function marks(c, n, kb, last) {
  c.fillStyle = K.red;
  for (let i = 0; i < n; i++) { const q = G.labelOf(SCAN[i]); quad(c, q[0], q[1], q[2], q[3]); c.fill(); }
  for (const [b, at] of REST) if (last || n >= at) { const q = G.labelOf(b); quad(c, q[0], q[1], q[2], q[3]); c.fill(); }
  const b = SCAN[Math.min(n, NMAX)];
  if (last === 'gone') { c.fillStyle = '#060e2a'; quad(c, b[0], b[1], b[2], b[3]); c.fill(); }   // it has been taken out: a gap in the row
  else if (last === 'back') { c.fillStyle = K.yellow; quad(c, b[0], b[1], b[2], b[3]); c.fill(); }   // put back, its sheet in her hand
  else if (last) {                                                          // the one that has no mark: yellow
    const pulse = Math.exp(-(((kb % 1) + 1) % 1) * 3);
    c.fillStyle = K.yellow; quad(c, b[0], b[1], b[2], b[3]); c.fill();
    c.strokeStyle = K.yellow; c.lineWidth = 4; c.globalAlpha = 0.35 + 0.3 * pulse; quad(c, b[0], b[1], b[2], b[3], 0.02 + 0.012 * pulse); c.stroke(); c.globalAlpha = 1;
  } else if (kb >= 140) {
    c.fillStyle = K.paper; quad(c, b[0], b[1], b[2], b[3]); c.fill();
    c.strokeStyle = K.yellow; c.lineWidth = 5; quad(c, b[0], b[1], b[2], b[3], 0.008); c.stroke();
  }
}

// the volume's own tag (top left; not the DAY mark, and no block over the corner): a thin paper frame like a spine label,
// 記録 No. and the volume's number, and once looked at, 失敗
function recCard(c, no, failed, kb, last) {
  const ink = last ? K.yellow : K.paper, edge = '#0b1b45';
  c.save(); c.strokeStyle = edge; c.lineWidth = 9; c.strokeRect(72, 72, 410, 104); c.strokeStyle = ink; c.lineWidth = 3; c.strokeRect(72, 72, 410, 104); c.restore();
  const put = (str, x, y, px, font, weight, col, align = 'left') => { c.save(); c.font = `${weight} ${px}px "${font}"`; c.textAlign = align; c.lineJoin = 'round'; c.strokeStyle = edge; c.lineWidth = Math.max(6, px * 0.16); c.strokeText(str, x, y); c.fillStyle = col; c.fillText(str, x, y); c.restore(); };
  put('記録', 96, 116, 30, 'Mincho X', 400, ink); put('No.', 96, 156, 28, 'Mincho X', 400, ink);
  put(String(no).padStart(4, '0'), 168, 160, 84, 'Mincho X', 400, ink);
  if (failed) { c.save(); c.translate(424, 124); c.rotate(-0.12); const s = 1 + 0.25 * Math.exp(-(((kb * 4) % 1) * 4)); c.scale(s, s); c.strokeStyle = K.red; c.lineWidth = 4; c.strokeRect(-38, -38, 76, 76); put('失', 0, -4, 30, 'Mincho X', 400, K.red, 'center'); put('敗', 0, 28, 30, 'Mincho X', 400, K.red, 'center'); c.restore(); }
}
// upright type in a column, each character landing when sung (small kana at 70 %, top right); an outline round it
const SMALL = 'っゃゅょぁぃぅぇぉッャュョァィゥェォ';
function vcol(c, chars, T, x, y0, size, o = {}) {
  c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  let y = y0 + size / 2;
  for (const ch of chars) {
    const k = hit(T - ch.t, o.amt ?? 0.28, 16), sm = SMALL.includes(ch.c);
    if (k > 0) {
      const s = size * (sm ? 0.7 : 1); c.font = `400 ${s}px "${o.font ?? 'Mincho X'}"`;
      c.save(); c.translate(x + (sm ? size * 0.13 : 0), y - (sm ? size * 0.13 : 0)); c.scale(k, k);
      if ('「」ー'.includes(ch.c)) c.rotate(Math.PI / 2);
      if (o.edge) { c.strokeStyle = o.edge; c.lineWidth = o.ew ?? 10; c.strokeText(ch.c, 0, 0); }
      c.fillStyle = o.color ?? K.white; c.fillText(ch.c, 0, 0); c.restore();
    }
    y += size * (o.lead ?? 1.06);
  }
  c.restore();
}
// the sung words of W2 and its inserts: always in the same two columns at the right
function words2(c, T) {
  vcol(c, L.b, T, 1800, 130, 66, { edge: '#0b1b45', lead: 1.08 });
  vcol(c, L.c, T, 1690, 130, 66, { edge: '#0b1b45', lead: 1.08 });
}

// ---- W1: she walks to the wall
function w1(c, kb, T) {
  const u = clamp((kb - 128) / (KW2 - 128)), zh = 6 * (1 - u), cam = G.cam;
  cam.fov = 30; cam.position.set(0.12, 1.12, zh + mix(4.2, 5.8, u)); cam.lookAt(0, 1.08, zh); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  // r9: the foot she stands on is ON the floor and in her shadow: each drawing is set down by its sole (v2.json low), and the
  // shadow is centred under her, not 2 cm in front of her (seen from above the floor, that put its middle below her sole)
  const wk = WALK[((Math.floor((kb - 128) * 4 + 1e-6) % 8) + 8) % 8];
  G.setHer(wk, 0, -(TB_LOW[wk] ?? 0), zh); G.shadow.position.z = zh - 0.01; G.shadow.material.color.set('#060e2a'); G.shadow.material.opacity = 0.6;
  G.pass(c, { room: 'A', bg: G.PAL.A.bg });
  G.mid(c, zh - 0.3, () => {
    row(c, L.a.slice(0, 4), T, -92, -203, 44, { font: 'Mincho X', color: K.white, track: 2, amt: 0.35 });   // 知リタイ above her
    vcol(c, L.a.slice(4, 6), T, -120, -152, 40, { lead: 1.08, color: K.white });
    vcol(c, L.a.slice(6), T, 120, -152, 40, { lead: 1.08, color: K.white });
  });
  G.pass(c, { her: true });
}

// ---- F: her face, seen from inside the shelf: the spines close to the lens frame her; as her eyes go on, their labels go red
function face(c, kb, T, f) {
  const [k0, k1, card] = f, u = clamp((kb - k0) / (k1 - k0)), n = stepQ(kb);
  c.fillStyle = '#0b1b45'; c.fillRect(0, 0, W, H);
  const h = mix(1000, 1040, u); fig(c, card, mix(800, 790, u), H, h);                        // 927 x 1273 drawn at <= 0.83 : 1
  // the spines between the lens and her: two groups, sliding as her eyes go along
  const dx = -(kb - k0) * 38, cols = PAL_SP;
  c.save();
  for (let i = 0; i < 14; i++) {
    const side = i < 6 ? 0 : 1, j = side ? i - 6 : i, w = 74 + 46 * ((i * 7) % 5) / 4;
    const x = (side ? 1440 + j * 68 : -120 + j * 66) + dx * (side ? 1.2 : 1), top = 40 + 70 * ((i * 3) % 4) / 3;
    if (x > W || x + w < 0) continue;
    c.fillStyle = cols[i % cols.length]; c.fillRect(x, top, w, H - top);
    c.fillStyle = 'rgba(6,14,42,0.35)'; c.fillRect(x + w - 10, top, 10, H - top);
    const red = n > i * 2 + (side ? 1 : 0); c.fillStyle = red ? K.red : '#8fa3d8'; c.fillRect(x + w * 0.17, top + 150, w * 0.66, 120);
  }
  c.restore();
  if (f === F1) vcol(c, L.a.slice(0, 4), T, 1760, 140, 110, { edge: '#0b1b45', lead: 1.04 });
  else words2(c, T);
}
const PAL_SP = ['#1b3f86', '#23509f', '#1f4690', '#2a5cb0', '#1d4490', '#16397a'];

// ---- CL: one volume, close: 記録 No.000001; 失敗 comes down on it on the beat; then the view pulls back
function closeVol(c, kb, T) {
  const b = SCAN[0], q = G.labelOf(b), cam = G.cam, back = out3((kb - 140.5) / 1.0), d = mix(0.3, 1.7, back);
  cam.fov = 27; cam.position.set(q[0] + 0.012 + 0.25 * back, q[1] - 0.01 + 0.1 * back, -0.652 + d); cam.lookAt(q[0] + 0.25 * back, q[1] - 0.01 + 0.1 * back, -0.652); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  G.pass(c, { room: 'A', bg: G.PAL.A.bg });
  const n = Math.max(1, stepQ(kb));
  // its label is a slip of paper with his record's number on it (the others are seen too small to read)
  const stamped = kb >= 140 - 1 / 24 / 0.42858;
  { quad(c, q[0], q[1], q[2], q[3]); c.fillStyle = stamped ? K.red : K.paper; c.fill();
    const p = G.proj(q[0], q[1], -0.652), mm = (G.proj(q[0] + 0.001, q[1], -0.652)[0] - p[0]);                  // pixels a millimetre
    c.save(); c.translate(p[0], p[1]); c.rotate(Math.PI / 2); text(c, 'No.0001', 0, 0, 7.5 * mm, { font: 'Shoulders', weight: 700, color: stamped ? K.paper : K.blue, align: 'center', base: 'middle' }); c.restore(); }  if (kb >= 139.9) {                                                           // 失敗, pressed onto the slip
    const age = (kb - 140) * 0.42858, k = age < 0 ? mix(1.35, 1, out3((age + 0.04) / 0.04)) : 1 + 0.05 * Math.exp(-age * 18);
    const p = G.proj(q[0], q[1] - q[3] * 0.05, -0.65), sc = (G.proj(q[0] + 0.01, q[1], -0.65)[0] - G.proj(q[0], q[1], -0.65)[0]);
    c.save(); c.translate(p[0], p[1]); c.rotate(-0.08); c.scale(k * sc / 34, k * sc / 34);
    c.fillStyle = K.paper; c.fillRect(-64, -40, 128, 80); c.strokeStyle = K.red; c.lineWidth = 6; c.strokeRect(-58, -34, 116, 68);
    text(c, '失敗', 0, 4, 46, { font: 'Mincho X', color: K.red, align: 'center', base: 'middle' }); c.restore();
  }
  // as the view pulls back, the next ones go red
  c.fillStyle = K.red; for (let i = 1; i < n; i++) { const r = G.labelOf(SCAN[i]); quad(c, r[0], r[1], r[2], r[3]); c.fill(); }
  words2(c, T);
}

// ---- W2: close behind her shoulder
function w2(c, kb, T) {
  const u = clamp((kb - KW2) / (KW3 - KW2)), cam = G.cam, n = stepQ(kb);
  cam.fov = 27; cam.position.set(mix(0.62, 0.5, u), mix(1.27, 1.19, u), mix(3.0, 2.7, u)); cam.lookAt(mix(0.3, 0.24, u), mix(1.31, 1.23, u), 0); cam.updateProjectionMatrix(); cam.updateMatrixWorld();   // r9: lower than before and going lower as it comes in, so her hands stay whole all the way (the frame's foot at mid-thigh)
  G.setHer(headOf(kb), 0, 0, 0);
  G.pass(c, { room: 'A', bg: G.PAL.A.bg });
  marks(c, n, kb, false);
  G.pass(c, { her: true, shadow: false });
  words2(c, T);
  recCard(c, recNo(n), n > 0, kb, false);
}

// ---- the sheet: his last record, upright - THE sheet (report.js, the canon art/canon/prop_report.png), drawn in a unit
// width; s: what is happening on it (cursor on/off; where her eyes are reading). 結果 empty: the 成功 is thanks' to give
function sheet(c, s) { drawReport(c, 0, 0, 1, { cursor: s.cursor, read: s.read }); }
// the sheet's state at beat kb
function sheetState(kb) {
  // the result field stays empty (the 成功 is thanks' to give): only the cursor waits, faster at the end
  const r = kb >= KREAD[0] && kb < KREAD[1] ? readAt(kb) : null;
  return { cursor: Math.floor(kb * (kb >= 171.5 ? 4 : 2)) % 2 === 0, read: r };
}
// her eyes go down the sheet a line a beat (k 163 - 165): heading, 最終稿, 心 -> the socket, the flat trace
const LINES = REPORT.lines;
const readAt = kb => { const i = Math.min(3, Math.floor((kb - KREAD[0]) * 2)), f = smooth(((kb - KREAD[0]) * 2) % 1 / 0.8), l = LINES[i]; return [l[0], l[1], l[2] * f]; };
// the sheet on the screen at full size: its rectangle at beat kb (the view goes down it to 結果)
function sheetRect(kb) {
  const a = out3((kb - 169) / 2);
  const s = mix(1000 / 1.414, 1900, a), cy = mix(0.707, 1.0, a);              // pixels a unit; the sheet's point at the frame's middle
  const x = W / 2 - s * mix(0.5, 0.53, a), y = H / 2 - cy * s + 6 * Math.sin(kb * 0.9);
  return [x, y, s];
}
function w4(c, kb) {
  c.fillStyle = '#0b1b45'; c.fillRect(0, 0, W, H);
  const [x, y, s] = sheetRect(kb);
  c.save(); c.translate(x, y); c.scale(s, s); sheet(c, sheetState(kb)); c.restore();
}

// ---- W3: the yellow one; she looks up at it (157), up on her toes she takes it down (kn_reach, 158.5); then - the volume
// back in its place - its sheet in her raised hand (tr_2, 160.5); her eyes read it (the insert, 163 - 165); the view goes in
// r10 (C4): tr_2 is redrawn after art/canon/prop_report.png - the record is drawn on the sheet in her hand, thumb and all,
// so nothing is printed on it here any more. TR: that sheet's edges in tr_2's pixels [u0, u1, v0, v1] (px [707, 2372]);
// sheetCorner() puts a card pixel where the card is in the room (its plane turned to the lens as setHer turns it), so the
// sheet that comes up to the lens at KGROW starts from the drawn one.
const TR = [423, 702, 4, 415], TRG = { px: [707, 2373], mpp: 0.0008021108179419525, ax: -0.05855408970976254, low: 0.004 };   // v2.json tr (r10b: tr0 redrawn, the set re-baked)
function sheetCorner(hx, y0, u, v) {
  const g = TRG, cam = G.cam, th = Math.atan2(cam.position.x - hx, cam.position.z) * 0.6, dx = (u - g.px[0] / 2) * g.mpp;
  return G.proj(hx - g.ax + dx * Math.cos(th), y0 + (g.px[1] - v) * g.mpp, -dx * Math.sin(th));
}
function w3(c, kb, T) {
  const u = clamp((kb - KW3) / (KTAKE - KW3)), cam = G.cam, took = kb >= KTAKE, reach = kb >= KCL2 && !took;
  // whole, her feet on the floor (she is on her toes) while she reaches; then nearer, a cut on the beat the sheet goes up,
  // and nearer again after the insert - never nearer than her drawing is drawn (1.24 px a mm)
  if (!took) { cam.fov = 27; cam.position.set(0.1, 0.98, mix(4.75, 4.5, smooth(u))); cam.lookAt(0.08, 0.96, 0); }   // r9: 16 cm lower: her soles on the floor inside the frame
  else if (kb < KREAD[0]) { const g = smooth((kb - KTAKE) / (KREAD[0] - KTAKE)); cam.fov = 27; cam.position.set(mix(0.12, 0.15, g), mix(1.45, 1.5, g), mix(2.7, 2.35, g)); cam.lookAt(mix(0.15, 0.18, g), mix(1.52, 1.56, g), 0); }
  else { const g = smooth((kb - KREAD[1]) / (KGROW - KREAD[1])); cam.fov = 27; cam.position.set(mix(0.17, 0.2, g), mix(1.54, 1.6, g), mix(2.15, 1.86, g)); cam.lookAt(mix(0.2, 0.234, g), mix(1.6, 1.66, g), 0); }
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  // where she stands to reach it: the volume in her hand before its gap in the row as the lens sees it; she stays there
  const b = SCAN[NMAX], C = cam.position, q = (0 - C.z) / (-0.652 - C.z), hx0 = (() => { const cz = 4.5; return 0.1 + (b[0] - 0.1) * (cz / (cz + 0.652)) - 0.322; })();
  const hx = kb >= KCL2 ? hx0 : 0;
  G.setHer(took ? 'tr_2' : reach ? 'kn_reach' : 'tk_h', hx, took ? -TRG.low : -0.0032, 0); G.shadow.position.z = -0.01;   // r9d: on her toes, the toe tips ON the floor and in her shadow (the shadow under her, not 2 cm in front, which put it below her toes)   // R2: she looks up at it from the first (tb0 for 1.5 beats is gone) G.shadow.material.color.set('#060e2a'); G.shadow.material.opacity = 0.6;
  G.pass(c, { room: 'A', bg: G.PAL.A.bg, labRed: true });                          // by now every volume on the wall is marked
  marks(c, NMAX, kb, reach || took ? 'gone' : true);            // once taken its place stays empty: what she holds is what she took (it does not go back on the shelf behind her)
  if (!took) vcol(c, L.d.filter(q => 'ココロ'.includes(q.c)), T, 1760, 240, 110, { font: 'Dela', color: K.yellow, lead: 1.06, amt: 0.4, edge: K.navy, ew: 10 });   // the three the same size from the first
  G.pass(c, { her: true });
  if (took) {
    const p0 = sheetCorner(hx, -TRG.low, TR[0], TR[2]), p1 = sheetCorner(hx, -TRG.low, TR[1], TR[2]);   // (the record is tr_2's own drawing)
    // the last half beat: the sheet comes up to the lens and fills the frame (the next shot is that sheet)
    const e = smooth((kb - KGROW) / (KW4 - KGROW));
    if (e > 0) {
      const [x, y, s] = sheetRect(KW4), ax = p1[0] - p0[0], sx = mix(ax, s, e);
      c.save(); c.translate(mix(p0[0], x, e), mix(p0[1], y, e)); c.scale(sx, sx); sheet(c, sheetState(kb)); c.restore();
    }
  }
  if (kb < KGROW) recCard(c, VOLS, false, kb, true);
}
// ---- the insert: the sheet in her hands, close - the top half, her eyes going along it line by line (k 163 - 165)
function readIns(c, kb) {
  c.fillStyle = '#0b1b45'; c.fillRect(0, 0, W, H);
  // two framings, cut on k = 164: the top (heading, 最終稿, the drawing), then the drawing and the flat trace - no line cut by the frame
  const B = kb >= 164, a = (kb - (B ? 164 : 163)), s = (B ? 2150 : 1720) * (1 + 0.025 * a), cy = B ? 0.532 : 0.24;   // A: the heading to the drawing; B: the drawing to the trace (report.js layout)
  c.save(); c.translate(W / 2 - s * 0.5, H / 2 - cy * s); c.scale(s, s); sheet(c, sheetState(kb)); c.restore();
}
export function draw(c, t) {
  const T = t + start, kb = kbOf(T);
  if (kb < KW2) (kb >= F1[0] && kb < F1[1] ? face(c, kb, T, F1) : w1(c, kb, T));
  else if (kb < KCL) closeVol(c, kb, T);
  else if (kb < KW3) (kb >= F2[0] && kb < F2[1] ? face(c, kb, T, F2) : kb >= F3[0] && kb < F3[1] ? face(c, kb, T, F3) : w2(c, kb, T));
  else if (kb < KW4) (kb >= KREAD[0] && kb < KREAD[1] ? readIns(c, kb) : w3(c, kb, T));
  else w4(c, kb);
}
