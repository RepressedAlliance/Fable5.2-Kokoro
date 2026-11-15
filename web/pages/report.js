// THE SHEET: 「心」設計記録 - his design record for her heart. ONE layout for the whole film (the canon is
// art/canon/prop_report.png and prop_report_done.png, rendered by web/pages/reportsheet.js). Every page that draws the
// sheet draws it with drawReport; only its size, crop, tilt and state differ.
//
// Portrait A4 (1 : 1.414), laid out in thousandths of its width (1000 x 1414 units). Top to bottom:
//   the frame; the navy-blue title band: 「心」設計記録 left, No.021169 right
//   最終稿 large left, DAY 021169 right, a rule under them
//   the drawing: 心 in a box -> a dashed arrow (ここに, in his hand, over it) -> the socket (two rings);
//                his notes beside it: まだ (struck out), あと一つ
//   心拍: a trace in a ruled box - flat
//   a small table: 部品 / 回路 / 調整, each with a printed line
//   結果: a long box - empty (or 成功 / 失敗 stamped in it)
//   起動: an underlined field - a yellow cursor (or OK)
//   研究員: a signature line
import { K, clamp, out3, hit, text, stamp, press } from './kit.js';

export const RW = 1000, RH = 1414;                     // the sheet in its own units
// where things are (units), for pages that frame a part of it or draw over it
export const REPORT = {
  socket: [640, 410], ringR: [110, 66],                // the socket's centre; its outer and inner ring
  heart: [190, 407],                                   // the 心 in its box
  trace: [80, 560, 840, 190], traceY: 655,             // the trace's box; its flat line
  result: [300, 935, 600, 140], resultC: [600, 1005],   // 結果's box and its centre
  boot: [300, 1130], bootLine: 1222,                   // 起動's field (cursor's top left); its underline
  // the lines her eyes go along when she reads it: [x, y, length] under the heading, 最終稿, the drawing, the trace
  lines: [[75, 113, 860], [80, 258, 230], [90, 512, 830], [80, 757, 840]],
};
const hand = (c, s, x, y, size, o = {}) => text(c, s, x, y, size, { font: 'Klee', color: o.color ?? K.blue, align: o.align, base: o.base });

// drawReport(c, x, y, w, o): the sheet with its top left at (x, y), w pixels wide (w * 1.414 tall). o (all optional):
//   no, day       the record's number and its day (both 21169: his last)
//   title         the large heading ('最終稿'); a failed sheet of the wall: '草稿'
//   result        null (empty) | '成功' | '失敗': the stamp in 結果;  resultAge: seconds since it landed (press animation)
//   boot          null | 'OK' in 起動 (bootK: its landing scale);  cursor: the yellow cursor in 起動 shown
//   socket        { wait: dash offset (yellow dashes going round: it waits), fill: 0..1 (yellow from its centre),
//                   heart: scale of the 心 set into it (0: none), rings: [0..1, ...] (yellow rings going out from it) }
//   trace         { len: 0..1 (how much of the flat line is drawn), beat: 0..1 (a beat running along it) }
//   read          [x, y, len]: a yellow underline where her eyes are (units)
//   ground        false: print only (the paper is the drawing's own)
export function drawReport(c, x, y, w, o = {}) {
  const no = o.no ?? 21169, day = o.day ?? 21169, title = o.title ?? '最終稿', sk = o.socket ?? {}, tr = o.trace ?? {};
  c.save(); c.translate(x, y); c.scale(w / RW, w / RW);
  c.lineCap = 'butt'; c.lineJoin = 'miter'; c.setLineDash([]);
  if (o.ground !== false) { c.fillStyle = K.white; c.fillRect(0, 0, RW, RH); }
  // the frame and the title band
  c.strokeStyle = K.blue; c.lineWidth = 8; c.strokeRect(40, 40, 920, 1334);
  c.fillStyle = K.blue; c.fillRect(40, 40, 920, 85);
  text(c, '「心」設計記録', 75, 100, 45, { font: 'Mincho X', color: K.white });
  text(c, 'No.' + String(no).padStart(6, '0'), 925, 98, 36, { font: 'Shoulders', weight: 600, color: K.white, align: 'right' });
  // the heading and the day
  text(c, title, 80, 240, 75, { font: 'Mincho X', color: K.blue });
  text(c, 'DAY ' + String(day).padStart(6, '0'), 920, 236, 36, { font: 'Shoulders', weight: 600, color: K.blue, align: 'right' });
  c.fillStyle = K.blue; c.fillRect(80, 272, 840, 4);
  // the drawing: 心 -> the socket in her chest
  const [sx, sy] = REPORT.socket, [r1, r2] = REPORT.ringR;
  c.strokeStyle = K.blue; c.lineWidth = 7; c.strokeRect(90, 325, 200, 165);
  text(c, '心', 190, 410, 118, { font: 'Mincho X', color: K.navy, align: 'center', base: 'middle' });
  c.lineWidth = 6; c.setLineDash([20, 14]); c.beginPath(); c.moveTo(312, 410); c.lineTo(478, 410); c.stroke(); c.setLineDash([]);
  c.fillStyle = K.blue; c.beginPath(); c.moveTo(478, 391); c.lineTo(506, 410); c.lineTo(478, 429); c.closePath(); c.fill();
  hand(c, 'ここに', 336, 380, 36);
  // the socket: rings going out (behind), the yellow, the rings, the dashes that wait, the 心 set in
  for (const ph of sk.rings ?? []) { if (ph < 0 || ph >= 1) continue; c.strokeStyle = K.yellow; c.lineWidth = 9 * (1 - ph) + 1; c.beginPath(); c.arc(sx, sy, r1 + 8 + ph * 40, 0, 7); c.stroke(); }
  if (sk.fill > 0) { c.fillStyle = K.yellow; c.beginPath(); c.arc(sx, sy, Math.min(r1 - 2, r1 * sk.fill), 0, 7); c.fill(); }
  c.strokeStyle = K.blue; c.lineWidth = 7; c.beginPath(); c.arc(sx, sy, r1, 0, 7); c.stroke(); c.beginPath(); c.arc(sx, sy, r2, 0, 7); c.stroke();
  if (sk.wait != null) { c.save(); c.strokeStyle = K.yellow; c.lineWidth = 6; c.setLineDash([16, 12]); c.lineDashOffset = sk.wait; c.beginPath(); c.arc(sx, sy, (r1 + r2) / 2, 0, 7); c.stroke(); c.restore(); }
  if (sk.heart > 0) { c.save(); c.translate(sx, sy); c.scale(sk.heart, sk.heart); text(c, '心', 0, 4, 84, { font: 'Mincho X', color: K.navy, align: 'center', base: 'middle' }); c.restore(); }
  // his notes beside it: 'not yet', struck out; 'one more'
  hand(c, 'まだ', 786, 372, 38); c.strokeStyle = K.blue; c.lineWidth = 3; c.beginPath(); c.moveTo(778, 364); c.lineTo(870, 348); c.stroke();
  hand(c, 'あと一つ', 772, 452, 36);
  // 心拍: the trace
  const [tx, ty, tw, th] = REPORT.trace, yl = REPORT.traceY;
  c.strokeStyle = K.blue; c.lineWidth = 6; c.strokeRect(tx, ty, tw, th);
  c.lineWidth = 2; c.beginPath(); for (let i = 1; i < 8; i++) { c.moveTo(tx + i * 105, ty + 6); c.lineTo(tx + i * 105, ty + th - 6); } c.moveTo(tx + 6, ty + th / 4); c.lineTo(tx + tw - 6, ty + th / 4); c.moveTo(tx + 6, ty + th * 3 / 4); c.lineTo(tx + tw - 6, ty + th * 3 / 4); c.stroke();
  c.fillStyle = K.white; c.fillRect(tx + 3, ty + 3, 96, 42); text(c, '心拍', tx + 16, ty + 36, 30, { font: 'Mincho X', color: K.blue });
  if (tr.beat == null) { const a = tr.len ?? 1; if (a > 0) { c.fillStyle = K.navy; c.fillRect(tx, yl - 4, tw * clamp(a), 8); } }
  else {
    const bx = tx + tw * (((tr.beat % 1) + 1) % 1);
    c.save(); c.beginPath(); c.rect(tx, ty, tw, th); c.clip();
    c.strokeStyle = K.navy; c.lineWidth = 8; c.lineJoin = 'round'; c.beginPath(); c.moveTo(tx, yl);
    for (const [dx, dy] of [[-60, 0], [-40, -12], [-26, 0], [-14, 0], [0, -66], [16, 30], [30, 0], [70, 0], [90, -16], [112, 0]]) { const px = bx + dx; if (px > tx && px < tx + tw) c.lineTo(px, yl + dy); }
    c.lineTo(tx + tw, yl); c.stroke(); c.restore();
  }
  // the table
  c.strokeStyle = K.blue; c.lineWidth = 3; c.beginPath();
  for (let i = 0; i <= 3; i++) { c.moveTo(80, 785 + i * 40); c.lineTo(920, 785 + i * 40); }
  c.moveTo(250, 785); c.lineTo(250, 905); c.stroke();
  ['部品', '回路', '調整'].forEach((s, i) => text(c, s, 100, 815 + i * 40, 26, { font: 'Mincho X', color: K.blue }));
  c.fillStyle = K.blue; [430, 300, 540].forEach((l, i) => c.fillRect(276, 801 + i * 40, l, 9));
  // 結果
  const [rx, ry, rw, rh] = REPORT.result, [rcx, rcy] = REPORT.resultC;
  text(c, '結果', 80, 1030, 70, { font: 'Mincho X', color: K.blue });
  c.strokeStyle = K.blue; c.lineWidth = 6; c.strokeRect(rx, ry, rw, rh);
  // 起動
  const [bx0, by0] = REPORT.boot;
  text(c, '起動', 80, 1205, 70, { font: 'Mincho X', color: K.blue });
  c.fillStyle = K.blue; c.fillRect(bx0, REPORT.bootLine, 600, 5);
  if (o.cursor) { c.fillStyle = K.yellow; c.fillRect(o.boot ? bx0 + 150 : bx0, by0, 45, 85); }   // after the OK once there is one
  if (o.boot) { const k = o.bootK ?? 1; if (k > 0) { c.save(); c.translate(bx0 + 4, by0 + 44); c.scale(k, k); text(c, o.boot, 0, 0, 76, { font: 'Dot', color: K.navy, base: 'middle' }); c.restore(); } }
  // 研究員
  text(c, '研究員', 80, 1325, 32, { font: 'Mincho X', color: K.blue }); c.fillStyle = K.blue; c.fillRect(240, 1325, 400, 4);
  if (o.read) { c.fillStyle = K.yellow; c.fillRect(o.read[0], o.read[1], o.read[2], 10); }
  // the stamp, last, over everything: the whole of it in the middle of 結果
  if (o.result) {
    const age = o.resultAge ?? 10, cv = stamp(o.result, 224, K.red), s = 118 / cv.height;
    if (age > -0.09) { c.save(); c.translate(rcx, rcy); c.scale(s, s); press(c, cv, 0, 0, age, o.result === '失敗' ? -0.08 : -0.035); c.restore(); }
  }
  c.restore();
}
