// verse2's last shot, V7 (k 391.5 - 401.5): 溢れ出す - the memories go INTO the empty ring in her chest, and come out
// of it again (r11, P4: the old shot - the arms up on a round stage, the sheets rising past - used the pose of the
// finale's opening; it is gone).
//   suck   (391.5 - 395): the wall's lit sheets come off it one after another, nearest her first, and are drawn in a
//          whirl into the ring in her chest; she holds her chest, head down, eyes shut, in tears (ov_hold). The wall
//          is left a grid of empty, dark frames. The camera goes slowly in on her.
//   burst  (395, on 出): she throws her arms back and her head up, the wind in her hair (ov_burst_w1..w8, the kit's
//          windFrame loop); the sheets pour out of the ring in a fountain - out, round and towards the lens, the
//          nearer the larger, some past the lens. A ring of paper goes out from her chest. The camera draws back.
// Every flying sheet is a sheet of the wall (its own picture, cached once), a card in space with two hard tones (lit /
// in shade) and a blank back; they are sorted by depth: the ones behind her go behind her. No sheet ever crosses her
// face (each flight is checked against her face and bow beforehand; one that would is sent behind her).
// 溢れ / 出す: the square tiles of the old V7, in two columns either side of her, each as it is sung.
// Everything but the tiles is in "stage" pixels: the frame at camera zoom 1 (the wall where V6 left it).
import { W, H, K, clamp, mix, smooth, out3, rnd, hit, text, pic, windNames, windFrame } from './kit.js';
import { V2, load, card, her, sheets, SHEET } from './wonder.js';

const T0B = 20.016, PB = 0.42858, kt = k => T0B + k * PB;
export const K0 = 391.5, KBURST = 395, K1 = 401.5;
const PAPER_SH = '#d3dbef', SW = 356, SHh = 266, TW = SHEET.TW, TH = SHEET.TH;
const grp = n => n.split('_')[0].replace(/\d+$/, '');
const has = n => card(n) === n;

// ---------------------------------------------------------------- her
// the drawings, and where the empty ring in the chest is on each (card pixels). Until set ov is there, fs_1 / up_a stand in.
const RING = { ov_hold: [300, 470], ov_burst_w1: [303, 455], fs_1: [284, 516], up_a: [504, 449] };   // ov: READY_ov.txt (the ring under her hands on ov_hold; the burst loop's ring within 3 px on all eight)
const X = 960, FOOT = 880, PPM = 425;           // 1.64 m: 697 px, about 60 % of the frame (at the camera's mean zoom)
let HOLD = 'fs_1', BURST = 'up_a', CH = [X, 380], CB = [X, 380];
function ringOf(n) {
  const g = V2[grp(n)], r = g?.ring?.[n] ?? g?.chest?.[n] ?? g?.hole?.[n] ?? RING[n] ?? RING[grp(n) === 'ov' ? 'up_a' : 'fs_1'];
  return Array.isArray(r) ? r : [r.x ?? r.u, r.y ?? r.v];
}
// the stage point of card pixel (u, v) of drawing n as her() places it (her feet on (X, FOOT))
function placeOf(n, [u, v]) {
  const g = V2[grp(n)], gr = g.ground?.[n], mid = gr && gr.length ? gr.reduce((a, b) => a + b, 0) / gr.length : 0, im = pic(n);
  const h = g.h * PPM, w = im.width * h / im.height, fx = X - mid * PPM, fy = FOOT + (g.low?.[n] ?? 0) * PPM, s = h / im.height;
  return [fx - w / 2 + u * s, fy - h + v * s];
}

// ---------------------------------------------------------------- the sheets, cached
const MIPS = [534, 267, 134, 67];
let CELLS = [], CAM = null, SCR = null;
function mipsOf(src) {
  const out = []; let prev = src;
  for (const w of MIPS) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = Math.round(w * SHh / SW);
    const x = cv.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(prev, 0, 0, cv.width, cv.height); out.push(cv); prev = cv;
  }
  return out;
}
function shade(cv) {
  const o = document.createElement('canvas'); o.width = cv.width; o.height = cv.height; const x = o.getContext('2d');
  x.drawImage(cv, 0, 0); x.globalCompositeOperation = 'multiply'; x.fillStyle = PAPER_SH; x.fillRect(0, 0, o.width, o.height);
  return o;
}
function bake(i, j) {
  if (!SCR) { SCR = document.createElement('canvas'); SCR.width = W; SCR.height = H; }
  sheets(SCR.getContext('2d'), 400, i * TW, j * TH, 2, 241, () => true, { bow: 'bx_o', tea: 'jt_2' });   // as V6 leaves them
  const big = document.createElement('canvas'); big.width = 2 * SW; big.height = 2 * SHh;
  big.getContext('2d').drawImage(SCR, W / 2 - SW, H / 2 - SHh, 2 * SW, 2 * SHh, 0, 0, 2 * SW, 2 * SHh);
  const lit = mipsOf(big); return { lit, sh: lit.map(shade) };
}
const texFor = (t, sh, px) => { const L = sh ? t.sh : t.lit; for (let q = L.length - 1; q >= 0; q--) if (L[q].width >= px * 0.9) return L[q]; return L[0]; };
const stageOf = (i, j) => [W / 2 + (i * TW - CAM[0]) * CAM[2], H / 2 + (j * TH - CAM[1]) * CAM[2]];

// ---------------------------------------------------------------- a card in space
// world: stage pixels, origin at the point o (the ring), z towards the lens; the lens at z = D. m: rotation matrix (rows).
const D = 1500, LTO = (() => { const v = [-0.45, -0.7, 0.55], l = Math.hypot(...v); return v.map(a => a / l); })();
function rotM(rx, ry, rz) {
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
  // R = Rz * Ry * Rx
  return [[cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx], [sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx], [-sy, cy * sx, cy * cx]];
}
const mul = (m, v) => [m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2], m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2], m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]];
const proj = (o, p) => { const s = D / (D - p[2]); return [o[0] + p[0] * s, o[1] + p[1] * s, D - p[2]]; };
// the card's four corners on the stage (or null: too near the lens)
function corners(o, p, m, w) {
  const h = w * SHh / SW, P = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([a, b]) => { const q = mul(m, [a, b, 0]); return proj(o, [p[0] + q[0], p[1] + q[1], p[2] + q[2]]); });
  return P.some(q => q[2] < 140) ? null : P;
}
function drawCard(c, o, p, m, w, tex) {
  const P = corners(o, p, m, w); if (!P) return;
  P[2] = [P[1][0] + P[3][0] - P[0][0], P[1][1] + P[3][1] - P[0][1]];   // the card is drawn as the parallelogram of three corners (the texture's own shape): its edge and its back too
  const px = Math.hypot(P[1][0] - P[0][0], P[1][1] - P[0][1]), py = Math.hypot(P[3][0] - P[0][0], P[3][1] - P[0][1]);
  const area = Math.abs((P[1][0] - P[0][0]) * (P[3][1] - P[0][1]) - (P[1][1] - P[0][1]) * (P[3][0] - P[0][0]));
  if (area / Math.max(px, py, 1) < 7) return;                          // edge on: not drawn (a hair-line reads as a scratch)
  const n = mul(m, [0, 0, 1]), toLens = [-p[0], -p[1], D - p[2]], face = n[0] * toLens[0] + n[1] * toLens[1] + n[2] * toLens[2] > 0;
  const nf = face ? n : n.map(a => -a), lit = nf[0] * LTO[0] + nf[1] * LTO[1] + nf[2] * LTO[2] > 0.12;
  if (face) {
    const t = texFor(tex, !lit, Math.min(px, py * SW / SHh) * 1.15);   // the narrower way decides (a slanted card shimmered)
    c.save(); c.transform((P[1][0] - P[0][0]) / t.width, (P[1][1] - P[0][1]) / t.width, (P[3][0] - P[0][0]) / t.height, (P[3][1] - P[0][1]) / t.height, P[0][0], P[0][1]);
    c.drawImage(t, 0, 0); c.restore();
  } else { c.fillStyle = lit ? K.white : PAPER_SH; c.beginPath(); P.forEach((q, k) => k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); c.fill(); }
  c.strokeStyle = PAPER_SH; c.lineWidth = Math.max(1.5, px / 160); c.lineJoin = 'miter';   // the paper's edge, so that a sheet on a sheet is seen
  c.beginPath(); P.forEach((q, k) => k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); c.stroke();
}
// her face and bow (stage), the zones no sheet may cross
let FACE = [];
function overBody(o, p, m, w) {                                   // her body's box (arms aside): head to feet, shoulder to shoulder
  const P = corners(o, p, m, w); if (!P) return false;
  const xs = P.map(q => q[0]), ys = P.map(q => q[1]), bx = 0.2 * PPM;
  return Math.max(...xs) > CB[0] - bx && Math.min(...xs) < CB[0] + bx && Math.max(...ys) > CB[1] - 0.6 * PPM && Math.min(...ys) < FOOT;
}
function overFace(o, p, m, w) {
  const P = corners(o, p, m, w); if (!P) return false;
  const cx = (P[0][0] + P[2][0]) / 2, cy = (P[0][1] + P[2][1]) / 2, r = Math.max(Math.hypot(P[2][0] - P[0][0], P[2][1] - P[0][1]), Math.hypot(P[3][0] - P[1][0], P[3][1] - P[1][1])) / 2;
  return FACE.some(([fx, fy, fr]) => Math.hypot(cx - fx, cy - fy) < fr + r * 0.85);
}

// ---------------------------------------------------------------- suck: the wall's sheets into the ring
const SUCK = [];
function suckAt(s, kb) {                                           // -> [p, m, w] in the world about CH, or null
  const q = (kb - s.td) / s.dur; if (q < 0 || q >= 1) return null;
  const e = Math.pow(q, 1.7), r = s.r0 * (1 - e), th = s.th0 + s.dth * smooth(q);
  const p = [r * Math.cos(th), r * Math.sin(th), 360 * Math.sin(Math.PI * clamp(q * 1.25)) * (1 - e)];   // off the wall towards us, then in
  const m = rotM(s.fx * smooth(q), s.fy * q, s.rz0 + s.dth * 0.8 * smooth(q));
  return [p, m, s.w * mix(1, 0.04, Math.pow(e, 0.8))];
}
// ---------------------------------------------------------------- burst: out of the ring
const OUT = [], NOUT = 150;
function outAt(s, T) {
  const tau = T - s.te; if (tau < 0 || tau > 3.2) return null;
  const r = s.R * (1 - Math.exp(-tau / 0.34)) + 90 * tau, th = s.th0 + s.om * tau;
  const p = [r * Math.cos(th), r * Math.sin(th) + 90 * tau * tau, s.vz * tau];
  const m = rotM(s.rx0 + s.wx * tau, s.ry0 + s.wy * tau, s.rz0 + s.wz * tau);
  return [p, m, s.w * (0.1 + 0.9 * out3(tau / 0.3))];
}
function newOut(i, a) {
  const R = (k) => rnd(i * 13.7 + a * 101.3 + k * 7.31), right = i % 2 === 0, back = R(1) < 0.36, graze = !back && R(2) < 0.14;
  let th0, vz, Rr;
  if (back) { th0 = (-170 + 160 * R(3) + (R(14) < 0.4 ? 180 : 0)) * Math.PI / 180; vz = -(160 + 300 * R(4)); Rr = 700 + 650 * R(5); }
  else if (graze) { const d = 30 + 60 * R(3); th0 = (right ? d : 180 - d) * Math.PI / 180; vz = 1350 + 500 * R(4); Rr = 140 + 160 * R(5); }
  else { const d = R(15) < 0.75 ? -15 + 75 * R(3) : 60 + 45 * R(3); th0 = (right ? d : 180 - d) * Math.PI / 180; vz = 120 + 900 * R(4); Rr = 520 + 640 * R(5); }
  const side = Math.cos(th0) >= 0 ? 1 : -1;
  return { back, th0, vz, R: Rr, om: side * (0.35 + 0.6 * R(6)) * (back ? -1 : 1), w: SW * CAM[2] * (0.75 + 0.45 * R(7)),
    rx0: (R(8) - 0.5) * 1.2, ry0: (R(9) - 0.5) * 1.2, rz0: (R(10) - 0.5) * 1.4, wx: (R(11) - 0.5) * 4.4, wy: (R(12) - 0.5) * 3.4, wz: (R(13) - 0.5) * 3 };
}

// ---------------------------------------------------------------- prepare
export async function prepareOverflow(cam) {
  CAM = cam;
  for (const n of ['ov_hold', ...windNames('ov_burst'), 'fs_1', 'up_a']) await load(n);
  HOLD = has('ov_hold') ? 'ov_hold' : 'fs_1';
  BURST = windNames('ov_burst').every(has) ? 'ov_burst' : 'up_a';
  const bref = has(BURST) ? BURST : BURST + '_w1';
  CH = placeOf(HOLD, ringOf(HOLD)); CB = placeOf(bref, ringOf(bref));
  // her face and bow, from the ring up (metres on her: the face's middle 0.15 m over the ring, the bow's 0.36 m)
  FACE = [[CH[0], CH[1] - 0.16 * PPM, 0.11 * PPM], [CH[0], CH[1] - 0.36 * PPM, 0.17 * PPM], [CB[0], CB[1] - 0.16 * PPM, 0.11 * PPM], [CB[0], CB[1] - 0.36 * PPM, 0.17 * PPM]];
  // the cells of the wall in the frame where V6 left it
  const z = CAM[2], i0 = Math.floor((CAM[0] - W / 2 / z) / TW) - 1, i1 = Math.ceil((CAM[0] + W / 2 / z) / TW) + 1, j0 = Math.floor((CAM[1] - H / 2 / z) / TH) - 1, j1 = Math.ceil((CAM[1] + H / 2 / z) / TH) + 1;
  CELLS = [];
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const [sx, sy] = stageOf(i, j), hw = SW * z / 2, hh = SHh * z / 2;
    if (sx + hw < 0 || sx - hw > W || sy + hh < 0 || sy - hh > H) continue;
    CELLS.push({ i, j, sx, sy, tex: bake(i, j) });
  }
  const dMax = Math.max(...CELLS.map(q => Math.hypot(q.sx - CH[0], q.sy - CH[1])));
  const key = (q, k) => 0.5 * Math.hypot(q.sx - CH[0], q.sy - CH[1]) / dMax + 0.5 * rnd(k * 3.17 + 0.9), RANK = new Map(CELLS.map((q, k) => [q, key(q, k)]).sort((a, b) => a[1] - b[1]).map(([q], k, A) => [q, k / (A.length - 1)]));   // one after another, the near ones rather first, evenly to the burst; holes open all over the wall
  SUCK.length = 0;
  CELLS.forEach((q, n) => {
    const dx = q.sx - CH[0], dy = q.sy - CH[1], d = Math.hypot(dx, dy);
    const s = { cell: q, td: K0 + 0.15 + 2.75 * RANK.get(q), dur: 0.55 + 0.15 * rnd(n * 2.9 + 0.1), r0: d, th0: Math.atan2(dy, dx),
      dth: 0.9 + 0.8 * rnd(n * 4.1 + 0.7), fx: (rnd(n * 5.3) - 0.5) * 3.2, fy: (rnd(n * 6.1) - 0.5) * 2.4, rz0: 0, w: SW * z, back: false };
    for (let a = 0; a <= 0.86; a += 0.03) { const st = suckAt(s, s.td + a * s.dur); if (st && overFace(CH, ...st)) { s.back = true; break; } }
    q.suck = s; SUCK.push(s);
  });
  // the fountain: emitted from 395 on, most at once
  OUT.length = 0;
  for (let i = 0; i < NOUT; i++) {
    const u = i / NOUT, te = kt(KBURST) + 6.1 * PB * u * u;
    let s = null;
    for (let a = 0; a < 6 && !s; a++) {
      const c = newOut(i, a); c.te = te; c.tex = CELLS[(i * 7) % CELLS.length].tex;
      // a sheet in front of her comes out from behind her: it is drawn behind her until it is clear of her body (fr), and
      // never crosses her body or face after that
      let bad = false; c.fr = 0;
      if (!c.back) { let clear = false; for (let tau = 0; tau <= 3.2; tau += 0.03) { const st = outAt(c, te + tau); if (!st) continue; const ob = overBody(CB, ...st);
        if (!clear && !ob) { clear = true; c.fr = tau; } else if (clear && (ob || overFace(CB, ...st))) { bad = true; break; } } if (!clear) bad = true; }
      if (!bad) s = c;
    }
    if (!s) { s = newOut(i, 0); s.back = true; s.vz = -Math.abs(s.vz) * 0.5 - 200; s.te = te; s.tex = CELLS[(i * 7) % CELLS.length].tex; }
    OUT.push(s);
  }
}

// ---------------------------------------------------------------- draw
const zoomOf = kb => kb < KBURST ? 1 + 0.12 * smooth((kb - K0) / (KBURST - K0)) : mix(1.12, 0.935, out3((kb - KBURST) / 1.4)) - 0.035 * clamp((kb - KBURST - 1.4) / 5);
function emptyCell(c, x, y, z) {
  const w = SW * z, h = SHh * z;
  c.fillStyle = K.deep; c.fillRect(x - w / 2, y - h / 2, w, h);
  c.strokeStyle = K.blue; c.lineWidth = 3; c.strokeRect(x - w / 2 + 6, y - h / 2 + 6, w - 12, h - 12);
}
export function drawOverflow(c, T, kb, chars) {
  const z = CAM[2], b = kb - K0, zc = zoomOf(kb), F = CH;
  c.fillStyle = K.navy; c.fillRect(0, 0, W, H);
  c.save(); c.translate(F[0], F[1]); c.scale(zc, zc); c.translate(-F[0], -F[1]);
  // the wall: what is left of it. A sheet trembles on its pin for a moment before it goes.
  const vx0 = F[0] - F[0] / zc, vx1 = F[0] + (W - F[0]) / zc, vy0 = F[1] - F[1] / zc, vy1 = F[1] + (H - F[1]) / zc;
  const i0 = Math.floor((CAM[0] + (vx0 - W / 2) / z) / TW) - 1, i1 = Math.ceil((CAM[0] + (vx1 - W / 2) / z) / TW) + 1, j0 = Math.floor((CAM[1] + (vy0 - H / 2) / z) / TH) - 1, j1 = Math.ceil((CAM[1] + (vy1 - H / 2) / z) / TH) + 1;
  const at = new Map(CELLS.map(q => [q.i + ',' + q.j, q]));
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const [x, y] = stageOf(i, j), q = at.get(i + ',' + j);
    if (!q || kb >= q.suck.td) { emptyCell(c, x, y, z); continue; }
    const pre = clamp((kb - (q.suck.td - 0.45)) / 0.45), wob = pre > 0 ? Math.sin(pre * 14 + q.i) * 0.05 * pre : 0;
    if (pre > 0) emptyCell(c, x, y, z);
    c.save(); c.translate(x, y - 6 * pre); c.rotate(wob); const t = texFor(q.tex, false, SW * z * zc); c.drawImage(t, -SW * z / 2, -SHh * z / 2, SW * z, SHh * z); c.restore();
  }
  // the rings: drawn in to her chest while she takes the sheets in; then one of paper out from it, and a ring a beat
  c.lineJoin = 'round';
  if (kb < KBURST) {
    for (let j = 0; j < 2; j++) { const ph = ((b * 1 + j * 0.5) % 1 + 1) % 1; if (b < 0.6 + j * 0.5) continue;
      c.strokeStyle = K.yellow; c.lineWidth = 3 + 9 * ph; c.beginPath(); c.arc(CH[0], CH[1], 40 + 560 * (1 - ph) * (1 - ph * 0.3), 0, 7); c.stroke(); }
  } else {
    const a = (kb - KBURST) / 1.8;
    if (a < 1) { c.strokeStyle = K.paper; c.lineWidth = 70 * Math.pow(1 - a, 2) + 2; c.beginPath(); c.arc(CB[0], CB[1], 50 + 1500 * out3(a), 0, 7); c.stroke(); }
    for (let j = 0; j < 3; j++) { const age = ((kb - KBURST - 1) % 1.5 + 1.5) % 1.5 + j * 1.5, ph = age / 4.5; if (kb - KBURST - 1 < age) continue;
      c.strokeStyle = K.yellow; c.lineWidth = 16 * (1 - ph) + 2; c.beginPath(); c.arc(CB[0], CB[1], 120 + age * 330, 0, 7); c.stroke(); }
  }
  // the sheets in flight, far to near; the ones behind her first
  const fly = [];
  for (const s of SUCK) { const st = suckAt(s, kb); if (st) fly.push({ o: CH, st, tex: s.cell.tex, back: s.back }); }
  for (const s of OUT) { const st = outAt(s, T); if (st) fly.push({ o: CB, st, tex: s.tex, back: s.back || T - s.te < s.fr || st[0][2] < -20 }); }
  fly.sort((p, q) => p.st[0][2] - q.st[0][2]);
  for (const f of fly) if (f.back) drawCard(c, f.o, ...f.st, f.tex);
  const n = kb < KBURST ? HOLD : windFrame(BURST, T, has);
  her(c, n, X, FOOT, PPM);
  for (const f of fly) if (!f.back) drawCard(c, f.o, ...f.st, f.tex);
  c.restore();
  // 溢 れ | 出 す: the square tiles, two a side
  const Sz = 206, POS = [[250, 380], [250, 380 + Sz + 34], [W - 250, 380], [W - 250, 380 + Sz + 34]];
  chars.forEach((ch, k) => { const a = T - ch.t; if (a < -1 / 24) return; const s = hit(Math.max(0, a), 0.25, 12); const [x, y] = POS[k];
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = K.navy; c.fillRect(-Sz / 2 + 12, -Sz / 2 + 14, Sz, Sz); c.fillStyle = K.white; c.fillRect(-Sz / 2 - 6, -Sz / 2 - 6, Sz + 12, Sz + 12); c.fillStyle = K.navy; c.fillRect(-Sz / 2, -Sz / 2, Sz, Sz);
    text(c, ch.c, 0, 8, 160, { font: 'Mincho X', color: k === 0 || k === 2 ? K.yellow : K.white, align: 'center', base: 'middle' }); c.restore(); });
}
