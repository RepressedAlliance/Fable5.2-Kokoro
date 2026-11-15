// Verse 1 (35.45 - 62.66 s): six pages of the record, one for each thing the song says.
// Beats: 20.016 + k * 0.42858 s (measured). Here the voice comes in half a beat AFTER the bar line: the pages turn ON
// the bar line (k = 44, 52, 68, 76, 84), the first word lands half a beat later with the voice, and whatever else
// happens on a page (the printing head, the stamps, the figures, her eyes) happens on its beats.
//   A  the roll of the laboratory: eighteen stools, one man                 孤独な科学者に
//   B  she is printed onto the sheet, top to bottom; her type and number     作られたロボット
//   C  the inspection: every item passes, and the verdict is stamped         出来栄えを言うなら 奇跡
//   D  the figure that never reaches a hundred                               だけどまだ足りない
//   E  everything she can do, and the one square that is empty               一つだけ出来ない
//   F  into that square: the word, made of his code; it will not run         それは「心」と言う プログラム
import { W, H, BEAT, BAR, K, clamp, mix, smooth, out3, out5, rnd, hit, img, fig, tint, pic, lyrics, line, column, row, text, grid, stamp, press, shake, dayMark } from './kit.js';
import { roll, prepareRoll, HX, HY, PXM } from './roll.js';
export const name = 'verse1';
const T0B = 20.016, PB = 0.42858, kt = k => T0B + k * PB, kbOf = T => (T - T0B) / PB;
export const start = kt(36);
export const duration = kt(99.5) - start;
const CUT = [44, 52, 68, 76, 84].map(kt), F2 = 3 / 24 / PB;
let L = {}, EYES = false, V2 = null;
const grp = n => n.split('_')[0].replace(/\d+$/, '');
// a drawing sized by its own measure (v2.json): the middle of the feet on (x, y), ppm pixels a metre
function figM(c, n, x, y, ppm) { const g = V2[grp(n)], gr = g.ground?.[n], mid = gr && gr.length ? gr.reduce((a, b) => a + b, 0) / gr.length : 0; fig(c, n, x - mid * ppm, y + (g.low?.[n] ?? 0) * ppm, g.h * ppm); }
export async function prepare() {
  await lyrics();
  await prepareRoll();
  V2 = await (await fetch('data/cards/v2.json?' + Date.now())).json();
  for (const n of ['hi0', 'hi_b', 'hi_l', 'hi_d', 'op_o', 'op_c', 'op_h', 'oe_o', 'sv0', 'cb_up', 'cb0', 'cb_down', 'tb_p1', 'tf0', 'me0', 'me0w', 'me0wb', 'fs_1']) await img(n);
  for (const n of ['oe_l', 'oe_d']) { try { await img(n); EYES = true; } catch (e) { EYES = false; } }
  L = { a: line('孤独な科学者に'), b: line('作られたロボット'), c: line('出来栄えを言うなら奇跡'), d: line('だけどまだ足りない'), e: line('一つだけ出来ない'), f: line('それは「心」と言う'), g: line('プログラム') };
  heart();
}

// ---------------------------------------------------------------- A, B
// The roll as it is today (DAY 001460, open has just made her): fifteen stools, one man. Then (B) she is put on it: on
// the bar line she stands beside his stool, looks to him, back at us; on k = 50 her entry is stamped on the roll.
const RZ = 1.45, RPX = HX + 30, RPY = HY - 134;                  // the camera at rest (r9: the stools are 0.65 m now - at 1.45 the row above's seats are just out at the top and the third row's out at the bottom, nothing half-cut)
// r9: it opens on him with the row above's labels whole at the top and his own row's below the frame (clear of the DAY);
// then out to the roll at rest
const CA0 = [RPX - (RPX - W / 2) / 2.5, 474, 2.5], CA1 = [RPX - (RPX - W / 2) / RZ, RPY - (RPY - H / 2) / RZ, RZ];
const camA = T => { const u = out3((T - start) / (8 * PB)), z = 1 / mix(1 / CA0[2], 1 / CA1[2], u); return [mix(CA0[0], CA1[0], u), mix(CA0[1], CA1[1], u), z]; };
const dayPlate = (c, s) => dayMark(c, s, { edge: K.blue });          // the one DAY of the film (kit.js)
// him, while the roll is read: writing; a blink; writing; he looks up (and, when she is there, at her)
// r9b: the me set is redrawn from one master (the stool the same in every card), so he looks up on k 41 again, as the
// reading of the roll ends: three beats looking at us before she is set down beside him
const HE_A = [[36, 'me0w'], [38, 'me0wb'], [38 + F2, 'me0w'], [41, 'me0']];
// the roll's labels are read one by one, a half-beat each, then the count lands
// r9b: the outer columns' labels (01/06/11 at the left edge, 05/10/15 under the band) would only ever be half in the frame: not written
const EDGE = new Set([1, 6, 11, 5, 10, 15]), INNER = new Set(Array.from({ length: 15 }, (_, i) => i + 1).filter(n => !EDGE.has(n)));
const readSeen = kb => new Set(Array.from({ length: clamp(Math.floor((kb - 36.5) * 2) + 1, 0, 15) }, (_, i) => i + 1).filter(n => n !== 8));
// r9: on the page's first frames the band slides in from the right edge and is in place as 孤 lands (0.25 s): no empty band on the cut
function band(c, T = 1e9) { const bx = 1470 + 450 * (1 - out3((T - start) / 0.22)); c.fillStyle = K.navy; c.fillRect(bx, 0, W - bx, H); c.fillStyle = K.yellow; c.fillRect(bx, 0, 8, H); }
function counter(c, label, n) {
  text(c, label, 1560, 1016, 30, { font: 'Gothic X', color: K.paper });
  text(c, String(n), 1730, 1040, 250, { font: 'Shoulders', weight: 800, color: K.yellow, align: 'center' });
  text(c, '/15', 1790, 1020, 64, { font: 'Shoulders', weight: 600, color: K.paper });
}
function pageA(c, T) {
  const [cx, cy, z] = camA(T);
  const kb = kbOf(T);
  const seen = readSeen(kb);                                     // r9: each label is written as it is read (the roll read out; no label slides under the DAY as the view goes out)
  roll(c, 0, 0, W, H, cx, cy, z, { he: pickK(HE_A, kb), seen, labels: new Set([...seen, ...(kb >= 36.5 ? [8] : [])].filter(n => !EDGE.has(n))) });   // 08's own label with the first read, when it is whole in the frame
  band(c, T);
  column(c, L.a.slice(0, 2), T, 1722, 96, 340, { lead: 1.04, color: K.paper, shadow: K.blue, sd: 10 });
  column(c, L.a.slice(2), T, 1518, 110, 76, { lead: 1.12, font: 'Mincho X', color: K.paper });
  const kc = hit(kb - 43.5, 0.3, 10); if (kc > 0) { c.save(); c.translate(1730, 960); c.scale(kc, kc); c.translate(-1730, -960); counter(c, '研究員', 1); c.restore(); }   // the count lands when the reading is done
  dayPlate(c, '001460');
}
// R2 (fix8): one line that never goes back, every drawing held two beats or more: set down, looking at us; her eyes go
// to him; on the stamp (k = 50) they go down to it. (Her profile sv0 is the checklist's 聴覚, not here.)
const B_SEQ = [[44, 'hi0'], [47, 'hi_l'], [50, 'hi_d']];
let ENTRY = null;
function entryStamp() {                                          // her entry on the roll: flat red, like the verdict
  if (ENTRY) return ENTRY;
  const cv = document.createElement('canvas'), x = cv.getContext('2d'); cv.width = 420; cv.height = 150;
  x.strokeStyle = K.red; x.fillStyle = K.red; x.lineWidth = 8; x.strokeRect(4, 4, 412, 142); x.lineWidth = 3; x.strokeRect(14, 14, 392, 122);
  x.font = '400 40px "Gothic X"'; x.textBaseline = 'middle'; x.fillText('試作機', 28, 76);
  x.font = '800 92px "Shoulders"'; x.textAlign = 'right'; x.fillText('08-02', 396, 82);   // made by researcher 08, his second: not researcher 02 (stool 02 is another seat on the roll)
  return ENTRY = cv;
}
function pageB(c, T) {
  const kb = kbOf(T), u = clamp((T - CUT[0]) / (CUT[1] - CUT[0])), z = mix(RZ, 1.716, smooth(u));          // in on the two of them
  const fx0 = HX + 110, fy0 = HY - 150, cx = mix(RPX - (RPX - W / 2) / RZ, fx0, smooth(u)), cy = mix(RPY - (RPY - H / 2) / RZ, fy0, smooth(u));
  roll(c, 0, 0, W, H, cx, cy, z, { he: 'me0', seen: readSeen(99), floor: true, labels: INNER });
  // she stands beside his stool (where the roll puts her): there, on the ground line, on the bar line
  const sx = (x, y) => [W / 2 + (x - cx) * z, H / 2 + (y - cy) * z], [fx, fy] = sx(HX + 186, HY), a = T - CUT[0];
  figM(c, pickK(B_SEQ, kb), fx, fy, PXM * z);                    // by her card's measure, as he is by his: the two of them on one floor, one scale
  const [lx, ly] = sx(HX + 186, HY + 92), ka = T - kt(50);
  if (ka > -0.09) press(c, entryStamp(), lx, ly, ka, -0.05);
  band(c);
  column(c, L.b.slice(0, 4), T, 1518, 110, 76, { lead: 1.12, font: 'Mincho X', color: K.paper });
  column(c, L.b.slice(4), T, 1722, 96, 170, { lead: 1.04, color: K.paper, shadow: K.blue, sd: 8 });
  counter(c, '研究員', 1);
  dayPlate(c, '001460');
}
// ---------------------------------------------------------------- C
const ITEMS = ['視覚', '聴覚', '発声', '歩行', '平衡', '記憶', '演算', '家事'];
// Her panel (right): each item is checked on its beat, and she does that thing - her eyes, close, look left and back
// (視覚); her profile, the headphone (聴覚); her mouth opens (発声); she walks (歩行, from behind); her eyes go up to the
// left (記憶), down (演算); she speaks, a hand on her chest (言語); she holds the tray (家事). Then near, waiting; the
// verdict comes down and she blinks.
//   kind: 'full' (all of her, her feet on the ground line), 'bust' (cut at the waist), 'eyes' (her face, near)
// R2 (fix8): the items are checked a beat apart, but she is not: two items share a drawing and every drawing is held
// two beats or more, each used once - her eyes (視覚); her profile, the headphone, then she says はい (聴覚, 発声); she
// walks away from us (歩行, 平衡); eyes shut, the pictures, then the figures (記憶, 演算); the tray (家事); near, waiting
// for the verdict; after it, her eyelids lower.
const C_SEQ = [[0, 'oe_l', 'eyes'], [54, 'sv0', 'bust', 'hear'], [55, 'sv0', 'bust', 'speak'], [56, 'tb_p1', 'full'],
  [58, 'op_c', 'near', 'recall'], [59, 'op_c', 'near', 'sums'], [60, 'tf0', 'full'], [62, 'oe_o', 'near'], [65, 'op_h', 'near']];
const pickK = (A, kb) => { let n = A[0][1]; for (const [k, v] of A) if (kb >= k - 1e-6) n = v; return n; };
const pickS = (A, kb) => { let n = A[0]; for (const e of A) if (kb >= e[0] - 1e-6) n = e; return n; };
const PX0 = 1270, PCX = 1595;                                   // her panel: from x 1270 to the edge, centred on 1595
function herPanel(c, kb) {
  const [k0, n, kind, act] = pickS(C_SEQ, kb), a = kb - k0;
  c.save(); c.beginPath(); c.rect(PX0, -40, W - PX0 + 40, H + 80); c.clip();
  if (kind === 'full') { c.fillStyle = K.paper; c.fillRect(PX0, 1038, W - PX0, 4); figM(c, n, PCX, 1040, 590); }
  else if (kind === 'bust') figM(c, n, PCX, 1080 + 0.95 * 1500, 1500);                 // cut at the waist
  else if (kind === 'eyes') { const im = pic(n), sc = 1.55, h = im.height * sc; fig(c, n, PCX + 20, 520 - im.height * 0.42 * sc + h, h); }   // her eyes across the panel
  else { const h = 960; fig(c, n, PCX - 70, 1080 + 30, h); }                          // near: her face and chest
  // what the item is: her card acts it (the profile and its headphone, the shut eyes, the eyes down); the one thing
  // drawn on is the word said - its balloon's tail on her mouth (sv0 at this size: the mouth at 1462, 552).
  // p8: the sound arcs (聴覚), the three boxes (記憶) and the running figures (演算) were dropped over her hair and bow,
  // tied to nothing - gone.
  if (act === 'speak') { const kk = hit(a, 0.3, 14); c.save(); c.translate(1358, 554); c.scale(kk * 0.62, kk * 0.62); c.fillStyle = K.paper; c.beginPath(); c.moveTo(-110, -70); c.lineTo(110, -70); c.lineTo(110, -24); c.lineTo(168, -4); c.lineTo(110, 16); c.lineTo(110, 50); c.lineTo(-110, 50); c.closePath(); c.fill();   /* before her mouth, its tail to it: clear of her hair and its clip */ text(c, 'はい。', 0, -6, 60, { font: 'Gothic X', color: K.navy, align: 'center', base: 'middle' }); c.restore(); }
  c.restore();
  c.fillStyle = K.paper; c.fillRect(PX0 - 2, 0, 4, H);
}
// the verdict's stamp, flat like everything else on the page; 奇 when it lands, 跡 when it is sung
function verdict(c, T, x, y) {
  const tS = L.c[L.c.length - 2].t, tS2 = L.c[L.c.length - 1].t, a = T - (kt(63) - 0.02);
  if (a < -0.06) return;
  const k = a < 0 ? mix(1.25, 1, (a + 0.06) / 0.06) : 1 + 0.04 * Math.exp(-a * 18), size = 220;
  c.save(); c.translate(x, y); c.rotate(-0.08); c.scale(k, k);
  c.strokeStyle = K.red; c.lineWidth = 16; c.strokeRect(-280, -150, 560, 300); c.lineWidth = 5; c.strokeRect(-262, -132, 524, 264);
  text(c, '奇', -116, 8, size, { font: 'Mincho X', color: K.red, align: 'center', base: 'middle' });
  const k2 = hit(T - tS2 + 1 / 24, 0.3, 16); if (k2 > 0) { c.save(); c.translate(116, 8); c.scale(k2, k2); text(c, '跡', 0, 0, size, { font: 'Mincho X', color: K.red, align: 'center', base: 'middle' }); c.restore(); }
  c.restore();
}
function pageC(c, T) {
  const tS = kt(63), [sx, sy] = shake(T - tS, 22), kb = kbOf(T);
  c.save(); c.translate(sx, sy);
  c.fillStyle = K.blue; c.fillRect(-40, -40, W + 80, H + 80); grid(c, K.paper, 40, 0.09);
  herPanel(c, kb);
  row(c, L.c.slice(0, -2), T, 84, 128, 96, { font: 'Mincho X', color: K.paper, track: 4 });
  c.fillStyle = K.paper; c.fillRect(84, 196, 1150, 6);
  ITEMS.forEach((s, i) => {
    const y = 258 + i * 96, ta = kt(53 + i) - 0.1, a = T - ta;
    if (a < 0) { text(c, String(i + 1).padStart(2, '0'), 90, y + 22, 30, { color: K.deep }); c.fillStyle = K.deep; c.fillRect(84, y + 50, 1150, 2); return; }   // the rows are there, waiting
    text(c, String(i + 1).padStart(2, '0'), 90, y + 22, 30, { color: K.paper });
    text(c, s, 170, y + 26, 64, { font: 'Gothic X', color: K.paper });
    c.save(); c.strokeStyle = K.paper; c.lineWidth = 3; c.setLineDash([3, 13]); c.beginPath(); c.moveTo(330, y + 12); c.lineTo(330 + 640 * clamp(a / 0.12), y + 12); c.stroke(); c.restore();
    const k = hit(a - 0.1, 0.5, 20);
    if (k > 0) {
      c.save(); c.translate(1100, y + 4); c.scale(k, k); c.rotate(-0.1 + 0.2 * rnd(i));
      c.fillStyle = K.yellow; c.beginPath(); c.arc(0, 0, 40, 0, 7); c.fill();
      text(c, '合', 0, 19, 50, { font: 'Mincho X', color: K.navy, align: 'center' });
      c.restore();
    }
    c.fillStyle = K.navy; c.fillRect(84, y + 50, 1150, 2);
  });
  verdict(c, T, 660, 790);                                        // over the dotted lines of the last rows: every item and every 合 stays readable
  c.restore();
}
// ---------------------------------------------------------------- D
// Her eyes, a strip across the top of the frame, watching the figure that never reaches a hundred grow across the
// whole width below them. Her eyes stay on it; one blink on the bar line.
function pageD(c, T) {
  c.fillStyle = K.navy; c.fillRect(0, 0, W, H); grid(c, K.paper, 40, 0.05);
  const t = T - CUT[2], kb = kbOf(T), n = 1 + Math.floor(t / (BEAT / 2)), s = '99.' + '9'.repeat(Math.min(n, 14));
  // the strip of her eyes: her own card at 1.1 at most, the band of the eyes only
  // R2: one gaze held the whole page (the figure grows, she does not look away); one blink on the bar line (k = 72)
  const bl = kb >= 72 && kb < 72 + 2 / 24 / PB, nm = bl ? 'op_c' : 'op_o';
  const im = pic(nm), sc = 1.1, y0 = 440, y1 = 700, sh = (y1 - y0) * sc, sy = 70, z = 1 + 0.02 * clamp(t / (8 * PB));
  c.fillStyle = K.blue; c.fillRect(0, sy - 8, W, sh + 16);
  c.save(); c.beginPath(); c.rect(0, sy, W, sh); c.clip(); c.translate(W / 2, sy + sh / 2); c.scale(z, z);
  c.drawImage(im, 0, y0, im.width, y1 - y0, -im.width * sc / 2, -sh / 2, im.width * sc, sh); c.restore();
  c.fillStyle = K.yellow; c.fillRect(0, sy - 8, W, 6); c.fillRect(0, sy + sh + 2, W, 6);
  // the figure, as wide as the frame allows, and its bar the whole width
  c.save(); c.font = '800 400px "Shoulders"'; const w = c.measureText(s + '%').width; c.restore();
  const size = Math.min(380, 400 * 1700 / w), pulse = 1 + 0.03 * Math.exp(-((t / (BEAT / 2)) % 1) * 5);
  c.save(); c.translate(72, 740); c.scale(pulse, pulse);
  text(c, s, 0, 0, size, { font: 'Shoulders', weight: 800, color: K.paper });
  c.font = `800 ${size}px "Shoulders"`; const w2 = c.measureText(s).width;
  text(c, '%', w2 + 10, 0, size * 0.5, { font: 'Shoulders', weight: 800, color: K.yellow });
  c.restore();
  const bx = 72, bw = 1700, by = 780, f = 1 - Math.pow(0.5, n + 2);
  c.fillStyle = K.paper; c.fillRect(bx, by, bw * f, 50);
  c.strokeStyle = K.yellow; c.lineWidth = 4; c.setLineDash([10, 8]); c.strokeRect(bx + bw * f + 2, by + 2, bw * (1 - f) + 40, 46); c.setLineDash([]);
  row(c, L.d, T, 72, 950, 96, { font: 'Mincho X', color: K.paper, track: 2 });
}
// ---------------------------------------------------------------- E
// Everything she can do, a square each, seven across; in the middle the one square that is empty, two squares wide and
// two high, and the line is said in it in the same type as every other square. She is on the right, near: a dashed
// line runs over the squares from the empty one to the empty ring on her chest. Her eyes: on the grid; down at her chest. Then into the empty square, straight onto the first strokes of the code.
const CAN = ['視覚', '聴覚', '発声', '歩行', '握力', '記憶', '演算', '平衡', '言語', '学習', '動力', '触覚', '走行', '跳躍', '筆記', '歌唱', '掃除', '料理', '計時', '通信', '裁縫', '給仕', '挨拶', '洗濯'];
const EC = 7, ER = 4, EW = 160, EH = 152, EX = 700, EY = 236, HOLE = [3, 1];   // the grid on the right; she is on the left       // the empty square: columns 3-4, rows 1-2
// R2: her eyes on the grid while the line is sung; as the dashed line reaches her (k = 80) they go down to her chest
const E_SEQ = [[0, 'oe_l'], [80, 'oe_d']];
const SOCK = [478, 1003, 54];                                    // the ring on her chest, in the card's pixels (op/oe are one canvas)
const inHole = (i, j) => i >= HOLE[0] && i <= HOLE[0] + 1 && j >= HOLE[1] && j <= HOLE[1] + 1;
function pageE(c, T) {
  const t = T - CUT[3], kb = kbOf(T), zt = clamp((kb - 83.3) / 0.7), z = 1 + 6 * zt * zt * zt;
  const hx0 = EX + HOLE[0] * EW, hy0 = EY + HOLE[1] * EH, hw = 2 * EW, hh = 2 * EH, hx = hx0 + hw / 2, hy = hy0 + hh / 2;
  c.fillStyle = K.paper; c.fillRect(0, 0, W, H);
  c.save(); c.translate(W / 2 + (hx - W / 2) * (1 - zt), H / 2 + (hy - H / 2) * (1 - zt)); c.scale(z, z); c.translate(-hx, -hy);
  // her
  const HH = 900, im = pic('op_o'), s = HH / im.height, X = 340, x0 = X - im.width * s / 2, y0 = 1080 - HH;
  fig(c, pickK(E_SEQ, kb), X, 1080, HH);
  const sx0 = x0 + SOCK[0] * s, sy0 = y0 + SOCK[1] * s, sr = SOCK[2] * s;
  // the squares
  let n = 0;
  for (let j = 0; j < ER; j++) for (let i = 0; i < EC; i++) {
    if (inHole(i, j)) continue;
    const id = n++, sname = CAN[id], x = EX + i * EW, y = EY + j * EH;
    const on = t - Math.floor(rnd(id * 5.3) * 6) * PB / 2, k = hit(on, 0.12, 22);
    if (k <= 0) { c.strokeStyle = K.navy; c.lineWidth = 2; c.strokeRect(x + 7, y + 7, EW - 14, EH - 14); continue; }
    c.save(); c.translate(x + EW / 2, y + EH / 2); c.scale(k, k);
    c.fillStyle = K.navy; c.fillRect(-EW / 2 + 7, -EH / 2 + 7, EW - 14, EH - 14);
    text(c, sname, 0, 12, 62, { font: 'Gothic X', color: K.paper, align: 'center', base: 'middle' });
    text(c, String(id + 1).padStart(2, '0'), -EW / 2 + 18, -EH / 2 + 32, 18, { color: K.paper });
    c.fillStyle = K.yellow; c.beginPath(); c.arc(EW / 2 - 26, -EH / 2 + 26, 8, 0, 7); c.fill();
    c.restore();
  }
  // the empty square, and the line said in it
  c.fillStyle = K.deep; c.fillRect(hx0 + 7, hy0 + 7, hw - 14, hh - 14);
  c.strokeStyle = K.yellow; c.lineWidth = 5; c.setLineDash([16, 12]); c.lineDashOffset = -T * 40; c.strokeRect(hx0 + 7, hy0 + 7, hw - 14, hh - 14); c.setLineDash([]);
  L.e.forEach((ch, m) => { const k = hit(T - ch.t + 1 / 24, 0.4, 16); if (k <= 0) return; c.save(); c.translate(hx + (m % 4 - 1.5) * 68, hy + (m < 4 ? -40 : 44)); c.scale(k, k); text(c, ch.c, 0, 0, 60, { font: 'Gothic X', color: K.paper, align: 'center', base: 'middle' }); c.restore(); });
  // one dashed line over the squares, from the empty square to the ring on her chest, drawn on as the line is sung
  // one dashed line from the empty square to the ring on her chest: out of the square's left side along the seam between
  // two rows of squares (it crosses no square and no figure), then across to her; drawn on as the line is sung
  const pts = [[hx0 + 7, hy], [EX - 24, hy], [sx0 + sr + 18, sy0]], seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1])), tot = seg[0] + seg[1];
  const lk = clamp((T - L.e[0].t) / (4 * PB));
  if (lk > 0) {
    let left = lk * tot; const path = [pts[0]];
    for (let i = 0; i < 2 && left > 0; i++) { const u = Math.min(1, left / seg[i]); path.push([mix(pts[i][0], pts[i + 1][0], u), mix(pts[i][1], pts[i + 1][1], u)]); left -= seg[i]; }
    const stroke = () => { c.beginPath(); c.moveTo(...path[0]); for (const q of path.slice(1)) c.lineTo(...q); c.stroke(); };
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = K.navy; c.lineWidth = 12; stroke();
    c.strokeStyle = K.yellow; c.lineWidth = 6; c.setLineDash([18, 12]); c.lineDashOffset = -T * 40; stroke();
    if (lk >= 1) { c.beginPath(); c.arc(sx0, sy0, sr + 14, 0, 7); c.stroke(); }
    c.restore();
  }  c.restore();
}

// ---------------------------------------------------------------- F
// The code is typed into the shape of 心 (two beats); then it is RUN, again and again, faster and faster, and every run
// fails worse than the one before: more of it falls out, whole strokes go missing, the character leans and slides; the
// last run brings all of it down - ERROR. She is on the right: at each failure she looks down at her chest, her hand
// goes to the empty ring, and comes down again.
let CELLS = [];
const HCX = 860, HCY = 560;
function heart() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
  x.font = '400 880px "Gothic X"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.strokeStyle = '#fff'; x.lineWidth = 20;   // the black gothic: every stroke four characters wide or more
  x.lineJoin = 'round'; x.strokeText('心', HCX, HCY); x.fillText('心', HCX, HCY);
  const d = x.getImageData(0, 0, W, H).data, CW = 16, CH = 21, code = 'KOKORO.PRG//';
  CELLS = [];
  for (let j = 0; j * CH < H; j++) for (let i = 0; i * CW < W; i++) {
    const px = Math.floor(i * CW + CW / 2), py = Math.floor(j * CH + CH / 2);
    if (d[(py * W + px) * 4 + 3] > 110) CELLS.push({ x: i * CW, y: j * CH + 17, ch: code[(i + j * 5) % code.length], r: rnd(i * 13.7 + j * 71.3), r2: rnd(i * 3.1 + j * 17.9), r3: rnd(i * 7.7 + j * 3.3), stroke: Math.floor(rnd(Math.floor(i / 6) * 9.1 + Math.floor(j / 5) * 4.7) * 12) });
  }
}
// the runs: a beat apart, then half a beat, then a quarter; the last at k = 98.25
const RUNS = []; for (let k = 86; k < 91; k += 1) RUNS.push(k); for (let k = 91; k < 95; k += 0.5) RUNS.push(k); for (let k = 95; k < 98.5; k += 0.25) RUNS.push(k);
const F_SEQ = [[0, 'hi0']];
function pageF(c, T) {
  c.fillStyle = K.deep; c.fillRect(0, 0, W, H);
  const kb = kbOf(T), tK = kt(86), tG = L.g[0].t, tE = kt(98.5), half = Math.floor(kb * 2) % 2 === 0;
  const fill = clamp((T - CUT[4]) / (tK - CUT[4])), gone = clamp((T - tE) / (start + duration - tE));
  let rn = -1; for (let i = 0; i < RUNS.length; i++) if (kb >= RUNS[i]) rn = i;
  const run = rn >= 0 && T < tE, next = RUNS[rn + 1] ?? 98.5, len = next - (RUNS[rn] ?? 86), ph = run ? (kb - RUNS[rn]) / len : 0;
  const sev = run ? (rn + ph) / RUNS.length : T >= tE ? 1 : 0;           // how badly it is failing, 0..1
  const fail = run && ph < 0.55;
  // the character leans and slides as it fails
  c.save(); c.translate(HCX, HCY); c.rotate(-0.16 * sev * sev); c.translate(-HCX + 40 * sev * sev, -HCY + 30 * sev * sev);
  c.font = '700 20px "Mono"'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  for (const q of CELLS) {
    if (q.r > fill * 1.02) continue;
    if (q.stroke < Math.floor(sev * 7) && q.stroke % 2 === 0) continue;            // whole strokes gone
    if (q.r3 < sev * 0.45) continue;                                                // more and more of it gone for good
    let y = q.y;
    if (T > tE) { const g = (gone * 1.6 - q.r2) * 2; if (g > 0) { y += g * g * 620; if (y > 880 && q.x < 760) continue; if (y > H + 40) continue; } }
    else if (fail && q.r2 < 0.1 + 0.5 * sev) { const dp = ph / 0.55; y += dp * dp * 160; if (y > 880 && q.x < 760) continue; }   // this run's falling: off the lyric line
    c.fillStyle = T < tK ? K.white : fail && q.r2 < 0.1 + 0.5 * sev ? K.red : K.yellow;
    c.fillText(q.ch, q.x, y);
  }
  c.restore();
  // her: waist up. At each failure she looks down and her hand goes to her chest; then it comes down
  // one master for all of them (cb / fs): looking at us; a fingertip to the empty ring, eyes down; her hand on her chest
  // R2 (fix8): she does not flicker with the runs - the code, the count and the frame do. Four drawings, one line:
  // looking at us while it is typed and the first runs go (k 84); a fingertip to the empty ring, eyes down, as the
  // failures pile up (k 88); she looks up, mouth open, as it comes apart faster than she can follow (k 93, before
  // プログラム); eyes down, her hand on her chest, before the last run brings it all down (k 96.5 - the ERROR at 98.5).
  const nm = kb >= 96.5 ? 'cb_down' : kb >= 93 ? 'cb_up' : kb >= 88 ? 'fs_1' : 'cb0';
  const S = 1420 * (1 + 0.05 * smooth((kb - 84) / 15.5));               // the one slow push on her, the whole page
  figM(c, nm, 1600, 1080 + 0.95 * S, S);
  // each run's failure flashes the frame's edge red (the flicker is the machine's, not hers)
  if (fail && ph < 0.3) { c.strokeStyle = K.red; c.lineWidth = 14; c.strokeRect(22, 22, W - 44, H - 44); }
  // the machine's own lines
  if (run) { const n = rn + 1, k = hit(kb - RUNS[rn], 0.25, 30); text(c, 'RUN', 64, 700, 40, { color: K.paper, track: 4 }); c.save(); c.translate(64, 880); c.scale(k, k); text(c, String(n).padStart(3, '0'), 0, 0, 170, { font: 'Shoulders', weight: 800, color: K.red }); c.restore(); }
  let s = ''; for (const ch of L.f) if (T >= ch.t) s += ch.c;
  text(c, '> ' + s + (T < tG && half ? '_' : ''), 64, 100, 64, { font: 'Dot', color: K.white });
  let g = ''; for (const ch of L.g) if (T >= ch.t) g += ch.c;
  if (T >= tG - 0.3) text(c, '> ' + g + (half ? '_' : ''), 64, 1018, 96, { font: 'Dot', color: K.yellow });
  if (T > tE) {
    c.fillStyle = K.red; c.fillRect(0, 300, W * out5((T - tE) / 0.1), 500);
    text(c, '心 ERROR', 70, 590, 205, { font: 'Dela', color: K.deep });
    if (T >= kt(99)) text(c, '実行デキマセン', 78, 760, 132, { font: 'Dot', color: K.white });
    figM(c, nm, 1600, 1080 + 0.95 * S, S);                       // she is in front of it
  }
}
export function draw(c, t) {
  const T = t + start;
  (T < CUT[0] ? pageA : T < CUT[1] ? pageB : T < CUT[2] ? pageC : T < CUT[3] ? pageD : T < CUT[4] ? pageE : pageF)(c, T);
}
