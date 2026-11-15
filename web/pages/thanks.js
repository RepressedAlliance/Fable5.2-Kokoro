// アリガトウ, three times (206.8 - 227.4 s; the fourth is finale.js), each heavier than the one before.
//   R1  before the stool (stool.js), as say.js left it: the shadow of the man who sat there; she bows (upright, then
//       bowed; a tear falls from her to the floor). Nearer: her bow and his shadow. Then the day he made her, close: his
//       two hands setting the bow on her head.                                              この世に私を生んでくれて
//   R2  before the stool again. She steps forward and holds the sheet out to him; time runs back to his last day, he is
//       printed in (one age, 65: the old man of 78 belongs to ages.js), 在席; behind her photographs of their days fall in.
//       She straightens; on the bar line he is gone.                                                       一緒に過ごせた日々を
//   R3  she kneels to the empty stool and holds the sheet up over her head; we go in close. Then the sheet itself, the
//       last he drew (know.js W4, with her drawn on it in his hand): the socket, near, filled; the field, near, 成功
//       stamped into it; the whole sheet, its line beating. Her face, smiling, singing.     あなたが私にくれた全て
// Beats: 20.016 + k * 0.42858 s (measured). Each アリガトウ starts on a bar line (436, 452, 468).
import { W, H, K, clamp, mix, smooth, out3, out5, hit, img, pic, fig, lyrics, line, row, column, text, grid, stamp, press, shake, dayMark, echoTimes, stampOf, ariReps, ARI_T } from './kit.js';
import { drawReport } from './report.js';
import { prepareStool, load, card, scene, cam, kt, kbOf, PB, SX, GROUND, PPM, HERX, V2 } from './stool.js';
export const name = 'thanks';
export const start = kt(436);
export const duration = kt(484) - start;
const F2 = 2 / 24 / PB;
const pick = (A, kb) => { let n = A[0][1]; for (const [k, v] of A) if (kb >= k - 1e-6) n = v; return n; };
// her before the stool: the first, a bow (upright on the bar line, bowed on the next beat); the second, on ア she steps
// forward and holds the sheet out to him (th_step) and stays so; before the third she straightens once (th0); the third,
// on her knees, the sheet held up over her head. No drawing comes back straight after it has gone.
const SHE = [[436, 'th0'], [438, 'th_1'],   /* r8 (R2): from say's th_step she straightens on the bar line and holds it two beats (アリガトウ), then bows; the tear leaves her on 438.5 */ [452, 'th_step'], [466, 'th0'], [469, 'th_kneel']];
// the second: his shadow takes on its colours as ONE man and he stays so; his days are not run through again (only
// ages.js shows him growing old). r8: at 65 (mf_65, DAY 016425) - each drawing of him is the subject of one scene only, and
// mf_78 is ages.js's. The day runs back to that day and holds; gone on the bar line (the stool empty: 021170)
const DAY_HE = 16425;
const HE = [[452, 'mf_65'], [468, null]];
const DAY = [[456.5, DAY_HE], [468, 21170], [469, 182621]];
// the days they had, as three photographs falling in behind her, one each two beats, landing on the beat and staying:
// r8: none of the wonder interlude's pictures (each drawing is the subject of one scene only): jf_2 (the cup with the
// flower in it), and two close drawings asked of the art (jdc_1, jdc_2: work/qc/build_p10.md); a photograph whose drawing
// is not there yet is left out. [card, landing beat, centre x, centre y, width, tilt]
// r9: one column, one width for the two landscape drawings (jdc, 1447 x 1024) and the portrait one (jf_2, 787 x 911) a
// little narrower so that all three read as one set; 40 px between them, 76 px clear of the frame's right edge
let PHOTO = [['jf_2', 461, 1690, 232, 200, -0.04], ['jdc_1', 463, 1690, 500, 290, 0.03], ['jdc_2', 465, 1690, 762, 290, -0.025]];
const BOW = [[444.5, 'bx_0'], [448, 'bx_1'], [450, 'bx_o']];   // r8 (R2): bx_01 (1.5 beats) left out; the bow is set on 生 (448)
// the squares: weak to strong - teal, cream, then yellow and largest
const TILE = [[K.teal, K.white], [K.white, K.navy], [K.yellow, K.navy]];
let AR = [], WHY = [], REP = [];
export async function prepare() {
  const all = await lyrics();
  await prepareStool();
  await load(['bx_0', 'bx_1', 'bx_o', 'en_s2']);
  const have = [];
  for (const p of PHOTO) { try { await img(p[0]); have.push(p); } catch (e) { /* not drawn yet */ } }
  PHOTO = have;
  AR = all.filter(l => l.text.replace(/[\s　]/g, '').startsWith('アリガトウ')).map(l => l.chars.filter(ch => ch.c.trim() && ch.c !== '　'));
  WHY = [line('この世に私を生んでくれて'), line('一緒に過ごせた日々を'), line('あなたが私にくれた全て')];
  // v12b: each アリガトウ is sung twice (the printed lyrics write it twice); the second time, measured on the vocal stem,
  // about six beats after the first: the word is typed again in its squares exactly then, a square a syllable
  REP = [0, 1, 2].map(r => ariReps(AR[r], ARI_T[r].slice(1)));      // v12c: the 2nd - 4th times, as tapped
}

// アリガトウ, a square a syllable. The first two: a column down the right, going off to the right when the next line
// begins. The third, the heaviest: largest, yellow, a row across the top.
// (v12) No dots for the held note: while she holds it the word is typed again in the same squares, a syllable a
// sixteenth, every two beats (kit.js echoTimes): each square knocks, shows its colours the other way round for a moment,
// and a ring of its colour goes out from it.
function arigatou(c, T, r, kOut, o = {}) {
  const [bg, fg] = TILE[r], gone = kOut ? out3((T - kt(kOut)) / 0.25) : 0;
  if (gone >= 1) return;
  const Sz = r === 2 ? 180 : 146, G = 12, fs = r === 2 ? 138 : 112, W5 = AR[r].slice(0, 5);
  W5.forEach((ch, n) => {
    const st = stampOf(W5, n, REP[r], T); if (!st) return;
    const a = st.age, k = st.rep ? 1 + 0.2 * Math.exp(-a * 12) : hit(a, 0.3, 14), inv = st.rep && a < 0.14;
    const cm = r < 2 || o.x != null, x = cm ? (o.x ?? 1730) + 320 * gone : 70 + n * (Sz + G) + Sz / 2, y = cm ? (o.y0 ?? 96) + n * (Sz + G) + Sz / 2 : 70 + Sz / 2;
    c.save(); c.translate(x, y);
    if (st.rep && a < 0.45) { const u = a / 0.45, s = 1 + 0.45 * out3(u); c.globalAlpha = 1 - u; c.strokeStyle = bg; c.lineWidth = 7; c.strokeRect(-Sz * s / 2, -Sz * s / 2, Sz * s, Sz * s); c.globalAlpha = 1; }
    c.scale(k, k);
    c.fillStyle = K.navy; c.fillRect(-Sz / 2 + 8, -Sz / 2 + 10, Sz, Sz); c.fillStyle = inv ? fg : bg; c.fillRect(-Sz / 2, -Sz / 2, Sz, Sz);
    text(c, ch.c, 0, fs * 0.06, fs, { font: 'Dela', color: inv ? bg : fg, align: 'center', base: 'middle' });
    c.restore();
  });
}

// r10d: the code-drawn tear (a drop and a dashed fall from her face to the floor, 438.5) is gone - her tear is the one
// drawn in th_1

// a photograph as the wonder interlude has them: a white border, a navy shadow under it; the card whole, never enlarged.
// It drops in from above the frame and lands on its beat (a small knock), then stays where it is. Gone with him (468)
function photos(c, T, kb) {
  for (const [n, k, x, y, w, rot] of PHOTO) {
    const a = T - kt(k), fall = 0.22; if (a < -fall) continue;
    const im = pic(n), ww = Math.min(w, im.width), h = ww * im.height / im.width, b = Math.max(8, ww * 0.03);
    const u = clamp((a + fall) / fall), yy = a < 0 ? mix(-h - 80, y, u * u) : y, kz = a < 0 ? 1 : hit(a, 0.06, 18), r = a < 0 ? rot + 0.25 * (1 - u) : rot;
    c.save(); c.translate(x, yy); c.rotate(r); c.scale(kz, kz);
    c.fillStyle = K.navy; c.fillRect(-ww / 2 - b + 14, -h / 2 - b + 18, ww + 2 * b, h + 2 * b);
    c.fillStyle = K.white; c.fillRect(-ww / 2 - b, -h / 2 - b, ww + 2 * b, h + 2 * b);
    c.fillStyle = K.blue; c.fillRect(-ww / 2, -h / 2, ww, h);           // the cards are drawn on the blueprint blue (their own ground)
    c.drawImage(im, -ww / 2, -h / 2, ww, h); c.restore();
  }
}

// ---------------------------------------------------------------- before the stool
function stoolPart(c, T, kb) {
  const r = kb < 452 ? 0 : kb < 468 ? 1 : 2;
  if (r === 0) {
    // he is only remembered: the label stays 空席, the day is today's
    // v8: the DAY is not drawn in the near shot from 440.5 (his shadow fills the lower left there; the corner mark may not
    // lie over a figure, and the day is the same 182621 just seen)
    // r9: say.js ends with the frame round stool 08 drawn; it is wound back in over the first beat (not gone on the cut)
    const v = scene(c, kb, T, { she: pick(SHE, kb), he: 'mf0', ghost: 1, on: false, dayN: kb >= 440.5 ? null : 182621, noLabel: true, tag: true, mark: kb < 437 ? 1 - out3(kb - 436) : 0 });
    if (kb < 444.5) arigatou(c, T, 0);   // v12c: kept to the cut (the 4th time runs up to it)   // v12: kept while she holds the note (to 444.5, where the bow comes in), typed again   // r10d: no tear drawn by code (the user: no cheap code effects) - her tear is th_1's own
    return;
  }
  // from this アリガトウ on the shadow takes on its colours, from the top down, over the bar; the day runs back (◀◀) and
  // he is 在席 only once it is below 021170
  const he = pick(HE, kb), sol = clamp((kb - 452) / 4.5), back = out3(sol);
  let dayN, lab, dh = 1;
  if (kb < 456.5) { dayN = Math.round(mix(182621, DAY_HE, back)); lab = sol > 0 ? '◀◀' : undefined; }
  else { const d = DAY.reduce((p, q) => kb >= q[0] - 1e-6 ? q : p, DAY[0]); dayN = d[1]; dh = d[0] === 456.5 ? 1 : hit(T - kt(d[0]), 0.1, 14) || 1; }
  const tOn = kt(456.5), kf = kb >= 468 ? kt(468) : tOn, fl = clamp((T - kf + 0.06) / 0.12);
  const on = kb >= 468 ? fl < 0.5 : T >= tOn - 0.06 && fl >= 0.5;
  scene(c, kb, T, { she: pick(SHE, kb), he, ghost: 1 - sol, on, flip: T >= tOn - 0.06 ? Math.abs(Math.cos(fl * Math.PI)) : 1, dayN, dayLabel: lab, dayHit: dh, noLabel: true, tag: true });
  if (r === 1) {
    photos(c, T, kb);
    // one day after another, read from the right
    column(c, WHY[1].slice(0, 7), T, 300, 120, 104, { font: 'Mincho X', color: K.paper, shadow: K.navy, sd: 7, lead: 1.04, amt: 0.3 });
    column(c, WHY[1].slice(7), T, 160, 120, 104, { font: 'Mincho X', color: K.yellow, shadow: K.navy, sd: 7, lead: 1.04, amt: 0.3 });
    arigatou(c, T, 1, 461.3);
  } else arigatou(c, T, 2);
}

// ---------------------------------------------------------------- R1: the day he made her (open.js O4, nearer: his hands and the bow)
const BWX = 1290, BWB = 1478, BWF = 1.0, BWH = 1798, BWW = 926;
const bwx = px => BWX + (px - BWW / 2) * BWF, bwy = py => BWB - (BWH - py) * BWF;
function bowPart(c, T, kb) {
  c.fillStyle = K.blue; c.fillRect(0, 0, W, H); grid(c, K.paper, 40, 0.09);
  const z = mix(1.0, 1.06, clamp((kb - 444.5) / 7.5));
  c.save(); c.translate(BWX, 500); c.scale(z, z); c.translate(-BWX, -500);
  // where the bow is to sit, marked as on the first day; filled when it is set
  const x0 = bwx(4) - 14, x1 = bwx(921) + 14, y0 = bwy(529) - 14, y1 = bwy(910) + 6, set = kb >= 448;
  if (kb < 450) {
    const fl = set ? Math.exp(-(T - kt(448)) * 7) : 0;
    c.save(); c.strokeStyle = set ? K.yellow : K.paper; c.lineWidth = set ? 5 : 3;
    if (!set) { c.setLineDash([14, 12]); c.lineDashOffset = -Math.floor(kb * 2) * 13; }
    c.strokeRect(x0, y0, x1 - x0, y1 - y0); c.setLineDash([]);
    if (fl > 0.02) { c.lineWidth = 5 + 14 * fl; c.strokeRect(x0, y0, x1 - x0, y1 - y0); }                    // set: the frame flares, yellow
    c.fillStyle = set ? K.yellow : K.paper; for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) c.fillRect(x - 7, y - 7, 14, 14);
    c.restore();
  }
  fig(c, pick(BOW, kb), BWX, BWB, BWH * BWF);
  c.restore();
  // the line it is for; the day (fix7 G2: she was finished on 001460)
  const L = WHY[0];
  row(c, L.slice(0, 4), T, 88, 250, 150, { font: 'Mincho X', color: K.paper, track: 2 });
  row(c, L.slice(4, 6), T, 80, 505, 250, { font: 'Mincho X', color: K.paper, shadow: K.navy, sd: 12, amt: 0.35 });
  row(c, L.slice(6), T, 88, 770, 130, { font: 'Mincho X', color: K.yellow, shadow: K.navy, sd: 8, track: 2 });
  dayMark(c, 1460, { edge: K.blue });
}

// ---------------------------------------------------------------- R3: his last sheet (know.js W4), and what it gets
// THE sheet (report.js, the canon art/canon/prop_report.png -> prop_report_done.png), upright on the navy ground. What
// happens to it: the flat line is drawn in; the socket waits (yellow dashes, a step a half-beat); on あなたが the yellow
// spreads out from its centre and the 心 is set in, then a ring goes out from it on every beat; 成功 is pressed into 結果
// once (k 478), 起動 says OK; from the half-beat after the stamp the line beats, a beat a beat, running along it
function sheetState(T, kb) {
  const ts = T - kt(478), age = T - kt(476), on2 = kb >= 476 && age >= 0, bootK = ts >= 0 ? hit(ts - PB, 0.4, 14) : 0;
  return {
    socket: { wait: kb >= 474 && !on2 ? -Math.floor(kb * 2) * 14 : null, fill: on2 ? out3(age / 0.3) : 0, heart: on2 ? Math.max(0, hit(age - 0.12, 0.35, 12)) : 0,
      rings: on2 ? [0, 1].filter(j => kb >= 476.5 + j).map(j => ((((kb - 476.5) % 2) + 2) % 2 + j) % 2 / 2) : [] },
    trace: kb < 478.5 ? { len: out3((kb - 473) / 0.5) } : { beat: ((kb - 478.5) % 1 + 1) % 1 },
    cursor: ts < 0 ? Math.floor(kb * 2) % 2 === 0 : true,
    boot: bootK > 0 ? 'OK' : null, bootK,
    result: ts > -0.09 ? '成功' : null, resultAge: ts,
  };
}
// the shots, cut on the beats: [from the beat, the sheet's point (units), where it goes on the screen, pixels a unit from, to]
// the whole sheet; the socket, near; 結果 (and 起動 under it), near; the whole sheet again, its line beating
// [5]: its tilt; [6]: the two columns of words (x of the first, read from the right). The whole sheet is 88 % of the
// frame's height (on the first beat, before the words, in the middle; after them left of the middle), a little tilted, with a hard navy shadow (a sheet lying on the desk); the words to
// its right, the two together balanced. In the near shots the words stand on the ground right of the sheet's edge
const SHOT = [[473, [500, 707], [960, 540], 0.672, 0.678, -0.02, 1500], [474, [640, 410], [536, 667], 2.9, 2.96, 0, 1800], [477.5, [600, 1005], [700, 540], 2.2, 2.24, 0, 1800], [479.5, [500, 707], [620, 540], 0.672, 0.686, -0.02, 1500]];
function sheetPart(c, T, kb) {
  let i = 0; while (i < SHOT.length - 1 && kb >= SHOT[i + 1][0]) i++;
  const [k0, [ax, ay], [px, py], z0, z1, rot, lx] = SHOT[i], k1 = i < SHOT.length - 1 ? SHOT[i + 1][0] : 482, ts = T - kt(478);
  const z = mix(z0, z1, i === 2 ? smooth((kb - 478.3) / 1.2) : clamp((kb - k0) / (k1 - k0))), [sx, sy] = shake(ts, 26);
  c.fillStyle = K.blue; c.fillRect(0, 0, W, H); grid(c, K.paper, 40, 0.09);
  c.save(); c.translate(px + sx, py + sy); c.rotate(rot);
  if (rot) { c.fillStyle = K.navy; c.fillRect(-ax * z + 18, -ay * z + 22, 1000 * z, 1414 * z); }   // its shadow, hard-edged
  drawReport(c, -ax * z, -ay * z, 1000 * z, sheetState(T, kb)); c.restore();
  // the line of the song: two columns right of the sheet, read from the right
  const L = WHY[2];
  if (i > 0) {
    column(c, L.slice(0, 4), T, lx, 150, 100, { font: 'Mincho X', color: K.paper, lead: 1.04, amt: 0.3 });
    column(c, L.slice(4, 9), T, lx - 130, 150, 100, { font: 'Mincho X', color: K.yellow, lead: 1.04, amt: 0.3 });
  }  // v12b: the third アリガトウ is sung the second time over this shot: its squares stay, typed again, until the next line
  const kw = kbOf(WHY[2][0].t); if (kb < kw + 1.2) arigatou(c, T, 2, kw + 0.7, { x: 1752, y0: 62 });   // down the free blue band on the right (the sheet's head is under the top row)
}

// ---------------------------------------------------------------- R3: her face, close, smiling, singing 全 / て
function facePart(c, T, kb) {
  c.fillStyle = K.paper; c.fillRect(0, 0, W, H); grid(c, K.navy, 40, 0.07);
  const z = mix(1.0, 1.04, clamp((kb - 482) / 2)) * (hit(T - kt(482), 0.04, 14) || 1) * (kb >= 483.09 ? hit(T - kt(483.09), 0.02, 14) : 1), h = 1250 * z, s = h / 1273, top = 20;
  fig(c, card('en_s2'), 960, top + h, h);   // r8 (R2): one drawing for 全 / て (en_m2 was held 1 beat)
  // the socket in her chest, in the card's own pixels (measured on en_s2 / en_m2: centre 477.4, 1004.2; its rim between
  // radius 40 and 51.5): the rim in navy over the card's brown; round it the yellow dashes of the sheet's waiting
  // socket, stepping a half-beat: the 心 is not in it yet (finale puts it there). Drawn under the card's transform, so
  // they move with it
  c.save(); c.translate(960 - 927 / 2 * s, top); c.scale(s, s);
  c.strokeStyle = K.navy; c.lineWidth = 12; c.beginPath(); c.arc(477.4, 1004.2, 46, 0, 7); c.stroke();
  c.strokeStyle = K.yellow; c.lineWidth = 5 / s; c.setLineDash([12 / s, 9 / s]); c.lineDashOffset = -Math.floor(kb * 2) * 10 / s; c.beginPath(); c.arc(477.4, 1004.2, 46 + 24, 0, 7); c.stroke();
  c.restore();
  const L = WHY[2], o = { font: 'Mincho X', color: K.navy, shadow: K.yellow, sd: 14, amt: 0.35 };
  row(c, L.slice(9, 10), T, 110, 600, 330, o);
  row(c, L.slice(10), T, 1480, 600, 330, o);
}

export function draw(c, t) {
  const T = t + start, kb = kbOf(T);
  if (kb < 444.5 || (kb >= 452 && kb < 473)) stoolPart(c, T, kb);
  else if (kb < 452) bowPart(c, T, kb);
  else if (kb < 482) sheetPart(c, T, kb);
  else facePart(c, T, kb);
}
