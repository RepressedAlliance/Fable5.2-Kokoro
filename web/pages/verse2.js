// The quiet chorus (162.95 - 192.1 s): why she was made. Piano only; the band comes back on the last beat.
//   V1  today: the sheet the wall ended in. She reads his last sheet; on 今 she lifts it nearer; on 始 she holds it to her
//       heart.                                                                                          今 気付き始めた
//   V2  the roll of the laboratory, all fifteen stools: the frame stops on each empty one, a half-beat each, then on
//       his: he is there.                                                                              生まれた理由を
//   V3  two halves of the frame, each a time-lapse: his first years, alone at the desk; her four hundred years, alone,
//       doing for an empty stool what she did for him, one thing after another.                         きっと独りは寂しい
//   V4  the seam goes: one warm picture - the day he held up his song and she sang it.                  そう、
//   V5  that picture is one sheet of the wall; beside it lights the day her bow was put on.             あの日、あの時
//   V6  from those two the wall lights, ring by ring.                                                   全ての記憶に 宿る「ココロ」が
//   V7  the sheets rise past her like water; she stands on a round stage and lifts her arms.            溢れ出す
// Beats: 20.016 + k * 0.42858 s (measured). Here the voice and the piano are on the half-beats (k = x.5): the pages
// turn there; her drawings change there or on the beat.
import { W, H, K, clamp, mix, smooth, out3, out5, rnd, hit, img, pic, fig, lyrics, line, column, row, text, grid, dayMark, windNames, windFrame } from './kit.js';
import { prepare as prepareWonder, load, sheets, scene, nowShot, her, hM, card, sheetCard, picCentre, anchor, ZFULL, TEA, BOW, SHEET, pairPhoto } from './wonder.js';
import { roll, prepareRoll, COLS, X0, Y0, DX, DY } from './roll.js';
import { prepareOverflow, drawOverflow } from './verse2_overflow.js';
export const name = 'verse2';
const T0B = 20.016, PB = 0.42858, kt = k => T0B + k * PB, kbOf = T => (T - T0B) / PB;
export const start = kt(333.5);
export const duration = kt(401.5) - start;
const KB = 343.5, KC = 351.5, KC2 = 355, KD = 365.5, KD2 = 367.5, KD3 = 371, KE = 375.5, KF = 383.5, KF2 = 391.5;
const EMPTY = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15];  // every stool but his, in the order they are read
let L = {};
export async function prepare() {
  await lyrics(); await prepareWonder(); await prepareRoll();   // r9: the roll sets its stools by v2.json
  for (const n of ['mf0', 'mf_gone', 'me_gone', 'tw0', 'tw_off', 'bx_1', 'bx_o', 'lv_eat', 'lv_read', 'lv_cup', 'lv_sleep', 'jsc_1', 'bx_0', 'bx_01', 'sv0', 'pg_1', 'jf_2', 'jt_1', 'jt_2', 'kv_tie', 'kv_joy']) await load(n);
  await prepareOverflow(wallCam(KF2 - 1e-4));   // r11 (P4): V7 redrawn - verse2_overflow.js
  L = { b: line('生まれた理由を'), c: line('きっと独りは寂しい'), d: line('そう、あの日、あの時'), e: line('全ての記憶に'), f: line('宿る「ココロ」が溢れ出す') };
}
const band = (c, x) => { c.fillStyle = K.navy; c.fillRect(x, 0, W - x, H); c.fillStyle = K.yellow; c.fillRect(x, 0, 8, H); };
const pick = (A, kb) => { let n = A[0][1]; for (const [k, v] of A) if (kb >= k - 1e-6) n = v; return n; };

// ---------------------------------------------------------------- V2  the roll: every stool in the frame
// r8: one picture. She, large, on the right, looks left at the roll; the roll is near enough to read, and the camera goes
// with the yellow frame (her eyes) from stool to stool; the words and the count are under the roll, on the same ground.
const RW = 1360, RH = 860, RC = [RW / 2, RH / 2];                 // the roll's window: the frame left of her, above the words
const rollAim = s => { const m = s < 14 ? EMPTY[s] : 8, i = (m - 1) % COLS, j = Math.floor((m - 1) / COLS); return [X0 + 2 * DX, j < 2 ? 350 : 710]; };   // two whole rows in view: the frame moves down a row once (from 10 to 11); r9: 710, his head (row 2, larger now) stays in
function rollPage(c, T, kb) {
  const q = (kb - KB) * 2, s = Math.floor(q + 1e-6), mark = s < 14 ? EMPTY[s] : 8, seen = new Set(EMPTY.slice(0, Math.min(s + 1, 14)));
  const A0 = rollAim(Math.max(0, s - 1)), A1 = rollAim(s), m = s === 0 ? 1 : smooth((q - s) / 0.7);
  const e = out3((kb - 350.5) / 0.9), z = mix(1.0, 1.65, e);   // r9: 1.75 -> 1.65, the labels of 07 / 09 whole in the window       // and on his stool, in on him
  const rcx = mix(mix(A0[0], A1[0], m), X0 + 2 * DX, e), rcy = mix(mix(A0[1], A1[1], m), Y0 + DY - 200, e);   // r9: half a head over him
  c.fillStyle = K.blue; c.fillRect(0, 0, W, H); grid(c, K.paper, 40, 0.09);
  c.save(); c.imageSmoothingQuality = 'high'; roll(c, 0, 0, RW, RH, rcx, rcy, z, { he: 'mf0', seen }); c.restore();   // r9: small, he was jagged
  { const i = (mark - 1) % COLS, j = Math.floor((mark - 1) / COLS), bx = X0 + i * DX, by = Y0 + j * DY, sx = x => RC[0] + (x - rcx) * z, sy = y => RC[1] + (y - rcy) * z;   // the frame on the stool: tall enough for him
    c.save(); c.beginPath(); c.rect(0, 0, RW, RH); c.clip(); c.strokeStyle = K.yellow; c.lineWidth = 5; const top = mark === 8 ? 341 : 300; c.strokeRect(sx(bx - 104), sy(by - top), 208 * z, (top + 54) * z); c.restore(); }   // r9: on his stool the frame clears his head (roll.js draws him ~10 % larger) and stays under the labels of the row above; on an empty one it is lower
  c.fillStyle = K.paper; c.fillRect(60, RH - 2, RW - 60, 4);        // the roll's edge: the words stand under it
  // she reads it: her profile, large, facing the roll - she watches the frame go along the empty stools; half-way, she
  // looks down at his sheet (one change: r8)
  // r10 (C4): the redrawn pg_1 holds the sheet out in both hands, further from her: a little smaller and further right
  // (1120 -> 1040, 1640 -> 1710) so the sheet stays clear of the roll's window (its stool 10 and the frame on it)
  const sn = kb < 347.5 ? 'sv0' : 'pg_1', ppm = 1040;
  her(c, sn, 1710, 1080 + 0.78 * ppm, ppm);
  // 生まれた 理由 を: one line under the roll, set on one foot
  const base = 1010, put = (ch, x, sz, o = {}) => row(c, ch, T, x, base - sz * 0.42, sz, { font: 'Mincho X', color: K.paper, ...o });
  let x = 90; x += put(L.b.slice(0, 4), x, 76); x += put(L.b.slice(4, 6), x + 10, 150, { shadow: K.navy, sd: 8 }) + 20; put(L.b.slice(6), x, 76);
  // the count: each empty stool as the frame stops on it; then his, and he is there (beside the words, under the roll)
  const his = s >= 14, n = his ? 1 : s + 1, kz = 1 + 0.12 * Math.exp(-((q % 1) * 4));
  text(c, his ? '在席' : '空席', 940, base - 4, 34, { font: 'Gothic X', color: his ? K.yellow : K.paper });
  c.save(); c.translate(1110, base); c.scale(kz, kz); text(c, String(n), 0, 0, 150, { font: 'Shoulders', weight: 800, color: his ? K.yellow : K.paper, align: 'center' }); c.restore();
  text(c, '/15', 1180, base - 6, 50, { font: 'Shoulders', weight: 600, color: K.paper });
}

// ---------------------------------------------------------------- V3  two halves, two time-lapses
const G3 = 960, P3 = 520;                                        // the ground line; pixels a metre (both halves alike: him and her about 75 % of the frame)
// r9: his days alone before she was there (きっと独りは寂しい): he eats at the desk; reads; a cup he made himself; dozes
// over the book. Each once, 3 - 4 beats, between her changes on the right (355 / 358 / 361 / 363.5).
const HE3 = [[KC, 'lv_eat'], [355, 'lv_read'], [359, 'lv_cup'], [362, 'lv_sleep']];
const HX3 = 360;                                                 // where the far foot of his stool stands (the set lv: the stool never moves between drawings)
// what she did for him, done for nobody: the cup held out, the floor swept, the tray lowered at the empty stool, his song
const SHE3 = [[KC2, 'wm_off'], [358, 'wm_broom'], [361, 'wm_low'], [363.5, 'wm_sing']];   // r8: each once, none coming back
const days = (a, b, k0, k1, kb) => String(Math.round(mix(a, b, smooth(clamp((kb - k0) / (k1 - k0)))))).padStart(6, '0');
// the days going over: an arc over the half, the sun on it by day, the moon by night (per: beats a day)
function sky(c, cx, kb, k0, per, line, ground) {
  const R = 880, cy = G3 - 40, ph = (((kb - k0) / per) % 1 + 1) % 1, day = ph < 0.5, a = Math.PI * (1 - (ph % 0.5) * 2);
  c.strokeStyle = line; c.lineWidth = 4; c.setLineDash([18, 14]); c.beginPath(); c.arc(cx, cy, R, Math.PI, 2 * Math.PI); c.stroke(); c.setLineDash([]);
  const x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);
  c.fillStyle = day ? K.yellow : K.paper; c.beginPath(); c.arc(x, y, day ? 30 : 24, 0, 7); c.fill();
  if (!day) { c.fillStyle = ground; c.beginPath(); c.arc(x + 11, y - 7, 21, 0, 7); c.fill(); }   // the moon: a crescent
}
// his failed drawings pinned on the wall behind him, more every day (a sheet every 2/3 beat)
// where they go, in order (x from him, y): above him, then over the desk, then behind his back
// r9: in the frame's own pixels - over the desk, and behind his back; never over his head, never over the words on the left
const SLOTS = [[800, 95], [885, 222], [330, 330], [805, 332], [345, 482], [330, 632]];
function failures(c, kb, hx) {
  const n = clamp(Math.floor((kb - KC) * 0.75) + 2, 0, SLOTS.length);          // r9: fewer, slower (they were a heap by the end)
  for (let i = 0; i < n; i++) {
    const [sx, dy] = SLOTS[i], put = i + 1, x = sx + (hx - 500) + (rnd(i * 7.13) - 0.5) * 24, y = dy + (rnd(i * 3.71) - 0.5) * 20;   // they come in with him (hx: 500 when the halves are set)
    const r = (rnd(i * 5.3 + 2) - 0.5) * 0.3, k = put <= 2 ? 1 : hit((kb - (KC + (put - 3) / 0.75)) * PB, 0.25, 12);
    c.save(); c.translate(x, y); c.rotate(r); c.scale(k, k);
    c.fillStyle = K.deep; c.fillRect(-60 + 6, -44 + 8, 120, 88); c.fillStyle = K.white; c.fillRect(-60, -44, 120, 88);
    c.fillStyle = K.blue; c.fillRect(-52, -36, 104, 10); for (let q = 0; q < 3; q++) c.fillRect(-50, -16 + q * 16, q % 2 ? 50 : 80, 5);
    c.strokeStyle = K.red; c.lineWidth = 3; c.save(); c.translate(26, 22); c.rotate(-0.15); c.strokeRect(-24, -12, 48, 24); c.restore();
    c.fillStyle = K.yellow; c.beginPath(); c.arc(0, -40, 5, 0, 7); c.fill();                 // the pin
    c.restore();
  }
}
function halves(c, T, kb) {
  const sl = out5((kb - KC2) / 0.5), xs = mix(W, 960, sl), hx = mix(650, HX3, sl), hm = hx + 0.27 * P3;   // hm: about the middle of him and his desk
  // his: blueprint blue, the desk and the stool on the ground; his failures on the wall; the days going over
  c.fillStyle = K.blue; c.fillRect(0, 0, xs, H); grid(c, K.paper, 40, 0.07);
  c.save(); c.beginPath(); c.rect(0, 0, xs, H); c.clip();
  sky(c, mix(960, 480, sl), kb, KC, 2, K.deep, K.blue);
  failures(c, kb, hm);
  c.restore();
  c.fillStyle = K.deep; c.fillRect(0, G3, xs, H - G3); c.fillStyle = K.paper; c.fillRect(0, G3 - 2, xs, 4);
  her(c, pick(HE3, kb), hx, G3, P3, { at: 0 });
  dayMark(c, days(1, 1459, KC, 362.5, kb), { edge: K.deep, size: 56, y: 1030 });
  // hers: navy, the empty stool, and every day something done for it; the days go over four times as fast
  if (kb >= KC2) {
    c.save(); c.translate(xs - 960, 0); c.beginPath(); c.rect(960, 0, 960, H); c.clip();
    c.fillStyle = K.navy; c.fillRect(960, 0, 960, H);
    sky(c, 1440, kb, KC2, 0.5, K.blue, K.navy);
    c.fillStyle = K.deep; c.fillRect(960, G3, 960, H - G3); c.fillStyle = K.paper; c.fillRect(960, G3 - 2, 960, 4);
    her(c, 'mf_gone', 1100, G3, P3);                              // r9: by the card's own measure (the stool 0.65 m, as his)
    her(c, pick(SHE3, kb), 1490, G3, P3);   // r9: 1560 -> 1490, her hair clear of 寂しい
    dayMark(c, days(21171, 182621, KC2, 363, kb), { x: 1032, edge: K.deep, size: 56, y: 1030 });
    c.restore();
    c.fillStyle = K.yellow; c.fillRect(xs - 3, 0, 6, H);           // the seam
  }
  // きっと 独りは: one column at the left of his half;  寂しい: at the right of hers (each half: the words on its outer third)
  // r9: the columns start under the arcs of the days (the sun's way never crosses a word: over x 70-230 / 1720-1860 the
  // arcs and the sun on them stay above y 180)
  column(c, L.c.slice(0, 3), T, 150, 190, 76, { font: 'Mincho X', color: K.paper });
  column(c, L.c.slice(3, 6), T, 150, 190 + 3 * 76 * 1.06 + 16, 148, { font: 'Mincho X', color: K.paper, shadow: K.navy, sd: 8, amt: 0.35 });
  column(c, L.c.slice(6), T, 1800, 200, 140, { font: 'Mincho X', color: K.yellow, shadow: K.deep, sd: 8, amt: 0.35 });
}

// ---------------------------------------------------------------- V4 - V6  one picture; the two days; the wall they are part of
// あの日: the day her bow was put on (BOW);  あの時: the first cup (TEA). The two are side by side on the wall.
const PAIR = [(TEA[0] + BOW[0]) / 2 * SHEET.TW, TEA[1] * SHEET.TH - 19], ZP = 2.45;   // at ZP the two sheets are each about half the frame
const ringOf = (i, j) => Math.floor(Math.min(Math.hypot(i - TEA[0], (j - TEA[1]) * 1.2), Math.hypot(i - BOW[0], (j - BOW[1]) * 1.2)) + 1e-6);
// the camera: the wall point A at the frame point S, at zoom z
function wallCam(kb) {
  let A = PAIR, S = [960, 420], z = ZP;
  if (kb < KE) z = ZP * (1 + 0.02 * clamp((kb - KD2) / 8));
  else if (kb < KF) {                                            // as the wall lights, the frame stops on the sheets near them, big enough to read: the two, the one above them, today below
    const P = [PAIR, PAIR, [-SHEET.TW / 2, -SHEET.TH - 19], [SHEET.TW / 2, SHEET.TH - 19], PAIR], ks = [KE, 377.5, 379.5, 381.5, 383.5];
    let q = 0; for (let i = 0; i < 4; i++) if (kb >= ks[i]) q = i; const e = smooth((kb - ks[q]) / 1.2);
    A = [mix(P[q][0], P[q + 1][0], e), mix(P[q][1], P[q + 1][1], e)]; z = mix(ZP * 1.02, 1.45, out3((kb - KE) / 1.5));
  }
  else { const e = smooth((kb - KF) / (KF2 - KF)); S = [960, mix(420, 330, e)]; z = Math.exp(mix(Math.log(1.45), Math.log(0.62), e)); }
  return anchor(A, S, z);
}
const isTea = (i, j) => i === TEA[0] && j === TEA[1], isBow = (i, j) => i === BOW[0] && j === BOW[1];
// r9: the day he held up his song (jsc_1: the score in his hands, she sings from it) - after the first cup (001501), long
// before 005475
function together(c, T, kb) {                                     // V4: そう - the seam goes; a warm day of the two of them, near
  c.fillStyle = K.paper; c.fillRect(0, 0, W, H); grid(c, K.navy, 40, 0.07);
  const z = 1 + 0.03 * clamp((kb - KD) / 2);
  c.save(); c.translate(1110, 500); c.scale(z, z); c.translate(-1110, -500); pairPhoto(c, 'jsc_1', 1110, 500, 1100, K.paper, 22); c.restore();   // r9: larger (at 0.98 of the card): their faces and the score fill it
  column(c, L.d.slice(0, 2), T, 260, 150, 240, { font: 'Mincho X', color: K.navy, shadow: K.yellow, sd: 10, lead: 1.04 });
  dayMark(c, '001600', { color: K.navy, edge: K.paper });         // the day of the song
}// the words of V6 as squares, on a band of their own across the frame (so they cover no one's face on the wall)
const tiles6 = (c, chars, T, colOf, k0) => {
  // r9 (v8): the band is as wide as the words sung so far (it grows to the right with each one), not the whole line from
  // the start; the line, when whole, is centred
  const Sz = 180, G = 16, x0 = W / 2 - 3 * (Sz + G) + G / 2, y = 900, bk = out5((kbOf(T) - k0) / 0.4);
  const grow = chars.slice(0, 6).reduce((a, ch) => a + out5((T - ch.t + 0.08) / 0.18) * (Sz + G), 0), bw = Math.max(Sz + 60, grow - G + 60), bx = x0 - 30;
  c.fillStyle = K.navy; c.fillRect(bx, 900 - 112 * bk, bw, 224 * bk); c.fillStyle = K.yellow; c.fillRect(bx, 900 - 112 * bk - 6, bw, 6 * bk); c.fillRect(bx, 900 + 112 * bk, bw, 6 * bk);
  chars.slice(0, 6).forEach((ch, n) => {
    const k = hit(T - ch.t, 0.22, 14); if (k <= 0) return;
    const [bg, fg] = colOf(ch, n);
    c.save(); c.translate(x0 + n * (Sz + G) + Sz / 2, y); c.scale(k, k);
    c.fillStyle = bg; c.fillRect(-Sz / 2, -Sz / 2, Sz, Sz);
    if (bg === K.navy) { c.strokeStyle = K.yellow; c.lineWidth = 5; c.strokeRect(-Sz / 2 + 2.5, -Sz / 2 + 2.5, Sz - 5, Sz - 5); }
    text(c, ch.c, 0, 10, 140, { font: 'Dela', color: fg, align: 'center', base: 'middle' });
    c.restore();
  });
};
function wall(c, T, kb) {                                        // V5, V6
  const [x, y, z] = wallCam(kb), lit = (i, j) => kb >= KE + 2 * ringOf(i, j);
  const bowOn = kb >= KD2, teaOn = kb >= KD3;                    // あの日: the bow's sheet lights; あの時: the cup's
  const shown = (i, j) => (bowOn && isBow(i, j)) || (teaOn && isTea(i, j)) || (kb >= KE && lit(i, j));
  // what is in the two sheets, a drawing a beat: the hands bring the bow down onto her head, and let go; she holds the cup out, he has it and smiles
  const tie = card('kv_tie') === 'kv_tie', bow = kb < 369.5 ? (tie ? 'kv_tie' : 'bx_0') : kb < 373 ? 'bx_1' : 'bx_o', tea = kb < 373 ? 'jt_1' : 'jt_2';   // he ties it (a15); nearer: his hands on it; they let go
  // r9 (v8b): the sheets the band of words lies over show their record side - the band covers no one's face
  const BX0 = W / 2 - 3 * 196 + 8 - 30, BAND = [BX0, 900 - 118, BX0 + 6 * 196 - 16 + 60, 900 + 118];
  const blank = (a, b, cc, d) => kb >= KE && cc > BAND[0] && a < BAND[2] && d > BAND[1] && b < BAND[3];
  sheets(c, 400, x, y, z, 241, kb >= KE ? lit : null, { dark: (i, j) => !shown(i, j), ring: (i, j) => kb < KE + 2 && ((bowOn && isBow(i, j)) || (teaOn && isTea(i, j))), bow, tea, blank });   // no turning here: every sheet in the frame is a different day
  if (kb < KE + 0.5) {                                            // あの日 under the bow's sheet, あの時 under the cup's
    const out = clamp((kb - KE) / 0.5);
    c.save(); c.globalAlpha = 1 - out;
    row(c, L.d.slice(3, 6), T, 330, 900, 150, { font: 'Mincho X', color: K.paper, shadow: K.blue, sd: 8 });
    row(c, L.d.slice(7), T, 1260, 900, 150, { font: 'Mincho X', color: K.paper, shadow: K.blue, sd: 8 });
    c.restore();
  }
  if (kb >= KE && kb < KF) tiles6(c, L.e, T, () => [K.white, K.navy], 375.6);
  if (kb >= KF) tiles6(c, L.f.filter(q => !'「」'.includes(q.c)).slice(0, 6), T, q => 'ココロ'.includes(q.c) ? [K.navy, K.yellow] : q.c === 'が' ? [K.white, K.navy] : [K.teal, K.white], 0);
}
// ---------------------------------------------------------------- V7  溢れ出す
// r11 (P4): redrawn. The sheets of the wall go into the empty ring in her chest (she holds it, ov_hold), and on 出 they
// pour out of it (ov_burst, the wind loop): verse2_overflow.js. (The round stage and up_a -> up_b -> up0 are gone: they
// were the finale's opening pose.)
function flood(c, T, kb) { drawOverflow(c, T, kb, L.f.slice(-4)); }
export function draw(c, t) {
  const T = t + start, kb = kbOf(T);
  if (kb < KB) nowShot(c, T); else if (kb < KC) rollPage(c, T, kb); else if (kb < KD) halves(c, T, kb);
  else if (kb < KD2) together(c, T, kb); else if (kb < KF2) wall(c, T, kb); else flood(c, T, kb);
}
