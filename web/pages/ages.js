// "Hundreds of years" (62.66 - 74.87 s): the roll of the laboratory again, the sheet verse 1 opened on.
//   P1  He grows old on stool 08; she stands beside him with the tea, as on every day. Three ages, two beats each (R2):
//       the boy (to 004502), at 45 (009125), at 78 (to 021169).
//                                                                                                  幾百年が過
//   P2  (cut on k = 105.5: 研究員 0 / 15) The stool is empty and she is right beside it. Every day she does the same
//       things for it - holds the tea out to it, lowers the tray, sweeps round its feet, sings to it (each once, two
//       beats or more) - and the days go faster and faster on the counter while the view goes in.
//                                                                                                  ぎ 独りで残された
//   P3  nearer: she sets the tray down on his stool, and stands.                                    奇跡のロボットは願う
//   The band on the right is the page's title, as 孤独 was: 幾百年 -> 独り -> 願う.
// Every figure is a whole drawing with what it touches drawn in it (his stool; her tray); every stool on the sheet is his
// stool (the drawing mf_gone). Her drawings stand by their own measure (v2.json): the planted feet on one spot.
// Beats: 20.016 + k * 0.42858 s (work/beat_probe2.py).
import { W, H, K, clamp, mix, smooth, out3, hit, img, fig, lyrics, line, text, dayMark } from './kit.js';
import { roll, prepareRoll, HX, HY, PXM as RPXM } from './roll.js';
export const name = 'ages';
const T0B = 20.016, PB = 0.42858, kt = k => T0B + k * PB, kbOf = T => (T - T0B) / PB;
export const start = kt(99.5);
export const duration = kt(128) - start;
const KGONE = 105.5, KP3 = 115.5, Z3 = 500 / RPXM;                       // the stool is empty; the nearer staging (pixels a metre)
// r8 (R2): the only place he grows old, so each age is held two beats, long enough to be seen: the boy, at 45, at 78
const AGE = [[0, 'mf0'], [101.5, 'mf_45'], [103.5, 'mf_78'], [KGONE, null]];
// the day on the counter: each age arrives on its own day and counts on inside its years; then the empty stool's days
const DAYS = [[99.5, 1501], [101.5 - 1e-4, 4502], [101.5, 9125], [103.5 - 1e-4, 12770], [103.5, 18800], [105, 21169], [KGONE - 1e-4, 21169]];   // his last day holds for the half beat before the stool is empty
const SHE1 = [[0, 'tw0'], [103.5, 'wm_off']];                     // r9: wm_off comes with the old man (103.5) and is held on past the cut to 107.5: beside him: the tray; to the old man she holds it out (a14: one tray, a pot, two cups)
// P2: what she does for the empty stool, each thing once, each held two beats or more (only the DAY speeds up):
// the tray still held out (from 104.5) -> lowered on 独 -> the broom on で -> singing on さ -> the nearer staging (ts0)
const SHE2 = [[KGONE, 'wm_off'], [107.5, 'wm_low'], [109.5, 'wm_broom'], [112.5, 'wm_sing']];
let SHE3 = [[0, 'ts0'], [120, 'ts_put'], [124, 'ts_up']];         // nearer (set ts: the stool and the tray are in the drawing); with ts_look (when drawn): she straightens, then looks down at the empty stool on 願
// r9: the ts cards (1293 x 2141) are set by their own measure (v2.json): the stool's middle is the mean of its two feet
// (ground[0..1], 0.309 m left of the card's middle), her planted feet ground[2] (0.30 m right of it); one stool for every
// ts card, so the stool never moves when the drawing changes. The pot on the stool, in card pixels (its lid's top).
const POT = { ts_up: [284, 1112], ts_look: [283, 1125] };
const STOOL = 17;                                                   // stool 08's middle, right of HX (roll pixels: roll.js SMX)
let TSM = -0.3087, FEET = 0.607;                                    // the ts stool's middle from the card's middle; her feet from the stool's middle (m) - from v2.json in prepare()
const NOLAB = new Set(), ROW1 = new Set([1]), NEAR = new Set([7, 9]), DXR = 286;                            // the stools beside his in the push; the roll's stool pitch
const pick = (A, kb) => { let n = A[0][1]; for (const [k, v] of A) if (kb >= k - 1e-6) n = v; return n; };
let L = {}, V2 = null;
const grp = n => n.split('_')[0].replace(/\d+$/, '');
// her drawing by its own measure: the foot she stands on (the rearmost contact: wm_broom's broom tip is not a foot) on (x, y); ppm pixels a metre
function figM(c, n, x, y, ppm) { const g = V2[grp(n)], gr = g.ground?.[n], mid = gr && gr.length ? Math.max(...gr) : g.ax; fig(c, n, x - mid * ppm, y + (g.low?.[n] ?? 0) * ppm, g.h * ppm); }
// a ts card with its stool's middle on (sx, y = the floor)
function figTS(c, n, sx, y, ppm, o) { const g = V2.ts; fig(c, n, sx - TSM * ppm, y + (g.low?.[n] ?? 0) * ppm, g.h * ppm, o); }
export async function prepare() {
  await lyrics();
  await prepareRoll();
  V2 = await (await fetch('data/cards/v2.json?' + Date.now())).json();
  for (const n of [...AGE, ...SHE1, ...SHE2, ...SHE3]) if (n[1]) await img(n[1]);
  await img('ts_stool');
  { const g = V2.ts.ground, st = g.ts_stool; TSM = (st[0] + st[1]) / 2; FEET = g.ts0[2] - TSM; }
  try { await img('ts_look'); SHE3 = [[0, 'ts0'], [120, 'ts_put'], [122, 'ts_up'], [123.5, 'ts_look']]; } catch (e) { /* not drawn yet */ }
  L = { a: line('幾百年が過ぎ'), b: line('独りで残された'), c: line('奇跡のロボットは願う') };
}
const lerpC = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };

// upright type in a column, each character landing when sung; small kana at 70 %, set in the top right of their square
const SMALL = 'っゃゅょぁぃぅぇぉッャュョァィゥェォ';
function vcol(c, chars, T, x, y0, size, o = {}) {
  c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
  let y = y0 + size / 2;
  for (const ch of chars) {
    const k = hit(T - ch.t, o.amt ?? 0.28, 16), sm = SMALL.includes(ch.c);
    if (k > 0) {
      const s = size * (sm ? 0.7 : 1);
      c.font = `400 ${s}px "${o.font ?? 'Mincho X'}"`;
      c.save(); c.translate(x + (sm ? size * 0.13 : 0), y - (sm ? size * 0.13 : 0)); c.scale(k, k);
      if (o.shadow) { c.fillStyle = o.shadow; c.fillText(ch.c, o.sd ?? 8, o.sd ?? 8); }
      c.fillStyle = o.color ?? K.paper; c.fillText(ch.c, 0, 0); c.restore();
    }
    y += size * (o.lead ?? 1.06);
  }
  c.restore();
}

function band(c, kb, T, gone) {
  const bx = 1470;
  c.fillStyle = K.navy; c.fillRect(bx, 0, W - bx, H);
  c.fillStyle = K.yellow; c.fillRect(bx, 0, 8, H);
  if (kb < 107.4) {
    vcol(c, L.a.slice(0, 3), T, 1722, 64, 250, { lead: 1.0, shadow: K.blue, sd: 9 });
    vcol(c, L.a.slice(3), T, 1540, 110, 84, { lead: 1.12 });
  } else if (kb < KP3 - 0.05) {
    vcol(c, L.b.slice(0, 2), T, 1722, 96, 340, { lead: 1.04, shadow: K.blue, sd: 10 });
    vcol(c, L.b.slice(2), T, 1540, 110, 84, { lead: 1.12 });
  } else if (T < L.c[8].t - 0.05) {
    vcol(c, L.c.slice(0, 3), T, 1800, 110, 84, { lead: 1.12 });
    vcol(c, L.c.slice(3, 7), T, 1640, 110, 150, { font: 'Dela', lead: 1.04, shadow: K.blue, sd: 7 });
    vcol(c, L.c.slice(7, 8), T, 1640, 110 + 4 * 150 * 1.04 + 4, 84, { lead: 1.12 });
  } else {
    vcol(c, L.c.slice(8), T, 1722, 96, 340, { lead: 1.04, color: K.yellow, shadow: K.blue, sd: 10, amt: 0.35 });
  }
  // the roll's count: 研究員 1 / 15, then 0 (all of it 60 px or more inside the frame)
  text(c, '研究員', 1540, 1012, 30, { font: 'Gothic X', color: K.paper });
  const kz = gone ? hit(T - kt(KGONE), 0.35, 12) : 1;
  c.save(); c.translate(1745, 1018); c.scale(kz, kz); text(c, gone ? '0' : '1', 0, 0, 200, { font: 'Shoulders', weight: 800, color: gone ? K.red : K.yellow, align: 'center' }); c.restore();
  text(c, '/15', 1800, 1018, 60, { font: 'Shoulders', weight: 600, color: K.paper });
}
function dayOf(kb) {
  if (kb < KGONE) { let i = 0; while (i < DAYS.length - 2 && kb >= DAYS[i + 1][0]) i++; const [k0, d0] = DAYS[i], [k1, d1] = DAYS[i + 1]; return Math.round(mix(d0, d1, clamp((kb - k0) / (k1 - k0)))); }
  if (kb >= KP3) return 182621;
  return kb < KGONE + 0.5 ? 21170 : Math.round(mix(21170, 182621, Math.pow(clamp((kb - KGONE - 0.5) / (KP3 - KGONE - 0.5)), 1.7)));   // 021170 holds a half beat; then faster and faster
}
// the counter (kit dayMark: no block, the page's ground as its edge); a jump to a new age lands with a knock
function days(c, kb, T, ground) {
  const jump = [101.5, 103.5, KGONE].find(k => kb >= k && kb < k + 0.6), kz = jump ? hit(T - kt(jump), 0.12, 14) : 1;
  c.save(); c.translate(72, H - 72); c.scale(kz, kz); dayMark(c, dayOf(kb), { x: 0, y: 0, edge: ground, color: kb >= KP3 || kb < KGONE ? K.yellow : K.paper }); c.restore();
}
// steam off the pot on his stool: three thin wisps, fading as they rise (no higher than the pot is tall, twice over)
function steam(c, x, y, ppm, t) {
  c.save(); c.strokeStyle = K.paper; c.lineCap = 'butt'; c.lineWidth = Math.max(2, 0.006 * ppm);
  for (let i = 0; i < 3; i++) {
    const ph = t * 1.3 + i * 2.1, x0 = x + (i - 1) * 0.018 * ppm;
    for (let j = 0; j < 24; j++) {   // r9c: 24 short pieces, so a wisp reads as one soft curve (8 read as broken lines)
      const a0 = j / 24, a1 = (j + 1) / 24, h = 0.24 * ppm, yy = q => y - q * h - ((t * 0.6 + i * 0.3) % 1) * 0.03 * ppm, xx = q => x0 + Math.sin(ph + q * 5) * 0.012 * ppm * (0.4 + q);
      c.globalAlpha = 0.75 * (1 - a0) * (1 - a0); c.beginPath(); c.moveTo(xx(a0), yy(a0)); c.lineTo(xx(a1), yy(a1)); c.stroke();
    }
  }
  c.restore();
}
// the nearer staging, as (pixels a metre, the ts card's centre x, its foot y) at beat k; cut to her face on 願 (123.5), back out on 126
// (the row above's labels stand at her head's height: framed so they are always whole in the frame, never cut by its top)
// r9: as (pixels a metre, her planted feet's x, the floor's y); the push before it by the stool's middle and the floor
// r9: the roll's labels under the stools stay above the DAY all through the push and the nearer staging (the floor no lower
// than 805, she whole in the frame, more than half its height); stool 07's label stays whole inside the left edge
const P2S = [500, 560], P2F = [940, 975], P2P = [450, 500];   // r9c: she (and the stool, the tray) 68 - 76 % of the frame's height; stool 07 just out at the left
const p3 = () => [[KP3, Z3 * RPXM, P2S[1] + FEET * Z3 * RPXM, P2F[1]], [120, 530, 900, 985], [123.5, 540, 908, 990]], P3C = [[123.5, 1250, 690, 2280], [126, 1290, 680, 2335]], P3W = [[126, 530, 900, 985], [128, 520, 892, 980]];
const lerpK = (A, kb, ease) => { let i = 0; while (i < A.length - 2 && kb >= A[i + 1][0]) i++; const a = A[i], b = A[i + 1], u = ease(clamp((kb - a[0]) / (b[0] - a[0]))); return [1, 2, 3].map(j => mix(a[j], b[j], u)); };
export function draw(c, t) {
  const T = t + start, kb = kbOf(T), dark = smooth((kb - KGONE) / 5), gone = kb >= KGONE, ground = lerpC(K.blue, '#122a5e', dark);
  if (kb < KGONE) {
    // the roll: the point between them comes towards the middle of the sheet as the view goes in
    const a = smooth((kb - 99.5) / 6), z = mix(2.0, 2.3, a);
    const wx = HX + 100, wy = HY - 0.8 * RPXM, sx = mix(900, 960, a), sy = mix(560, 545, a);   // the two of them, big enough to read (he is 1.47 m seated)
    roll(c, 0, 0, W, H, wx - (sx - W / 2) / z, wy - (sy - H / 2) / z, z, { he: pick(AGE, kb), she: pick(SHE1, kb), ground, rows: ROW1, whole: [24, 1446] });   // r9d: only their own row (no half stool legs of the row above at the top), and only labels that are whole in the frame
  } else {
    // one push from the empty stool and her beside it, all the way in (P2), to the nearer staging (P3) where the drawing
    // with the stool in it takes over on the beat. Stool 08 (its foot A = HX + 26, HY + 5) goes from (700, 820) to (800, 904);
    // its number always clear of the DAY counter.
    // r9: the push is laid out by stool 08's middle (sx) and the floor (fy) on the screen; the ts cards stand on the same
    // stool and floor, so the handover at KP3 changes nothing but her drawing
    const u = smooth(clamp((kb - KGONE) / (KP3 - KGONE)) * 0.85 + clamp((kb - KGONE) / (KP3 - KGONE)) * 0.15), S = V2.ts;
    let ppm, sx, fy;
    if (kb < KP3) { ppm = mix(P2P[0], P2P[1], u); sx = mix(P2S[0], P2S[1], u); fy = mix(P2F[0], P2F[1], u); }
    else { let feet; [ppm, feet, fy] = kb < 123.5 ? lerpK(p3(), kb, smooth) : kb < 126 ? lerpK(P3C, kb, x => x) : lerpK(P3W, kb, smooth); sx = feet - FEET * ppm; }
    const z = ppm / RPXM;
    roll(c, 0, 0, W, H, HX + STOOL - (sx - W / 2) / z, HY - (fy - H / 2) / z, z, { he: false, ground, floor: true, labels: NOLAB, rows: ROW1 });   // r9c: this near, the roll's labels would run into her head (the row above) and under the DAY (her row): none written. r9: 07 and 09 are the roll's own stools again (mf_gone and ts_stool are now the one stool, same size and shape)
    // stool 08 is the ts drawings' stool all through the push (a14: ts_stool), so it does not change drawing when the ts cards take over
    if (kb < KP3) figTS(c, 'ts_stool', sx, fy, ppm);
    if (kb < KP3) figM(c, pick(SHE2, kb), sx + FEET * ppm, fy, ppm);  // her feet FEET m from the stool's middle, as in the ts drawings: within reach of it
    else {
      const n = pick(SHE3, kb); figTS(c, n, sx, fy, ppm);
      const pot = POT[n]; if (kb >= 122 && pot) { const cx = sx - TSM * ppm, by = fy + (S.low[n] ?? 0) * ppm; steam(c, cx + (pot[0] - S.px[0] / 2) * S.mpp * ppm, by - (S.px[1] - pot[1]) * S.mpp * ppm, ppm, T); }   // the pot she has left there
    }
  }
  days(c, kb, T, ground);
  band(c, kb, T, gone);
}
