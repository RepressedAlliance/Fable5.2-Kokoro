// Before the stool (say.js S3, thanks.js): blueprint blue, one ground line. Stool 08 of the roll stands left of centre,
// empty; she stands right of it, facing it, the whole of her in the frame. One camera runs through both pages, so the
// last frame of say.js and the first of thanks.js are the same picture.
// Sizes as the roll has them (roll.js): the stool is his card's height (set mf, 1.473 m), she is her own card's (set th).
// There is one stool and it is drawn once: the empty stool is mf_gone (his drawing with him taken out, the same
// canvas), and when he sits on it the stool is the one in his own drawing.
// While he is only remembered he is a flat shadow on the stool (navy, a step darker than the ground) with a thin cream
// line round it: someone sat here.
import { W, H, K, clamp, mix, smooth, out3, hit, img, pic, fig, tint, text, dayMark } from './kit.js';
export const T0B = 20.016, PB = 0.42858, kt = k => T0B + k * PB, kbOf = T => (T - T0B) / PB;
export const GROUND = 870, PPM = 480, SX = 640, HERX = 1240;       // the world at zoom 1: the ground line, pixels a metre, stool and her
export let V2 = null;
const HAVE = new Set();
// should a card not be there, the one it replaces stands in
const STAND = { en_n: 'en_o', en_s: 'en_o', en_nc: 'en_c', en_m1: 'en_s', en_m2: 'en_s', en_s2: 'en_o', th0: 'pg_1', th_1: 'pg0', th_2: 'pg0', th_p: 'pg0', th_step: 'th_p', th_kneel: 'th_1', mf_gone: 'me_gone' };
const HOLD = new Set([]);                                     // cards not to be used until redrawn
export const card = n => HAVE.has(n) && !HOLD.has(n) ? n : HAVE.has(STAND[n]) ? STAND[n] : n;
const grp = n => n.split('_')[0].replace(/\d+$/, '');
export const hM = n => V2[grp(n)].h;
export async function load(names) {
  for (const n of names) {
    if (HAVE.has(n) || !V2[grp(n)]) continue;
    try { await img(n); HAVE.add(n); } catch (e) { /* not drawn yet */ }
  }
}
export async function prepareStool() {
  V2 = await (await fetch('data/cards/v2.json?' + Date.now())).json();
  await load(['mf_gone', 'me_gone', 'mf0', 'mf_30', 'mf_45', 'mf_65', 'mf_78', 'th0', 'th_1', 'th_2', 'th_p', 'th_step', 'th_kneel', 'pg0', 'pg_1']);
}
// her, standing: the middle of her feet on (x, y)
export function her(c, n, x, y, ppm) {
  // the foot she stands on stays where it is: the rearmost contact (she faces left; th_step's back foot, th_kneel's boot toes)
  n = card(n); const g = V2[grp(n)], gr = g.ground?.[n], mid = gr && gr.length ? Math.max(...gr) : 0;
  const cx = x - mid * ppm, by = y + (g.low?.[n] ?? 0) * ppm, h = g.h * ppm;
  fig(c, n, cx, by, h);
  if (n === 'th_p' && PAPER) paper(c, cx, by, h, g.px);
}
// th_p as first drawn shows the sheet edge-on, like a tray. Until it is redrawn, the face of the sheet is set on it:
// its header band, the socket, three lines, foreshortened. (Card pixels of the sheet's visible face.)
const PAPER = false;                          // th_p is now drawn with the face of the sheet
function paper(c, cx, by, h, px) {
  const s = h / px[1], X = u => cx + (u - px[0] / 2) * s, Y = v => by - (px[1] - v) * s;
  const P = [[330, 539], [598, 539], [545, 576], [232, 575]];                 // far edge, near edge
  const at = (u, v) => { const fx = mix(P[0][0], P[3][0], v) + (mix(P[1][0], P[2][0], v) - mix(P[0][0], P[3][0], v)) * u, fy = mix(mix(P[0][1], P[1][1], u), mix(P[3][1], P[2][1], u), v); return [X(fx), Y(fy)]; };
  c.save(); c.beginPath(); for (const [u, v] of P) c.lineTo(X(u), Y(v)); c.closePath(); c.clip();
  const quad = (u0, u1, v0, v1) => { c.beginPath(); for (const [u, v] of [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]) c.lineTo(...at(u, v)); c.closePath(); };
  c.fillStyle = K.blue; quad(0.04, 0.62, 0.1, 0.32); c.fill();                   // the header band (the hand covers the rest of it)
  c.strokeStyle = K.blue; c.lineWidth = Math.max(1, 3 * s);
  for (const v of [0.5, 0.66, 0.82]) { c.beginPath(); c.moveTo(...at(0.06, v)); c.lineTo(...at(v === 0.66 ? 0.34 : 0.48, v)); c.stroke(); }
  const [ex, ey] = at(0.48, 0.66); c.beginPath(); c.ellipse(ex, ey, 26 * s, 8 * s, 0, 0, 7); c.stroke();
  c.restore();
}
// the stool's card, or his: the middle of the stool's legs on x, its feet on y. r9: set mf is 707 x 1673 (the stool 0.65 m
// high, its legs' outer box centred ax metres off the card's middle); every mf drawing has the stool in the same place
function stoolCard(c, n, x, y, ppm, im) {
  const g = V2.mf; fig(c, im ?? n, x - g.ax * ppm, y + (g.low?.[n] ?? 0.005) * ppm, g.h * ppm);
}
// him, remembered: his whole drawing (he and the stool he sits on) as one flat navy shape, a step darker than the
// ground, with a thin cream line all round it (the cream shape set under it, a few pixels out every way)
// ?nolabel=1: no label row and no DAY (a still of the page taken for somewhere else)
const Q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
const BOLD = Q.get('sil') === 'bold', NOLABEL = Q.get('nolabel') === '1';
const SIL = {};
// r10 (C4): a clean shape. From the card's own alpha at its own size: the small holes filled (gaps between his thigh and
// the seat, specks in the matte), narrow cracks closed, the large openings kept (between the stool's legs, under his
// knees); then the edge smoothed and anti-aliased, and the cream line drawn round the SMOOTHED edge. The fill is one
// opaque navy, nothing showing through it. (Was: a hard 1-bit edge, a square-dilated line - stair-stepped - and every
// pinhole of the matte left open, which showed the ground through his legs.)
// card px: an enclosed opening smaller than this is filled. Every enclosed one is (astra read the openings between his
// shins and the stool's legs as scraps of matte): the shadow is one whole shape; the stool's cream outline (mf_gone, laid
// over it) still draws the stool's legs and seat
const HOLE_MIN = Infinity;
function blurBox(src, w, h, r) {                       // box blur, separable, edges clamped; Float32
  const a = new Float32Array(w * h), b = new Float32Array(w * h), n = 2 * r + 1;
  for (let j = 0; j < h; j++) {
    const row = j * w; let s = 0;
    for (let i = -r; i <= r; i++) s += src[row + Math.min(w - 1, Math.max(0, i))];
    for (let i = 0; i < w; i++) { a[row + i] = s / n; s += src[row + Math.min(w - 1, i + r + 1)] - src[row + Math.max(0, i - r)]; }
  }
  for (let i = 0; i < w; i++) {
    let s = 0;
    for (let j = -r; j <= r; j++) s += a[Math.min(h - 1, Math.max(0, j)) * w + i];
    for (let j = 0; j < h; j++) { b[j * w + i] = s / n; s += a[Math.min(h - 1, j + r + 1) * w + i] - a[Math.max(0, j - r) * w + i]; }
  }
  return b;
}
const sstep = (e0, e1, v) => { const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function silhouette(n) {
  if (SIL[n]) return SIL[n];
  const im = pic(n), w = im.width, h = im.height, N = w * h, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const x = cv.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, w, h).data;
  const m = new Uint8Array(N); for (let i = 0; i < N; i++) m[i] = d[i * 4 + 3] > 128 ? 1 : 0;
  // 1. close narrow cracks (dilate 3, erode 3)
  const C = 3, dl = blurBox(m, w, h, C); const md = new Float32Array(N); for (let i = 0; i < N; i++) md[i] = dl[i] > 0.001 ? 1 : 0;
  const er = blurBox(md, w, h, C); const f = new Uint8Array(N); for (let i = 0; i < N; i++) f[i] = (m[i] || er[i] > 0.999) ? 1 : 0;
  // 2. the empty regions: the outside (reachable from the edge) stays; an enclosed one is filled if small, kept if large
  const lab = new Int32Array(N), keep = new Uint8Array(N), st = [];
  let id = 0;
  for (let s = 0; s < N; s++) {
    if (f[s] || lab[s]) continue;
    id++; st.push(s); lab[s] = id; const px = []; let edge = false;
    while (st.length) { const k = st.pop(); px.push(k); const i = k % w, j = (k - i) / w; if (i === 0 || j === 0 || i === w - 1 || j === h - 1) edge = true;
      for (const q of [i > 0 ? k - 1 : -1, i < w - 1 ? k + 1 : -1, j > 0 ? k - w : -1, j < h - 1 ? k + w : -1]) if (q >= 0 && !f[q] && !lab[q]) { lab[q] = id; st.push(q); } }
    if (edge || px.length >= HOLE_MIN) { if (!edge) for (const k of px) keep[k] = 1; }
    else for (const k of px) f[k] = 1;
  }
  // 3. the fill: smoothed and anti-aliased; the line: the smoothed shape grown ~5 px, not inside the kept openings
  const sf = blurBox(f, w, h, 2), gr = blurBox(f, w, h, 7);
  const o = x.createImageData(w, h), od = o.data, F = [20, 44, 99], P = [242, 233, 207];
  for (let k = 0; k < N; k++) {
    const a = sstep(0.3, 0.7, sf[k]), l = keep[k] ? 0 : sstep(0.03, 0.11, gr[k]), A = a + l * (1 - a); if (A <= 0) continue;
    const q = k * 4, wl = l * (1 - a) / A, wa = a / A;
    od[q] = F[0] * wa + P[0] * wl; od[q + 1] = F[1] * wa + P[1] * wl; od[q + 2] = F[2] * wa + P[2] * wl; od[q + 3] = Math.round(255 * A);
  }
  x.clearRect(0, 0, w, h); x.putImageData(o, 0, 0);
  return SIL[n] = cv;
}
// the stool's own outline, cream, nothing filled: laid over his shadow, so the stool he sits on is seen to be the very
// stool that stands there empty (a flat shadow alone swallows it: seat, legs and ring all go into one dark shape)
const LINE = {};
function outlineOnly(n) {
  if (LINE[n]) return LINE[n];
  const s = silhouette(n), cv = document.createElement('canvas'); cv.width = s.width; cv.height = s.height;
  const x = cv.getContext('2d'); x.drawImage(s, 0, 0); const d = x.getImageData(0, 0, cv.width, cv.height);
  for (let k = 0; k < d.data.length; k += 4) d.data[k + 3] = Math.round(d.data[k + 3] * Math.min(1, Math.max(0, (d.data[k] - 20) / (242 - 20))));   // r10: the cream only, its soft edge kept (navy -> clear by how cream the pixel is)
  x.putImageData(d, 0, 0); return LINE[n] = cv;
}
function shadow(c, n) {
  stoolCard(c, n, SX, GROUND, PPM, silhouette(n));
  if (card('mf_gone') === 'mf_gone' && n.startsWith('mf')) { c.save(); c.globalAlpha *= 0.7; stoolCard(c, 'mf_gone', SX, GROUND, PPM, outlineOnly('mf_gone')); c.restore(); }
}
// the one camera: zoom z about the world point (cx, cy), which is put at the frame's centre
const seg = (a, b, u) => ({ z: mix(a.z, b.z, u), cx: mix(a.cx, b.cx, u), cy: mix(a.cy, b.cy, u) });
export function cam(kb) {
  const A0 = { z: 1.16, cx: 1010, cy: 520 }, A1 = { z: 1.18, cx: 960, cy: 517 }, B = { z: 1.18, cx: 975, cy: 517 }, C = { z: 1.2, cx: 985, cy: 512 }, D = { z: 1.2, cx: 980, cy: 512 };
  // her hands and the sheet, from the waist up (r9: th_p holds the sheet further out; the two of them in the middle of the
  // frame, the stool's seat out of it)
  if (kb >= 423.5 && kb < 426.5) return { z: mix(2.3, 2.38, (kb - 423.5) / 3), cx: HERX - 0.19 * PPM, cy: 306 };   // v8: cy 306 - her bow whole to the push's end
  if (kb < 428.5) return seg(A0, A1, smooth((kb - 420.5) / 8));         // her, then across to the stool
  if (kb < 432) return seg(A1, B, smooth((kb - 428.5) / 3.5));
  if (kb < 436) return seg(B, C, smooth((kb - 432) / 4));
  if (kb < 440.5) return seg(C, D, clamp((kb - 436) / 4.5));
  // 440.5: cut nearer, the two of them from the thighs up; her bow and his shadow
  if (kb < 452) { const M0 = { z: 2.0, cx: 965, cy: 330 }, M1 = { z: 2.06, cx: 885, cy: 334 }; return seg(M0, M1, smooth((kb - 440.5) / 4)); }   // across from her bow to his shadow
  // the second: on the two of them, nearer by the day
  // r10 (C4): the redrawn th_kneel holds the sheet high over her head (its top 232 px up the world, was much lower): J is
  // less near and lower-left (1.45 / 820 / 546 -> 1.25 / 744 / 560) so the sheet stays whole, clear of the top edge and
  // well right of the third アリガトウ's row of squares (top left), her boots clear of the right edge
  const E = { z: 1.3, cx: 905, cy: 501 }, F = { z: 1.32, cx: 895, cy: 499 }, G = { z: 1.25, cx: 920, cy: 520 }, J = { z: 1.25, cx: 744, cy: 560 };
  const E2 = { z: 1.31, cx: 900, cy: 500 };                            // slowly on the two of them
  if (kb < 456.5) return seg(E, { z: 1.305, cx: 903, cy: 500.5 }, clamp((kb - 452) / 4.5));
  if (kb < 460.5) return seg({ z: 1.305, cx: 903, cy: 500.5 }, E2, smooth((kb - 456.5) / 4));
  if (kb < 468) return seg(E2, F, clamp((kb - 460.5) / 7.5));
  // the third: the stool is empty, we step back from it; on her deepest bow we go in
  if (kb < 469) return seg(F, G, smooth(kb - 468));
  // the third: on her knees, the sheet held up; in close on her, and a little closer on 470.5
  const v = seg(G, J, smooth((kb - 469) / 1.5)), pr = kb >= 470.5 ? out3((kb - 470.5) / 0.35) : 0;
  return { z: v.z + 0.05 * pr, cx: v.cx - 20 * pr, cy: v.cy };
}
// the scene. o.he: his drawing, or null (the stool empty). o.ghost: 1 he is only remembered (the shadow), 0 he is there;
// between, he is printed in from the top down. o.print: 0..1 how much of the shadow has come up from the seat.
// o.she: her drawing. o.on: 在席. o.day: the day's text. o.dayHit: its scale. o.flip: 0..1 the label turning.
// o.mark: 0..1 the frame round stool 08. o.cam: a camera other than cam(kb).
export function scene(c, kb, T, o) {
  const v = o.cam ?? cam(kb);
  c.fillStyle = K.blue; c.fillRect(0, 0, W, H);
  c.save(); c.translate(W / 2, H / 2); c.scale(v.z, v.z); c.translate(-v.cx, -v.cy);
  c.save(); c.globalAlpha = 0.09; c.strokeStyle = K.paper; c.lineWidth = 1 / v.z; c.beginPath();
  for (let x = -40; x <= W + 40; x += 40) { c.moveTo(x + 0.5, -40); c.lineTo(x + 0.5, H + 40); }
  for (let y = -40; y <= H + 40; y += 40) { c.moveTo(-40, y + 0.5); c.lineTo(W + 40, y + 0.5); }
  c.stroke(); c.restore();
  // v8: where the floor line would run through the DAY (no plate behind it any more), it starts right of the DAY
  { const gys = H / 2 + (GROUND - v.cy) * v.z, thru = o.dayN != null && !NOLABEL && gys > H - 72 - 120 && gys < H - 50, x0 = thru ? v.cx + (372 - W / 2) / v.z : -40;
    c.fillStyle = K.paper; c.fillRect(x0, GROUND, W + 80 - (x0 + 40), 4); }
  // stool 08, and him: every row of pixels shows the stool once
  const gone = card('mf_gone');
  if (!o.he) { if (!o.noStool) stoolCard(c, gone, SX, GROUND, PPM); }
  else {
    const g = o.ghost ?? 0, h = hM('mf') * PPM, top = GROUND - h - 10, bot = GROUND + 10, yS = mix(top, bot, 1 - g);
    if (g < 1) { c.save(); c.beginPath(); c.rect(-40, -40, W + 80, yS + 40); c.clip(); stoolCard(c, o.he, SX, GROUND, PPM); c.restore(); }
    if (g > 0) {
      // below yS: the shadow, a whole shape (he and the stool he sits on); above the line it has come up to, the empty stool
      const p = o.print ?? 1, yP = Math.max(yS, mix(bot, top, p));
      if (yP > yS) { c.save(); c.beginPath(); c.rect(-40, yS, W + 80, yP - yS); c.clip(); stoolCard(c, gone, SX, GROUND, PPM); c.restore(); }
      c.save(); c.beginPath(); c.rect(-40, yP, W + 80, H + 40 - yP); c.clip();
      shadow(c, o.he); c.restore();
      if (p < 1) { c.fillStyle = K.paper; c.fillRect(SX - 0.45 * PPM, yP - 2, 0.9 * PPM, 4); }
    }
    if (g > 0.01 && g < 0.99) { c.fillStyle = K.yellow; c.fillRect(SX - 0.5 * PPM, yS - 4, PPM, 8); }
  }
  // the label under it, as the roll has it: the number, the day, and whether he is there
  const ly = GROUND + 56, labelOn = !(o.noLabel ?? NOLABEL) && H / 2 + (ly + 4 - v.cy) * v.z <= H - 50;
  if (labelOn) {
    text(c, '08', SX - 0.5 * PPM, ly, 40, { color: o.on ? K.yellow : K.paper });
    if (o.day) { const kd = o.dayHit ?? 1; c.save(); c.translate(SX - 10, ly - 14); c.scale(kd, kd); text(c, o.day, 0, 16, 44, { font: 'Shoulders', weight: 700, color: o.dayColor ?? K.paper, track: 2, align: 'center' }); c.restore(); }
    c.save(); c.translate(SX + 0.5 * PPM, ly - 14); c.scale(1, o.flip != null ? o.flip : 1);
    text(c, o.on ? '在席' : '空席', 0, 15, 40, { font: o.on ? 'Gothic X' : 'Gothic', color: o.on ? K.yellow : K.paper, align: 'right' });
    c.restore();
  }
  const gy = H / 2 + (GROUND - v.cy) * v.z; let merged = false;
  // v8b: the label (08 and whether he is there) is always under the stool itself, centred on it, just below the floor
  // line; never folded into the DAY mark. Where there is no room under the floor line in the frame, it is not drawn.
  if (o.tag && !NOLABEL && gy + 50 <= H - 50) {
    c.restore(); c.save();
    const sxs = W / 2 + (SX - v.cx) * v.z, ty = gy + 50, tx = sxs - 88;
    text(c, '08', tx, ty, 40, { color: o.on ? K.yellow : K.paper });
    c.save(); c.translate(tx + 64, ty - 15); c.scale(1, o.flip != null ? o.flip : 1); text(c, o.on ? '在席' : '空席', 0, 15, 44, { font: o.on ? 'Gothic X' : 'Gothic', color: o.on ? K.yellow : K.paper }); c.restore();
    c.restore(); c.save(); c.translate(W / 2, H / 2); c.scale(v.z, v.z); c.translate(-v.cx, -v.cy);
  }
  if (o.mark > 0) {
    const x0 = SX - 0.56 * PPM, y0 = GROUND - 1.6 * PPM, x1 = SX + 0.56 * PPM, y1 = GROUND, per = 2 * (x1 - x0 + y1 - y0), len = per * clamp(o.mark);
    c.save(); c.strokeStyle = K.yellow; c.lineWidth = 5; c.setLineDash([len, per]); c.beginPath(); c.moveTo(x0, y1); c.lineTo(x0, y0); c.lineTo(x1, y0); c.lineTo(x1, y1); c.closePath(); c.stroke(); c.restore();
  }
  if (o.she) { c.fillStyle = K.paper; c.beginPath(); c.ellipse(HERX - 0.12 * PPM, GROUND + 2, 0.5 * PPM, 0.035 * PPM, 0, 0, 7); c.fill(); her(c, o.she, HERX, GROUND, PPM); }
  if (o.world) o.world(c);                                           // anything else in the world, under the same camera
  c.restore();
  if (o.dayN != null && !NOLABEL) { const kd = o.dayHit ?? 1; c.save(); c.translate(72, H - 72); c.scale(kd, kd); dayMark(c, o.dayN, { x: 0, y: 0, edge: K.blue,   /* v8: no gap - the plate of ground behind the figures read as a solid block */ label: merged ? (o.dayLabel ?? 'DAY') + '  08 ' + (o.on ? '在席' : '空席') : o.dayLabel, labelColor: merged && o.on ? K.yellow : undefined, color: o.dayColor }); c.restore(); }
  return v;
}
