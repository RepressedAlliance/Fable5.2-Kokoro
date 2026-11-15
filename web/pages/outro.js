// The end (253.8 - 280.6 s): 同じ場所で - the same place. The music box alone.
// The roll of the laboratory, as ages drew it near: stools 08 (his) and 09, the band on the right (研究員 0/15, red),
// the day. With a heart she does again what she did without one, and this time it shows. The floor line is the line
// behind her heart: on every note of the music box it beats.
// c3 (v8, the user: "she cannot strike out 09 - strike out 08 and fill in 08-02"): the mirror of the opening's T shot.
// There he sat on 08 and set a cup on the empty stool beside him (09, on his right) for one who was not yet; here she
// sets the tea on 09 for one who is gone, and sits on 08 - his seat, now 08-02's. 08 and 09 stand side by side as the
// opening has them (0.73 m apart, as the epl drawings have them too); nothing is carried any more.
//   253.80  she sets the tray on 09 - two cups - and smiles
//   256.26  she sweeps by the stools; the steam goes up from the cups
//   258.50  (a small note) she crouches: under 08, his yellow pencil. She is in tears.          > ナミダ  OK
//   260.64  (close) a line of the roll: her hand, with his pencil, strikes out 08's 空席 and writes 08-02
//   263.63  08 and 09: she sits on 08, the tea on 09 beside her. 264.08: 08-02 在席. 研究員 1/15
//   266.60  near: her face and the tea; she sings with her eyes shut. 永遠に歌う, a character on each note
//   270.04  the two stools, near: (she leans toward the tea on 09). The steam breaks off the cups and goes. The line
//           beats once, hard, and slowly goes flat.                                             > 心 OK  > 記録ヲ閉ジル
//   273.75  her face, as the film begins (open.js, frame 0), eyes shut, smiling, in tears; the line behind her
//           heart. It stays to the end: the day's last figure creeps up a step at a time; on 279.8 it is 182622, and
//           on that frame the line beats. The next frame is the film's first: the same face, eyes open.
// Drawings: set ep (a10); the ones named in STAND stand in for any not yet drawn.
// The notes are measured on the recording (work/beat_probe.py); nothing here is on the song's beat grid.
import { W, H, K, clamp, mix, smooth, out3, out5, rnd, hit, img, pic, fig, tint, text, grid, column, dayMark } from './kit.js';
import { HX as RHX, HY as RHY, PXM as RPXM, prepareRoll } from './roll.js';
import { her, prepareStool, V2 } from './stool.js';
export const name = 'outro';
export const start = 253.80;
const T_FIN = 280.60;
export const duration = T_FIN - start;
const NOTE = [253.80, 256.26, 260.64, 263.22, 266.60, 270.04, 273.75];
const T_FIND = 258.50, T_FLIP = 264.08, T_COUNT = 265.78, T_STOP = 270.04, T_TYPE = [270.9, 272.3], T_CREEP = 274.5, T_DAY = 279.0;
const SING = [266.55, 267.06, 267.84, 268.78, 269.21];          // 永遠に歌う: a character on each note of the music box (measured onsets)
const ORN = [254.21, 256.77, 258.50, 259.72, 261.06, 263.63, 264.08, 265.78];   // the small notes before the line goes still: a small beat each
const ECHO = [[274.5, 42], [275.3, 36], [276.1, 30], [276.9, 26], [277.7, 22], [278.4, 18]];   // small beats as the last note dies; the day is knocked up on each
const BUMP = [0.18, 0.25, 0.32, 0.39, 0.46, 0.54];           // after the last note, as it dies away: smaller and smaller
// the drawings, and what stands in for each until it is drawn
const STAND = { ep_tea: 'ts_put', ep_sweep: 'wm_broom', ep_sweep2: 'ep_sweep', ep_find: 'tq_down', ep_sit: 'sv0', ep_sing: 'sv0', ep_lean: 'sv0', ep_lean1: 'ep_lean', ep_lean2: 'ep_lean1' };
const T_TEA2 = 254.98, T_LEAN2 = 270.9,   /* r8 (R2): ep_lean1 held two beats (0.86 s), the hand comes to rest as the line starts typing */ ORN2 = [271.85, 272.78];              // the small notes after the stop: the line answers them                                          // the small note after the stop: her hand comes to rest on 08
const use = n => pic(n) ? n : pic(STAND[n]) ? STAND[n] : STAND[STAND[n]];
// the set: the roll at the ages near view. Stool 08's foot at (X8F, GY); pixels a metre PPM
const Z = 525 / RPXM, PPM = 525, X8F = 600, GY = 954;
const EK = PPM * 0.0007592407592407592;                          // the ep drawings: screen pixels a card pixel
// r9: every stool is the same stool (0.65 m high, about 0.34 m across the feet), drawn at the same metre scale.
// c3: 08 and 09 side by side, 955.5 ep card pixels (0.73 m) apart - as the epl drawings and the opening's
// T shot have the two stools - from the first frame; 09 is never moved
const SP = 955.5 * EK, SPR = SP / Z;                             // the stools' spacing: set pixels, roll units
const X8O = X8F - 9.2 * Z, X9O = X8O + SP;                      // the middles of the stools' outer boxes (legs and all)
// c3: 263.63 (a small note, measured) she is sitting on 08; on the strong note at 264.08 its label turns to 在席 (T_FLIP)
const T_SIT = 263.63;
// her sitting drawings. All of the present ones (ep_sit, ep_sing, ep_lean1/2) have her facing LEFT, the stool with the
// tea on her left: the mirror of what this shot needs (she on 08, the tea on 09 on her right; 08 is left of 09). Not
// mirrored here (her 02 and her hairpins would go to the wrong side). Until art draws them facing right, she sits on
// 08 in ep_sit / ep_sing, facing away from the tea, and the leaning pair is left out (ep_sing is held through the last
// two-shot). When the new ones come, name them here (and their stool pixels in SEAT / EPL below)
// c3b: art has drawn them (set epr: she on the left stool facing right, the tea on the right one; the four registered,
// stools and tea set pixel for pixel)
const SITC = { sit: 'ep_sit_r', sing: 'ep_sing_r', lean1: 'ep_lean1_r', lean2: 'ep_lean2_r' };
// epr, card pixels: her stool (08) x 248, the tea's (09) x 1203, the feet y 2073, the seat's top y 1216, the cups' rims
const EPR = { l: 248, r: 1203, feet: 2073, seat: 1216, cups: [[1131, 1091], [1295, 1090]] };
// the tea set on 09 from the sweep on is cut out of ep_sit_r (above its right stool's seat), so that it is the very
// tea set of the sitting drawings: nothing jumps at the cuts
const TEA_BOX = [1000, 930, 1420, 1213];                         // x0, y0, x1, y1 (card px of epr)
let TEA = null;
const epx = (c, n, u, v, x, y) => { const im = pic(n); fig(c, n, x + (im.width / 2 - u) * EK, y + (im.height - v) * EK, im.height * EK); };   // an ep drawing (any canvas) with its card pixel (u, v) on (x, y)
// the stool (me_gone, r9: 763 x 1693, its legs' outer box centred on x 331, feet on y 1685): in the roll's own units,
// centred on the roll point x, its feet on y; k roll units a metre (alpha / a flat tint optional)
// v8 fix: the me set was baked again (684 x 1610): where the legs' box and the feet are is read from v2.json (ax, low),
// never written in here
function stoolAt(c, x, y, k, o = {}) {
  const g = V2.me, im = o.im ?? pic('me_gone'), s = g.mpp * k;
  fig(c, im, x - g.ax * k, y + (g.low?.me_gone ?? 0) * k, im.height * s, { alpha: o.alpha });
}
// the stools' places in the ep drawings (card pixels: the legs' outer box centre, the feet), measured on the r9 cards
// c3c: ep_tea / ep_tea2 redrawn with the epr tea set (ept now 1255 x 2087): measured again on the new cards
const SEAT = { ep_tea: [246, 2117], ep_tea2: [234.5, 2082], ep_sit: [805.5, 2116], ep_sing: [807, 2118], ep_lean: [806.5, 2122] };
// the two-stool drawings: [the middle between their two stools, the feet, the cups' rims (x, y)]. (The present epl pair
// has the tea on the LEFT stool - not usable now; a redrawn pair, her on the left stool and the tea on the right, goes
// here under its own names, see SITC)
const EPL = Object.fromEntries(['ep_sit_r', 'ep_sing_r', 'ep_lean1_r', 'ep_lean2_r'].map(n => [n, [(EPR.l + EPR.r) / 2, EPR.feet, EPR.cups]]));
// the tea set left on 09 (screen, from the sweep on): the card's cups' rims, its right stool on 09
// c3c: as ep_tea leaves it - its tray's middle (x 218) 28 card px left of its stool's (246); epr's tray (x 1001-1414)
// sits 4.5 right of its stool's: so the cut-out set is put 32.5 px left of where epr has it, on the sweep and the pencil
// shots (cut straight from ep_tea). The sitting drawings have it where epr has it; between them is the close-up of the
// roll, and 13 screen px across two cuts does not show
const TEA_DX = 218 - 246 - ((1001 + 1414) / 2 - EPR.r);
const teaR = (u, v) => [X9O + (u + TEA_DX - EPR.r) * EK, GY + (v - EPR.feet) * EK];
// ep_tea's tea set as it is left on 09 (card pixels of ep_tea): its stool centre (245, 2117) on 09's
const teaX = u => X9O + (u - SEAT.ep_tea[0]) * EK, teaY = v => GY + (v - SEAT.ep_tea[1]) * EK;
// c3: the cameras (set point f put on the screen point at), with 08 and 09 0.73 m apart; the screen's middle for the
// picture is x 735 (the band takes x 1470 on)
// c3d: the pencil lies on the floor just left of 08 (by his stool's foot) and she crouches there, on the open floor:
// ep_find is 0.6 m across, the gap between 08 and 09 only 0.37 m (between them she went through 09's legs)
const BROOM = 330, FINDX = -243, PENCIL_X = -275;                               // her front boot right of 09 (sweeping); her crouch right of 08 (the pencil)
const SF = { tea: [X8O + 270, 570], sweep: [X8O + 413, GY], find: [X8O - 420, GY], sit: [X8O + 135, 586], sing: [X8O + 165, 400], two: [X8O + 135, 560] };
const SA = { tea: [830, 500], sweep: [944, 880], find: [140, 820], sit: [800, 495], sing: [900, 540], two: [735, 600] };
const SL = [1.15, 1.19];
let HAND = null, EDGE = null;
const HANDS = {};
function keyed(im, scribble) {
  const w = im.width, h = im.height, cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d'); x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, w, h), a = d.data, N = w * h, s0 = ((h - 6) * w + 6) * 4, pr = a[s0], pg = a[s0 + 1], pb = a[s0 + 2];
  const isPaper = i => a[i * 4 + 3] > 200 && Math.abs(a[i * 4] - pr) < 8 && Math.abs(a[i * 4 + 1] - pg) < 8 && Math.abs(a[i * 4 + 2] - pb) < 10;
  const paper = new Uint8Array(N), q = [];
  for (const [sx, sy] of [[6, h - 6], [w - 6, h - 6], [w / 2, h - 6]]) { const i = Math.floor(sy) * w + Math.floor(sx); if (isPaper(i) && !paper[i]) { paper[i] = 1; q.push(i); } }
  while (q.length) { const i = q.pop(), px = i % w, py = (i - px) / w; for (const j of [px > 0 ? i - 1 : -1, px < w - 1 ? i + 1 : -1, py > 0 ? i - w : -1, py < h - 1 ? i + w : -1]) if (j >= 0 && !paper[j] && isPaper(j)) { paper[j] = 1; q.push(j); } }
  const empty = new Uint8Array(N); for (let i = 0; i < N; i++) empty[i] = a[i * 4 + 3] < 20 ? 1 : 0;
  const grow = (m, r) => { const o = new Uint8Array(N), t = new Uint8Array(N);
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { let v = 0; for (let k = -r; k <= r && !v; k++) { const u = xx + k; if (u >= 0 && u < w && m[y * w + u]) v = 1; } t[y * w + xx] = v; }
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { let v = 0; for (let k = -r; k <= r && !v; k++) { const u = y + k; if (u >= 0 && u < h && t[u * w + xx]) v = 1; } o[y * w + xx] = v; } return o; };
  const nearP = grow(paper, 6), nearE = grow(empty, 6);
  for (let i = 0; i < N; i++) { const px = i % w, py = (i - px) / w; if (paper[i] || (nearP[i] && nearE[i]) || (scribble && px < 166 && py > 886 && py < 968)) a[i * 4 + 3] = 0; }
  x.putImageData(d, 0, 0); return cv;
}
export async function prepare() {
  await prepareRoll(); await prepareStool();
  for (const n of ['en_c', 'end_t0', 'end_t1', 'end_t2', 'end_t3', 'end_t4', 'end_t4b', 'end_t5', 'end_t5b', 'end_t6', 'end_t7', 'me_gone', ...new Set([...Object.keys(STAND), ...Object.values(STAND)]), 'ep_write2a', 'ep_write2b', 'ep_write2c', 'ep_tea2', ...Object.values(SITC).filter(Boolean)]) { try { await img(n); } catch (e) { /* not drawn yet */ } }
  // the hands: the hand and the pencil only. The sheet in the drawing (the cream joined to its corners), its edge line
  // and (ep_write) the scribble by the pencil point are left out: the page is the sheet, and she writes on it
  for (const n of ['ep_write2a', 'ep_write2b', 'ep_write2c']) { const im = pic(n); if (im) HANDS[n] = keyed(im, false); }
  { const im = pic('ep_sit_r'); if (im) { const [x0, y0, x1, y1] = TEA_BOX, cv = document.createElement('canvas'); cv.width = x1 - x0; cv.height = y1 - y0; cv.getContext('2d').drawImage(im, -x0, -y0); TEA = cv; } }
  HAND = HANDS.ep_write ?? null;
  // her outline, row by row (en_c): where the line behind her shows on either side
  const f = pic('en_c'), cv = document.createElement('canvas'); cv.width = f.width; cv.height = f.height; const x = cv.getContext('2d'); x.drawImage(f, 0, 0);
  const d = x.getImageData(0, 0, f.width, f.height).data; EDGE = [];
  for (let j = 0; j < f.height; j++) { let a = -1, b = -1; for (let i = 0; i < f.width; i++) if (d[(j * f.width + i) * 4 + 3] > 40) { if (a < 0) a = i; b = i; } EDGE.push([a < 0 ? 0.5 : a / f.width, b < 0 ? 0.5 : (b + 1) / f.width]); }
}

// ---- the set: a camera is a scale s about a point f of the set, put on the screen point at (default: f)
function roll(c, o) {
  c.fillStyle = K.blue; c.fillRect(0, 0, W, H); grid(c, K.paper, 40, 0.09);
  const at = o.at ?? o.f; c.save(); c.translate(at[0], at[1]); c.scale(o.s, o.s); c.translate(-o.f[0], -o.f[1]);
  c.save(); c.translate(X8F, GY); c.scale(Z, Z); c.translate(-(RHX + 26), -(RHY + 5));
  // the row of 08: 08, 09 and (faint) 10, side by side (c3: SPR apart, as the opening's two stools); the row above shows
  // only as legs hanging from the frame's top (the 0.65 m stools) and is left out; left of 08 is the day's corner
  // (10 is not drawn: 0.73 m on, it would stand where she stands)
  for (let n = 8; n <= 9; n++) {
    const cx = RHX + 16.8 + (n - 8) * SPR, sy = 302 + 380;
    if (!(n === 8 && o.no08) && !(n === 9 && o.no09)) stoolAt(c, cx, sy + 5, RPXM);
    if (!o.noLabels) label(c, n, cx, sy + 34, o.T);
  }
  c.restore();
  if (o.tray || o.steam) tray(c, o.T, !!o.tray, o.big, o.cups);
  { const m = c.getTransform(), x0 = (360 - m.e) / m.a; c.save(); c.beginPath(); c.rect(x0, -1e4, 1e5, 2e4); c.clip(); heartLine(c, o.T, o.stop); c.restore(); }   // the line starts right of the day
  if (o.pencil) pencil(c, X8O + PENCIL_X, GY - 7, -0.03, 0.62, true);   // c3d: left of 08, its end at 08's foot   // v8: between 08's legs, not out by her broom   // lying on the floor under 08 (r9: on the line, not under it)
  if (o.she) o.she(c);
  c.restore();
}
// a stool's label, under it, centred on it (roll units; y its middle line): the number, a blank for the name, the status.
// 08: 空席; struck out and 08-02 written in the blank by her (260.64, the close-up of the roll); turned over to 在席 on
// T_FLIP, the number lit. 09 (the tea's): 空席, always. Two lines, each centred on its stool (the number; the name and
// the status), no wider than 100 units, so that two stools 155 apart keep their labels well apart
function label(c, n, cx, y, T) {
  const me = n === 8, fl = me ? clamp((T - T_FLIP) / 0.16) : 0, sc = fl < 0.5 ? 1 - fl * 2 : (fl - 0.5) * 2, on = fl >= 0.5, wrote = me && T >= NOTE[2];
  const y2 = y + 25;
  text(c, String(n).padStart(2, '0'), cx, y + 4, 24, { color: on ? K.yellow : K.paper, alpha: on ? 1 : me ? 0.9 : 0.6, align: 'center' });
  if (wrote) { c.save(); c.translate(cx - 50, y2 - 9); c.scale(0.16, 0.16); two(c, 1, on ? K.yellow : K.paper, 11, false); c.restore(); }
  else { c.save(); c.strokeStyle = K.paper; c.globalAlpha = 0.4; c.lineWidth = 1.5; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(cx - 50, y2 + 8); c.lineTo(cx - 2, y2 + 8); c.stroke(); c.restore(); }
  c.save(); c.translate(cx + 50, y2); c.scale(on ? hit(T - T_FLIP - 0.08, 0.4, 14) || 1 : 1, sc);
  text(c, on ? '在席' : '空席', 0, 8, 20, { font: on ? 'Gothic X' : 'Gothic', color: on ? K.yellow : K.paper, alpha: on ? 1 : me ? 0.8 : 0.5, align: 'right' });
  if (!on && wrote) { c.fillStyle = K.paper; c.fillRect(-42, -1, 44, 2.2); }
  c.restore();
}
// the floor is the line behind her heart: a beat goes out both ways from the middle on every note. On the stop it beats
// hard, from her, the brightest thing in the frame; then a slow swell that dies to flat
function heartLine(c, T, stop) {
  const ev = NOTE.slice(0, 5).map(t => [t, 70, 735]).concat(SING.map(t => [t, 40, 735]), ORN.map(t => [t, 26, 735]), [[T_STOP, 190, 1000]], ORN2.map(t => [t, 60, 760]));
  const st = T - T_STOP;
  c.save(); c.strokeStyle = K.yellow; c.lineWidth = stop ? 10 : 5; c.lineJoin = 'round'; c.beginPath();
  for (let x = -200; x <= 1900; x += 3) {
    let v = 0;
    for (const [t, a, o] of ev) { const age = T - t + 1 / 48; if (age < 0 || age > 2.4) continue; const u = (Math.abs(x - o) - age * 900) / (a > 100 ? 70 : 40); if (u > -1 && u < 1) v += a * Math.exp(-age * 0.8) * spike(u); }
    if (st > 0.6 && st < 3.7) v += 22 * Math.sin((x - 1000) / 160 - st * 2.6) * Math.exp(-(st - 0.6) * 1.1) * smooth((st - 0.6) / 0.4);
    x === -200 ? c.moveTo(x, GY - 2 - v) : c.lineTo(x, GY - 2 - v);
  }
  c.stroke(); c.restore();
}
const spike = u => u < -0.5 ? -(u + 1) * 0.5 : u < 0 ? -0.25 + (u + 0.5) * 2.5 : u < 0.5 ? 1 - u * 3 : -0.5 + (u - 0.5);
// the tea set as ep_tea sets it down on 08 (card pixels of that drawing): the tray, the pot behind, two cups on saucers.
// The steam goes up from the cups' rims (it is under her, a layer behind); on the stop it breaks off and goes
const CUPS = [[162, 1136, 1190], [312, 1136, 1190]];             // [middle x, rim y, bottom y] (c3c: the redrawn ep_tea)
function tray(c, T, set, big, cups) {
  const X = teaX, Y = teaY, e = (u, v, rx, ry) => { c.beginPath(); c.ellipse(X(u), Y(v), rx * EK, ry * EK, 0, 0, 7); };
  if (set && TEA) { const [x, y] = teaR(TEA_BOX[0], TEA_BOX[1]); c.drawImage(TEA, x, y, TEA.width * EK, TEA.height * EK); }   // c3b: the sitting drawings' own tea set
  else if (set) {
    // as ep_tea leaves it: the pot (its middle at 256, 1150) behind, the cups in front, all on a white tray
    const PX = -26, PY = -192;                                     // the pot as it was drawn before, moved to where r9's is
    c.save(); c.strokeStyle = K.navy; c.lineWidth = 1.6; c.lineJoin = 'round';
    e(217, 1238, 123, 20); c.fillStyle = K.white; c.fill(); c.stroke();
    c.fillStyle = K.white;
    c.beginPath(); c.moveTo(X(232 + PX), Y(1338 + PY)); c.quadraticCurveTo(X(214 + PX), Y(1322 + PY), X(196 + PX), Y(1300 + PY)); c.lineTo(X(206 + PX), Y(1296 + PY)); c.quadraticCurveTo(X(226 + PX), Y(1312 + PY), X(242 + PX), Y(1322 + PY)); c.closePath(); c.fill(); c.stroke();      // the spout
    c.beginPath(); c.ellipse(X(320), Y(1146), 20 * EK, 26 * EK, 0, -1.4, 1.4); c.lineWidth = 3; c.stroke(); c.lineWidth = 1.6;               // the handle
    e(256, 1150, 58, 44); c.fill(); c.stroke(); e(256, 1108, 34, 8); c.fill(); c.stroke(); e(256, 1095, 9, 9); c.fill(); c.stroke();
    for (const [x, t, b] of CUPS) {
      e(x, b + 2, 55, 10); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(X(x - 34), Y(t)); c.lineTo(X(x + 34), Y(t)); c.bezierCurveTo(X(x + 34), Y(b - 18), X(x + 22), Y(b), X(x), Y(b)); c.bezierCurveTo(X(x - 22), Y(b), X(x - 34), Y(b - 18), X(x - 34), Y(t)); c.closePath(); c.fill(); c.stroke();
      e(x, t, 34, 6); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(X(x + 40), Y(t + 22), 11 * EK, 14 * EK, 0, -1.4, 1.4); c.lineWidth = 3; c.stroke(); c.lineWidth = 1.6;
    }
    c.restore();
  }
  // steam: two or three thin wisps from each cup, half-clear and fading as they rise, no taller than three cups; on the
  // stop they come apart where they are and fade
  const st = T - T_STOP, L = (big ? 1.25 : 1) * 3 * 52 * EK, lw = big ? 4 : 3;
  if (st > 1.2) return;
  (cups ?? (TEA && T >= NOTE[1] ? EPR.cups.map(([u, v]) => teaR(u, v)) : CUPS.map(([x, t]) => [teaX(x), teaY(t)]))).forEach(([cx, cy], j) => {
    for (let w = 0; w < 2; w++) {
      const ph = ((T - start) * 0.45 + j * 0.37 + w * 0.5) % 1, gone = st > 0 ? clamp(st / 1.2) : 0;
      c.save(); c.strokeStyle = K.white; c.lineWidth = lw; c.lineCap = 'round';
      for (let k = 0; k < 10; k++) {
        if (st > 0 && (k + w) % 2 === 0) continue;                // it breaks
        const v0 = k / 10, v1 = (k + 1) / 10, P = v => [cx + (w ? 5 : -5) + 6 * Math.sin(v * 6 + ph * 6.283 + w), cy - 6 - (v + ph * 0.25) * L];
        c.globalAlpha = 0.55 * (1 - v0) * (1 - gone); const a = P(v0), b = P(v1); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
      }
      c.restore();
    }
  });
}
// his pencil (yellow, the wood, the lead), its point at (x, y), at angle r, len metres; edged in navy
function pencil(c, x, y, r, len, edged) {
  const L = len * PPM * 0.4, w = 9;
  c.save(); c.translate(x, y); c.rotate(r);
  if (edged) { c.fillStyle = K.navy; c.beginPath(); c.moveTo(-3, 0); c.lineTo(22, -w / 2 - 3); c.lineTo(25 + L + 10, -w / 2 - 3); c.lineTo(25 + L + 10, w / 2 + 3); c.lineTo(22, w / 2 + 3); c.closePath(); c.fill(); }
  c.fillStyle = K.navy; c.beginPath(); c.moveTo(0, 0); c.lineTo(10, -2.5); c.lineTo(10, 2.5); c.fill();
  c.fillStyle = K.paper; c.beginPath(); c.moveTo(6, -1.6); c.lineTo(22, -w / 2); c.lineTo(22, w / 2); c.lineTo(6, 1.6); c.fill();
  c.fillStyle = K.yellow; c.fillRect(22, -w / 2, L, w);
  c.fillStyle = K.red; c.fillRect(22 + L, -w / 2, 10, w);
  c.restore();
}
// 08-02, her number (the second made by researcher 08; 02 alone is another researcher's seat), written: g 0..1 of the
// way through; at (0, 0) its top left, 100 units tall, 300 wide. In graphite, thick and thin
const P02 = (() => {
  const O = dx => { const z = []; for (let a = 0; a <= 1.001; a += 0.04) z.push([dx + 27 + 27 * Math.sin(a * 6.283 - 0.3), 50 - 47 * Math.cos(a * 6.283 - 0.3)]); return z; };
  const eight = []; for (let a = 0; a <= 1.001; a += 0.025) { const q = a * 6.283; eight.push([92 + 22 * Math.sin(2 * q) * (a < 0.5 ? 0.9 : 1.1), 50 - 47 * Math.cos(q)]); }
  const dash = []; for (let a = 0; a <= 1.001; a += 0.25) dash.push([mix(136, 166, a), 56 - 2 * a]);
  const two = []; for (let a = 0; a <= 1.001; a += 0.05) two.push([262 + 26 * Math.sin(-1.4 + a * 3.2), 30 - 26 * Math.cos(-1.4 + a * 3.2)]);
  for (let a = 0.1; a <= 1.001; a += 0.1) two.push([mix(282, 242, a), mix(48, 98, a)]);
  for (let a = 0.1; a <= 1.001; a += 0.1) two.push([mix(242, 300, a), 98 + 2 * Math.sin(a * 3)]);
  return [O(0), eight, dash, O(176), two];
})();
const GRAPHITE = '#5a6172';                                      // the pencil's grey, as in ep_write
function two(c, g, col, lw, rough = true) {
  c.save(); c.strokeStyle = col; c.lineCap = 'round';
  const all = P02.reduce((a, P) => a + P.length, 0); let n = Math.floor(g * all);
  for (const P of P02) { if (n <= 0) break; for (let i = 1; i < Math.min(n, P.length); i++) { c.lineWidth = lw * (rough ? 0.75 + 0.35 * Math.sin(i * 0.9) : 1); c.beginPath(); c.moveTo(...P[i - 1]); c.lineTo(...P[i]); c.stroke(); } n -= P.length; }
  c.restore();
}
function P02Point(g) {
  const all = P02.reduce((a, P) => a + P.length, 0); let n = Math.max(1, Math.floor(g * all));
  for (const P of P02) { if (n <= P.length) return P[n - 1]; n -= P.length; }
  const P = P02[P02.length - 1]; return P[P.length - 1];
}
// the band: 永遠に歌う (its frames, empty, from the sitting down; a character on each note), 研究員 0/15 -> 1/15
function band(c, T) {
  const bx = 1470; c.fillStyle = K.navy; c.fillRect(bx, 0, W - bx, H); c.fillStyle = K.yellow; c.fillRect(bx, 0, 8, H);
  if (T >= T_SIT) for (let i = 0; i < 5; i++) { if (T >= SING[i]) continue; const k = hit(T - T_SIT - i * 0.06, 0.2, 12); if (k <= 0) continue; c.save(); c.translate(1700, 90 + 128 * 1.04 * i + 64); c.scale(k, k); c.strokeStyle = K.paper; c.globalAlpha = 0.6; c.lineWidth = 2; c.setLineDash([10, 8]); c.strokeRect(-60, -60, 120, 120); c.restore(); }
  column(c, '永遠に歌う'.split('').map((ch, i) => ({ c: ch, t: SING[i] })), T, 1700, 90, 128, { font: 'Mincho X', color: K.yellow, shadow: K.blue, sd: 6, lead: 1.04, amt: 0.35 });
  const on = T >= T_COUNT, e = out3((T - T_COUNT) / 0.25), kz = on ? hit(T - T_COUNT - 0.2, 0.6, 9) || 1 : 1;
  c.save(); if (on) { c.translate(1600, 1006); c.scale(kz, kz); c.translate(-1600, -1006); }
  text(c, '研究員', 1560, 1016, 30, { font: 'Gothic X', color: on ? K.yellow : K.paper });
  c.restore();
  c.save(); c.beginPath(); c.rect(1600, 760, 260, 300); c.clip();
  if (e < 1) text(c, '0', 1730, 1040 - e * 260, 250, { font: 'Shoulders', weight: 800, color: K.red, align: 'center' });
  if (e > 0) { c.save(); c.translate(1730, 1040 + (1 - e) * 260); c.scale(kz, kz); text(c, '1', 0, 0, 250, { font: 'Shoulders', weight: 800, color: K.yellow, align: 'center' }); c.restore(); }
  c.restore();
  text(c, '/15', 1790, 1020, 64, { font: 'Shoulders', weight: 600, color: K.paper });
}
// the day, top left on this page (so that 08 is seen), and the machine's log under it (the opening's type)
function days(c) { dayMark(c, 182621, { edge: K.blue }); }
function log(c, T) {
  const lines = [];
  if (T >= T_FIND + 0.25 && T < NOTE[2]) lines.push('> ナミダ  OK');
  if (T >= T_STOP) lines.push('> 心  OK');
  if (T >= T_TYPE[0]) { const s = '記録ヲ閉ジル', m = Math.min(s.length, Math.floor((T - T_TYPE[0]) / ((T_TYPE[1] - T_TYPE[0]) / s.length)) + 1); lines.push('> ' + s.slice(0, m) + (Math.floor(T * 4) % 2 ? '_' : '')); }
  lines.forEach((s, i) => text(c, s, 72, 130 + i * 50, 40, { font: 'Dot', color: K.white }));
}

// ---- the shots
function scene(c, T) {
  let o = { T, s: 1, f: [735, 560], at: [735, 540], tray: T >= NOTE[1], steam: false, pencil: T < T_FIND };
  if (T < NOTE[1]) {
    // r9: the tea. She brings it in on the tray (ep_tea2), and on the small note sets it down on 08 (ep_tea), smiling.
    // Both drawings have the stool in them (the same stool as 08, the same size): theirs stands on 08's place, the roll's
    // 08 is not drawn. The tea stays on 08 from here on (drawn by tray(), where ep_tea leaves it)
    // c3: on 09 - the stool beside his - as he set the cup on it in the opening; she comes in from its right
    const n = T < T_TEA2 ? 'ep_tea2' : 'ep_tea';
    o.s = mix(0.92, 0.95, (T - NOTE[0]) / 2.46); o.f = SF.tea; o.at = SA.tea;
    o.no09 = true; o.steam = n === 'ep_tea';
    o.she = c => epx(c, n, ...SEAT[n], X9O, GY);
  } else if (T < T_FIND) {                                     // the floor: the two broom drawings, once each (half the shot each; never back)
    const n = use(T < (NOTE[1] + T_FIND) / 2 ? 'ep_sweep' : 'ep_sweep2');
    o.steam = true; o.s = mix(1.0, 1.04, (T - NOTE[1]) / 2.24); o.f = SF.sweep; o.at = SA.sweep; o.noLabels = true;   // nearer, on her and the broom: her boots and the broom on the floor in the frame, the labels under it out of it; 08 and 09 whole
    // c3: she sweeps just right of 09 (the stools are 0.73 m apart now: between them there is no room for her)
    const bx = X9O + BROOM;                                    // where the front boot's right edge stands (ep_sweep 750.5,2114; ep_sweep2 746.5,2113)
    o.she = n === 'ep_sweep' ? c => epx(c, n, 750.5, 2114, bx, GY) : n === 'ep_sweep2' ? c => epx(c, n, 746.5, 2113, bx, GY) : c => her(c, n, X9O + 0.35 * PPM, GY, PPM);
  } else if (T < NOTE[2]) {                                    // his pencil, under his stool: she has it, crouching; in tears. The tea on 09 behind her
    const n = use('ep_find'), u = (T - T_FIND) / 2.14;
    o.s = mix(1.22, 1.26, u); o.f = SF.find; o.at = SA.find; o.steam = true;
    o.she = n === 'ep_find' ? c => epx(c, n, 888.5, 2113, X8O + FINDX, GY) : c => her(c, n, X8O + FINDX, GY, PPM);
  } else if (T < T_SIT) {
    return insert(c, T);
  } else {                                                     // 08 and 09: she sits on 08, his seat; the tea on 09
    const sit = T < NOTE[4], sing = !sit && T < T_STOP, lean = !sit && !sing && SITC.lean1;
    const n = sit ? use(SITC.sit) : sing || !lean ? use(SITC.sing) : use(T < T_LEAN2 || !SITC.lean2 ? SITC.lean1 : SITC.lean2);
    o.steam = true;
    if (sit) { o.s = mix(0.95, 0.99, smooth((T - T_SIT) / (NOTE[4] - T_SIT))); o.f = SF.sit; o.at = SA.sit; }
    else if (sing) { o.s = mix(1.6, 1.65, (T - NOTE[4]) / 3.44); o.f = SF.sing; o.at = SA.sing; o.big = true; }
    // the two stools whole, from her bow to the floor; the floor line at the frame's foot, the labels out of the frame
    else { o.s = mix(SL[0], SL[1], (T - T_STOP) / 3.71); o.f = SF.two; o.at = SA.two; o.big = true; o.stop = true; o.noLabels = true; }
    o.no08 = n.startsWith('ep');                               // the ep sitting drawings carry the stool: theirs is 08
    if (EPL[n]) {
      // (a redrawn two-stool pair) her on 08, the tea on 09, in one drawing; the middle between its two stools on the
      // middle between 08 and 09; nothing of the roll's own stools or tea is drawn
      const [mu, fv, cups] = EPL[n], mx = (X8O + X9O) / 2, ex = u => mx + (u - mu) * EK, ey = v => GY + (v - fv) * EK;
      o.no09 = true; o.tray = false;
      o.cups = cups.map(([u, v]) => [ex(u), ey(v)]);
      o.she = c => epx(c, n, mu, fv, mx, GY);
    } else o.she = SEAT[n] ? c => epx(c, n, ...SEAT[n], X8O, GY) : c => her(c, n, X8O, GY, PPM);
  }
  roll(c, o);
}
// 260.64: a line of the roll, near, on cream paper (the sheet of ep_write). Her hand strikes out 09's 空席 and writes 08-02;
// the hand is put down where each stroke ends and stays while the stroke is drawn (no sliding); graphite, thick and thin
const PAPER = '#fef5df', TIP = [172, 932], HK = 1.15, W2TIP = { ep_write2a: [199, 580], ep_write2b: [191, 611], ep_write2c: [199, 540] }, HK2 = 1.4;   // v8: the tip measured again on ep_write2b (191, 611); larger, so that her forearm comes in from the frame's right edge and is not cut off inside the frame   // a17 (third round): the pencil points; mpp 0.00028, as before
const ROW = 640, NUMX = 560, STX = 1500, P0X = 810, P0Y = 470, P0S = 1.15;
const WR = 1.7;                                                  // c3: the writing of 08-02 (s), unhurried: the shot is 0.41 s longer (no carrying)
function insert(c, T) {
  const t = T - NOTE[2], z = mix(1.0, 1.035, t / (T_SIT - NOTE[2]));
  c.fillStyle = PAPER; c.fillRect(0, 0, W, H);
  c.save(); c.translate(960, 560); c.scale(z, z); c.translate(-960, -560);
  // the sheet: its title, its rows (06 - 10), its ruled lines; the line of 08 - his, now hers - is the line behind her heart
  text(c, '研究員名簿', 300, 130, 46, { font: 'Gothic X', color: K.blue, alpha: 0.8 });
  text(c, 'LABORATORY ROLL', 610, 126, 24, { color: K.blue, alpha: 0.6, track: 3 });
  c.fillStyle = K.blue; c.globalAlpha = 0.5; c.fillRect(300, 160, 1300, 4); c.fillRect(780, 160, 3, 920); c.globalAlpha = 1;
  for (const [n, y, s, a] of [['06', 300, 80, 0.4], ['07', 440, 100, 0.55], ['08', ROW, 130, 1], ['09', 830, 100, 0.55], ['10', 970, 80, 0.4]]) {
    text(c, n, NUMX, y, s, { color: K.blue, alpha: a }); text(c, '空席', STX, y, s, { font: 'Gothic', color: K.blue, alpha: a, align: 'right' });
    if (n !== '08') { c.fillStyle = K.blue; c.globalAlpha = 0.3; c.fillRect(300, y + 30, 1300, 2); c.globalAlpha = 1; }
  }
  c.save(); c.strokeStyle = K.blue; c.lineWidth = 4; c.lineJoin = 'round'; c.beginPath();
  for (let x = 300; x <= 1600; x += 3) { let v = 0; for (const tt of [NOTE[2], 261.06, NOTE[3]]) { const age = T - tt + 1 / 48; if (age < 0 || age > 2) continue; const u = (Math.abs(x - 950) - age * 900) / 40; if (u > -1 && u < 1) v += 40 * Math.exp(-age) * spike(u); } x === 300 ? c.moveTo(x, 700 - v) : c.lineTo(x, 700 - v); }
  c.stroke(); c.restore();
  // what the pencil has drawn
  const sA = [STX - 285, ROW - 48], sB = [STX + 16, ROW - 54], st = clamp((t - 0.12) / 0.3), g = clamp((t - 0.62) / WR);
  if (st > 0) { c.save(); c.strokeStyle = GRAPHITE; c.lineCap = 'round'; for (let i = 0; i < 12; i++) { const a = i / 12, b = Math.min(st, (i + 1) / 12); if (a >= st) break; c.lineWidth = 9 + 3 * Math.sin(i * 1.3); c.beginPath(); c.moveTo(mix(sA[0], sB[0], a), mix(sA[1], sB[1], a)); c.lineTo(mix(sA[0], sB[0], b), mix(sA[1], sB[1], b)); c.stroke(); } c.restore(); }
  if (g > 0) { c.save(); c.translate(P0X, P0Y); c.scale(P0S, P0S); two(c, g, GRAPHITE, 9 / P0S); c.restore(); }
  // the hand (epw2 only): its pencil point is the end of the line as it grows, every frame. 2a for the strike; on 261.06
  // the grip for writing (2b); written, it lifts (2c) and goes
  let tip = null, hn = null;
  if (t < 0.05) { /* the hand comes in with the stroke (r8: no frame of the lifted hand before it) */ }
  else if (t < 0.42) { hn = 'ep_write2b';   /* r8 (R2): one drawing of her hand for the whole insert - the strike, the writing and the lift (2a / 2c were held 0.4 / 0.5 s) */
    tip = [mix(sA[0], sB[0], st), mix(sA[1], sB[1], st)]; }
  else if (t >= 0.42 && t < 0.62 + WR) { hn = 'ep_write2b'; const q = P02Point(Math.max(g, 0.001)); tip = [P0X + q[0] * P0S, P0Y + q[1] * P0S]; if (g <= 0) { const e = smooth((t - 0.42) / 0.2); tip = [mix(sB[0], tip[0], e), mix(sB[1], tip[1], e) - 40 * Math.sin(e * Math.PI)]; } }
  else if (t < 1.12 + WR) { hn = 'ep_write2b'; const q = P02Point(1), e = smooth((t - 0.62 - WR) / 0.5); tip = [P0X + q[0] * P0S + 20 + 520 * e * e, P0Y + q[1] * P0S - 60 - 420 * e * e]; }
  if (tip && HANDS[hn]) { const im = HANDS[hn], tp = W2TIP[hn]; fig(c, im, tip[0] + (im.width / 2 - tp[0]) * HK2, tip[1] + (im.height - tp[1]) * HK2, im.height * HK2); }
  else if (tip) pencil(c, tip[0], tip[1] - 2, -2.3, 0.62 * 4);
  c.restore();
}

// 273.75: her face, as the film begins (open.js frame 0): the same framing, the same line, the same 心 OK and DAY. It
// stays to the end, coming nearer to exactly the opening's size on the last frame; her tears run.
// v8: the bow whole in the frame all the way, to the push's end: her drawing's top stays 34 px under the frame's top
// and the push grows downward (r9 en_c: 927 x 1275, the bow's top at card y 5)
const FACE_T = 34, faceFoot = z => FACE_T + 1420 * z;
// r11: her tears run - drawn frames (set endt, the same canvas and place as en_c), one way, never back. The tear's run
// (t1 - t5b) goes on at about 0.53 s a drawing, on the music box's last notes where they fall (measured onsets 274.31 /
// 275.01 / 276.07; after 276.07 the box only rings out, so the rest are even); t6 is held longer (1.0 s), and end_t7
// comes in with the day turning over (T_DAY) and holds the last 1.6 s
const END_T = [[NOTE[6], 'end_t0'], [274.306, 'end_t1'], [275.009, 'end_t2'], [275.54, 'end_t3'], [276.071, 'end_t4'], [276.60, 'end_t4b'],
  [277.13, 'end_t5'], [277.38, 'end_t5b'], [278.00, 'end_t6'], [T_DAY, 'end_t7']];   // t5 (the drop below her chin) only 0.25 s: falling, not stuck
function endCard(T) {
  let n = 'en_c'; for (const [t, k] of END_T) if (T >= t - 1e-6 && pic(k)) n = k;   // a drawing not baked yet: the one before it holds
  return n;
}
// v8b: the day stands still, all its figures on one line; on T_DAY its last figure turns over once - the 1 slides up out
// of its place and the 2 up into it, in 4 frames, then everything is level again (no knocks on the small beats)
function faceDay(c, T) {
  dayMark(c, '18262', { edge: K.blue });
  c.save(); c.font = '800 92px "Shoulders"'; const w5 = c.measureText('18262').width, wd = c.measureText('2').width; c.restore();
  const x = 72 + 22 + w5, y = H - 72, a = T - T_DAY, SL = 4 / 24, e = a <= 0 ? 0 : a >= SL ? 1 : smooth(a / SL);
  const fig1 = (d, dy) => { c.save(); c.translate(x, y + dy); c.font = '800 92px "Shoulders"'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
    c.strokeStyle = K.blue; c.lineWidth = Math.max(6, 92 * 0.16); c.strokeText(d, 0, 0); c.fillStyle = K.yellow; c.fillText(d, 0, 0); c.restore(); };
  if (e <= 0) return fig1('1', 0);
  if (e >= 1) return fig1('2', 0);
  c.save(); c.beginPath(); c.rect(x - 10, y - 92 * 0.9 - 8, wd + 24, 92 * 0.9 + 18); c.clip();
  fig1('1', -100 * e); fig1('2', 100 * (1 - e)); c.restore();
}
function face(c, T) {
  const br = 1 + 0.015 * Math.sin(Math.PI * clamp((T - 275.4) / 1.6));   // one breath
  const z = mix(1.0, 1.05, clamp((T - NOTE[6]) / (T_FIN - NOTE[6]))) * br;
  c.fillStyle = K.blue; c.fillRect(0, 0, W, H); grid(c, K.paper, 40, 0.09);
  lineBehind(c, T, z);
  fig(c, endCard(T), 960, faceFoot(z), 1420 * z);
  // v8b: no drops drawn over her face (small, over the drawn tear, they read as hollow rings); the tears are the drawing's own
  // 心 OK, as open.js sets it on its first frame
  text(c, '>', 60, 600, 84, { font: 'Dot', color: K.white });
  text(c, '心', 132, 604, 92, { font: 'Mincho X', color: K.white });
  text(c, 'OK', 262, 600, 84, { font: 'Dot', color: K.yellow });
  faceDay(c, T);
}
// the line behind her heart (open.js: y 760, 8 px): small beats as the last note dies away; on 182622, one large beat
function lineBehind(c, T, z) {
  const h = 1420 * z, wd = h * 927 / 1275, top = faceFoot(z) - h, j = clamp(Math.round((760 - top) / h * (EDGE.length - 1)), 0, EDGE.length - 1), xl = 960 - wd / 2 + EDGE[j][0] * wd, xr = 960 - wd / 2 + EDGE[j][1] * wd;
  const ev = ECHO.concat([[T_DAY, 330]]);
  c.save(); c.strokeStyle = K.yellow; c.lineWidth = 8; c.lineJoin = 'round';
  for (const [x0, x1, o, dir] of [[-20, xl + 30, xl, -1], [xr - 30, W + 20, xr, 1]]) {
    c.beginPath();
    for (let x = x0; x <= x1; x += 3) {
      let v = 0;
      for (const [t, a] of ev) { const age = T - t + 1 / 48; if (age < 0 || age > 2) continue; const dist = (x - o) * dir, u = (dist - age * 1300) / (a > 100 ? 80 : 46); if (u > -1 && u < 1 && dist > -20) v += a * Math.exp(-age * 0.6) * spike(u); }
      if (x < 440 && v > 110) { const q = clamp((440 - x) / 80); v = mix(v, 110 + (v - 110) * 0.12, q); }   // v8: not up into the 心 OK
      x === x0 ? c.moveTo(x, 760 - v) : c.lineTo(x, 760 - v);
    }
    c.stroke();
  }
  c.restore();
}

export function draw(c, t) {
  const T = t + start;
  if (T < NOTE[6]) { scene(c, T); if (T < NOTE[2] || T >= T_SIT) { band(c, T); days(c); log(c, T); } }
  else face(c, T);
}
