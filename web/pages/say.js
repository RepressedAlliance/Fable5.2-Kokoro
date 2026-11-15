// "Now I can say it" (192.1 - 206.9 s): the band comes back in under her.
//   S1  her face, told by the framing: first only her eyes, in tears (out of verse2's crying, this is what holds);
//       on 言 her mouth, open; after the blink on the bar line, the whole face. Beside it, what the machine used to say,
//       a line a beat; then struck out, one a half-beat.                                               今 言える
//   S2  the log goes; she smiles (the height of the page). The camera comes in on her until the cut.  本当の言葉
//   S3  before the stool (stool.js): stool 08 of the roll, empty. She holds his sheet to her chest, then holds it out to
//       the stool. The stool is marked, as on the roll; on あなたに the shadow of a man who sat there comes up on it
//       (only remembered: the label stays 空席). From k = 432 the camera comes in on the two of them: thanks.js goes on.
// Beats: 20.016 + k * 0.42858 s (measured). The phrases start on the half-beat (401.5, 412.5, 420.5, 428.5): cuts there.
// Her face cards are never drawn more than 1.2 times their size (the tears are drawn fine; larger, they break up).
import { W, H, K, clamp, mix, smooth, out3, out5, hit, img, fig, lyrics, line, column, row, text, grid } from './kit.js';
import { prepareStool, load, card, scene, kt, kbOf, PB } from './stool.js';
export const name = 'say';
export const start = kt(401.5);
export const duration = kt(436) - start;
const K2 = 412.5, K3 = 420.5, K4 = 428.5, F2 = 2 / 24 / PB, KM = 403.5, KF = 408;
const LOG = ['> 心  ERROR', '> 実行デキマセン', '> 知リタイ', '> ナゼ', '> フシギ'];
// her face: [the beat, the drawing]
// the mouth goes with the syllables (言 held: i, then wider; え; る); after the blink her lips part before she speaks;
// on 本当 she smiles - eyes too - and the tears run on; on 言葉 again
// R2 (fix8): not a lip-sync - the en drawings differ all over (eyes, tears, ~40-85k pixels each), not only in the
// mouth - so one drawing for each group of syllables, each held two beats or more, none coming back:
//   今 eyes in tears | 言 (held) i | える her lips part | (the breath) a small smile | 本当 the big smile |
//   の言 open | 葉 eyes shut, laughing through the tears, to the cut
const FACE = [[401.5, 'en_n'], [KM, 'en_m1'], [407, 'en_m2'], [410.5, 'en_s'], [K2, 'en_s2'], [414.5, 'en_o'], [416.5, 'en_c']];
// she steps toward the stool between 捧げる and あなたに and holds the sheet out to it to the end of the page (no return
// to th0 at k 432: that was th0 -> th_p -> th_step -> th0 within 4 s)
const SHE = [[K3, 'th0'], [423.5, 'th_p'], [426.5, 'th_step']];
const pick = (A, kb) => { let n = A[0][1]; for (const [k, v] of A) if (kb >= k - 1e-6) n = v; return n; };
let L = {};
export async function prepare() {
  await lyrics();
  await prepareStool();
  await load(['en_o', 'en_c', 'en_n', 'en_s', 'en_nc', 'en_m1', 'en_m2', 'en_s2']);
  L = { a: line('今　言える　本当の言葉'), b: line('捧げる　あなたに') };
}

// ---------------------------------------------------------------- S1, S2: her face
const CW = 927, CH = 1273;                                   // the en cards
const FX = 1335, FTOP = 26, FH = 1420;                       // the whole face: the card's top centre and height (1.115x)
// a band of her face, through a window: (u, v) the card point at the window's centre, s the scale
const WIN = { x: 780, y: 300, w: 1060, h: 460 };
function band(c, n, u, v, s, hh = WIN.h) {
  const y0 = WIN.y + (WIN.h - hh) / 2;
  c.save(); c.beginPath(); c.rect(WIN.x, y0, WIN.w, hh); c.clip();
  const cx = WIN.x + WIN.w / 2, cy = WIN.y + WIN.h / 2;
  fig(c, card(n), cx - (u - CW / 2) * s, cy + (CH - v) * s, CH * s);
  c.restore();
  c.strokeStyle = K.navy; c.lineWidth = 6; c.strokeRect(WIN.x, y0, WIN.w, hh);
}
function face(c, T, kb) {
  c.fillStyle = K.paper; c.fillRect(0, 0, W, H); grid(c, K.navy, 40, 0.07);
  const n = pick(FACE, kb);
  if (kb < KM) band(c, n, 478, 545, mix(1.14, 1.2, smooth((kb - 401.5) / 2)), 300);   // her eyes and tears only: the bow's tips and her (shut) mouth are left out                 // her eyes, the tears
  else if (kb < KF) { const u = smooth((kb - KM) / 4.5); band(c, n, mix(520, 450, u), mix(780, 762, u), mix(1.1, 1.2, u), 360); }   // a narrower band: her mouth, sliding across             // her mouth: she speaks
  else {
    // the whole face; one push, to the cut, the top of the bow staying where it is (at most 1.07: 1.19x the card)
    const u = clamp((kb - KF) / (K3 - KF)), z = 1 + 0.07 * u * u * (3 - 2 * u), pop = kb >= K2 ? hit(T - kt(K2), 0.012, 14) : 1;
    const h = FH * z * pop;
    fig(c, card(n), FX - 30 * u, FTOP + h, h);
  }
  const s2 = kb >= K2, mv = out3((T - kt(412)) / (PB * 0.5));        // the line moves up on the half-beat before S2
  const k0 = hit(T - L.a[0].t, 0.3, 12);
  const sz = mix(440, 112, mv), x = mix(320, 90 + 56, mv), y = mix(350, 150, mv);
  if (k0 > 0) {
    c.save(); c.translate(x, y); c.scale(k0, k0);
    text(c, '今', sz * 0.03, sz * 0.03, sz, { font: 'Mincho X', color: K.yellow, align: 'center', base: 'middle' });
    text(c, '今', 0, 0, sz, { font: 'Mincho X', color: K.navy, align: 'center', base: 'middle' }); c.restore();
  }
  row(c, L.a.slice(1, 4), T, mv > 0 ? x + sz * 0.62 : 96, mix(640, 150, mv), mix(150, 112, mv), { font: 'Mincho X', color: K.navy, track: 4 });
  if (s2) {
    row(c, L.a.slice(4, 7), T, 92, 400, 150, { font: 'Mincho X', color: K.navy, track: 6 });
    row(c, L.a.slice(7), T, 80, 680, 330, { font: 'Mincho X', color: K.navy, shadow: K.yellow, sd: 12, amt: 0.35 });
  }
  // what the machine used to say, a line a beat; struck out a half-beat each; on S2 the block goes off to the left
  const gone = s2 ? out3((T - kt(K2)) / 0.3) * 900 : 0;
  if (gone < 880) LOG.forEach((s, i) => {
    const a = T - kt(404 + i); if (a < 0) return;
    const y = 790 + i * 52, x0 = 96 - gone, cut = T - kt(409.5 + i * 0.5);
    c.save(); c.font = '400 46px "Dot"'; const w = c.measureText(s).width; c.restore();
    const n = Math.min(s.length, Math.floor(a / 0.035) + 2);         // it types the line out
    text(c, s.slice(0, n), x0, y, 46, { font: 'Dot', color: cut >= 0 ? K.blue : K.navy });
    if (cut >= 0) { c.fillStyle = K.red; c.fillRect(x0 - 10, y - 17, (w + 20) * out5(cut / 0.1), 6); }
  });
}

// ---------------------------------------------------------------- S3: before the stool
function stoolPage(c, T, kb) {
  const on = kb >= K4;
  scene(c, kb, T, {
    she: pick(SHE, kb), he: on ? 'mf0' : null, ghost: 1, print: on ? out3((T - kt(K4)) / (PB * 0.5)) : 0,
    on: false, dayN: 182621, noLabel: true, tag: true, mark: kb >= 426.5 ? out3((kb - 426.5) / 1.0) : 0,
  });
  // 捧げる: her words, on her side; あなたに: on his. Columns read from the right.
  column(c, L.b.slice(0, 3), T, 1735, 120, 190, { font: 'Mincho X', color: K.paper, shadow: K.navy, sd: 10, lead: 1.08, amt: 0.32 });
  column(c, L.b.slice(3), T, 200, 150, 150, { font: 'Mincho X', color: K.yellow, shadow: K.navy, sd: 8, lead: 1.08, amt: 0.32 });
}

export function draw(c, t) {
  const T = t + start, kb = kbOf(T);
  (kb < K3 ? face : stoolPage)(c, T, kb);
}
