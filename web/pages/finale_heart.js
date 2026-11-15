// The heart of finale (k500 - k532): his record, sheet by sheet, gathers in the air into 心 - all but its last dot; she
// sends his last sheet up into the empty dot; from there the sheets turn over one by one to their yellow side; then they
// leave it from the top down and stream into her chest.
//
// Drawn in 2D with a camera of its own: every sheet is a real sheet (A4, 0.21 x 0.297 m) in a 3D space, projected; it has
// a lit side and a shaded side (hard, two tones), it casts a hard shadow on the sheets behind it, it flutters. Her drawing
// stands in the same space as a flat card. The character's skeleton is 心 in KaiTi, a little bolder (v11; ?glyph=U / K for
// the textbook face / ZenOldMincho). v11 composition (option D): one axis - she in the middle, from the back, waist up, the
// character just over her bow; the sheets come up from both sides; the waiting ones circle behind her head. The sheets lie along its strokes
// (the long side of each follows the brush), the strokes are written in the order of the brush, the edge of the character
// is the sheets' own corners.
import { W, H, K, clamp, mix, smooth, out3, rnd, img, pic, fig, grid, text } from './kit.js';
import { drawReport } from './report.js';

const PAPER_SH = '#d3dbef', YEL_SH = '#f0bb3c', SHADOW_P = '#b3c0e2', SHADOW_Y = '#eab43a', SW = 0.297, SH = 0.42;
const nrm = v => { const l = Math.hypot(...v); return v.map(a => a / l); };
let LD = nrm([0.42, -0.62, -0.66]), LTO = LD.map(a => -a);        // the light: from above left, from our side
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

let C = null, GLYPH = 'K', KAI_BOLD = 7;                                                      // config from finale.js: { kt, PB, KLAND, KUP, KTOSS, KLIT, KOUT, T_FLOW, FLOWDUR, V2 }
let SHEETS = [], DOT = null, DOTHULL = [], HB = null, TEX = {}, LA = null, LB = null, FINAL = null, OPT = 'A';

// ---------------------------------------------------------------- the camera
const CAM = { p: [0, 1, 5], f: [0, 0, -1], r: [1, 0, 0], u: [0, 1, 0], F: 1000, sx: 0, sy: 0 };
function setCam(p, t, fov, sx = 0, sy = 0) {
  const f = nrm([t[0] - p[0], t[1] - p[1], t[2] - p[2]]), r = nrm(cross(f, [0, 1, 0])), u = cross(r, f);
  Object.assign(CAM, { p, f, r, u, F: H / 2 / Math.tan(fov * Math.PI / 360), sx, sy });
}
const proj = q => { const d = [q[0] - CAM.p[0], q[1] - CAM.p[1], q[2] - CAM.p[2]], z = dot3(d, CAM.f); return [W / 2 + CAM.F * dot3(d, CAM.r) / z + CAM.sx, H / 2 - CAM.F * dot3(d, CAM.u) / z + CAM.sy, z]; };

// rotation: R = Ry(yaw) Rz(rz) Ry(ry) Rx(rx), as a function on vectors
function rot(yaw, rz, ry, rx, pitch = 0) {
  const m = (v) => {
    let [x, y, z] = v;
    [y, z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)];
    [x, z] = [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)];
    [x, y] = [x * Math.cos(rz) - y * Math.sin(rz), x * Math.sin(rz) + y * Math.cos(rz)];
    if (pitch) [y, z] = [y * Math.cos(pitch) - z * Math.sin(pitch), y * Math.sin(pitch) + z * Math.cos(pitch)];   // the character's plane leaning back
    [x, z] = [x * Math.cos(yaw) + z * Math.sin(yaw), -x * Math.sin(yaw) + z * Math.cos(yaw)];
    return [x, y, z];
  };
  return m;
}

// ---------------------------------------------------------------- where the character stands (per option)
// HP: its centre, its height (m), its yaw; the plane it lies in
const HPOS = { D: { c: [0.0, 4.62, -4.5], h: 4.4, yaw: 0, tilt: -0.45 }, A: { c: [0, 5.55, -4.3], h: 4.0, yaw: 0 }, B: { c: [-6.0, 4.9, -5.0], h: 6.6, yaw: 0.45 }, C: { c: [0, 5.55, -4.3], h: 4.0, yaw: 0 } };
let HP = HPOS.A;
const toWorld = (X, Y, dz = 0) => { const m = rot(HP.yaw, 0, 0, 0, HP.tilt ?? 0)([X, Y, dz]); return [HP.c[0] + m[0], HP.c[1] + m[1], HP.c[2] + m[2]]; };
const planeN = () => rot(HP.yaw, 0, 0, 0, HP.tilt ?? 0)([0, 0, 1]);

// ---------------------------------------------------------------- the character, measured
function glyph() {
  const S = 420, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d');
  x.fillStyle = '#fff'; x.font = GLYPH === 'U' ? `400 ${S * 0.8}px "UDK"` : GLYPH === 'Kai' ? `400 ${S * 0.8}px "KAI"` : `400 ${S * 0.84}px "Mincho K"`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('心', S / 2, S / 2);
  // Kai: the brush's own 心 (a kaisho), made a little bolder all round (round joins), so that a sheet still fits across a stroke
  if (GLYPH === 'Kai') { x.strokeStyle = '#fff'; x.lineJoin = 'round'; x.lineWidth = KAI_BOLD; x.strokeText('心', S / 2, S / 2); }
  const d = x.getImageData(0, 0, S, S).data, M = new Uint8Array(S * S);
  let x0 = S, x1 = 0, y0 = S, y1 = 0;
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) if (d[(j * S + i) * 4 + 3] > 127) { M[j * S + i] = 1; x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, j); y1 = Math.max(y1, j); }
  // its strokes: the four pieces of ink
  const lab = new Int16Array(S * S).fill(-1), comps = [];
  for (let s = 0; s < S * S; s++) if (M[s] && lab[s] < 0) {
    const q = [s], g = []; lab[s] = comps.length;
    while (q.length) { const p = q.pop(); g.push(p); const i = p % S, j = (p - i) / S; for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) { const u = i + a, v = j + b, r = v * S + u; if (u >= 0 && u < S && v >= 0 && v < S && M[r] && lab[r] < 0) { lab[r] = comps.length; q.push(r); } } }
    comps.push(g);
  }
  const big = comps.map((g, n) => ({ g, n })).filter(o => o.g.length > 40).sort((a, b) => b.g.length - a.g.length);
  const cxOf = g => g.reduce((s, p) => s + p % S, 0) / g.length;
  const hook = big[0], dots = big.slice(1, 4).sort((a, b) => cxOf(a.g) - cxOf(b.g));
  const order = [dots[0], hook, dots[1], dots[2]];                  // left dot, the hook, the top dot, the right dot: as it is written
  const K4 = new Int8Array(S * S).fill(-1); order.forEach((o, k) => o.g.forEach(p => { K4[p] = k; }));
  // distance to the edge (chamfer 3-4, in pixels)
  const D = new Float32Array(S * S); for (let s = 0; s < S * S; s++) D[s] = M[s] ? 1e9 : 0;
  for (let j = 1; j < S - 1; j++) for (let i = 1; i < S - 1; i++) { const s = j * S + i; if (!M[s]) continue; D[s] = Math.min(D[s], D[s - 1] + 3, D[s - S] + 3, D[s - S - 1] + 4, D[s - S + 1] + 4); }
  for (let j = S - 2; j > 0; j--) for (let i = S - 2; i > 0; i--) { const s = j * S + i; if (!M[s]) continue; D[s] = Math.min(D[s], D[s + 1] + 3, D[s + S] + 3, D[s + S + 1] + 4, D[s + S - 1] + 4); }
  // along each stroke: the distance from where the brush goes in (its top), inside the stroke
  const G = new Float32Array(S * S).fill(1e9), gmax = [0, 0, 0, 0];
  order.forEach((o, k) => { let st = o.g[0]; for (const p of o.g) if (p < st) st = p; G[st] = 0; });
  for (let pass = 0; pass < 40; pass++) {
    let ch = false;
    const relax = (s, r, w) => { if (K4[r] === K4[s] && G[r] + w < G[s]) { G[s] = G[r] + w; ch = true; } };
    for (let j = 1; j < S - 1; j++) for (let i = 1; i < S - 1; i++) { const s = j * S + i; if (K4[s] < 0) continue; relax(s, s - 1, 1); relax(s, s - S, 1); relax(s, s - S - 1, 1.414); relax(s, s - S + 1, 1.414); }
    for (let j = S - 2; j > 0; j--) for (let i = S - 2; i > 0; i--) { const s = j * S + i; if (K4[s] < 0) continue; relax(s, s + 1, 1); relax(s, s + S, 1); relax(s, s + S + 1, 1.414); relax(s, s + S - 1, 1.414); }
    if (!ch) break;
  }
  for (let s = 0; s < S * S; s++) if (K4[s] >= 0 && G[s] < 1e8) gmax[K4[s]] = Math.max(gmax[K4[s]], G[s]);
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1, mpp = HP.h / bh, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const XY = s => { const i = s % S, j = (s - i) / S; return [(i - cx) * mpp, (cy - j) * mpp]; };
  // the brush's direction at a pixel: the way the distance along the stroke grows, averaged round it
  const dirAt = s => {
    const i = s % S, j = (s - i) / S, k = K4[s]; let gx = 0, gy = 0;
    for (let b = -4; b <= 4; b++) for (let a = -4; a <= 4; a++) {
      const r = (j + b) * S + i + a, rl = r - 1, rr = r + 1, ru = r - S, rd = r + S;
      if (K4[r] !== k || K4[rl] !== k || K4[rr] !== k || K4[ru] !== k || K4[rd] !== k) continue;
      gx += G[rr] - G[rl]; gy += G[rd] - G[ru];
    }
    return Math.atan2(-gy, gx);                                    // in the plane, y up
  };
  HB = { mpp, top: (cy - y0) * mpp, bot: -(y1 - cy) * mpp, w: bw * mpp };
  // ---- the sheets: wherever a part of the strokes is not yet under a sheet, a sheet is laid, its long side along the brush,
  // its size from how wide the stroke is there (smaller where the stroke runs out); until every part is under paper
  const cover = new Uint8Array(S * S), ink = [];
  for (let s = 0; s < S * S; s++) if (K4[s] >= 0) ink.push(s);
  ink.sort((a, b) => rnd(a * 0.013 + 1) - rnd(b * 0.013 + 1));
  // the edge's direction at a pixel: across the stroke (the way the distance to the edge grows), smoothed
  const inward = s => { const i = s % S, j = (s - i) / S; let gx = 0, gy = 0;
    for (let b = -3; b <= 3; b++) for (let a = -3; a <= 3; a++) { const r = (j + b) * S + i + a; if (r - S < 0 || r + S >= S * S) continue; gx += D[r + 1] - D[r - 1]; gy += D[r + S] - D[r - S]; }
    const l = Math.hypot(gx, gy) || 1; return [gx / l, gy / l]; };
  const mark = (i0, j0, a, hl, hs) => { const ca = Math.cos(a), sa = Math.sin(a), R = Math.ceil(Math.max(hl, hs) + 1);
    for (let b = -R; b <= R; b++) for (let c = -R; c <= R; c++) { const u = c * ca + (-b) * sa, v = -c * sa + (-b) * ca; if (Math.abs(u) <= hl && Math.abs(v) <= hs) { const r = (j0 + b) * S + i0 + c; if (r >= 0 && r < S * S) cover[r] = 1; } } };
  const push = (k, i0, j0, a, sc, dz, tilt, gs) => {
    const n = SHEETS.length, X = (i0 - cx) * mpp, Y = (cy - j0) * mpp;
    SHEETS.push({ k, X, Y, a, sc, dz, rx0: (rnd(n + 0.23) - 0.5) * tilt, ry0: (rnd(n + 0.29) - 0.5) * tilt * 1.1, v: dz > 0.034 ? 'blank' : rnd(n + 0.41) < 0.5 ? 0 : rnd(n + 0.43) < 0.5 ? 1 : 2, p: G[gs] / Math.max(1, gmax[k]), i: n, edge: dz > 0.034 });
  };
  // 1  the edge: small sheets, their long side exactly along the outline, their outer side on it (the outline is theirs)
  const rim = ink.filter(s => D[s] <= 4);
  for (const s of rim) {
    if (cover[s]) continue;
    const k = K4[s], [nx, ny] = inward(s), i0 = s % S, j0 = (s - i0) / S;
    let med = 0; for (let t = 1; t < 60; t++) { const r = Math.round(j0 + ny * t) * S + Math.round(i0 + nx * t); if (K4[r] !== k) break; med = Math.max(med, D[r] / 3); }
    const n = SHEETS.length, w = Math.min(SW * (0.5 + 0.12 * rnd(n + 0.7)), med * 2 * mpp * 0.98), sc = Math.max(0.16, w / SW);
    const off = SW * sc / 2 * 0.9 / mpp, ci = Math.round(i0 + nx * off), cj = Math.round(j0 + ny * off), cs = cj * S + ci;
    const a = Math.atan2(-ny, nx) + Math.PI / 2 + (rnd(n + 0.31) - 0.5) * 0.08;      // the tangent, in the plane (y up)
    push(k, ci, cj, a, sc, 0.036 + 0.014 * rnd(n + 0.17), 0.1, K4[cs] === k ? cs : s);
    mark(ci, cj, a, SH * sc / 2 * 0.92 / mpp, SW * sc / 2 * 1.0 / mpp);
  }
  // 2  inside: larger sheets along the brush, never reaching out past the edge sheets
  const inner = (minD, sMax, shrink) => { for (const s of ink) {
    if (cover[s] || D[s] < minD) continue;
    const k = K4[s], n = SHEETS.length, hw = D[s] / 3 * mpp, a = dirAt(s) + (rnd(n + 0.31) - 0.5) * 0.18;
    let sc = clamp((0.85 + 0.35 * rnd(n + 0.71)) * Math.min(sMax, hw * 1.9 / SW), 0.25, sMax); const i0 = s % S, j0 = (s - i0) / S;
    // no corner reaches out past the stroke (a hair of slack): it shrinks until all four are on the ink
    const inkNear = (u, v) => { for (let b = -2; b <= 2; b++) for (let c = -2; c <= 2; c++) { const r = (Math.round(v) + b) * S + Math.round(u) + c; if (r >= 0 && r < S * S && K4[r] === k) return true; } return false; };
    for (let tries = 0; tries < 6; tries++) {
      const hl = SH * sc / 2 / mpp, hs = SW * sc / 2 / mpp, ca = Math.cos(a), sa = Math.sin(a);
      if ([[1, 1], [1, -1], [-1, 1], [-1, -1]].every(([e, f]) => inkNear(i0 + e * hl * ca - f * hs * sa, j0 - (e * hl * sa + f * hs * ca)))) break;
      sc = Math.max(0.22, sc * 0.82);
    }
    push(k, i0, j0, a, sc, 0.006 + 0.026 * rnd(n + 0.17), 0.22, s);
    mark(i0, j0, a, SH * sc / 2 * shrink / mpp, SW * sc / 2 * shrink / mpp);
  } };
  inner(12, 1.3, 0.72); inner(5, 1.0, 0.78); inner(0, 0.7, 0.9);
  // the empty dot: where his last sheet goes (its centre, its long axis, its size)
  const dp = order[3].g.map(XY), mx = dp.reduce((s, q) => s + q[0], 0) / dp.length, my = dp.reduce((s, q) => s + q[1], 0) / dp.length;
  let sxx = 0, syy = 0, sxy = 0; for (const [a, b] of dp) { sxx += (a - mx) ** 2; syy += (b - my) ** 2; sxy += (a - mx) * (b - my); }
  const th = 0.5 * Math.atan2(2 * sxy, sxx - syy); let lmax = 0, lmin = 0;
  for (const [a, b] of dp) { const u = (a - mx) * Math.cos(th) + (b - my) * Math.sin(th), v = -(a - mx) * Math.sin(th) + (b - my) * Math.cos(th); lmax = Math.max(lmax, Math.abs(u)); lmin = Math.max(lmin, Math.abs(v)); }
  DOT = { X: mx, Y: my, a: th, len: lmax * 2, wid: lmin * 2 };
  // its outline (hull), for the dashed mark of the empty place
  const P = dp.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = []; for (const p of P) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of P.slice().reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  DOTHULL = lo.slice(0, -1).concat(up.slice(0, -1));
  for (const s of SHEETS) s.dd = Math.hypot(s.X - DOT.X, s.Y - DOT.Y);
  const d3s = SHEETS.filter(s => s.k === 3); d3s.forEach((s, n) => { s.ri = n / d3s.length; });
}

// ---------------------------------------------------------------- the paper
function sheetCanvas(v, wpx, shade) {
  const hpx = Math.round(wpx * SH / SW), cv = document.createElement('canvas'); cv.width = wpx; cv.height = hpx; const x = cv.getContext('2d'), k = wpx / 210;
  if (v === 'blank') { x.fillStyle = shade ? PAPER_SH : K.white; x.fillRect(0, 0, wpx, hpx); }
  else if (v === 'yellow') { x.fillStyle = shade ? YEL_SH : K.yellow; x.fillRect(0, 0, wpx, hpx); }
  else if (v === 'lo') {
    // the same sheet seen from far: report.js's layout with only what carries at that size - the title band and two rules
    const u = wpx / 1000; x.fillStyle = K.white; x.fillRect(0, 0, wpx, hpx); x.fillStyle = K.blue;
    x.fillRect(40 * u, 40 * u, 920 * u, 85 * u); x.globalAlpha = 0.55; x.fillRect(80 * u, 270 * u, 840 * u, Math.max(1, 8 * u)); x.fillRect(80 * u, 650 * u, 840 * u, Math.max(1, 8 * u)); x.globalAlpha = 1;
  }
  else {
    // the film's one layout (report.js): his last sheet as it is; the others, failed drafts of earlier days
    const no = [3100, 9125, 16425][v] ?? 0;
    drawReport(x, 0, 0, wpx, v === 3 ? {} : { no, day: no, title: '草稿', result: '失敗' });
  }
  if (shade && v !== 'blank' && v !== 'yellow') { x.globalCompositeOperation = 'multiply'; x.fillStyle = PAPER_SH; x.fillRect(0, 0, wpx, hpx); x.globalCompositeOperation = 'source-over'; }
  // the paper's own edge, a hair darker, so that a sheet on a sheet is seen
  x.strokeStyle = v === 'yellow' ? YEL_SH : PAPER_SH; x.lineWidth = Math.max(1, wpx / 90); x.strokeRect(0.5, 0.5, wpx - 1, hpx - 1);
  return cv;
}
const RES = [40, 90, 200, 420];
function textures() {
  for (const v of [0, 1, 2, 3, 'blank', 'yellow']) for (const sh of [0, 1]) TEX[v + '_' + sh] = RES.map(r => sheetCanvas(v, r, sh));
  for (const sh of [0, 1]) TEX['lo_' + sh] = RES.map(r => sheetCanvas('lo', r, sh));
}
const texFor = (v, sh, px) => { const L = TEX[(px < 120 && (v === 0 || v === 1 || v === 2) ? 'lo' : v) + '_' + sh]; for (let j = 0; j < RES.length; j++) if (RES[j] >= px * 1.1) return L[j]; return L[RES.length - 1]; };

export async function prepareHeart(cfg) {
  C = cfg; OPT = new URLSearchParams(location.search).get('opt') || cfg.opt || 'D'; HP = HPOS[OPT] ?? HPOS.D;
  if (OPT === 'B') { LD = nrm([-0.5, -0.62, -0.6]); LTO = LD.map(a => -a); }
  if (OPT === 'D') { LD = nrm([0.18, -0.8, -0.55]); LTO = LD.map(a => -a); }   // D: from above, a little from the left: symmetric
  GLYPH = new URLSearchParams(location.search).get('glyph') || cfg.glyph || 'K'; KAI_BOLD = +(new URLSearchParams(location.search).get('kaib') || KAI_BOLD);   // v11: the kaisho (astra chose it over the textbook face)
  if (GLYPH === 'Kai') { try { const ff = new FontFace('KAI', "local('KaiTi'), local('楷体'), local('SimKai')"); await ff.load(); document.fonts.add(ff); } catch (e) { GLYPH = 'U'; } }
  if (GLYPH === 'U') { try { const ff = new FontFace('UDK', "local('UD Digi Kyokasho N Bold'), local('UDDigiKyokashoN-Bold')"); await ff.load(); document.fonts.add(ff); } catch (e) { GLYPH = 'K'; } }   // B: the light from above right, where she stands
  if (GLYPH === 'Kai' && OPT === 'D') HP = { ...HP, h: HP.h * 0.9, c: [HP.c[0] - 0.12, HP.c[1] + 0.05, HP.c[2]] };   // (and a little left: its hook and right dot weigh on the right)   // (its box is lower and wider: the same width, the same gap over her bow)
    glyph(); textures();
  LA = document.createElement('canvas'); LA.width = W; LA.height = H; LB = document.createElement('canvas'); LB.width = W; LB.height = H;
}

// ---------------------------------------------------------------- one sheet, drawn
// s: { p: [x,y,z] centre, m: rotation fn, sc, v, back: 'blank' | 'yellow', shadow: bool }
function drawSheet(x, s, shadowOn) {
  const w = SW * s.sc / 2, h = SH * s.sc / 2, m = s.m, c = s.p;
  const cn = [[-w, h], [w, h], [w, -h], [-w, -h]].map(([a, b]) => { const q = m([a, b, 0]); return [c[0] + q[0], c[1] + q[1], c[2] + q[2]]; });
  const P = cn.map(proj); if (P.some(q => q[2] < 0.9)) return;            // (too near the lens: the flat drawing of it would stretch)
  const n = m([0, 0, 1]), face = dot3(n, [CAM.p[0] - c[0], CAM.p[1] - c[1], CAM.p[2] - c[2]]) > 0, nf = face ? n : n.map(a => -a);
  const lit = dot3(nf, LTO) > 0.15;
  // its shadow, on the paper behind it: along the light onto the character's plane, a little behind this sheet's own place
  if (shadowOn && s.shadow && s.near) {
    const N = planeN(), Q = toWorld(0, 0, Math.max(0, (s.base ?? 0) - 0.005)), dl = dot3(LD, N);
    if (Math.abs(dl) > 0.05) {
      const S2 = cn.map(q => { const t = dot3([Q[0] - q[0], Q[1] - q[1], Q[2] - q[2]], N) / dl; return proj([q[0] + LD[0] * t, q[1] + LD[1] * t, q[2] + LD[2] * t]); });
      x.globalCompositeOperation = 'source-atop'; x.fillStyle = s.shadowCol ?? PAPER_SH;
      x.beginPath(); S2.forEach((q, j) => j ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.closePath(); x.fill();
      x.globalCompositeOperation = 'source-over';
    }
  }
  const px = Math.hypot(P[1][0] - P[0][0], P[1][1] - P[0][1]), py = Math.hypot(P[3][0] - P[0][0], P[3][1] - P[0][1]);
  // a sheet seen edge on is only a hair-thin white line: not drawn (it read as a scratch)
  const area = Math.abs((P[1][0] - P[0][0]) * (P[3][1] - P[0][1]) - (P[1][1] - P[0][1]) * (P[3][0] - P[0][0]));
  if (area / Math.max(px, py, 1) < 2.2) return P;
  const tex = texFor(face ? s.v : s.back ?? 'blank', lit ? 0 : 1, Math.max(px, py / 1.414));
  x.setTransform((P[1][0] - P[0][0]) / tex.width, (P[1][1] - P[0][1]) / tex.width, (P[3][0] - P[0][0]) / tex.height, (P[3][1] - P[0][1]) / tex.height, P[0][0], P[0][1]);
  x.drawImage(tex, 0, 0); x.setTransform(1, 0, 0, 1, 0, 0);
  if (s.edge) { x.strokeStyle = s.edge; x.lineWidth = Math.max(2, px * 0.05); x.lineJoin = 'miter'; x.beginPath(); P.forEach((q, j) => j ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.closePath(); x.stroke(); }
  return P;
}

// ---------------------------------------------------------------- the cameras of the three options
// each: k -> { cam: [pos, target, fov], her: [x, z] }
const lerp3 = (a, b, e) => a.map((v, i) => mix(v, b[i], e));
function keyed(KEYS, kb) {
  let i = 0; while (i < KEYS.length - 1 && kb >= KEYS[i + 1][0]) i++;
  const a = KEYS[i], b = KEYS[Math.min(i + 1, KEYS.length - 1)];
  if (a === b || b[0] <= a[0]) return a[1];
  const e = smooth(clamp((kb - a[0]) / (b[0] - a[0])));
  return { p: lerp3(a[1].p, b[1].p, e), t: lerp3(a[1].t, b[1].t, e), fov: mix(a[1].fov, b[1].fov, e) };
}
const CAMS = {
  // D (v9 feedback): one axis. A short establishing shot of her walking in, whole; then on k504 behind her on the centre
  // line: she fills the lower half from her thighs up, her bow just under the character, which gathers above her head,
  // centred, leaning back a little over her (a canopy of paper she looks up into)
  D: [[500, { p: [0, 1.05, 4.4], t: [0, 2.4, -6], fov: 50 }], [504, { p: [0, 1.08, 4.2], t: [0, 2.45, -6], fov: 50 }],
      [504, { p: [0, 1.22, 1.42], t: [0, 2.3, -6], fov: 50 }], [515, { p: [0, 1.22, 1.35], t: [0, 2.3, -6], fov: 50 }], [522, { p: [0, 1.22, 1.3], t: [0, 2.32, -6], fov: 50 }],
      [528, { p: [0, 1.22, 1.32], t: [0, 2.3, -6], fov: 50 }], [532, { p: [0, 1.22, 1.28], t: [0, 2.3, -6], fov: 50 }]],
  // A: low, behind her, on her axis: she is the near half of the frame (from her shins up); the character gathers above her head
  A: [[500, { p: [0.15, 0.7, 3.4], t: [0, 3.5, -5.5], fov: 56 }], [508, { p: [0.15, 0.62, 3.0], t: [0, 3.7, -5.5], fov: 56 }], [515, { p: [0.15, 0.6, 2.8], t: [0, 3.8, -5.5], fov: 56 }],
      [515, { p: [0.35, 0.62, 2.15], t: [0, 4.0, -5.5], fov: 56 }], [522, { p: [0.3, 0.6, 2.0], t: [0, 4.1, -5.5], fov: 56 }], [528, { p: [0.2, 0.6, 2.25], t: [0, 4.0, -5.5], fov: 56 }], [532, { p: [0.1, 0.62, 2.4], t: [0, 3.9, -5.5], fov: 56 }]],
  // B: from behind her, to her right: she right of centre, near; the character on the left, turned towards us, in depth
  B: [[500, { p: [1.4, 0.75, 3.3], t: [-3.4, 2.6, -5.5], fov: 56 }], [508, { p: [1.25, 0.62, 2.8], t: [-3.4, 2.75, -5.5], fov: 59 }], [515, { p: [1.15, 0.62, 2.6], t: [-3.4, 2.8, -5.5], fov: 58.5 }],
      [515, { p: [1.0, 0.75, 2.1], t: [-3.4, 4.4, -5.5], fov: 54 }], [522, { p: [0.95, 0.75, 2.0], t: [-3.4, 4.45, -5.5], fov: 54 }], [528, { p: [1.0, 0.75, 2.1], t: [-3.4, 4.4, -5.5], fov: 54 }], [532, { p: [1.0, 0.75, 2.2], t: [-3.4, 4.3, -5.5], fov: 54 }]],
  // C: the camera goes up with the sheets into the character, then (cut) low behind her for his last sheet
  C: [[500, { p: [0.15, 0.8, 3.4], t: [0, 3.6, -5.5], fov: 56 }], [507, { p: [0.1, 4.2, 2.6], t: [0, 5.4, -5.5], fov: 50 }], [512, { p: [0.0, 4.9, 2.2], t: [0, 5.6, -5.5], fov: 50 }], [515, { p: [-0.1, 5.1, 2.0], t: [0, 5.6, -5.5], fov: 50 }],
      [515, { p: [0.35, 0.62, 2.15], t: [0, 4.0, -5.5], fov: 56 }], [522, { p: [0.3, 0.6, 2.0], t: [0, 4.1, -5.5], fov: 56 }], [528, { p: [0.2, 0.6, 2.25], t: [0, 4.0, -5.5], fov: 56 }], [532, { p: [0.1, 0.62, 2.4], t: [0, 3.9, -5.5], fov: 56 }]],
};
const D_SY = 275;                                    // D: the axis shot moved down on the screen (her bow under the character)
const HERX = { A: 0, B: 0.6, C: 0, D: 0 };

// ---------------------------------------------------------------- the frame
// st: { kb, T, pose, low, holdSheet (drawn on tr_2), herZ }
export function drawHeart(c, st) {
  const { kb, T } = st, { kt, PB, KLAND, KLIT, T_FLOW, FLOWDUR, V2 } = C;
  const cm = keyed(CAMS[OPT], kb);
  if (OPT === 'D' && kb >= 504) { const dz = st.herZ ?? 0; cm.p = [cm.p[0], cm.p[1], cm.p[2] + dz]; cm.t = [cm.t[0], cm.t[1], cm.t[2] + dz]; }   // on the axis the camera walks with her
  setCam(cm.p, cm.t, cm.fov, 0, OPT === 'D' && kb >= 504 ? D_SY : 0);
  const hx = HERX[OPT], hz = st.herZ ?? 0;
  c.fillStyle = K.navy; c.fillRect(0, 0, W, H); grid(c, K.paper, 40, 0.07);
  // the floor: from the horizon down, a little deeper navy; its far edge a line
  const hzn = proj([CAM.p[0] + CAM.f[0] * 400, CAM.p[1], CAM.p[2] + CAM.f[2] * 400]);
  const fl = proj([hx, 0, hz - 40]);
  if (fl[1] < H && proj([hx, 0, hz])[1] < H + 40) {      // (the floor only where her feet are in the frame: no horizon line across her)
   c.fillStyle = K.deep; c.fillRect(0, fl[1], W, H - fl[1]); c.fillStyle = K.blue; c.fillRect(0, fl[1] - 1, W, 3); }
  const lit = kb >= C.KLIT, tL = kt(KLIT), flow = T >= T_FLOW;
  // the beat in the character: a breath with the band once it is lit; the last chord
  let pulse = 0; if (kb >= KLIT && kb < C.KOUT) pulse = 0.025 * Math.exp(-((kb - KLIT) % 1) * 5);
  if (kb >= C.KOUT) pulse += 0.05 * Math.exp(-(kb - C.KOUT) * PB * 4) * (flow ? 0.6 : 1);
  const sheets = [];
  const chest = [hx, 1.28, hz - 0.06];                       // (her chest is behind her back: they go in over her shoulders, down the axis)
  for (const s of SHEETS) {
    const d3 = s.k === 3;
    const tArr = d3 ? kt(KLAND[2]) + 0.3 + 1.8 * PB * rnd(s.i + 0.9) : kt(KLAND[s.k]) - 0.05 - (1 - s.p) * 2.3 * PB - 0.06 * rnd(s.i + 0.9), dur = 2.1 + 0.9 * rnd(s.i + 0.8), dep = tArr - dur;
    if (T < dep) continue;
    const X = s.X * (1 + pulse), Y = s.Y * (1 + pulse);
    let rest = toWorld(X, Y, s.dz), sp = 0, orb = 0;
    // the sheets of the last dot cannot settle: they circle the empty place until his last sheet comes; then they close in with it
    if (d3 && T < tL) {
      const tS = kt(C.KTOSS); sp = clamp((T - tS) / (tL - tS)); const th = s.ri * 6.283 + 0.5 * (rnd(s.i + 0.51) - 0.5) + T * (0.4 + 0.3 * rnd(s.i + 0.55)) + 2.5 * sp * sp, q = (1 + 0.06 * Math.sin(T * 1.7 + s.i)) * (1 - smooth((sp - 0.5) / 0.5));
      // v11: the empty place stays clean (a ring there read as a hole, a breakage); they wait round her instead, a loose slow
      // circle over her head (on the axis, where the eye is), and go up with his last sheet into the dot
      // (behind her: round her head and shoulders, never over her)
      const rj = 0.8 + 0.4 * rnd(s.i + 0.53), ux = 0.42 * rj * Math.cos(th), uz = 0.35 * rj * Math.sin(th);
      const o = [hx + ux, 1.5 + 0.22 * (rnd(s.i + 0.54) - 0.5) + 0.05 * Math.sin(T * 1.3 + s.i), hz - 0.75 + uz]; orb = 1 - smooth((sp - 0.6) / 0.4);
      const e3 = smooth((sp - 0.3 - 0.15 * rnd(s.i + 0.56)) / 0.55); rest = [0, 1, 2].map(a => mix(o[a], rest[a], e3));
    }
    let p = rest, yaw = HP.yaw, rz = s.a - Math.PI / 2, ry = s.ry0, rx = s.rx0, sc = s.sc, back = 'blank', light = false;
    if (T < tArr) {
      // on the way: from behind us, low, past her, up; as a flock (the sheets of a stroke keep together and close in)
      const e = (T - dep) / dur, u = 1 - Math.pow(1 - e, 2.3), side = rnd(s.i + 0.5) < (OPT === 'B' ? 0.18 : 0.5) ? -1 : 1;
      const S0 = [hx + side * (2.6 + 2.4 * rnd(s.i + 0.61)), 0.2 + 1.2 * rnd(s.i + 0.62), 0.2 + 1.4 * rnd(s.i + 0.63)];
      const C1 = [hx + side * (1.4 + 1.4 * rnd(s.i + 0.64)) + s.X * 0.3, 2.8 + 1.8 * rnd(s.i + 0.65), -1.2 - 1.5 * rnd(s.i + 0.66)];
      const C2 = toWorld(X * 1.15 + (rnd(s.i + 0.67) - 0.5) * 1.0, Y + 1.6 + 0.8 * rnd(s.i + 0.69), 1.6 + 1.0 * rnd(s.i + 0.68));     // they come down into their places from above, never across her
      if (d3) { C2[0] = rest[0] + (rest[0] - hx) * 1.5; C2[1] = rest[1] + 1.0; C2[2] = rest[2] - 0.6; }   // (the waiting ones come down round her from above)
      const v = 1 - u, b = [v * v * v, 3 * v * v * u, 3 * v * u * u, u * u * u], sw = Math.pow(v, 1.4);
      p = [0, 1, 2].map(a => b[0] * S0[a] + b[1] * C1[a] + b[2] * C2[a] + b[3] * rest[a]);
      p[0] += sw * 0.5 * Math.sin(T * 1.9 + s.i); p[1] += sw * 0.35 * Math.cos(T * 1.5 + s.i * 2); p[2] += sw * 0.4 * Math.sin(T * 1.2 + s.i * 3);
      // not across her head and shoulders: near her they keep to their own side of her
      const kw = smooth((p[2] - (hz - 2.2)) / 0.9) * smooth((hz + 1.4 - p[2]) / 0.6) * smooth((p[1] - 0.7) / 0.3);
      if (kw > 0) p[0] = mix(p[0], hx + side * Math.max(side * (p[0] - hx), 1.0), kw);
      rx += sw * (2.4 * Math.sin(T * 3.1 + s.i) + s.i); ry += sw * (2.0 * Math.sin(T * 2.3 + s.i * 1.7)); rz += sw * 1.6 * Math.sin(T * 1.4 + s.i * 0.7);
    } else if (d3 && T < tL) {
      const w = 1 - sp; rx += w * 0.45 * Math.sin(T * 2.1 + s.i); ry += w * 0.4 * Math.sin(T * 1.6 + s.i * 1.3); rz += w * 0.6 * Math.sin(T * 0.9 + s.i);
    } else {
      // in its place: it settles, breathes, now and then a corner lifts
      const age = T - (d3 ? tL : tArr);
      ry += 0.55 * Math.exp(-age * 5) * Math.sin(age * 17 + s.i);
      rx += 0.06 * Math.sin(T * 1.7 + s.i * 1.3); ry += 0.07 * Math.sin(T * 1.3 + s.i * 2.1);
      const P2 = 3.2 + 3 * rnd(s.i + 0.97), f = (T + 9 * rnd(s.i + 0.93)) % P2; if (f < 0.7) rx += 0.5 * Math.sin(f / 0.7 * Math.PI) * (rnd(s.i + 0.95) < 0.5 ? 1 : -1);
    }
    // lit: from the dot she filled, sheet by sheet, each turns over to its yellow side
    if (lit) {
      const tf = tL + 0.18 + s.dd / 7 + 0.04 * rnd(s.i + 0.33), fe = smooth((T - tf) / 0.16);   // v11: slow enough to be seen running out from the dot
      if (fe > 0) { ry += Math.PI * fe; back = 'yellow'; light = fe >= 1; }
    }
    // then it leaves the character from the top down, and goes into her
    if (flow) {
      const yn = (HB.top - s.Y) / (HB.top - HB.bot), torn = 0.07 * Math.sin(s.X * 3 + 1.3) + 0.05 * Math.sin(s.X * 9) + 0.06 * rnd(s.i + 5);
      const rel = T_FLOW + clamp(yn + torn) * FLOWDUR, tf = T - rel, d = 1.0 + 0.5 * rnd(s.i + 6);
      if (tf > d) continue;
      if (tf > 0) {
        const e = smooth(tf / d), mid = [hx + s.X * 0.18 + (rnd(s.i + 42) - 0.5) * 0.4, 1.95 + 0.35 * rnd(s.i + 43), hz - 1.0 - 0.6 * rnd(s.i + 44)], v = 1 - e;   // down the centre line, a narrowing stream
        p = [0, 1, 2].map(a => v * v * rest[a] + 2 * v * e * mid[a] + e * e * chest[a]);
        rx += 1.8 * e * Math.sin(tf * 4 + s.i); rz += 1.2 * e * Math.sin(tf * 3 + s.i); sc *= 1 - 0.78 * e;
        if (e > 0.8) { sheets.push({ spark: true, p, r: 0.8 * (1 - (e - 0.8) / 0.2) }); continue; }   // light only once it is down at her
      }
    }
    if (orb > 0) sc *= 1 - 0.76 * orb;                              // (small while they wait near the lens, round her)
    const v = flow && back === 'yellow' ? 'yellow' : s.v;           // (going into her, both its sides are yellow: no white flashing in the stream)
    sheets.push({ p, m: rot(yaw, rz, ry, rx, HP.tilt ?? 0), sc, v, back, shadow: true, near: Math.hypot(p[0] - rest[0], p[1] - rest[1], p[2] - rest[2]) < 0.12, base: s.dz, shadowCol: back === 'yellow' ? SHADOW_Y : SHADOW_P });
  }
  const her = st.pose ? (() => { const S = V2[st.set], qa = proj([hx, 0.9, hz]), qb = proj([hx, 1.6, hz]), q1 = proj([hx, 1.25, hz]);
    // her card is flat: its scale is taken over her upper body (what is in the frame) and it is pinned at her chest,
    // so that near the lens, looking up, her head and shoulders are where the 3D puts them (her feet may be off the frame)
    const ppm = (qa[1] - qb[1]) / 0.7; return qa[2] > 0.3 && ppm > 1 ? { S, ppm, foot: [q1[0], q1[1] + 1.25 * ppm, q1[2]], depth: q1[2] } : null; })() : null;
  // his last sheet: in her hand (tr_2: drawn there, on her card), in the air, in the dot
  const dotRest = toWorld(DOT.X * (1 + pulse), DOT.Y * (1 + pulse), 0.16), dotSc = 0.85;
  let lastSheet = null;
  if (kb >= C.KTOSS) {
    const a = clamp((kb - C.KTOSS) / (KLIT - C.KTOSS));
    // where it leaves her hand: exactly over the sheet printed in tr_2 (her card is flat on the screen, so the point is
    // found on the screen - the card's own pixels - and taken back into the world at her depth), as large as it is there
    const Str = V2.tr, kc = her ? her.ppm : 1, HC = her ? [her.foot[0] - Str.ax * kc + (HAND_UV[0] - Str.px[0] / 2) * Str.mpp * kc, her.foot[1] + (Str.low?.tr_2 ?? 0) * kc - Str.h * kc + HAND_UV[1] * Str.mpp * kc] : null;
    const H0 = HC ? unproj(HC[0], HC[1], her.depth) : [hx + 0.2, 1.75, hz], sc0 = HC ? HAND_W * Str.mpp * kc * her.depth / CAM.F / SW : 0.8;
    const e = smooth(a), p = [mix(H0[0], dotRest[0], e) + 0.5 * Math.sin(a * Math.PI) * (OPT === 'B' ? -1 : 1), mix(H0[1], dotRest[1], a * a * (2 - a)) + (OPT === 'D' ? 0.3 : 1.1) * Math.sin(a * Math.PI), mix(H0[2], dotRest[2], e)];   // (D, near: a low arc, so it stays in the frame)
    let ry = 0.3 * Math.sin(a * 9) * (1 - a), rx = 0.4 * Math.sin(a * 7) * (1 - a), back = 'blank';
    if (lit) { const fe = smooth((T - tL - 0.16) / 0.22); ry += Math.PI * fe; if (fe > 0) back = 'yellow'; rx += 0.3 * Math.exp(-(T - tL) * 6) * Math.sin((T - tL) * 25); }
    let pp = a < 1 ? p : dotRest, sc = mix(sc0, dotSc, a);
    if (flow) { const tf = T - T_FLOW - 0.15 * FLOWDUR, d = 1.2; if (tf > d) pp = null; else if (tf > 0) { const e2 = smooth(tf / d), v = 1 - e2, mid = [hx + 0.12, 2.3, hz - 1.4]; pp = [0, 1, 2].map(i => v * v * dotRest[i] + 2 * v * e2 * mid[i] + e2 * e2 * chest[i]); sc *= 1 - 0.8 * e2; if (e2 > 0.82) { sheets.push({ spark: true, p: pp, r: 1.0 * (1 - (e2 - 0.82) / 0.18) }); pp = null; } } }
    if (pp) { lastSheet = { p: pp, m: rot(mix(Math.atan2(-CAM.f[0], -CAM.f[2]), HP.yaw, smooth(a)), mix(0, DOT.a - Math.PI / 2, a), ry, rx + (1 - smooth(a)) * Math.asin(CAM.f[1]), (HP.tilt ?? 0) * smooth(a)), sc, v: 3, back, edge: back === 'yellow' || a < 0.1 || a >= 1 ? null : K.yellow, shadow: a >= 1, near: a >= 1, base: 0.16, shadowCol: back === 'yellow' ? SHADOW_Y : SHADOW_P }; sheets.push(lastSheet); }
  }
  // others, adrift far behind, and a few close to us going up: the air is never still
  for (let i = 0; i < 28; i++) {
    const y = 0.5 + ((rnd(i + 81) * 11 + T * (0.15 + 0.25 * rnd(i + 82))) % 11);
    sheets.push({ p: [HP.c[0] + (i % 2 ? 1 : -1) * (HB.w * 0.85 + rnd(i + 80) * 9), y, HP.c[2] - 2 - rnd(i + 83) * 12], m: rot(0, T * 0.4 + i, T * 0.7 + i * 2, T * 0.5 + i), sc: 1, v: i % 3, back: lit && kb >= C.KOUT ? 'yellow' : 'blank' });
  }
  // the empty place of the dot: dashed, as on his plans; it shows itself twice before she lifts his sheet
  const markDot = false;            // (no dashed mark: the gap in the character says it; the sheets circling it say it)
  // ---- draw: far to near; she is a card at her depth
  const items = sheets.map(s => ({ s, z: proj(s.p)[2] })).sort((a, b) => b.z - a.z);
  const lay = (x, list, shadows) => { x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, W, H); for (const { s } of list) { if (s.spark) spark(x, s); else drawSheet(x, s, shadows); } };
  const behind = her ? items.filter(o => o.z > her.depth) : items, front = her ? items.filter(o => o.z <= her.depth) : [];
  lay(LA.getContext('2d'), behind, true);
  if (markDot) dashedDot(c, kb, T, pulse);
  c.drawImage(LA, 0, 0);
  // rings, from the dot as it is filled, flat and thin: three, a third of a beat apart
  if (false) { const q = proj(dotRest);       // (no rings: astra read them as a debug circle; the turning sheets are the event)
 for (let j = 0; j < 3; j++) { const g = (kb - KLIT - 0.4 - j * 0.5) / 2.2; if (g < 0 || g >= 1 || j > 1) continue; c.strokeStyle = K.yellow; c.lineWidth = 5 * (1 - g) + 1; c.beginPath(); c.arc(q[0], q[1], 60 + g * 1100, 0, 7); c.stroke(); } }
  if (her) {
    c.fillStyle = K.navy; c.beginPath(); c.ellipse(her.foot[0], her.foot[1] + 3, 0.34 * her.ppm, 0.06 * her.ppm, 0, 0, 7); c.fill();
    const S = her.S, k = her.ppm, wpx = S.h * S.px[0] / S.px[1] * k;
    fig(c, st.pose, her.foot[0] - S.ax * k, her.foot[1] + (st.low ?? 0) * k, S.h * k);
    // (tr_2 is drawn with his last sheet printed in her hand: nothing is laid over it)
  }
  if (front.length) { lay(LB.getContext('2d'), front, false); c.drawImage(LB, 0, 0); }
  return { dotScreen: proj(dotRest) };
}
// the light a sheet becomes as it goes into her: a small four-pointed spark, yellow
function spark(x, s) {
  const q = proj(s.p); if (q[2] < 0.2) return; const r = Math.max(1.5, 0.05 * s.r * CAM.F / q[2]);   // v11: small (big ones read as stickers)
  x.fillStyle = K.yellow; x.beginPath(); x.moveTo(q[0], q[1] - r); x.lineTo(q[0] + r * 0.32, q[1] - r * 0.32); x.lineTo(q[0] + r, q[1]); x.lineTo(q[0] + r * 0.32, q[1] + r * 0.32); x.lineTo(q[0], q[1] + r); x.lineTo(q[0] - r * 0.32, q[1] + r * 0.32); x.lineTo(q[0] - r, q[1]); x.lineTo(q[0] - r * 0.32, q[1] - r * 0.32); x.closePath(); x.fill();
}
function dashedDot(c, kb, T, pulse) {
  const P = DOTHULL.map(([a, b]) => proj(toWorld(a * (1 + pulse), b * (1 + pulse), 0)));
  const flash = [511.5, 513.5].some(k => kb >= k && kb < k + 0.3);
  c.save(); c.beginPath(); P.forEach((q, j) => j ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath();
  if (flash) { c.fillStyle = K.yellow; c.fill(); }
  c.strokeStyle = flash ? K.yellow : K.paper; c.lineWidth = 4; c.setLineDash([14, 10]); c.lineDashOffset = -T * 30; c.stroke(); c.restore();
}
// his last sheet in her raised hand (tr_2 has it blank): the record printed on it
function holdPrint(c, her, S, k, hx, hz, st) {
  const mpp = S.mpp, cx = her.foot[0] - S.ax * k, top = her.foot[1] + (st.low ?? 0) * k - S.h * k;
  const u2x = u => cx + (u - S.px[0] / 2) * mpp * k, v2y = v => top + v * mpp * k;
  const a = [u2x(478), v2y(16)], b = [u2x(664), v2y(279)], tex = texFor(3, 0, b[0] - a[0]);
  c.drawImage(tex, a[0], a[1], b[0] - a[0], b[1] - a[1]);
}
// where the held sheet's centre is, in the world (for the toss to start from)
// the sheet in tr_2's hand, in the card's pixels: its centre and its width (r9 redraw, 707 x 2372: paper x 420 - 707, y 7 - 410)
const HAND_UV = [562, 210], HAND_W = 287;
const unproj = (sx, sy, z) => { const xr = (sx - W / 2 - CAM.sx) / CAM.F * z, yu = -(sy - H / 2 - CAM.sy) / CAM.F * z; return [0, 1, 2].map(i => CAM.p[i] + CAM.r[i] * xr + CAM.u[i] * yu + CAM.f[i] * z); };
export function handWorld(S, hx, hz, low) { const mpp = S.mpp; return [hx - S.ax + (HAND_UV[0] - S.px[0] / 2) * mpp, (S.px[1] - HAND_UV[1]) * mpp - low, hz]; }
