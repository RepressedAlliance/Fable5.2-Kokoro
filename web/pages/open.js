// The opening and the intro (0 - 35.445 s).
//   COLD OPEN (0 - 9.73), one fixed frame, one thing happening in it: the young man ties the bow on her head; she opens
//   her eyes; he laughs; there is nothing behind her eyes; he grows old a note at a time and is gone; she does not change.
//   The title drops into the half of the frame he left.  (Music box notes: NOTE, measured.)
//   INTRO (9.73 - 35.445, the band): how he got there, in order. DAY 000001 he starts; sheet after sheet fails; he sleeps;
//   draws again; her design; the three views; her parts; the days run out to 001460; the bow; he looks up at her; his
//   hands lift the bow over her head - the moment before the cold open's first frame. Cut to verse1.
// Beats: 20.016 + k * 0.42858 s; bars at k = 0 mod 4. 9.73 s is k = -24.
import { W, H, K, clamp, mix, smooth, out3, out5, rnd, hit, img, pic, fig, tint, text, grid, stamp, press, shake, dayMark } from './kit.js';
export const name = 'open';
export const start = 0;
const T0B = 20.016, PB = 0.42858, kt = k => T0B + k * PB, kbOf = T => (T - T0B) / PB, FR = 1 / 24;
export const duration = kt(36);
const pick = (A, x) => { let v = A[0][1]; for (const [k, n] of A) if (x >= k - 1e-6) v = n; return v; };
const pickAt = (A, x) => { let v = A[0]; for (const a of A) if (x >= a[0] - 1e-6) v = a; return v; };
let V2 = null;
const HAVE = new Set();
async function want(n) { if (HAVE.has(n)) return true; try { await img(n); HAVE.add(n); return true; } catch (e) { return false; } }

// ------------------------------------------------------------------ the cold open (set kv: a15, A1)
// One frame, one thing: he ties the bow; her eyes open; he laughs; then he tries to make her laugh - pushes up the
// corners of his mouth, she copies him with empty eyes (and where her heart should be the slot blinks empty), and he ends
// with his hand on her head. On the loudest note (7.80) a hard cut to the title. DAY 001460 all through.
// r9: the kv cards were redrawn whole ([1277, 1047] since v8b); kv_wave / kv_laugh / kv_sad are gone. Every card is held about two
// beats (0.72 - 1.27 s), on the music box notes.
// The kv card on screen: (KX0, KY0) + KS * card px. Its bottom edge is a cut: it sits on the frame's bottom edge.
const KV = ['kv_tie', 'kv_done', 'kv_e1', 'kv_e2', 'kv_joy', 'kv_grin', 'kv_mimic', 'kv_pat'];
// v8b: the kv canvas is 1047 high now (everything 23 px lower; his hair 4 px under the card's top): the card is set
// 40 px down so there is air over his head; its bottom (a cut) goes out under the frame's bottom edge
const KS = 1.06, KX0 = 400, KY0 = 40;
const KV_BOW = [655, 123, 1262, 371];                      // the bow's box in the kv cards (measured; v8b: +23)
const KV_EYE = [966, 460], KV_SOCKET = [965, 735];         // her eyes' middle and her chest slot in the kv cards (measured)
const kv2s = (x, y) => [KX0 + KS * x, KY0 + KS * y];
const kvName = n => HAVE.has(n) ? n : 'kv_tie';
const OPW = 926, OPH = 1273, EYE_L = [367, 539], EYE_R = [585, 539];
function kvCard(c, n) { const im = pic(n), [x, y] = kv2s(0, 0); c.drawImage(im, x, y, im.width * KS, im.height * KS); }
const kvBow = () => { const [x0, y0] = kv2s(KV_BOW[0], KV_BOW[1]), [x1, y1] = kv2s(KV_BOW[2], KV_BOW[3]); return [x0, y0, x1, y1]; };

// music box notes, measured
const NOTE = [0.50, 0.97, 1.40, 2.24, 2.69, 3.12, 3.55], T_EYE = 3.97, T_JOY = 4.32, T_HEART = 6.55, T_PAT = 6.96, T_GRIN = 5.125, T_TITLE = 7.80, T_BAND = kt(-24);
// r9: kv_joy needs two beats (0.83 s) and the eye shot its 0.39 s, so the grin lands 0.1 s after the 5.04 note, in the
// quiet before 5.58; the eye shot opens straight on the open eyes (kv_e2 is already half open: no op_h in-between)
const CO = [[0, 'kv_tie'], [0.97, 'kv_done'], [2.24, 'kv_e1'], [3.12, 'kv_e2'], [T_JOY - FR, 'kv_joy'],
  [T_GRIN, 'kv_grin'], [6.12 - FR, 'kv_mimic'], [T_PAT - FR, 'kv_pat']];
// the camera: in from 1.10 on the first frames; while her eyes open, a step nearer on each note, held on her eyes and
// zooming on her eyes (so the cut to her eyes, near, finds them where they were); after the laugh slowly on
const CO_PAN = [40, 0];           // r9 astra: a pan to the left pushed his sleeve under the DAY mark; he now stays clear of it
function coCam(T) {
  let z = 1.0, u = 0;                                                    // v8: no zoom-in on the first frames (it cut his hair)
  for (let i = 2; i < NOTE.length; i++) u += out3((T - NOTE[i]) / 0.14) / (NOTE.length - 2);
  z += 0.14 * u;
  let p = [CO_PAN[0] * u, CO_PAN[1] * u], f = [kv2s(...KV_EYE)[0], 100];   // on her eyes across, on the top of his hair down: nothing goes out of the top
  if (T >= T_JOY - FR) { z = 1.0 + 0.02 * smooth((T - T_JOY + FR) / 2.6); p = [0, 0]; f = [980, 20]; }
  if (T >= T_PAT - FR) z = 1.02 + 0.045 * smooth((T - T_PAT + FR) / 0.84);  // 6.96 - 7.80: closer, on him and her
  return { z, p, f };
}
const eyeOnScreen = () => [kv2s(...KV_EYE)[0] + CO_PAN[0], kv2s(...KV_EYE)[1] + CO_PAN[1]];
function bg(c, col = K.blue, gcol = K.paper, a = 0.09) { c.fillStyle = col; c.fillRect(-60, -60, W + 120, H + 120); grid(c, gcol, 40, a); }
const camAt = (c, z, fx, fy) => { c.translate(fx, fy); c.scale(z, z); c.translate(-fx, -fy); };

// the title page (7.80 - 9.73), navy: ココロ as squares, each 5 x 5, centred and large. The middle square of ロ's right side
// is missing (no heart): MISS.
const TP = 66, TS = 60, TGAP = 50, TW = 3 * 5 * TP + 2 * TGAP, TX0 = (W - TW) / 2, TY0 = 230;
const TILES = (() => { const out = []; ['コ', 'コ', 'ロ'].forEach((ch, k) => { for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) if (j === 0 || j === 4 || i === 4 || (ch === 'ロ' && i === 0)) out.push([TX0 + k * (5 * TP + TGAP) + i * TP, TY0 + j * TP, k, i, j]); }); return out; })();
const MISS = TILES.findIndex(q => q[2] === 2 && q[3] === 4 && q[4] === 2);
const TCX = W / 2, TCY = TY0 + 2.5 * TP;
function titlePage(c, T) {
  const a = T - T_TITLE + FR, [sx, sy] = shake(a, 16), zt = 1 + 0.035 * smooth((a - 0.2) / 1.7);
  c.save(); c.translate(sx, sy);
  c.fillStyle = K.navy; c.fillRect(-60, -60, W + 120, H + 120);
  c.save(); camAt(c, zt, TCX, 560);
  const k = a < 0.12 ? mix(1.7, 1, out3(a / 0.12)) : 1 + 0.04 * Math.exp(-(a - 0.12) * 14);
  c.save(); c.translate(TCX, TCY); c.scale(k, k); c.translate(-TCX, -TCY);
  TILES.forEach(([x, y], i) => {
    if (i === MISS) return;
    const d = hit(a - 0.1 - rnd(i * 1.3) * 0.05, 0.22, 16) || 1;
    c.fillStyle = K.yellow; c.fillRect(x + TS / 2 - TS / 2 * d, y + TS / 2 - TS / 2 * d, TS * d, TS * d);
  });
  // the gap: red three times as it lands, the square that should be there falls out of it; then an empty frame, blinking.
  // On k = -26 a scrap of paper flies in, tries the gap, sits a moment, slips and falls away
  const [gx, gy] = TILES[MISS];
  if (a < 0.42) { if (Math.floor(a / 0.07) % 2 === 0) { c.strokeStyle = K.red; c.lineWidth = 8; c.strokeRect(gx - 5, gy - 5, TS + 10, TS + 10); } }
  else { const on = Math.floor((a - 0.42) / 0.215) % 2 === 0; c.strokeStyle = on ? K.paper : K.yellow; c.lineWidth = on ? 6 : 4; c.strokeRect(gx + 3, gy + 3, TS - 6, TS - 6); }
  // v8: the scrap of paper that tried the gap read as a patch stuck on wrong; the gap is only the empty, blinking frame
  if (a < 1.0) { const f = a / 1.0; c.save(); c.translate(gx + TS / 2 + 140 * f, gy + TS / 2 + 1000 * f * f); c.rotate(f * 4); c.fillStyle = K.yellow; c.fillRect(-TS / 2, -TS / 2, TS, TS); c.restore(); }
  c.restore();
  const k1 = hit(T - kt(-27), 0.25, 14), k2 = hit(T - kt(-26), 0.25, 14);
  if (k1 > 0) { c.save(); c.translate(W / 2, 700); c.scale(k1, k1); text(c, '鏡音リン', 0, 0, 76, { font: 'Mincho X', color: K.paper, align: 'center', track: 16 }); c.restore(); }
  if (k2 > 0) { c.save(); c.translate(W / 2, 790); c.scale(k2, k2); text(c, 'music  トラボルタ', 0, 0, 50, { font: 'Mincho X', color: K.paper, align: 'center', track: 5 }); c.restore(); }
  c.restore();
  const S = '> 記録ヲ開ク';
  if (T >= 8.70) {
    const n = S.length, kk = hit(T - 8.70, 0.3, 14);                          // v8: the line lands whole
    c.save(); c.font = '400 50px "Dot"'; const w = c.measureText(S + '_').width; c.restore();
    c.save(); c.translate(W / 2, 912); c.scale(kk, kk); c.translate(-W / 2, -912);
    text(c, S.slice(0, n) + (Math.floor(T * 4) % 2 ? '_' : ''), W / 2 - w / 2, 930, 50, { font: 'Dot', color: K.yellow }); c.restore();
  }
  c.restore();
  dayMark(c, 1460, { edge: K.navy });
}
// the machine's lines, top left
const CX = 72;
function termCol(c, T) {
  if (T < NOTE[1] - FR) return;
  const k1 = hit(T - NOTE[1], 0.3, 16);
  c.save(); c.translate(CX, 310); c.scale(k1, k1); text(c, '> 起動', 0, 0, 60, { font: 'Dot', color: K.white }); c.restore();
  const on = [...NOTE.slice(1), T_EYE];
  for (let i = 0; i < 7; i++) {
    const x = CX + i * 36, lit = T >= on[i] - FR, kk = lit ? hit(T - on[i], 0.5, 20) : 1;
    c.save(); c.translate(x + 14, 360); c.scale(kk, kk);
    if (lit) { c.fillStyle = i === 6 ? K.yellow : K.white; c.fillRect(-14, -12, 28, 24); } else { c.strokeStyle = K.white; c.lineWidth = 3; c.strokeRect(-13, -11, 26, 22); }
    c.restore();
  }
  if (T >= T_JOY - FR) { const k = hit(T - T_JOY + FR, 0.4, 14); c.save(); c.translate(CX + 210, 310); c.scale(k, k); text(c, 'OK', 0, 0, 60, { font: 'Dot', color: K.yellow }); c.restore(); }
  if (T >= T_HEART - FR) {
    const k = hit(T - T_HEART, 0.4, 14); c.save(); c.translate(CX, 480); c.scale(k, k); text(c, '> 心', 0, 0, 60, { font: 'Dot', color: K.white }); c.restore();
    const a = T - T_HEART, on2 = a < 0.6 ? Math.floor(a / 0.15) % 2 === 0 : true;
    if (on2) { c.fillStyle = K.red; c.fillRect(CX + 154, 460, 120, 10); }
  }
}
// her chest: where the heart should go, an empty dashed ring, twice (6.55 - 6.96, while she copies his smile)
function heartRing(c, T) {
  const a = T - T_HEART; if (a < -FR || a > 0.4) return;
  if (Math.floor((a + FR) / 0.135) % 2 === 1) return;
  const [x, y] = kv2s(...KV_SOCKET), g = hit(a + FR, 0.3, 12);
  c.save(); c.strokeStyle = K.yellow; c.lineWidth = 6; c.setLineDash([16, 12]); c.lineDashOffset = -a * 40;
  c.beginPath(); c.arc(x, y, 74 * g, 0, 7); c.stroke(); c.restore();
}
// the box the bow is fitted to: from the first frame it closes on the bow; on 0.50 it is set (yellow, OK)
function bowBox(c, T) {
  // v8 astra: the first frame must be clean - only four corner marks round the bow, closing in; no line crosses a face
  if (T >= NOTE[1] + 0.3) return;
  const [x0, y0, x1, y1] = kvBow(), set = T >= NOTE[0] - FR, m = set ? 10 : mix(46, 14, out5(T / 0.3)), L = 54;
  const fl = set ? Math.exp(-(T - NOTE[0]) * 9) : 0;
  c.save(); c.strokeStyle = set ? K.yellow : K.paper; c.lineWidth = (set ? 7 : 5) + 10 * fl; c.lineCap = 'square';
  c.beginPath();
  for (const [x, y, sx, sy] of [[x0 - m, y0 - m, 1, 1], [x1 + m, y0 - m, -1, 1], [x0 - m, y1 + m, 1, -1], [x1 + m, y1 + m, -1, -1]]) {
    c.moveTo(x, y + sy * L); c.lineTo(x, y); c.lineTo(x + sx * L, y);
  }
  c.stroke();
  if (set) { const k = hit(T - NOTE[0], 0.4, 14); c.save(); c.translate(x1 + m + 24, y0 + 40); c.scale(k, k); text(c, 'OK', 0, 0, 72, { font: 'Dot', color: K.yellow }); c.restore(); }
  c.restore();
}
// 3.97: her eyes, near - the one moment the whole film is built on. Half open a frame before the note, open on it; from
// each pupil a thin ring opens out and is gone, and four yellow corners close on each eye and lock
// r9: her eyes sit where they were in the two-shot (x); higher, so the bow goes out of the top cleanly (her right headphone is cut by the edge)
const EYE_Z = 1.2, EYE_Y = 185;
function eyeShot(c, T) {
  bg(c);
  const a = T - T_EYE, z = 1 + 0.035 * out3(a / 0.36), ex = eyeOnScreen()[0];
  const X0 = ex - (EYE_L[0] + EYE_R[0]) / 2 * EYE_Z, Y0 = EYE_Y - EYE_L[1] * EYE_Z;
  c.save(); camAt(c, z, ex, EYE_Y);
  const im = pic('op_o'), w = OPW * EYE_Z;
  c.drawImage(im, X0, Y0, w, OPH * EYE_Z);
  if (a >= FR) for (const [u, v] of [EYE_L, EYE_R]) for (const [d, r0, r1] of [[FR, 40, 175], [3 * FR, 30, 120]]) {
    const f = (a - d) / 0.3; if (f < 0 || f > 1) continue;
    const x = X0 + u * EYE_Z, y = Y0 + v * EYE_Z, r = mix(r0, r1, out3(f)) * EYE_Z / 1.62, lw = 7 * (1 - f);
    c.strokeStyle = K.white; c.lineWidth = lw; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke();
  }
  if (a >= FR && a < 0.62 && !(a > 0.36 && a < 0.44)) for (const [u, v] of [EYE_L, EYE_R]) {
    const x = X0 + u * EYE_Z, y = Y0 + v * EYE_Z, f = out5((a - FR) / 0.22), r = mix(190, 104, f) * EYE_Z / 1.5, L = 30;
    c.strokeStyle = K.yellow; c.lineWidth = 6; c.beginPath();
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { c.moveTo(x + sx * r, y + sy * (r - L)); c.lineTo(x + sx * r, y + sy * r); c.lineTo(x + sx * (r - L), y + sy * r); }
    c.stroke();
  }
  c.restore();
}
function cold(c, T) {
  if (T >= T_TITLE - FR) return titlePage(c, T);
  if (T >= T_EYE - FR && T < T_JOY - FR) {
    // the machine's lines stay over the cut: the same overlay on her eyes, near
    eyeShot(c, T); termCol(c, T); text(c, 'リボン', CX, 150, 80, { font: 'Gothic X', color: K.yellow });
    dayMark(c, 1460, { edge: K.blue }); return;
  }
  const cam = coCam(T), sh = T >= NOTE[0] - FR && T < 1 ? shake(T - NOTE[0], 9) : [0, 0];
  c.save(); c.translate(sh[0], sh[1]);
  bg(c);
  c.save(); c.translate(cam.p[0], cam.p[1]); camAt(c, cam.z, cam.f[0], cam.f[1]);
  kvCard(c, kvName(pickAt(CO, T)[1]));
  bowBox(c, T);
  heartRing(c, T);
  c.restore();
  termCol(c, T);
  // the last step, typed out a character every two frames from the first frame, large enough to read on a phone
  if (T < T_JOY - FR) text(c, 'リボン', CX, 150, 80, { font: 'Gothic X', color: K.yellow });   // v8: whole from the first frame
  c.restore();
  dayMark(c, T < 0.25 ? 1459 : 1460, { edge: K.blue });
}

// ------------------------------------------------------------------ the intro (9.73 - 35.445)
// before she is started her eyes are shut: the shut-eyed bx cards (a16) once they are baked
const shut = n => HAVE.has(n + 'c') ? n + 'c' : n;
// a card by its top-left: (x, y) where its pixel (0, 0) goes, s screen px a card px
function put(c, n, x, y, s) { const im = pic(n); c.drawImage(im, x, y, im.width * s, im.height * s); }
// r9: one floor and one scale for every side-on shot of him on the stool (ls, lb: the same mpp, so the stools, the desk
// and he are the same size in every shot): the floor at FLOOR, SIDE_S screen px a card px; his stool's middle at STOOL_X.
// The cards of a set are registered (stool, desk pixel for pixel), so a set is placed by fixed card px, never per card.
const FLOOR = 1050, SIDE_S = 0.58, STOOL_X = 640;
const floorLine = c => { c.fillStyle = K.paper; c.fillRect(-60, FLOOR, W + 120, 3); };
// lad (front, at the desk; [1163, 1868]): placed by its top-left at scale s; the desk top and his hands stay in frame
const LAD_DESK = 857;                                        // the desk's top edge, lad card px (r9b: every lad card the same desk)
// one of his sheets at (0, 0), 600 x 800: No.n; v: which try (the drawing on it); draw: how much of the drawing is done
function trySheet(c, no, v, draw = 1, head = '「心」試作') {
  c.fillStyle = K.white; c.fillRect(-300, -400, 600, 800); c.strokeStyle = K.blue; c.lineWidth = 5; c.strokeRect(-274, -374, 548, 748); c.fillStyle = K.blue; c.fillRect(-274, -374, 548, 62);
  text(c, head, -252, -330, 36, { font: 'Mincho X', color: K.white }); text(c, 'No.' + String(no).padStart(2, '0'), 252, -330, 30, { color: K.white, align: 'right' });
  c.strokeStyle = K.blue; c.fillStyle = K.blue; c.lineWidth = 5;
  const P = [];                                       // the drawing as strokes, drawn in order
  const ring = r => P.push(cc => { cc.beginPath(); cc.arc(0, -90, r, -Math.PI / 2, Math.PI * 1.5); cc.stroke(); });
  if (v % 5 === 0) { ring(110); ring(60); }
  else if (v % 5 === 1) { ring(124); ring(52); P.push(cc => { cc.beginPath(); for (const [x0, y0, x1, y1] of [[-150, -90, -60, -90], [60, -90, 150, -90], [0, -240, 0, -150], [0, -30, 0, 60]]) { cc.moveTo(x0, y0); cc.lineTo(x1, y1); } cc.stroke(); }); }
  else if (v % 5 === 2) { ring(118); ring(70); P.push(cc => { cc.beginPath(); for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; cc.moveTo(Math.cos(a) * 70, -90 + Math.sin(a) * 70); cc.lineTo(Math.cos(a) * 118, -90 + Math.sin(a) * 118); } cc.stroke(); }); }
  else if (v % 5 === 3) { P.push(cc => { cc.beginPath(); cc.arc(-80, -90, 90, 0, 7); cc.stroke(); }); P.push(cc => { cc.beginPath(); cc.arc(90, -90, 70, 0, 7); cc.stroke(); }); }
  else { ring(128); ring(84); P.push(cc => { cc.beginPath(); for (let x = -84; x <= 84; x += 4) cc.lineTo(x, -90 - Math.sin(x / 12) * 30 * Math.cos(x / 84 * Math.PI / 2)); cc.stroke(); }); }
  for (let j = 0; j < 4; j++) P.push(cc => cc.fillRect(-230, 120 + j * 46, (j + v) % 2 ? 300 - 40 * (v % 3) : 460 - 30 * (v % 5), 10));
  const n = draw * P.length;
  for (let i = 0; i < P.length; i++) if (i < n) P[i](c);
}
const STAMP_FAIL = () => stamp('失敗', 170, K.red);
// the sun and the moon: stepping along one fixed arc across the top, a step at a time (i of n; sun, moon, sun ...)
function skies(c, i, n, x0 = 300, x1 = 1640, y0 = 330, peak = 110) {
  if (i < 0) return; i = Math.min(i, n - 1);
  c.save(); c.strokeStyle = K.paper; c.lineWidth = 2; c.setLineDash([6, 14]); c.beginPath();
  for (let j = 0; j <= 40; j++) { const f = j / 40; c.lineTo(mix(x0, x1, f), y0 - (y0 - peak) * Math.sin(f * Math.PI)); }
  c.stroke(); c.restore();
  const f = n > 1 ? i / (n - 1) : 0.5, x = mix(x0, x1, f), y = y0 - (y0 - peak) * Math.sin(f * Math.PI);
  if (i < n / 2) { c.fillStyle = K.yellow; c.beginPath(); c.arc(x, y, 38, 0, 7); c.fill(); }   // the sun goes over, then the moon: never back and forth
  else { c.fillStyle = K.paper; c.beginPath(); c.arc(x, y, 34, 0, 7); c.fill(); c.fillStyle = K.blue; c.beginPath(); c.arc(x + 16, y - 10, 30, 0, 7); c.fill(); }
}
// the bow, as he draws it: strokes in order; draw: how much is done; fill: the finished bow, cream
function bowDraw(c, draw, fill, o = {}) {
  const S = [
    cc => { cc.moveTo(-34, -6); cc.bezierCurveTo(-120, -150, -270, -150, -250, -40); cc.bezierCurveTo(-240, 40, -150, 60, -34, 14); },
    cc => { cc.moveTo(34, -6); cc.bezierCurveTo(120, -150, 270, -150, 250, -40); cc.bezierCurveTo(240, 40, 150, 60, 34, 14); },
    cc => { cc.rect(-34, -30, 68, 56); },
    cc => { cc.moveTo(-20, 26); cc.lineTo(-90, 170); cc.lineTo(-40, 160); cc.lineTo(-6, 26); cc.moveTo(20, 26); cc.lineTo(90, 170); cc.lineTo(40, 160); cc.lineTo(6, 26); },
  ];
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  if (fill) { c.fillStyle = K.paper; for (const s of S) { c.beginPath(); s(c); c.fill(); } }
  c.strokeStyle = o.color ?? K.navy; c.lineWidth = o.lw ?? 7; if (o.dash) c.setLineDash(o.dash);
  const n = draw * S.length;
  for (let i = 0; i < S.length; i++) {
    if (i >= n) break;
    const part = clamp(n - i);
    c.save(); if (part < 1 && !o.dash) { c.setLineDash([900 * part, 2000]); }
    c.beginPath(); S[i](c); c.stroke(); c.restore();
  }
  c.restore();
}

// T  (-24 .. -18)  why: he alone. On stool 08, side on, he raises his cup to the empty stool beside him, where the other
// cup stands; then puts it down and looks at the empty stool. 研究員 1/15. DAY 000000.
// ls [1257, 1626] (r9b): his stool's middle x 323, the empty stool's 1068, feet 1621; the cup's top on the empty stool (card px).
const LS_STOOL = 323, LS_FEET = 1621, LS_CUP = [1068, 875];
function shotT(c, kb, T) {
  const a = T - T_BAND, [sx, sy] = shake(a, 14);
  c.save(); c.translate(sx, sy); bg(c);
  const z = 1 + 0.05 * Math.exp(-a * 6) + 0.035 * smooth((kb + 24) / 6);
  c.save(); camAt(c, z, 900, FLOOR);
  floorLine(c);
  put(c, kb >= -21 ? 'ls_look' : 'ls_tea', STOOL_X - LS_STOOL * SIDE_S, FLOOR - LS_FEET * SIDE_S, SIDE_S);
  // the cup on the empty stool, poured for nobody, still steaming (two thin flat lines; the card's cup top: LS_CUP)
  { const x = STOOL_X + (LS_CUP[0] - LS_STOOL) * SIDE_S, y = FLOOR - (LS_FEET - LS_CUP[1]) * SIDE_S;
    c.save(); c.strokeStyle = K.paper; c.lineWidth = 3; c.lineCap = 'round';
    for (const [dx, ph] of [[-9, 0], [9, 2.3]]) { c.beginPath(); for (let j = 0; j <= 12; j++) { const f = j / 12; c.lineTo(x + dx + Math.sin(f * 5.5 - T * 5 + ph) * 7 * f, y - 8 - f * 84); } c.stroke(); }
    c.restore(); }
  c.restore();
  // the roll, right: one of fifteen
  c.fillStyle = K.navy; c.fillRect(1480, -60, W, H + 120); c.fillStyle = K.yellow; c.fillRect(1480, -60, 8, H + 120);
  const kr = hit(T - kt(-23), 0.3, 14);
  if (kr > 0) { c.save(); c.translate(1560, 1000); c.scale(kr, kr); text(c, '研究員', 0, 0, 48, { font: 'Gothic X', color: K.paper }); c.restore(); }
  const k1 = hit(T - kt(-22), 0.4, 14);
  if (k1 > 0) { c.save(); c.translate(1760, 1012); c.scale(k1, k1); text(c, '1', 0, 0, 230, { font: 'Shoulders', weight: 800, color: K.yellow, align: 'right' }); c.restore(); }
  if (k1 > 0) text(c, '/15', 1770, 1006, 96, { font: 'Shoulders', weight: 600, color: K.paper });
  c.restore();
  dayMark(c, 0, { edge: K.blue });
}
// A  (-24 .. -20)  DAY 000001. He, at his desk, from the front (lad, 1:1, right), eager; his first sheet (left) is drawn
// a stroke a half-beat as he draws; 失敗, and he props his chin on his hand.
const A_HE = [[-24, 'lad0'], [-22, 'lad_1'], [-20, 'lad_34']];
const A_X = 670, A_Y = 40;
function shotA(c, kb, T) {
  const a = T - T_BAND, [sx, sy] = shake(a, 22);
  c.save(); c.translate(sx, sy); bg(c);
  const z = 1 + 0.05 * Math.exp(-a * 6) + 0.03 * smooth((kb + 24) / 6);
  c.save(); camAt(c, z, 960, 420);
  put(c, pick(A_HE, kb), A_X, A_Y, 1);
  // the sheet: slams down on the beat, drawn on a stroke a half-beat, stamped
  const ks = a < 0.1 ? mix(1.6, 1, out3(a / 0.1)) : 1 + 0.03 * Math.exp(-(a - 0.1) * 12);
  c.save(); c.translate(430, 470); c.rotate(-0.035); c.scale(0.9 * ks, 0.9 * ks);
  c.fillStyle = K.navy; c.fillRect(-300 + 14, -400 + 16, 600, 800);
  trySheet(c, 1, 0, clamp((kb + 23.5) / 2.5) );
  press(c, STAMP_FAIL(), 60, 180, T - kt(-20), -0.14);
  c.restore();
  c.restore(); c.restore();
  dayMark(c, 1, { edge: K.blue });
}
// B  (-20 .. -16)  at his desk, side on, the whole of him: sheet after sheet goes onto the pile, each one stamped
// lb [1004, 1764] (r9b, redrawn from one master: desk and stool the same in every card): the stool's middle x 223,
// feet 1758; the sheet on the desk (861, 753) (card px)
const LB_S = SIDE_S, LB_STOOL = 223, LB_FEET = 1758, LB_X = STOOL_X - LB_STOOL * LB_S, LB_Y = FLOOR - LB_FEET * LB_S, LB_PAPER = [861, 753];
const B_HE = [[-20, 'lb0'], [-18, 'lb_crumple']];
const PILE = [[1560, 600, -0.05], [1610, 560, 0.04], [1530, 540, -0.02], [1630, 520, 0.07], [1580, 500, -0.06], [1510, 520, 0.03], [1640, 480, -0.03]];
function pileOf(c, n, T, k0, stampLag = 0.5, scale = 0.62) {
  // sheets 2 .. n+1 come in from his desk a beat apart (the first is already there), stamped half a beat after
  for (let i = 0; i <= n; i++) {
    const kin = k0 + i - 1, a = i === 0 ? 9 : out5((T - kt(kin)) / 0.2); if (i > 0 && T < kt(kin)) break;
    const [px, py, r] = PILE[i % PILE.length], x = mix(LB_X + LB_PAPER[0] * LB_S, px, a), y = mix(LB_Y + LB_PAPER[1] * LB_S, py, a);
    c.save(); c.translate(x, y); c.rotate(r * a); c.scale(scale * mix(0.5, 1, a), scale * mix(0.5, 1, a));
    c.fillStyle = K.navy; c.fillRect(-300 + 14, -400 + 16, 600, 800);
    trySheet(c, i + 1, i, 1);
    press(c, STAMP_FAIL(), 60, 180, i === 0 ? 9 : T - kt(kin + stampLag), -0.14 + 0.1 * rnd(i));
    c.restore();
  }
}
function shotB(c, kb, T) {
  bg(c);
  const z = 1 + 0.04 * smooth((kb + 20) / 5);
  c.save(); camAt(c, z, 1000, 600);
  floorLine(c);
  pileOf(c, Math.min(4, Math.floor(kb + 20) + 1), T, -20);
  put(c, pick(B_HE, kb), LB_X, LB_Y, LB_S);
  c.restore();
  dayMark(c, pick([[-20, 71], [-19, 156], [-18, 264], [-17, 412], [-16, 455]], kb), { edge: K.blue });
}
// D  (-12 .. -8)  at the desk, near (lb at 1:1): a yawn; asleep on his arms while the sun and the moon go over, a day a
// half-beat; he wakes with a start and is at it again
const D_HE = [[-12, 'lb_2'], [-10, 'lb_3'], [-8, 'lb_4']];
const D_S = 1, D_X = 560, D_Y = 30;
function shotD(c, kb, T) {
  bg(c);
  // p8: the sun and the moon on one arc across the frame, centred on it (as verse2's days), clear of his head;
  // no z over him (head down on his arms, eyes shut: he is plainly asleep) and no ！ when he wakes (his face says it)
  if (kb >= -10 && kb < -8) skies(c, Math.floor((kb + 10) * 2), 4, 330, 1590, 300, 90);
  const z = 1 + 0.04 * smooth((kb + 12) / 6);
  c.save(); camAt(c, z, 1150, 500);
  put(c, pick(D_HE, kb), D_X, D_Y, D_S);
  c.restore();
  const d = kb < -10 ? 480 : kb < -8 ? Math.round(mix(480, 893, (kb + 10) / 2)) : 893 + Math.floor((kb + 8) * 2);
  dayMark(c, d, { edge: K.blue });
}
// E  (-8 .. -3)  he draws again, and this time it is her: his face (left); the sheet (right) where she is drawn,
// line by line from the top, a band a half-beat
// r9b: lad_6, drawing; then lad_5, still drawing, his eyes go to the sheet beside him (where she is coming out). He sits
// left of the middle, at the desk; the desk and his hands in frame
const E_HE = [[-8, 'lad_6'], [-6, 'lad_5']];
const E_X = 340, E_Y = 40, E_S = 0.8;
const SHX = 1250, SHY = 70, SHW = 610, SHH = 940, FIGH = 720, FIGX = 1570, FIGB = 990;
function sheetPage(c, head, no) {
  c.fillStyle = K.navy; c.fillRect(SHX + 16, SHY + 18, SHW, SHH); c.fillStyle = K.white; c.fillRect(SHX, SHY, SHW, SHH);
  c.strokeStyle = K.blue; c.lineWidth = 5; c.strokeRect(SHX + 24, SHY + 24, SHW - 48, SHH - 48);
  c.fillStyle = K.blue; c.fillRect(SHX + 24, SHY + 24, SHW - 48, 70);
  text(c, head, SHX + 52, SHY + 76, 44, { font: 'Mincho X', color: K.white }); text(c, no, SHX + SHW - 52, SHY + 74, 34, { color: K.white, align: 'right' });
}
function shotE(c, kb, T) {
  bg(c);
  const z = 1 + 0.03 * smooth((kb + 8) / 5);
  c.save(); camAt(c, z, 960, 540);
  put(c, pick(E_HE, kb), E_X, E_Y, E_S);
  sheetPage(c, '「心」試作', 'No.38');
  // her, drawn from the top down: blue lines (the drawing's own shape, one colour)
  const h = FIGH, im = pic('hi0'), w = im.width * h / im.height, top = FIGB - h;
  const rv = clamp(Math.floor((kb + 8) * 2 + 1) / 7);
  c.save(); c.beginPath(); c.rect(FIGX - w, top - 10, 2 * w, h * rv + 10); c.clip();
  c.drawImage(tint('hi0', K.blue), FIGX - w / 2, top, w, h);
  c.restore();
  if (rv < 1) { const y = top + h * rv; c.fillStyle = K.yellow; c.fillRect(SHX + 40, y - 3, SHW - 80, 6); c.fillRect(FIGX - w / 2 + ((kb * 2) % 1) * w - 10, y - 14, 20, 28); }
  // and her measure, once she is all there
  if (kb >= -5) { const g = out3((T - kt(-5)) / 0.2); c.fillStyle = K.blue; c.fillRect(FIGX - w / 2 - 60, FIGB - h * 0.94 * g, 5, h * 0.94 * g); }
  c.restore();
  dayMark(c, 1100 + Math.max(0, Math.floor(kb + 8)) * 50, { edge: K.blue });
}
// F  (-3 .. 0)  he holds the finished sheet up to the light (lb_hold), eyes shining; beside him the sheet, large:
// 完成予想図, she in colour
const LB_HELD = [732, 316];                                  // the sheet in his hands, lb_hold card px (its middle)
function shotF(c, kb, T) {
  const a = T - kt(-3), [sx, sy] = shake(a, 10);
  c.save(); c.translate(sx, sy); bg(c);
  const z = 1.0 + 0.04 * smooth((kb + 3) / 3);
  c.save(); camAt(c, z, 900, 600);
  floorLine(c);
  put(c, 'lb_hold', LB_X, LB_Y, LB_S);
  const hx = LB_X + LB_HELD[0] * LB_S, hy = LB_Y + LB_HELD[1] * LB_S;
  const X0 = 1290, Y0 = 70, SW = 560, SH = 860, g = out3(a / 0.2);
  c.save(); c.strokeStyle = K.paper; c.lineWidth = 3; c.setLineDash([10, 9]); c.lineDashOffset = -Math.floor(kb * 2) * 9.5;
  c.beginPath(); c.moveTo(hx, hy); c.lineTo(X0, Y0); c.moveTo(hx, hy); c.lineTo(X0, Y0 + SH); c.stroke(); c.restore();
  c.save(); c.translate(X0 + SW / 2, Y0 + SH / 2); c.scale(g, g); c.translate(-X0 - SW / 2, -Y0 - SH / 2);
  c.fillStyle = K.navy; c.fillRect(X0 + 16, Y0 + 18, SW, SH); c.fillStyle = K.white; c.fillRect(X0, Y0, SW, SH);
  c.strokeStyle = K.blue; c.lineWidth = 5; c.strokeRect(X0 + 22, Y0 + 22, SW - 44, SH - 44);
  c.fillStyle = K.blue; c.fillRect(X0 + 22, Y0 + 22, SW - 44, 66);
  text(c, '完成予想図', X0 + 48, Y0 + 70, 42, { font: 'Mincho X', color: K.white }); text(c, 'No.38', X0 + SW - 48, Y0 + 68, 32, { color: K.white, align: 'right' });
  const im = pic('hi0'), fh = 660, fw = im.width * fh / im.height;
  c.drawImage(im, X0 + SW / 2 + 30 - fw / 2, Y0 + SH - 40 - fh, fw, fh);
  c.fillStyle = K.blue; c.fillRect(X0 + SW / 2 + 30 - fw / 2 - 60, Y0 + SH - 40 - fh * 0.94, 5, fh * 0.94);
  c.restore();
  c.restore(); c.restore();
  dayMark(c, 1380, { edge: K.blue });
}
// G  (0 .. 5)  the three views, a beat each; under each its name; her height measured; the bow boxed on each
const VIEWS = [['hi0', '斜め前', 640, [8, 7, 492, 228]], ['sv0', '側面', 1090, [168, 7, 432, 236]], ['tb0', '背面', 1540, [62, 9, 574, 244]]];
const G_PPM = 420, G_FEET = 884;
function shotG(c, kb, T) {
  bg(c, K.white, K.navy, 0.07);
  const z = 1 + 0.05 * smooth(kb / 5);
  c.save(); camAt(c, z, 1090, 600);
  c.fillStyle = K.navy; c.fillRect(-60, G_FEET, W + 120, 5);
  const boxes = [];
  VIEWS.forEach(([n, label, x, bb], i) => {
    const a = T - kt(i); if (a < -FR) return;
    const g = V2[n.replace(/\d+$/, '')] ?? V2.hi, h = g.h * G_PPM, im = pic(n), s = h / im.height, w = im.width * s, k = hit(a, 0.12, 14);
    c.save(); c.translate(x, G_FEET); c.scale(k, k); c.drawImage(im, -w / 2, -h, w, h); c.restore();
    const nt = Math.max(0, Math.floor((T - kt(i + 0.5)) / 0.07) + 1); if (nt > 0) text(c, label.slice(0, nt), x, 948, 40, { font: 'Gothic X', color: K.navy, align: 'center' });
    boxes.push([x - w / 2 + bb[0] * s - 12, G_FEET - h + bb[1] * s - 12, (bb[2] - bb[0]) * s + 24, (bb[3] - bb[1]) * s + 24, kt(3 + i * 0.5)]);
  });
  // her height, drawn up beside her
  const rh = 1.52 * G_PPM, ru = clamp((kb - 1) / 1.5), rx = 470;
  if (ru > 0) {
    c.strokeStyle = K.navy; c.lineWidth = 4; c.beginPath(); c.moveTo(rx, G_FEET); c.lineTo(rx, G_FEET - rh * out3(ru)); c.stroke();
    for (let cm = 0; cm <= 150; cm += 10) { const y = G_FEET - cm / 152 * rh; if (y < G_FEET - rh * out3(ru)) break; c.fillStyle = K.navy; c.fillRect(rx - (cm % 50 ? 12 : 22), y - 1.5, cm % 50 ? 12 : 22, 3); }
    if (ru >= 1) { c.fillRect(rx - 26, G_FEET - rh - 2, 52, 4); c.save(); c.translate(rx - 34, G_FEET - rh / 2 + 60); c.rotate(-Math.PI / 2); text(c, '152 cm', 0, 0, 34, { color: K.navy, track: 3 }); c.restore(); }
  }
  // the bow, boxed on each view (the last part); the boxes joined, through the gaps, to its name
  boxes.forEach(([x, y, w, h, t0], i) => {
    const a = T - t0; if (a < 0) return; const g = hit(a, 0.25, 14);
    c.save(); c.strokeStyle = K.yellow; c.lineWidth = 6; c.setLineDash([14, 10]); c.lineDashOffset = -Math.floor(kb * 2) * 12;
    c.translate(x + w / 2, y + h / 2); c.scale(g, g); c.strokeRect(-w / 2, -h / 2, w, h); c.restore();
    c.fillStyle = K.yellow; for (const [px, py] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) c.fillRect(px - 7, py - 7, 14, 14);
    const nb = boxes[i + 1];
    c.save(); c.strokeStyle = K.yellow; c.lineWidth = 3; c.setLineDash([8, 8]); c.beginPath();
    if (nb && T >= nb[4]) { c.moveTo(x + w, y + h / 2); c.lineTo(nb[0], nb[1] + nb[3] / 2); }
    if (!nb && a > 0.1) { c.moveTo(x + w, y + h / 2); c.lineTo(x + w + 40, y + h / 2); }
    c.stroke(); c.restore();
    if (!nb && a > 0.1) { const k = hit(a - 0.1, 0.3, 14); c.save(); c.translate(x + w + 50, y + h / 2 + 16); c.scale(k, k); text(c, 'リボン', 0, 0, 44, { font: 'Gothic X', color: K.navy }); c.restore(); }
  });
  c.restore();
  text(c, '試作二号機　完成予想図', 110, 128, 72, { font: 'Mincho X', color: K.navy });
  dayMark(c, 1400, { edge: K.white, color: K.navy });
}
// H  (5 .. 11)  her parts, each passed: near views of her (bx_n, without the bow), a beat each; then the last one, empty
// each panel shows a 400 px square of the card (op px) at no more than 1:1; its centre. Four panels 2 x 2 on the left, the
// fifth (the bow) a larger empty slot on the right. All five are outlined from the first frame; each part slams into its
// panel on its beat, and on 9 the fifth slot turns yellow: 未.
const PARTS = [['ヘッドホン', [170, 570]], ['ヘアピン', [600, 300]], ['関節', [165, 1050]], ['刻印', [780, 1100]]];
const PW = 400, PG = 26, PX0 = 150, PY0 = 36, SLX = PX0 + 2 * PW + PG + 90, SLW = W - 120 - SLX, SLH = 2 * PW + PG;
function shotH(c, kb, T) {
  bg(c);
  // v8: the four parts land a half-beat apart (5 .. 6.5) and the empty fifth on 7, so the board is full for its last four beats
  const [sx, sy] = shake(T - kt(5 + 0.5 * Math.min(3, Math.max(0, Math.floor((kb - 5) * 2)))), 10); c.save(); c.translate(sx, sy);
  PARTS.forEach(([label, [cu0, cv0]], i) => {
    const x = PX0 + (i % 2) * (PW + PG), y = PY0 + Math.floor(i / 2) * (PW + PG), a = T - kt(5 + 0.5 * i);
    if (a < -FR) { c.save(); c.strokeStyle = K.paper; c.lineWidth = 3; c.setLineDash([12, 10]); c.strokeRect(x, y, PW, PW); c.restore(); return; }
    const k = a < 0.08 ? mix(1.45, 1, out3((a + FR) / (0.08 + FR))) : 1 + 0.04 * Math.exp(-(a - 0.08) * 14), zi = 0.92 + 0.08 * smooth(a / 2.5);
    c.save(); c.translate(x + PW / 2, y + PW / 2); c.scale(k, k); c.translate(-PW / 2, -PW / 2);
    c.fillStyle = K.navy; c.fillRect(12, 14, PW, PW); c.fillStyle = K.blue; c.fillRect(0, 0, PW, PW);
    c.save(); c.beginPath(); c.rect(0, 0, PW, PW); c.clip();
    const im = pic(shut('bx_n'));
    c.drawImage(im, PW / 2 - cu0 * zi, PW / 2 - (cv0 + 525) * zi, im.width * zi, im.height * zi);
    c.fillStyle = K.navy; c.fillRect(0, PW - 70, PW, 70);
    text(c, label, 22, PW - 20, 44, { font: 'Gothic X', color: K.paper });
    const kt2 = hit(a - 0.2, 0.3, 14);
    if (kt2 > 0) { c.save(); c.translate(PW - 24, PW - 20); c.scale(kt2, kt2); text(c, 'OK', 0, 0, 46, { font: 'Dot', color: K.yellow, align: 'right' }); c.restore(); }
    c.restore();
    c.strokeStyle = K.paper; c.lineWidth = 4; c.strokeRect(0, 0, PW, PW);
    c.restore();
  });
  // the fifth: the bow's place, empty
  const set = kb >= 7, a9 = T - kt(7), g = set ? hit(a9, 0.12, 14) : 1, on = !set || Math.floor(kb * 2) % 2 === 0 || a9 < 0.3;
  c.save(); c.translate(SLX + SLW / 2, PY0 + SLH / 2); c.scale(g, g); c.translate(-SLX - SLW / 2, -PY0 - SLH / 2);
  c.strokeStyle = set ? K.yellow : K.paper; c.lineWidth = set ? 6 : 3; c.setLineDash([18, 12]); c.lineDashOffset = set ? -kb * 20 : 0; c.strokeRect(SLX, PY0, SLW, SLH); c.setLineDash([]);
  // v8b: from the shot's first frame the slot says what goes in it: リボン, and the bow as a dashed outline (a thing that
  // is not there yet is drawn dashed); on 7 it turns yellow and 未 blinks under it
  text(c, 'リボン', SLX + 44, PY0 + 100, 72, { font: 'Gothic X', color: set ? K.yellow : K.paper });
  c.save(); c.translate(SLX + SLW / 2, PY0 + 330); c.scale(1.05, 1.05);
  bowDraw(c, 1, false, { color: set ? K.yellow : K.paper, lw: 5, dash: [16, 11] });
  c.restore();
  if (set) text(c, '未', SLX + SLW / 2, PY0 + SLH - 70, 250, { font: 'Gothic X', color: on ? K.red : K.paper, align: 'center' });   // v8: always there once set; it blinks red / cream
  c.restore();
  c.restore();
  dayMark(c, pick([[5, 1420], [5.5, 1426], [6, 1433], [6.5, 1440]], kb), { edge: K.blue });
}
// K  (17 .. 24)  001460: at his desk, he draws the last part - the bow, shown large beside him as it is drawn; done,
// it is the bow itself (cream)
// r9b: draws fast (lb_5); bent low over the last strokes (lb_1s); done, chin on his hand, he looks at it (lb_look)
const K_HE = [[17, 'lb_5'], [19, 'lb_1s'], [21, 'lb_look']];
function shotK(c, kb, T) {
  bg(c);
  const z = 1 + 0.04 * smooth((kb - 17) / 6);
  c.save(); camAt(c, z, 960, 600);
  floorLine(c);
  put(c, pick(K_HE, kb), LB_X, LB_Y, LB_S);
  // from the sheet on his desk, out to the large view
  const px = LB_X + LB_PAPER[0] * LB_S, py = LB_Y + LB_PAPER[1] * LB_S, cx = 1560, cy = 450, r = 290, g = out3((T - kt(17)) / 0.25);
  c.save(); c.strokeStyle = K.paper; c.lineWidth = 3; c.setLineDash([10, 9]); c.lineDashOffset = -Math.floor(kb * 2) * 9.5;
  c.beginPath(); c.moveTo(px, py); c.lineTo(cx - r * 0.82, cy + r * 0.57); c.moveTo(px, py); c.lineTo(cx - r * 0.2, cy + r * 0.98); c.stroke(); c.restore();
  c.save(); c.translate(cx, cy); c.scale(g, g);
  c.fillStyle = K.navy; c.beginPath(); c.arc(14, 16, r, 0, 7); c.fill();
  c.fillStyle = K.white; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
  c.strokeStyle = K.blue; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, r - 18, 0, 7); c.stroke();
  const done = kb >= 21.5;
  c.scale(0.84, 0.84); c.translate(0, -20); bowDraw(c, clamp(Math.floor((kb - 17) * 2 + 1) / 9), done);
  c.restore();
  const kd = hit(T - kt(21.5), 0.3, 14);
  if (kb >= 21.5) { c.save(); c.translate(cx, cy + r + 80); c.scale(kd, kd); text(c, 'リボン', 0, 0, 56, { font: 'Gothic X', color: K.yellow, align: 'center' }); c.restore(); }
  else text(c, 'リボン', cx, cy + r + 80, 56, { font: 'Gothic X', color: K.paper, align: 'center' });
  c.restore();
  dayMark(c, 1460, { edge: K.blue });
}
// L  (24 .. 31)  at the desk, from the front, in the middle (lad, 1:1): eyes down on his work; he looks up - at her -
// open-mouthed; and smiles
const L_HE = [[24, 'lad_b'], [26, 'lad_4'], [28, 'lad_45']];
const L_X = 960 - 576, L_Y = 40;
function shotL(c, kb, T) {
  bg(c);
  const z = 1 + 0.04 * smooth((kb - 24) / 7);
  c.save(); camAt(c, z, 960, 380);
  put(c, pick(L_HE, kb), L_X, L_Y, 1);
  c.restore();
  dayMark(c, 1460, { edge: K.blue });
}
// M  (30 .. 36)  her face under where the bow goes (bx_n), boxed; on 33 his hands bring it in over her head (bx_0);
// the frame closes slowly. Last frame: bx_0. Cut to verse1.
function shotM(c, kb, T) {
  bg(c);
  const n = shut(kb >= 33 ? 'bx_0' : 'bx_n'), im = pic(n);
  // v8: she sits higher (her face in the middle, her chest slot in frame); the bow comes in above her head
  const s = 0.72, cu = 463, cv = 980, z = 1 + 0.08 * smooth((kb - 30) / 6);
  c.save(); camAt(c, z, 960, 420);
  c.drawImage(im, 960 - cu * s, 560 - cv * s, im.width * s, im.height * s);
  // the box: where the bow sits (the bow's place in bx_o: 4 .. 921, 529 .. 910)
  const x0 = 960 + (4 - cu) * s - 14, x1 = 960 + (921 - cu) * s + 14, y0 = 560 + (529 - cv) * s - 14, y1 = 560 + (910 - cv) * s;
  // v8: four corner marks (as on the cold open's first frame), no line across her hair
  const on = kb < 33 || Math.floor(kb * 2) % 2 === 0;
  if (on) {
    const L = 54; c.save(); c.strokeStyle = kb >= 33 ? K.yellow : K.paper; c.lineWidth = 6; c.lineCap = 'square'; c.beginPath();
    for (const [x, y, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { c.moveTo(x, y + sy * L); c.lineTo(x, y); c.lineTo(x + sx * L, y); }
    c.stroke(); c.restore();
  }
  c.restore();
  text(c, '最終工程：リボン', 72, 120, 44, { font: 'Gothic X', color: K.paper });
  dayMark(c, 1460, { edge: K.blue });
}
// the running order: [new start, the shot, the beat the shot was written from]. A shot plays its own beats shifted.
const SHOTS = [[-24, shotT, -24], [-18, shotA, -24], [-12, shotB, -20], [-7, shotD, -12], [-1, shotE, -8], [3, shotF, -3], [6, shotG, 0], [11, shotH, 5], [17, shotK, 17], [23, shotL, 24], [30, shotM, 30]];

export async function prepare() {
  V2 = await (await fetch('data/cards/v2.json?' + Date.now())).json();
  const need = ['op_h', 'op_o', 'bx_n', 'bx_0', 'hi0', 'sv0', 'tb0', 'ls_tea', 'ls_look',
    'lad0', 'lad_1', 'lad_34', 'lad_6', 'lad_5', 'lad_b', 'lad_4', 'lad_45', 'lb0', 'lb_1s', 'lb_2', 'lb_3', 'lb_4', 'lb_5', 'lb_look', 'lb_crumple', 'lb_hold'];
  await Promise.all(need.map(n => img(n)));
  if (V2.bx) for (const n of ['bx_nc', 'bx_0c']) if (V2.bx.names.includes(n)) await want(n);
  if (V2.kv) await Promise.all(KV.filter(n => V2.kv.names.includes(n)).map(want));
}
export function draw(c, t) {
  const T = t + start, kb = kbOf(T);
  if (T < T_BAND) return cold(c, T);
  const [k0, f, w0] = pickAt(SHOTS, kb), kw = kb - k0 + w0; f(c, kw, kt(kw));
}
