// v12: the heart of finale written in her own song (234.3 - 253.8 s).
// After 永遠に歌う she goes on singing without words: ラ ラ ラ ラ ラ | ウ ラ ラ ウ ラ (vocal stem, measured onsets below).
// Every note she sings writes the character 心 on his blueprint, a stroke at a time, in the order of the brush - and the
// stroke is made of the syllable she is singing, small ラ set close in rows. The second phrase lights the four strokes
// yellow, one a syllable; on the last long ラ she is near, the character behind her; then it comes apart from the top
// down and runs into her; on the music box's first note her heart lights and she looks back.
// One axis for the whole passage: the character over her, she under it, both on the centre line.
import { W, H, K, clamp, mix, smooth, out3, rnd, fig, grid, dayMark } from './kit.js';

const S = 600;                                                   // the character's own square (its units)
// the notes she sings (s): the first phrase writes, the second lights
const N1 = [[238.45, 238.76], [238.78, 239.00], [239.02, 239.28], [239.30, 239.60], [239.62, 240.40]];   // v12b: ラ ラ ラ ラ ラ, measured
const N2 = [241.77, 242.23, 242.60, 243.47];                     // ウ ラ ラ ウ: a stroke each
export const T_LAST = 244.35;                                    // the last ラ, held to 247.4
export const T_FLOW0 = 246.40, T_FLOW1 = 250.30, T_BOX = 250.38;
let G = null;

function build() {
  const cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d');
  x.fillStyle = '#fff'; x.font = `400 ${S * 0.84}px "Mincho K"`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('心', S / 2, S / 2);
  const d = x.getImageData(0, 0, S, S).data, M = new Uint8Array(S * S);
  let x0 = S, x1 = 0, y0 = S, y1 = 0;
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) if (d[(j * S + i) * 4 + 3] > 127) { M[j * S + i] = 1; x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, j); y1 = Math.max(y1, j); }
  // the four pieces of ink, in the order of the brush: left dot, the hook, the top dot, the right dot
  const lab = new Int16Array(S * S).fill(-1), comps = [];
  for (let s = 0; s < S * S; s++) if (M[s] && lab[s] < 0) {
    const q = [s], g = []; lab[s] = comps.length;
    while (q.length) { const p = q.pop(); g.push(p); const i = p % S, j = (p - i) / S; for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) { const u = i + a, v = j + b, r = v * S + u; if (u >= 0 && u < S && v >= 0 && v < S && M[r] && lab[r] < 0) { lab[r] = comps.length; q.push(r); } } }
    comps.push(g);
  }
  const big = comps.map((g, n) => ({ g, n })).filter(o => o.g.length > 40).sort((a, b) => b.g.length - a.g.length);
  const cxOf = g => g.reduce((s, p) => s + p % S, 0) / g.length;
  const hook = big[0], dots = big.slice(1, 4).sort((a, b) => cxOf(a.g) - cxOf(b.g));
  const order = [dots[0], hook, dots[1], dots[2]];
  const SK = new Int8Array(S * S).fill(-1); order.forEach((o, k) => o.g.forEach(p => { SK[p] = k; }));
  // along each stroke: the distance from where the brush goes in (its top), through the ink
  const GD = new Float32Array(S * S).fill(-1), LEN = [];
  order.forEach((o, k) => {
    let st = o.g[0]; for (const p of o.g) { const i = p % S, j = (p - i) / S, si = st % S, sj = (st - si) / S; if (j < sj || (j === sj && i < si)) st = p; }
    const q = [st]; GD[st] = 0; let h = 0, mx = 0;
    while (h < q.length) { const p = q[h++], i = p % S, j = (p - i) / S; for (const [a, b, w] of [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1]]) { const u = i + a, v = j + b, r = v * S + u; if (u >= 0 && u < S && v >= 0 && v < S && SK[r] === k && GD[r] < 0) { GD[r] = GD[p] + w; mx = Math.max(mx, GD[r]); q.push(r); } } }
    LEN.push(mx);
  });
  // distance to the edge (chamfer)
  const D = new Float32Array(S * S); for (let s = 0; s < S * S; s++) D[s] = M[s] ? 1e9 : 0;
  for (let j = 1; j < S - 1; j++) for (let i = 1; i < S - 1; i++) { const s = j * S + i; if (D[s]) D[s] = Math.min(D[s], D[s - 1] + 3, D[s - S] + 3, D[s - S - 1] + 4, D[s - S + 1] + 4); }
  for (let j = S - 2; j > 0; j--) for (let i = S - 2; i > 0; i--) { const s = j * S + i; if (D[s]) D[s] = Math.min(D[s], D[s + 1] + 3, D[s + S] + 3, D[s + S + 1] + 4, D[s + S - 1] + 4); }
  // the syllables, set in rows (each row half a cell along from the last), only where a whole one fits in the ink
  const g = 12, glyphs = [];
  for (let r = 0, y = y0 + g * 0.45; y < y1; r++, y += g * 0.92) for (let x = x0 + (r % 2) * g / 2; x < x1; x += g) {
    const s = Math.round(y) * S + Math.round(x); if (!M[s] || D[s] < g * 0.3 * 3) continue;
    const k = SK[s]; glyphs.push({ x, y, k, d: GD[s] / LEN[k], n: glyphs.length, r1: rnd(glyphs.length * 7.3), r2: rnd(glyphs.length * 3.1) });
  }
  const A = new Uint8Array(S * S); for (let i = 0; i < S * S; i++) A[i] = d[i * 4 + 3];
  G = { glyphs, box: [x0, y0, x1, y1], g, A, SK, GD, LEN, M };
}

// when a syllable is written (the first phrase: stroke 0 on note 0, the hook on notes 1 and 2, then the dots)
function writeAt(o) {
  const seg = (n, u) => mix(N1[n][0], N1[n][1], u * 0.92);
  if (o.k === 0) return seg(0, o.d);
  if (o.k === 1) return o.d < 0.5 ? seg(1, o.d * 2) : seg(2, (o.d - 0.5) * 2);
  return seg(o.k === 2 ? 3 : 4, o.d);
}
const litAt = o => N2[o.k] + o.d * (o.k === 1 ? 0.42 : 0.28);
// when it leaves for her (top first) and how long it flies
const wob = (x, y) => 0.5 + 0.25 * (Math.sin(x * 0.05 + y * 0.031) + Math.sin(x * 0.023 - y * 0.061 + 1.3));   // a soft, wavy edge, not blocks
const cellT = (x, y) => T_FLOW0 + clamp(((y - G.box[1]) / (G.box[3] - G.box[1] + 10)) * 0.62 + wob(x, y) * 0.38) * (T_FLOW1 - T_FLOW0 - 1.2);
const flowAt = o => cellT(o.x, o.y);
const FLY = 1.1;

// the character, drawn with its bounding box centred at (cx, cy), `h` px tall. st: { T, target: [x, y] or null, alpha, plan }
// Each stroke is written as solid ink along the brush's way (the pixels in the order of their distance from where the
// brush goes in), paper while written, yellow once lit; her ラ are set into it, a shade darker, crisp at screen size.
let OCV = null, BODY = null;
export function drawRa(c, cx, cy, h, st) {
  if (!G) build();
  const [x0, y0, x1, y1] = G.box, sc = h / (y1 - y0), T = st.T, bw = Math.ceil((x1 - x0 + 4) * sc), bh = Math.ceil((y1 - y0 + 4) * sc);
  const ox = cx - (x0 + x1) / 2 * sc, oy = cy - (y0 + y1) / 2 * sc;
  if (T < 241.2 && (st.plan ?? 1) > 0) {                          // his plan: the outline, dashed, under what is written
    c.save(); c.setTransform(sc, 0, 0, sc, ox, oy); c.globalAlpha = 0.45 * (st.plan ?? 1); c.strokeStyle = K.paper; c.lineWidth = 2.4 / sc; c.setLineDash([10 / sc, 8 / sc]);
    c.font = `400 ${S * 0.84}px "Mincho K"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.strokeText('心', S / 2, S / 2); c.restore();
  }
  // the ink, at the character's own resolution
  if (!BODY) { BODY = document.createElement('canvas'); BODY.width = BODY.height = S; }
  const bx = BODY.getContext('2d'), im = bx.createImageData(S, S), D = im.data, P = [0xf2, 0xe9, 0xcf], Y = [0xf6, 0xc9, 0x45];
  const front = st.target ? y0 + clamp((T - T_FLOW0) / (T_FLOW1 - T_FLOW0 - 0.6)) * (y1 - y0 + 10) : -1;
  for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) {
    const p = j * S + i, a = G.A[p]; if (!a) continue;
    let k = G.SK[p]; if (k < 0) { let best = 1e9; for (let b = -2; b <= 2; b++) for (let q = -2; q <= 2; q++) { const r = p + b * S + q; if (G.SK[r] >= 0 && Math.abs(b) + Math.abs(q) < best) { best = Math.abs(b) + Math.abs(q); k = G.SK[r]; } } if (k < 0) continue; }
    const dd = G.GD[p] >= 0 ? G.GD[p] / G.LEN[k] : 1, o = { k, d: dd };
    if (T < writeAt(o)) continue; let fa = 1; if (st.target) { fa = 1 - clamp((T - cellT(i, j)) / 0.3); if (fa <= 0) continue; }
    const C = T >= litAt(o) ? Y : P; D[p * 4] = C[0]; D[p * 4 + 1] = C[1]; D[p * 4 + 2] = C[2]; D[p * 4 + 3] = a * fa;
  }
  bx.putImageData(im, 0, 0);
  if (!OCV) OCV = document.createElement('canvas');
  if (OCV.width < bw || OCV.height < bh) { OCV.width = Math.max(OCV.width, bw); OCV.height = Math.max(OCV.height, bh); }
  const o2 = OCV.getContext('2d'); o2.setTransform(1, 0, 0, 1, 0, 0); o2.clearRect(0, 0, OCV.width, OCV.height); o2.globalCompositeOperation = 'source-over';
  o2.imageSmoothingEnabled = true; o2.drawImage(BODY, x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4, 0, 0, bw, bh);
  // her ラ, set into the ink (only where there is ink)
  const fs = G.g * sc * 0.92, L = (x, y) => [(x - x0 + 2) * sc, (y - y0 + 2) * sc];
  o2.globalCompositeOperation = 'source-atop'; o2.font = `400 ${fs}px "Gothic X"`; o2.textAlign = 'center'; o2.textBaseline = 'middle';
  for (const o of G.glyphs) {
    if (T < writeAt(o)) continue; const [x, y] = L(o.x, o.y);
    o2.fillStyle = T >= litAt(o) ? '#d9971a' : '#b3bedc'; o2.fillText('ラ', x, y);
  }
  o2.globalCompositeOperation = 'source-over';
  c.save(); c.globalAlpha = st.alpha ?? 1; c.drawImage(OCV, 0, 0, bw, bh, ox + (x0 - 2) * sc, oy + (y0 - 2) * sc, bw, bh); c.restore();
  // the pen: the newest syllables come down large and yellow; and the ones flying to her
  c.save(); c.font = `400 ${fs}px "Gothic X"`; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const o of G.glyphs) {
    const sx = ox + o.x * sc, sy = oy + o.y * sc, a = T - writeAt(o);
    if (a >= 0 && a < 0.2) { const k = 1 + 1.6 * (1 - a / 0.2); c.save(); c.globalAlpha = 1 - a / 0.2 * 0.6; c.translate(sx, sy); c.scale(k, k); c.fillStyle = K.yellow; c.fillText('ラ', 0, 0); c.restore(); }
    const b = T - litAt(o); if (b >= 0 && b < 0.18) { const k = 1 + 1.2 * (1 - b / 0.18); c.save(); c.translate(sx, sy); c.scale(k, k); c.fillStyle = K.yellow; c.fillText('ラ', 0, 0); c.restore(); }
    if (st.target) {
      const tf = flowAt(o), u = (T - tf) / FLY; if (u <= 0 || u >= 1) continue;
      const e = u * u * (3 - 2 * u), tx = st.target[0] + (o.r2 - 0.5) * 40, ty = st.target[1] + (o.r1 - 0.5) * 30, mx = mix(sx, tx, 0.25) + (o.r2 - 0.5) * 60, my = mix(sy, ty, 0.55);
      const x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * mx + e * e * tx, y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * my + e * e * ty;
      c.save(); c.globalAlpha = 1 - clamp((e - 0.55) / 0.4); c.translate(x, y); const k = mix(2.2, 0.5, e); c.scale(k, k); c.fillStyle = K.yellow; c.fillText('ラ', 0, 0); c.restore();
    }
  }
  c.restore();
  return { sc };
}
export function arrived(T) {                                     // how much of the character has gone into her (0 - 1)
  if (!G) return 0; let n = 0; for (const o of G.glyphs) if (T >= flowAt(o) + FLY) n++; return n / G.glyphs.length;
}
