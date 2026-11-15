// The roll of the laboratory, as verse 1 drew it (fifteen stools, one man), seen through any window of the frame.
// Used where the film comes back to it: the sheet the interlude ends on, and the quiet chorus (why she was made).
// (verse1.js and ages.js draw their own, as approved; the numbers here are theirs.)
import { K, fig, text, img } from './kit.js';
export const COLS = 5, ROWS = 3, X0 = 160, DX = 286, Y0 = 302, DY = 380, S = 1.1, HIS = [2, 1], PXM = 286 * S / 1.473;
export const HX = X0 + HIS[0] * DX, HY = Y0 + HIS[1] * DY;       // the foot of his stool, 08
let V2 = null;
export async function prepareRoll() {
  for (const n of ['mf0', 'mf_gone', 'tw0', 'tw_off']) await img(n);
  try { V2 = await (await fetch('data/cards/v2.json?' + Date.now())).json(); } catch (e) { V2 = null; }
}
// r9: the stool is the one stool of the film (art/canon/prop_stool.png: seat 0.35 m across, 0.65 m high, four splayed
// legs, one foot ring), drawn in every mf / me card by the same measure (0.000967 m a card pixel). Each card is set by its
// own measure (v2.json): the middle of the stool's two feet (ground) and the floor's height above the card's foot (low).
// When v2.json is not loaded (a page that draws the roll without prepareRoll) the set's own figures stand in.
const SET = { mf: { h: 1.6170, mid: -0.0092, low: 0.0048 }, me: { h: 1.5561, mid: -0.0217, low: 0.0039 } };
const measure = n => {
  // the set a card belongs to: by its list of names (me0w is set me, not 'me0w')
  const g = V2 ? (V2[n.split('_')[0].replace(/\d+$/, '')]?.names?.includes(n) ? V2[n.split('_')[0].replace(/\d+$/, '')] : Object.values(V2).find(v => v.names?.includes(n))) : null, gr = g?.ground?.[n];
  return g ? { h: g.h, mid: gr && gr.length ? gr.reduce((a, b) => a + b, 0) / gr.length : g.ax, low: g.low?.[n] ?? 0 } : SET[n.slice(0, 2)] ?? { h: 1.6170, mid: 0, low: 0 };
};
// him on his stool (or the stool alone, mf_gone / me_gone): the middle of the stool on x, the floor at y, h pixels the
// card's height (h / the card's height in metres = pixels a metre). Every mf and me card puts the stool in the same place.
export const man = (c, n, x, y, h, o) => { const m = measure(n), ppm = h / m.h; fig(c, n, x - m.mid * ppm, y + m.low * ppm, h, o); };
const SMX = 17;                                                  // the stool's middle, right of the middle of its label line (as it always stood)
const manAt = (c, n, sx, sy) => man(c, n, sx + SMX, sy, measure(n).h * PXM);
// (x, y, w, h): the window. (cx, cy): the point of the roll at its centre; z: zoom.
// o.he: his drawing, or null: the stool stands empty.  o.she: her drawing beside it, or null.
// o.mark: a stool number (1..15) with a frame round it;  o.seen: the stools whose label has been read (a Set).
// o.skip: stools (a Set of numbers) the page draws itself: their label stays, the stool is left out.
// o.labels: if given, a Set of the stools whose labels are written (the others' are not yet).
// o.rows: if given, a Set of the rows (0, 1, 2) drawn at all (stool, floor line, label); the others are left out.
// o.whole: [x0, x1] on the screen: a label (number, or 在席/空席) is written only if it is whole between them (never half cut by the frame or a band).
export function roll(c, x, y, w, h, cx, cy, z, o = {}) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = o.ground ?? K.blue; c.fillRect(x, y, w, h);
  c.save(); c.globalAlpha = 0.09; c.strokeStyle = K.paper; c.lineWidth = 1; c.beginPath();
  for (let gx = x - (x % 40); gx <= x + w; gx += 40) { c.moveTo(gx + 0.5, y); c.lineTo(gx + 0.5, y + h); }
  for (let gy = y - (y % 40); gy <= y + h; gy += 40) { c.moveTo(x, gy + 0.5); c.lineTo(x + w, gy + 0.5); }
  c.stroke(); c.restore();
  c.translate(x + w / 2, y + h / 2); c.scale(z, z); c.translate(-cx, -cy);
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
    if (o.rows && !o.rows.has(j)) continue;
    const sx = X0 + i * DX, sy = Y0 + j * DY, n = j * COLS + i + 1, his = i === HIS[0] && j === HIS[1], on = his && !!o.he, seen = o.seen?.has(n), mk = o.mark === n;
    const scr = wx => x + w / 2 + (wx - cx) * z, fits = (a, b) => !o.whole || (scr(a) >= o.whole[0] && scr(b) <= o.whole[1]);
    c.strokeStyle = K.paper; c.globalAlpha = 0.35; c.lineWidth = 1.5; c.beginPath(); c.moveTo(sx - 86, sy + 0.5); c.lineTo(sx + 86, sy + 0.5); c.stroke(); c.globalAlpha = 1;
    const lab = !o.labels || o.labels.has(n);                    // o.labels (a Set): only these stools' labels are written (the roll being read out)
    if (lab && fits(sx - 86, sx - 52)) text(c, String(n).padStart(2, '0'), sx - 84, sy + 34, 24, { color: on || mk ? K.yellow : K.paper, alpha: on || mk ? 1 : 0.6 });
    if (!his && !o.skip?.has(n)) { c.globalAlpha = 0.5; manAt(c, 'mf_gone', sx, sy); c.globalAlpha = 1; }   // by the same measure as his: every stool stands alike over its label
    if (lab && fits(sx + 38, sx + 86)) text(c, on ? '在席' : '空席', sx + 84, sy + 34, 22, { font: on ? 'Gothic X' : 'Gothic', color: on || mk || seen ? K.yellow : K.paper, alpha: on || mk ? 1 : seen ? 0.8 : 0.45, align: 'right' });
    if (mk) { c.strokeStyle = K.yellow; c.lineWidth = 4; c.strokeRect(sx - 100, sy - 240, 200, 290); }   // clear of the labels of the row above
  }
  // where she stands (beside his stool) the floor line goes on under her feet
  if (o.she || o.floor) { c.strokeStyle = K.paper; c.globalAlpha = 0.35; c.lineWidth = 1.5; c.beginPath(); c.moveTo(HX + 86, HY + 0.5); c.lineTo(HX + DX - 86, HY + 0.5); c.stroke(); c.globalAlpha = 1; }
  if (o.he !== false) manAt(c, o.he ?? 'mf_gone', HX, HY);          // false: the stool is in another drawing
  // her, beside his stool: by her card's own measure, the middle of her planted feet on (HX + 186, the floor)
  if (o.she) { const m = measure(o.she); fig(c, o.she, HX + 186 - m.mid * PXM, HY + m.low * PXM, m.h * PXM); }
  c.restore();
}
