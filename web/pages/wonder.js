// After the first chorus (122.88 - 162.95 s): what the heart brings with it is every day he spent with her.
//   The frame is a wall of the sheets of his record: each turns over, from its 失敗 to the day it was, and keeps turning.
//   (interlude) On every bar line one day is pulled out of the wall and held up, large: the things she did for him, one
//     to a sheet - she swept while he drew; a blanket when he fell asleep at the desk; the first cup of tea; she sang his
//     song; a flower; a pot of soup; the last cup; and the stool, empty. Half a bar in, it moves.
//   フシギ ココロ ココロ フシギ, three times, each its own way, and she is there beside the words, wondering:
//     1  two rows of squares, a square a syllable (behind them the wall runs into one sheet);
//     2  the same words as a stack of four (and again into a sheet);
//     3  the wall's own sheets turn and ARE the words; ムゲン: and the wall goes on for ever.
//   私は知った 喜ぶ事を: the sheet IS the day - she holds a cup out to him; on 喜, years on: the cup is in his hand, and
//     there is a flower where her heart will be.
//   私は知った 悲しむ事を: his last day; on 悲 the stool is empty, and she lowers the tray and looks at it.
//   なんて深く切ない: she, in front of all of them: her hand on her heart; she looks up; on 切, close: crying.
//   Then the wall, near, one sheet of it lit: today, DAY 182621, she reading his last sheet. Into it: verse2 begins
//     inside that sheet (nowShot draws both).
// Sheets that are not the point are drawn flat - navy, their pictures as blue shapes - never dimmed by a veil.
// Beats: 20.016 + k * 0.42858 s; bars at k = 0 mod 4.
import { W, H, K, clamp, mix, smooth, out3, out5, rnd, hit, img, pic, fig, tint, lyrics, line, row, column, text, grid, dayMark } from './kit.js';
import { drawReport } from './report.js';
export const name = 'wonder';
const T0B = 20.016, PB = 0.42858, kt = k => T0B + k * PB, kbOf = T => (T - T0B) / PB;
export const start = kt(240);
export const duration = kt(333.5) - start;
const PXM = 600, TW = 380, TH = 290;                             // pixels a metre in the scenes; the wall's pitch
export let V2 = null;
const grp = n => n.split('_')[0].replace(/\d+$/, '');
// the drawings that may not be there yet (set wm is being drawn): until a card is there, tw0 stands in
const HAVE = new Set();
// drawings on their way (a11): until they are there, the nearest drawing we have stands in
const ALT = { fs_1: 'cb_down', fs_2: 'cb0', fs_3: 'cb_up', pg_3: 'th0' };
export const card = n => HAVE.has(n) ? n : ALT[n] && HAVE.has(ALT[n]) ? ALT[n] : 'tw0';
export async function load(n) { if (HAVE.has(n)) return; if (!V2[grp(n)]) return; try { await img(n); HAVE.add(n); } catch (e) { /* not drawn yet */ } }
export const hM = n => V2[grp(card(n))].h;
// her (or any standing card): the middle of her feet on (x, y), ppm pixels a metre. o.flip: mirrored; o.sil: drawn as one
// flat colour. o.at: put that one of the card's feet (its ground list) on x, not their middle (r9: the stool's far
// foot - the drawings of a set differ in where the desk and her feet are, never in where the stool is). Returns the card's placing: card pixel (u, v) is at (x0 + u * s, y0 + v * s)
export function her(c, n, x, y, ppm, o = {}) {
  n = card(n); const g = V2[grp(n)], gr = g.ground?.[n], mid = gr && gr.length ? (o.at != null ? gr[o.at] : gr.reduce((a, b) => a + b, 0) / gr.length) : 0, im = pic(n);
  const h = g.h * ppm, w = im.width * h / im.height, fx = x - mid * ppm * (o.flip ? -1 : 1), fy = y + (g.low?.[n] ?? 0) * ppm;
  fig(c, o.sil ? tint(n, o.sil) : n, fx, fy, h, { flip: o.flip });
  return { x0: fx - w / 2, y0: fy - h, s: h / im.height };
}
// him on his stool, the middle of the stool's feet on (x, y) (r9: set mf redrawn - by its own measure: its two ground
// entries are the stool's feet)
const seated = (c, n, x, y, ppm, o = {}) => her(c, n, x, y, ppm, o);
// the days on the sheets of the wall: [drawing, the day, its width on the sheet (px; default by its shape), how far up]
// He is young only up to 004502. r8 (R1): the wall is the days she spent with him - his ages are not on it in a row: of
// his drawings on his stool only the young one (mf0); the two of them together (jf_1, hc_tea, kv_pat; each once on the wall - r9: jb_1 out, the
// blanket is the sheet SONG, jb_2).
// r9: of him at his desk one drawing only (lb0: the wall repeats every 39 sheets, so at most two in any view, never side
// by side); the rest are days with her
// (jdc_2: he ties her scarf; jsc_1: she sings his song; jdc_1: he teaches her to write - in glasses, so in his thirties)
// and her days after him (ep_sing on his stool, ep_carry, ep_sweep)
// r10 (C4): set th is wider now (1216 -> 1276 px, ax 0.241 -> 0.262): th_1 / th_p 294 wide, -72 (were 280, -66) - she is as large and where she was
const PICS = [['lb0', 1, 330, 0], ['jdc_2', 6800, 330], ['jsc_1', 1600, 330, 6], ['jdc_1', 8400, 330], ['ep_sing', 40000, 280, 0, -40], ['ep_carry', 30000, 260, 0, -20], ['ep_sweep', 25000, 260, 0, -20],
  ['op_o', 1461, 200, 62], ['hi0', 1462, 150], ['wm_broom', 1463, 240, 0, -64], ['tk0', 1465, 150], ['kv_pat', 1464, 320], ['wm_blanket', 1483, 240, 0, -64], ['mf0', 1500, 221], ['hc_tea', 1501, 330, -40], ['tf_pour', 4600, 150],
  ['wm_sing', 5476, 240, 0, -64], ['sv0', 5800, 130], ['tf_offer', 6200, 150], ['tw_off', 7300, 150], ['th_1', 8000, 294, 0, -72],
  ['jf_1', 9120, 320], ['tw_fl', 9126, 150], ['tf_see', 9490, 150], ['tf_done', 9491, 150], ['ts_put', 10950, 330, 0, 10], ['tq0', 11000, 150], ['wm_pot', 12000, 240, 0, -64], ['tk_l', 13500, 150],
  ['tw0', 18000, 150], ['ts_up', 19000, 330, 0, -100], ['mf_gone', 21170, 150, 128], ['wm_low', 21171, 240, 0, -64], ['tq_up', 21172, 150], ['ts0', 22000, 330, 0, -100],
  ['tk_r', 50000, 150], ['th_p', 90000, 294, 0, -72], ['tf0', 120000, 150], ['tk_h', 150000, 150]];
// fixed sheets. TEA: the first cup. OLD: his last day (r8: their hands round his last cup, hc_last - not the old man, mf_78,
// whose scene is ages.js). SONG: (r8) the blanket, the two of them (jb_2) - not his ages. BOW: the day her bow was put on,
// beside TEA. NOW: today; the page ends in it, verse2 begins in it.
export const TEA = [0, 0], OLD = [1, 0], SONG = [-2, 0], BOW = [-1, 0], NOW = [0, 1];   // BOW beside TEA: verse2's あの日 / あの時
const FIXED = { [TEA]: { tea: true, day: 1501 }, [OLD]: { close: 'hc_last', day: 21169 },
  [SONG]: { two: 'jb_2', day: 1483 }, [BOW]: { bow: 'bx_1', day: 1460 }, [NOW]: { now: true, day: 182621 } };
// which day a sheet shows: no day twice in any window of 4 x 3 sheets
const NP = PICS.length, base = (i, j) => (((i + 8 * j + 20) % NP) + NP) % NP;   // any 8 x 5 window of the wall: 40 different days
const picAt = (i, j, g = 0) => PICS[(((base(i, j) + 5 * g) % NP) + NP) % NP];
// the centre of a sheet's picture, in the wall's pixels; the zoom at which the picture is exactly the frame's width
export const picCentre = ([i, j]) => [i * TW, j * TH - 19];
export const ZFULL = W / 340;
let LN = [], LNOW = [];
export async function prepare() {
  const all = await lyrics();
  V2 = await (await fetch('data/cards/v2.json?' + Date.now())).json();
  LN = all.filter(l => l.t0 > 136 && l.t0 < 158).map(l => l.chars.filter(ch => ch.c.trim() && ch.c !== '　'));   // フシギ, 私は知った 喜ぶ, フシギ, 私は知った, 悲しむ, フシギ…ムゲン, なんて
  LNOW = line('今　気付き始めた');
  for (const p of PICS) await load(p[0]);
  for (const n of ['tw0', 'tw_off', 'tw_fl', 'tw_c1', 'tf_pour', 'tf_offer', 'sv0', 'mf0', 'mf_30', 'mf_45', 'mf_65', 'mf_78', 'me_gone', 'mf_gone',
    'lb0', 'lb_1s', 'lb_4', 'lb_2', 'lb_3', 'lb_5', 'cb_down', 'cb_up', 'cb0', 'cb_12', 'bd_a', 'pg_1', 'pg_2', 'th0', 'pg0', 'bx_1',
    'wm_broom', 'wm_blanket', 'wm_off', 'wm_sing', 'wm_pot', 'wm_low', 'fs_1', 'fs_2', 'fs_3', 'pg_3', 'en_n', 'en_nc', 'cb_12', 'jb_1', 'jb_2', 'jt_1', 'jt_2', 'jf_1', 'jf_2', 'hc_tea', 'hc_last', 'jbc_1', 'jfc_1', 'kv_tie', 'bx_0', 'bx_01']) await load(n);
}

// ---------------------------------------------------------------- the pictures
// a day, the whole frame: him on his stool (or at his desk), her beside him. tone: 'warm' (paper, the light in the room),
// 'blue', 'deep'. o.dx: she is that far further off; o.sil: everything as flat shapes (a sheet not looked at).
// Everything is drawn well past the frame's edges, so that the picture can be set into a sheet of any shape.
// the drawings of the two of them (a12): where, in the card's pixels, the stool's feet are (centre x, foot line y);
// set so that the stool stands where he sits in scene() (x 640) on its ground line (y 1002). (Their ground data mixes desk,
// stool and her shoes: not used.)
// r9 (redrawn, measured on the cards): the middle of the stool's two feet and the feet's foot. jb is wider now - the
// desk is in it, left of him: its stool stands further right (dx) so that desk, him and her sit in the middle of the frame.
const PAIRS = { jb_1: [525, 903, 300], jb_2: [525, 903, 300], jt_1: [194, 907], jt_2: [197, 906], jf_1: [202, 906], jf_2: [200, 905] };
function pairCard(c, n, sil) {
  const im = pic(n), s = V2[grp(n)].h * PXM / im.height, [fx, fy, dx = 0] = PAIRS[n];
  c.drawImage(sil ? tint(n, sil) : im, 640 + dx - fx * s, 1002 - fy * s, im.width * s, im.height * s);
}
export function scene(c, he, she, tone, o = {}) {
  const warm = tone === true || tone === 'warm', sil = o.sil ? K.blue : null;
  c.fillStyle = sil ? K.navy : warm ? K.paper : tone === 'blue' ? K.blue : K.deep; c.fillRect(-W, -H, 3 * W, 3 * H);
  if (warm && !sil && !o.plain) { c.fillStyle = K.yellow; c.beginPath(); c.moveTo(1050 + 0.35 * 1200, -1200); c.lineTo(1500 + 0.35 * 1200, -1200); c.lineTo(1150, 1000); c.lineTo(700, 1000); c.fill(); }
  c.fillStyle = sil ? K.deep : warm ? K.white : tone === 'blue' ? K.deep : K.navy; c.fillRect(-W, 1000, 3 * W, 2 * H);
  c.fillStyle = sil ? K.blue : K.navy; c.fillRect(-W, 996, 3 * W, 6);
  if (o.pair) { pairCard(c, o.pair, sil); return; }                       // a drawing of the two of them together (a12)
  if (he && he.startsWith('lb')) her(c, he, o.heX ?? 990, 1002, PXM, { flip: true, sil, at: 0 });      // at his desk, his back to her (the stool's far foot on heX)
  else if (he) seated(c, he, o.heX ?? 640, 1002, PXM, { sil });
  if (she) her(c, she, (o.sheX ?? 1180) + (o.dx ?? 0), 1002, PXM, { sil });
}
// the plate the day is counted on (as the other pages have it, kept clear of the frame's edges)
// the DAY: the one way of the whole film (kit.js dayMark); edge: the ground it stands on
export const dayPlate = (c, s, edge = K.navy, color = K.yellow) => dayMark(c, s, { edge, color });
// a word with an edge of the ground behind it (no block under it)
function edged(c, s, x, y, size, o = {}) {
  c.save(); c.font = `400 ${size}px \"${o.font ?? 'Gothic X'}\"`; c.textAlign = o.align ?? 'left'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
  c.strokeStyle = o.edge ?? K.navy; c.lineWidth = size * 0.18; c.strokeText(s, x, y); c.fillStyle = o.color ?? K.paper; c.fillText(s, x, y); c.restore();
}
// TODAY, the first picture of verse2: on her own page she reads his last sheet; on 今 she lifts it nearer; she reads on;
// on 始 she holds it to her heart.  今 気付き始めた   (verse2.js draws it for its first ten beats; the wall's sheet NOW
// shows its first frame)
const NOWSEQ = [[0, 'pg_1'], [334, 'pg_2'], [337, 'pg_1'], [339, 'pg_3']];
export function nowShot(c, T, o = {}) {
  const kb = kbOf(T); let n = NOWSEQ[0][1]; for (const [k, v] of NOWSEQ) if (kb >= k - 1e-6) n = v;
  c.fillStyle = K.paper; c.fillRect(-W, -H, 3 * W, 3 * H);
  // three framings: her reading (as the wall's card has her); on 今 the sheet itself, near; on 気付き her face, near, in
  // tears; on 始 back to all of her upper body, the sheet held to her chest
  if (kb >= 334 && kb < 339) {
    grid(c, K.navy, 40, 0.07);
    if (kb < 335.5) sheetNear(c, kb);
    else { const nf = card('en_n'), im = pic(nf),   // r8 (R2): one drawing (en_nc was held one beat)
      z = 1 + 0.03 * clamp((kb - 335.5) / 3.5); c.save(); c.translate(1330, 600); c.scale(z, z); c.translate(-1330, -600); fig(c, nf, 1330, 130 + im.height, im.height); c.restore(); }
    nowWords(c, T, o); return;
  }
  const z = 1 + 0.05 * smooth(clamp((kb - 333.5) / 10));                       // the camera goes slowly in on her
  c.save(); c.translate(1300, 500); c.scale(z, z); c.translate(-1300, -500);
  grid(c, K.navy, 40, 0.07);
  her(c, n, 1300, 95 + 1.609 * 1200, 1200);                           // cut at the hips: head and bow in, the hands and the sheet in
  // (the report on the paper is in the drawing itself (a2): nothing is laid on the card)
  c.restore();
  nowWords(c, T, o);
}
// his last sheet, near: THE sheet (report.js, the canon art/canon/prop_report.png), 結果 empty, a little tilted, its
// shadow in navy under it
function sheetNear(c, kb) {
  const z = 1 + 0.04 * clamp((kb - 334) / 1.5);
  c.save(); c.translate(1300, 520); c.rotate(-0.05); c.scale(z, z);
  const w = 640, h = w * 1.414;
  c.fillStyle = K.navy; c.fillRect(-w / 2 + 18, -h / 2 + 22, w, h);
  drawReport(c, -w / 2, -h / 2, w, {});
  c.restore();
}
function nowWords(c, T, o = {}) {
  const k0 = hit(T - LNOW[0].t, 0.3, 12);
  if (k0 > 0) { c.save(); c.translate(380, 360); c.scale(k0, k0); text(c, '今', 14, 14, 540, { font: 'Mincho X', color: K.yellow, align: 'center', base: 'middle' }); text(c, '今', 0, 0, 540, { font: 'Mincho X', color: K.navy, align: 'center', base: 'middle' }); c.restore(); }
  row(c, LNOW.slice(1), T, 96, 790, 138, { font: 'Mincho X', color: K.navy, track: 4 });
  if (!o.noDay) dayPlate(c, '182621', K.paper, K.navy);
}

// ---------------------------------------------------------------- the wall
// one sheet of the wall, centred on (0, 0).  f: 0 its 失敗 side .. 1 the day.  o.g: which day (it changes as the wall
// keeps turning), o.f2: 0..1 turning to the next day,  o.word + o.wf: turning to a character of the song.
// o.dark: the sheet is not the point - navy, its lines and its picture in flat blue (no veil over its colours)
const SW = 356, SHh = 266;
function tile(c, i, j, f, lit, o = {}) {
  const w = SW, h = SHh, g = o.g ?? 0, f2 = o.f2 ?? 0, wf = o.word ? o.wf : 0, fx = FIXED[[i, j]], dk = !!o.dark;
  const sx = Math.abs(Math.cos((wf > 0 ? wf : f2 > 0 ? f2 : f) * Math.PI));
  c.save(); c.scale(Math.max(0.02, sx), 1);
  if (o.blank && !o.dark && wf < 0.5 && f >= 0.5) {                                   // r9: a sheet behind the words: its record side, no one on it
    c.fillStyle = K.white; c.fillRect(-w / 2, -h / 2, w, h); c.strokeStyle = K.blue; c.lineWidth = 3; c.strokeRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);
    c.fillStyle = K.blue; c.fillRect(-w / 2 + 8, -h / 2 + 8, w - 16, 30); for (let q = 0; q < 5; q++) c.fillRect(-w / 2 + 26, -h / 2 + 66 + q * 34, q % 2 ? 150 : 260, 12);
    c.restore(); return;
  }
  if (wf >= 0.5) {                                                          // a character of the song
    c.fillStyle = K.white; c.fillRect(-w / 2, -h / 2, w, h); c.fillStyle = o.word.bg; c.fillRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);
    text(c, o.word.c, 0, 12, 190, { font: 'Dela', color: o.word.fg, align: 'center', base: 'middle' });
    c.restore(); return;
  }
  const ink = dk ? K.blue : K.navy;
  c.fillStyle = dk ? K.deep : K.white; c.fillRect(-w / 2, -h / 2, w, h);
  if (f < 0.5) {
    c.strokeStyle = K.blue; c.lineWidth = 3; c.strokeRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16); c.fillStyle = K.blue; c.fillRect(-w / 2 + 8, -h / 2 + 8, w - 16, 30);
    for (let q = 0; q < 4; q++) { c.fillStyle = K.blue; c.fillRect(-w / 2 + 26, -h / 2 + 66 + q * 34, q % 2 ? 150 : 240, 12); }
    const st = dk ? K.blue : K.red;
    c.save(); c.translate(86, 60); c.rotate(-0.12); c.strokeStyle = st; c.lineWidth = 5; c.strokeRect(-62, -34, 124, 68); text(c, '失敗', 0, 2, 44, { font: 'Mincho X', color: st, align: 'center', base: 'middle' }); c.restore();
  } else {
    const px = -w / 2 + 8, py = -h / 2 + 8, pw = w - 16, ph = h - 54;
    c.fillStyle = dk ? K.navy : lit ? K.yellow : K.blue; c.fillRect(px, py, pw, ph);
    c.save(); c.beginPath(); c.rect(px, py, pw, ph); c.clip();
    let day;
    if (fx) {
      day = fx.day;
      if (fx.pair || fx.now || fx.tea || fx.two) {                                              // the whole frame, set into the sheet at its width
        c.translate(0, py + ph / 2); c.scale(pw / W, pw / W); c.translate(-W / 2, -H / 2);
        if (fx.tea || fx.two) scene(c, null, null, 'warm', { pair: fx.two ?? o.tea ?? 'jt_1', sil: dk, plain: true });          // the first cup: the two of them, drawn together (a12)
        else if (fx.pair) scene(c, fx.pair[0], fx.pair[1], fx.pair[2], { sil: dk });
        else if (dk) { c.fillStyle = K.navy; c.fillRect(-W, -H, 3 * W, 3 * H); her(c, 'pg_1', 1300, 95 + 1.609 * 1200, 1200, { sil: K.blue }); }
        else nowShot(c, kt(333.5), { noDay: true });   // r9 (v8): on the wall the day is on the caption, as on every sheet
      } else {                                                              // the hands, the bow, her face and her shoulders
        const n = fx.close ?? o.bow ?? fx.bow, im = pic(n), wide = im.width > im.height, hh = wide ? ph : ph / 0.92, ww = im.width * hh / im.height;   // r9 (v8): a wide drawing is shown whole in height (kv_tie: his raised hands and her bow were cut)   // the card's foot (her shoulders) on the picture's foot; a wide drawing covers the picture
        if (!dk) { c.fillStyle = K.blue; c.fillRect(px, py, pw, ph); }
        c.drawImage(dk ? tint(n, K.blue) : im, -ww / 2, py + ph - hh, ww, hh);
      }
    } else {
      const p = picAt(i, j, f2 >= 0.5 ? g + 1 : g); day = p[1];
      const im = pic(p[0]), fw = im ? p[2] ?? Math.min(w * 0.72, im.width / im.height * 520) : 0, fh = im ? fw * im.height / im.width : 0;
      if (im) c.drawImage(dk ? tint(p[0], K.blue) : im, -fw / 2 + (p[4] ?? 0), -h / 2 + 18 - (p[3] ?? 0), fw, fh);
    }
    c.restore();
    if (!dk) text(c, 'DAY ' + String(day).padStart(6, '0'), -w / 2 + 14, h / 2 - 14, 26, { color: ink, track: 2 });   // the photo's caption (the dark sheets keep none; today's sheet carries its own)
  }
  c.restore();
}
// a sheet of the wall on its own (verse2: the sheets that fly), centred on (0, 0) at zoom 1; any (i, j)
export const sheetCard = (c, i, j, lit = true) => tile(c, i, j, 1, lit);
// The wall, seen at zoom z centred on (cx, cy) in its own pixels. A sheet turns from 失敗 to its day when the wave from
// the middle reaches it, landing ON a beat.  lit(i, j): its ground is yellow.
// o.live: the beat now - the wall keeps turning (each sheet to another day every eight beats, an eighth of them a beat).
// o.words: Map "i,j" -> { c, t, bg, fg }: these sheets turn to a character at time t (o.T: the time now).
// o.dark(i, j): true: the sheet is drawn flat and dark;  o.big(i, j): a scale (> 1: drawn last, over the others);
// o.ring(i, j): true: a yellow frame round it;  o.bow: the drawing on the sheet BOW
let OFF = null;
export function sheets(c0, kb, cx, cy, z, kFlip0 = 241, lit = null, o = {}) {
  // very small sheets are drawn twice the size and brought down: they do not shimmer as the wall moves
  const sup = z < 0.42; if (sup && !OFF) { OFF = document.createElement('canvas'); OFF.width = W * 2; OFF.height = H * 2; }
  const c = sup ? OFF.getContext('2d') : c0, q = sup ? 2 : 1;
  c.save(); c.setTransform(q, 0, 0, q, 0, 0);
  c.fillStyle = K.navy; c.fillRect(0, 0, W, H);
  const i0 = Math.floor((cx - W / 2 / z) / TW) - 1, i1 = Math.ceil((cx + W / 2 / z) / TW) + 1, j0 = Math.floor((cy - H / 2 / z) / TH) - 1, j1 = Math.ceil((cy + H / 2 / z) / TH) + 1;
  c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-cx, -cy);
  const late = [];
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const d = Math.hypot(i, j * 1.2) + rnd(i * 3.3 + j * 9.1) * 0.8, kEnd = Math.ceil(kFlip0 + d * 2.6 + 0.9), f = clamp((kb - (kEnd - 0.9)) / 0.9);
    let pop = kb >= kEnd ? 1 + 0.07 * Math.exp(-(kb - kEnd) * PB * 14) : 1; const t = {};
    if (o.live != null && !FIXED[[i, j]] && o.live > kEnd + 3) {
      const ph = (((i * 5 + j * 3) % 8) + 8) % 8, n = Math.floor((o.live - ph + 0.9) / 8), kc = ph + 8 * n, a = o.live - (kc - 0.9);      // it has turned ON beat kc
      if (kc > kEnd + 3) { if (a < 0.9) { t.g = n - 1; t.f2 = clamp(a / 0.9); } else { t.g = n; pop = 1 + 0.07 * Math.exp(-(a - 0.9) * PB * 14); } }
    }
    const wd = o.words?.get(i + ',' + j);
    if (wd) { t.word = wd; t.wf = clamp((o.T - (wd.t - 0.16)) / 0.16); if (t.wf >= 1) pop = 1 + 0.12 * Math.exp(-(o.T - wd.t) * 12); }
    if (o.bow && FIXED[[i, j]]?.bow) t.bow = o.bow;
    if (o.tea && FIXED[[i, j]]?.tea) t.tea = o.tea;
    t.dark = o.dark ? o.dark(i, j) : false;
    if (o.blank) { const sx = W / 2 + (i * TW - cx) * z, sy = H / 2 + (j * TH - cy) * z; t.blank = o.blank(sx - SW / 2 * z, sy - SHh / 2 * z, sx + SW / 2 * z, sy + SHh / 2 * z); }
    const big = o.big ? o.big(i, j) : 1, ring = o.ring && o.ring(i, j);
    const one = () => {
      c.save(); c.translate(i * TW, j * TH); c.scale(pop * big, pop * big); tile(c, i, j, f, lit ? lit(i, j) : false, t);
      if (ring) { c.strokeStyle = K.yellow; c.lineWidth = 6; c.strokeRect(-SW / 2 - 6, -SHh / 2 - 6, SW + 12, SHh + 12); }
      c.restore();
    };
    if (big !== 1 || ring) late.push(one); else one();
  }
  for (const f of late) f();
  c.restore();
  if (sup) { c0.save(); c0.imageSmoothingQuality = 'high'; c0.drawImage(OFF, 0, 0, W, H); c0.restore(); }
}
const ALL = () => true;
// a camera that takes the wall from (c0, z0) to the point p at zoom z1, keeping p's way across the frame straight:
// e is how far (0..1) the frame has gone; zoom is interpolated in its logarithm
export function into(p, c0, z0, z1, e, ez = e) {
  const z = Math.exp(mix(Math.log(z0), Math.log(z1), ez)), s = [(p[0] - c0[0]) * z0 * (1 - e), (p[1] - c0[1]) * z0 * (1 - e)];
  return [p[0] - s[0] / z, p[1] - s[1] / z, z];
}
// the camera that puts the wall's point A at the frame's point S, at zoom z
export const anchor = (A, S, z) => [A[0] - (S[0] - W / 2) / z, A[1] - (S[1] - H / 2) / z, z];
export const SHEET = { TW, TH };

// ---------------------------------------------------------------- the interlude: what she did for him, one a bar
// he / heB: his drawing for the first half of the bar and from its middle on; a / b: hers. dx: she is still that far
// off. word: what it is, set on the plate.
// r8: only his young days (he grows old only on the ages page). Each day is a few drawings, each held two beats or more,
// none coming back: shots [beat in the page, { he, she | pair | close, zoom: [scale, x, y] }]
const DAYS = [                                                   // k: its first beat; dur: beats
  { k: 240, dur: 7, day: 1463, word: '掃除', shots: [[0, { he: 'lb_1s', she: 'wm_broom', zoom: [0.92, 830, 500] }], [3, { he: 'lb_4', she: 'wm_broom', zoom: [0.92, 830, 500] }],   // r9: a little wider (lb redrawn: his hair met the frame)
      // he draws while she sweeps (not verse2's lb0 / lb_look);
    [5, { he: 'lb_2', she: 'wm_broom', zoom: [1.6, 930, 350] }]] },                                                                  // nearer: he yawns
  { k: 247, dur: 8, day: 1483, word: '毛布', shots: [[0, { pair: 'jb_1' }], [3, { pair: 'jb_2' }], [5, { close: 'jbc_1' }]] },   // asleep: she spreads the blanket; it is on him; near: her hand on his shoulder
  { k: 255, dur: 10, day: 1501, word: '初めてのお茶', shots: [[0, { pair: 'jt_1' }], [3, { close: 'hc_tea' }], [6, { pair: 'jt_2' }], [8, { pair: 'jt_2', zoom: [1.06, 880, 525] }]] },   // she holds it out; the cup into his hand; he smiles; nearer
  { k: 265, dur: 7, day: 21170, tone: 'deep', word: '空席', shots: [[0, { he: 'mf_gone', she: 'wm_off', sheX: 1010 }], [3.5, { he: 'mf_gone', she: 'wm_off', sheX: 1010, zoom: [1.08, 830, 520] }]] }];   // years on, in one cut: she holds the cup out to the empty stool
const shotAt = (P, a) => { let q = 0; for (let i = 0; i < P.shots.length; i++) if (a >= P.shots[i][0] - 1e-6) q = i; return q; };
const dayAt = kb => { let n = 0; for (let i = 0; i < DAYS.length; i++) if (kb >= DAYS[i].k - 1e-6) n = i; return n; };
function dayPage(c, P, n, kb, zWall, day) {
  const a = kb - P.k, D = P.dur; if (a < 0 || a >= D) return;
  const PW = P.solo ? 760 : 1160, PH = P.solo ? 860 : 830, inn = n === 0 ? 1 : out5(a / 0.45), back = clamp((a - (D - 0.5)) / 0.5) ** 2;
  const s0 = clamp(SW * zWall / PW, 0.2, 0.9), sc = mix(s0, 1, inn) * mix(1, s0, back) * (1 + 0.03 * clamp(a / (D - 0.5)));
  const side = n % 2 ? 1 : -1, cx = 960 + side * 40 - side * 24 * clamp(a / (D - 0.5)), cy = 450 - 10 * clamp(a / (D - 0.5));
  c.save(); c.translate(cx, cy); c.scale(sc, sc);
  c.fillStyle = K.navy; c.fillRect(-PW / 2 + 20, -PH / 2 + 24, PW, PH);                // its shadow on the wall
  c.fillStyle = K.white; c.fillRect(-PW / 2, -PH / 2, PW, PH);
  const S = P.shots[shotAt(P, a)][1], px = -PW / 2 + 16, py = -PH / 2 + 16, pw = PW - 32, ph = PH - 16 - 76;
  c.save(); c.beginPath(); c.rect(px, py, pw, ph); c.clip();
  {                                                                        // the two of them, as the scenes have them; some shots cut in nearer
    const s = Math.max(pw / W, ph / H); c.translate(px + pw / 2, py + ph / 2); c.scale(s, s);
    const zb = S.zoom;
    if (zb) { c.scale(zb[0], zb[0]); c.translate(-zb[1], -zb[2]); } else c.translate(-905, -H / 2);
    scene(c, S.he, S.she, P.tone ?? 'blue', { pair: S.pair ?? null, sheX: S.sheX });
  }
  c.restore();
  text(c, 'DAY ' + String(P.day).padStart(6, '0'), -PW / 2 + 28, PH / 2 - 24, 40, { color: K.navy, track: 3 });   // the photo's own date (only the counter rolls)
  c.restore();
}
function interlude(c, kb) {
  const u = clamp((kb - 240) / 32), z = mix(2.3, 1.0, smooth(u));
  sheets(c, kb, TW / 2, 0, z, 241, null, { live: kb, dark: ALL });
  const n = dayAt(kb), P = DAYS[n];
  // the day rolls on to this sheet's as the sheet comes out of the wall, the plate and the sheet's own label together
  // (the young days roll on; the empty stool, years later, comes in one cut)
  const day = n && P.day - DAYS[n - 1].day < 1000 ? Math.round(mix(DAYS[n - 1].day, P.day, out3((kb - P.k) / 0.45))) : P.day;
  const ca = kb - P.k, qs = shotAt(P, ca), sh = P.shots[qs], cl = sh[1].close ? [sh[0], P.shots[qs + 1]?.[0] ?? P.dur, sh[1].close] : null;
  if (!cl) dayPage(c, P, n, kb, z, day);
  // a close-up, the whole frame (its lines are heavier than the full figures': never beside them)
  if (cl) {
    // at its own size (never enlarged), in a sheet larger than the others; the last cup's mouth is cut off
    const im = pic(cl[2]), last = cl[2] === 'hc_last', hc = cl[2].startsWith('hc'), cut = last ? 110 : hc ? 30 : 0, pw = im.width, ph = im.height - cut - (hc && !last ? 30 : 0), fx = W / 2, fy = 450;
    const fit = Math.min(1, 800 / ph, 1720 / pw), k0 = out5((ca - cl[0]) / 0.3), sc = fit * mix(0.85, 1, k0) * (1 - 0.02 * clamp((ca - cl[0]) / 3));
    c.save(); c.translate(fx, fy); c.scale(sc, sc);
    c.fillStyle = K.navy; c.fillRect(-pw / 2 - 16 + 22, -ph / 2 - 16 + 26, pw + 32, ph + 32); c.fillStyle = K.white; c.fillRect(-pw / 2 - 16, -ph / 2 - 16, pw + 32, ph + 32);
    c.beginPath(); c.rect(-pw / 2, -ph / 2, pw, ph); c.clip(); c.fillStyle = K.blue; c.fillRect(-pw / 2, -ph / 2, pw, ph); c.drawImage(im, -pw / 2, -ph / 2 - cut, im.width, im.height); c.restore();
  }
  dayPlate(c, String(day).padStart(6, '0'));
  const kw = hit(kb - P.k, 0.15, 6);
  c.save(); c.translate(1848, 1008); c.scale(kw, kw); edged(c, P.word, 0, 0, 64, { align: 'right' }); c.restore();
}
// ---------------------------------------------------------------- the rest
// she, all of her, beside the words: standing on a ground line, changing every two beats
function wondering(c, kb, x, seq) {
  let n = seq[0][1]; for (const [k, v] of seq) if (kb >= k - 1e-6) n = v;
  c.fillStyle = K.navy; c.fillRect(0, 1030, W, 50); c.fillStyle = K.blue; c.fillRect(0, 1028, W, 4);
  return her(c, n, x, 1032, 596);
}
// the line of the song as squares over the wall, a square a syllable, beside her (x0: the left edge of the block).
// mode 0: two rows of six;  1: a stack of four words.  out: 0..1 the squares going (before the cut into a day)
function squares(c, chars, T, mode, x0, out = 0) {
  const S = mode ? 222 : 196, G = mode ? 12 : 12, nc = mode ? 3 : 6, nr = mode ? 4 : 2;
  const y0 = H / 2 - nr / 2 * (S + G) + G / 2 - (mode ? 8 : 20);
  chars.slice(0, 12).forEach((ch, n) => {
    const k = hit(T - ch.t, 0.22, 14) * (1 - out); if (k <= 0) return;
    const col = n % nc, r = Math.floor(n / nc), heart = 'ココロ'.includes(ch.c), inf = 'ムゲン'.includes(ch.c), gap = mode ? 0 : col >= 3 ? 30 : 0;
    c.save(); c.translate(x0 + col * (S + G) + S / 2 + gap, y0 + r * (S + G) + S / 2); c.scale(k, k);
    c.fillStyle = K.navy; c.fillRect(-S / 2 + 10, -S / 2 + 12, S, S);
    c.fillStyle = mode ? (heart ? K.navy : K.white) : heart ? K.yellow : inf ? K.white : K.teal; c.fillRect(-S / 2, -S / 2, S, S);
    if (mode && heart) { c.strokeStyle = K.yellow; c.lineWidth = 5; c.strokeRect(-S / 2 + 2.5, -S / 2 + 2.5, S - 5, S - 5); }
    text(c, ch.c, 0, 12, S * 0.76, { font: 'Dela', color: mode ? (heart ? K.yellow : K.teal) : heart || inf ? K.navy : K.white, align: 'center', base: 'middle' });
    c.restore();
  });
}
const lineOf = n => LN[n] ?? [];
// 私は知った / 喜 ぶ事を  and  私は知った / 悲 しむ事を : set alike
function known(c, T, A, big, rest, color, shadow) {
  column(c, A, T, 150, 130, 92, { font: 'Mincho X', color, lead: 1.1 });
  column(c, big, T, 1700, 120, 330, { font: 'Mincho X', color, shadow, sd: 10 });
  column(c, rest, T, 1500, 190, 110, { font: 'Mincho X', color, lead: 1.1 });
}
// a day, the whole frame, the camera going slowly in from the sheet's own framing (k0: where it starts)
function dayShot(c, kb, k0, he, she, tone) {
  const z = 1 + 0.035 * clamp((kb - k0) / 8);
  c.save(); c.translate(905, 560); c.scale(z, z); c.translate(-905, -560); scene(c, he, she, tone); c.restore();
}
// the line of the song set on the wall's own sheets: a square a syllable, each square on a lit sheet of memory (the
// sheet's edge and its DAY show round it). cam: the wall's camera; at(n): the sheet (i, j) of the n-th syllable
function wordsOnSheets(c, chars, T, cam, at, out = 0, mode = 0) {
  // each square first lands big, where the squares stood across the whole frame, then (half a beat on) settles onto its sheet
  // (the big squares stand on the side of the frame away from her)
  const SB = mode ? 232 : 206, GB = 12, ncB = mode ? 3 : 6, nrB = mode ? 4 : 2, xB = mode ? 1020 : 70, yB = H / 2 - nrB / 2 * (SB + GB) + GB / 2;
  const [cx, cy, z] = cam, S = 0.62 * SW * z;
  chars.slice(0, 12).forEach((ch, n) => {
    const k = hit(T - ch.t + 1 / 24, 0.22, 14) * (1 - out); if (k <= 0) return;
    const [i, j] = at(n), xs = W / 2 + (i * TW - cx) * z, ys = H / 2 + (j * TH - 19 - cy) * z;
    const col = n % ncB, r = Math.floor(n / ncB), xb = xB + col * (SB + GB) + SB / 2 + (mode ? 0 : col >= 3 ? 24 : 0), yb = yB + r * (SB + GB) + SB / 2;
    const sl = smooth(((T - ch.t) / PB - 0.5) / 0.35), x = mix(xb, xs, sl), y = mix(yb, ys, sl), Sn = mix(SB, S, sl) / S;
    const heart = 'ココロ'.includes(ch.c), inf = 'ムゲン'.includes(ch.c);
    c.save(); c.translate(x, y); c.scale(k * Sn, k * Sn);
    c.fillStyle = K.navy; c.fillRect(-S / 2 + 8, -S / 2 + 10, S, S);
    c.fillStyle = mode ? (heart ? K.navy : K.white) : heart ? K.yellow : inf ? K.white : K.teal; c.fillRect(-S / 2, -S / 2, S, S);
    if (mode && heart) { c.strokeStyle = K.yellow; c.lineWidth = 5; c.strokeRect(-S / 2 + 2.5, -S / 2 + 2.5, S - 5, S - 5); }
    text(c, ch.c, 0, S * 0.06, S * 0.76, { font: 'Dela', color: mode ? (heart ? K.yellow : K.teal) : heart || inf ? K.navy : K.white, align: 'center', base: 'middle' });
    c.restore();
  });
}
// ---------------------------------------------------------------- フシギ, three times, three pictures of her
// the drawings of her as they are (a card pixel is a screen pixel at ppm = PP1): never shown larger than 1.1 of that
const PP1 = 2002 / 1.6033;
// her upper body, near: the middle of her feet at x, cut at her waist; z: the camera's own push (<= 1.08)
function herNear(c, n, x, z = 1, ox = x, oy = 540, dy = 0) {
  c.save(); c.translate(ox, oy); c.scale(z, z); c.translate(-ox, -oy);
  const P = her(c, n, x, 1080 + 0.97 * PP1 + dy, PP1); c.restore(); return P;
}
// a photograph: a white sheet, its picture 16:9 (w wide) centred on (x, y); draw() paints a whole frame (1920 x 1080) into it
function photo(c, x, y, w, draw, o = {}) {
  const h = w * 9 / 16, b = o.border ?? Math.max(8, w * 0.018);
  c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot);
  if (o.shadow !== false) { c.fillStyle = K.navy; c.fillRect(-w / 2 - b + 18, -h / 2 - b + 22, w + 2 * b, h + 2 * b); }
  c.fillStyle = K.white; c.fillRect(-w / 2 - b, -h / 2 - b, w + 2 * b, h + 2 * b);
  c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip(); c.imageSmoothingQuality = 'high'; c.scale(w / W, w / W); c.translate(-W / 2, -H / 2); draw(c);   // r9: small, the drawing in it was jagged
  c.restore();
}
// the two of them in a drawing of a12, as a photograph: the card at 1.1 at most, its upper part (their faces, their hands)
export function pairPhoto(c, n, x, y, w, ground = K.paper, dy = -10) {   // dy: the card's top that far (card px) below the photo's top
  const im = pic(n), sc = Math.min(1.1, w / im.width), h = w * 9 / 16, b = 14;
  c.save(); c.translate(x, y);
  c.fillStyle = K.navy; c.fillRect(-w / 2 - b + 18, -h / 2 - b + 22, w + 2 * b, h + 2 * b); c.fillStyle = K.white; c.fillRect(-w / 2 - b, -h / 2 - b, w + 2 * b, h + 2 * b);
  c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip(); c.fillStyle = ground; c.fillRect(-w / 2, -h / 2, w, h);
  c.drawImage(im, -im.width * sc / 2, -h / 2 + dy * sc, im.width * sc, im.height * sc); c.restore();
}
// squares of the song: each lands big on the side of the frame away from her, then settles where it belongs (to(n): [x, y, size])
function squaresTo(c, chars, T, to, slam, out = 0, mode = 0) {
  chars.slice(0, 12).forEach((ch, n) => {
    const k = hit(T - ch.t + 1 / 24, 0.22, 14) * (1 - out); if (k <= 0) return;
    const [xs, ys, S] = to(n), [xb, yb, SB] = slam(n), sl = smooth(((T - ch.t) / PB - 0.5) / 0.35), x = mix(xb, xs, sl), y = mix(yb, ys, sl), Sz = mix(SB, S, sl);
    const heart = 'ココロ'.includes(ch.c), inf = 'ムゲン'.includes(ch.c);
    c.save(); c.translate(x, y); c.scale(k, k);
    c.fillStyle = K.navy; c.fillRect(-Sz / 2 + 8, -Sz / 2 + 10, Sz, Sz);
    c.fillStyle = mode ? (heart ? K.navy : K.white) : heart ? K.yellow : inf ? K.white : K.teal; c.fillRect(-Sz / 2, -Sz / 2, Sz, Sz);
    if (mode && heart) { c.strokeStyle = K.yellow; c.lineWidth = 5; c.strokeRect(-Sz / 2 + 2.5, -Sz / 2 + 2.5, Sz - 5, Sz - 5); }
    text(c, ch.c, 0, Sz * 0.06, Sz * 0.76, { font: 'Dela', color: mode ? (heart ? K.yellow : K.teal) : heart || inf ? K.navy : K.white, align: 'center', base: 'middle' });
    c.restore();
  });
}
// the card she took from the wall, in fs_2's hands (card pixels), and what is on it
const FS2CARD = [236, 662, 99, 78];
function onHerCard(c, P, draw) {
  const [u, v, w, h] = FS2CARD, x0 = P.x0 + u * P.s, y0 = P.y0 + v * P.s, ww = w * P.s, hh = h * P.s;
  c.save(); c.beginPath(); c.rect(x0, y0, ww, hh); c.clip(); c.translate(x0 + ww / 2, y0 + hh / 2); c.scale(hh / 1080, hh / 1080); c.translate(-W / 2, -H / 2); draw(c); c.restore();
  return [x0 + ww / 2, y0 + hh / 2, ww];
}
const stack = (x0, y0, S, G, nc = 3) => n => [x0 + (n % nc) * (S + G) + S / 2, y0 + Math.floor(n / nc) * (S + G) + S / 2, S];
// his last cup, the whole frame: their hands round it (hc_last, as the sorrow page has it). r8: was mf_78 on his stool -
// the old man is ages.js's; this card is the same day, and the sorrow page cuts into it
function cupScene(c) {
  c.fillStyle = K.blue; c.fillRect(-W, -H, 3 * W, 3 * H);
  const im = pic('hc_last'); if (!im) return; const cut = 110, s = W / im.width;
  c.drawImage(im, 0, H / 2 - (im.height - cut) * s / 2 - cut * s, W, im.height * s);
}
const lastDay = c => { c.fillStyle = K.navy; c.fillRect(0, 0, W, H); };

export function draw(c, t) {
  const T = t + start, kb = kbOf(T), mid = [TW / 2, 0], live = { live: kb };
  if (kb < 272) interlude(c, kb);
  else if (kb < 280) {                                                      // フシギ 1: near, her fingertip at the empty ring on her chest; on the half, she looks down at it, her hand flat on it
    sheets(c, 400, mid[0] + 20 * (kb - 272), mid[1], 0.62, 241, null, { live: kb, dark: ALL });
    const z = 1 + 0.07 * smooth((kb - 276) / 3);
    herNear(c, kb < 276 ? 'fs_1' : 'cb_down', 640, z, 660, 560);
    squaresTo(c, lineOf(0), T, stack(1180, 150, 200, 14), stack(1150, 120, 214, 12), smooth((kb - 279.5) / 0.5), 0);
    dayPlate(c, '001460');
  } else if (kb < 288) {                                                    // joy (r8: not the first cup again - the interlude has it): she holds out a flower; on 喜, near: the flower, his hand, their faces
    c.fillStyle = K.paper; c.fillRect(0, 0, W, H); grid(c, K.navy, 40, 0.07);
    const z = 1 + 0.03 * clamp((kb - 280) / 8);
    c.save(); c.translate(900, 470); c.scale(z, z); c.translate(-900, -470); pairPhoto(c, kb < 284 ? 'jf_1' : 'jfc_1', 900, 470, 810); c.restore();
    const L = lineOf(1); known(c, T, L.slice(0, 5), L.slice(5, 6), L.slice(6), K.navy, K.yellow);
    dayPlate(c, '009125', K.paper, K.navy);
  } else if (kb < 296) {                                                    // フシギ 2: she holds the card she has taken down and looks at it; it is that day, large beside her: his last cup
    sheets(c, 400, mid[0] - 20 * (kb - 288), mid[1], 0.62, 241, null, { live: kb, dark: ALL });
    const go = 0, pz = 1 + 0.06 * clamp((kb - 292) / 4);       // the photograph stays where it is; on the bar line the frame cuts to their hands
    herNear(c, 'fs_2', 470, 1 + 0.04 * smooth((kb - 292) / 2), 470, 600, -150);   // r10 (C4): 150 px higher - the photograph in her hands (fs_2, r10b: his last cup drawn on it, face to us) and her hands whole in the frame; beside her the same day, large
    const px = mix(1250, W / 2, go), py = mix(470, H / 2, go), pw = mix(940, W * 1.02, go);
    photo(c, px, py, pw, cc => { cc.save(); cc.translate(W / 2, H / 2); cc.scale(pz, pz); cc.translate(-W / 2, -H / 2); cupScene(cc); cc.restore(); });
    squaresTo(c, lineOf(2), T, stack(px - 3 * 128 + 12, py + pw * 9 / 32 + 40, 104, 24, 6), stack(px - 3 * 128 + 12, py + pw * 9 / 32 + 40, 104, 24, 6), 0, 1);   // (they land where they stay: no larger landing that covered its neighbours)   // r9 (v8): under the photograph, two rows of six - never over their hands
    if (go < 0.5) dayMark(c, '021169', { x: 1680, size: 52 });   // r9 (v8): lower right, beside the words - lower left it was over her arm
  } else if (kb < 304) {                                                    // sorrow: their hands round his last cup; on 悲 the stool is empty, and she lowers the tray
    if (kb < 300) {
      c.fillStyle = K.deep; c.fillRect(0, 0, W, H); grid(c, K.paper, 40, 0.05);
      const im = pic('hc_last'), cut = 110, pw = im.width, ph = im.height - cut, z = 1 - 0.02 * clamp((kb - 296) / 4);
      c.save(); c.translate(W / 2 + 120, 470); c.scale(z, z); c.fillStyle = K.navy; c.fillRect(-pw / 2 - 16 + 22, -ph / 2 - 16 + 26, pw + 32, ph + 32); c.fillStyle = K.white; c.fillRect(-pw / 2 - 16, -ph / 2 - 16, pw + 32, ph + 32);
      c.beginPath(); c.rect(-pw / 2, -ph / 2, pw, ph); c.clip(); c.fillStyle = K.blue; c.fillRect(-pw / 2, -ph / 2, pw, ph); c.drawImage(im, -pw / 2, -ph / 2 - cut); c.restore();
    } else dayShot(c, kb, 300, 'mf_gone', 'wm_low', 'deep');
    const A = lineOf(3), B = lineOf(4); known(c, T, A, B.slice(0, 1), B.slice(1), K.white, K.blue);
    dayPlate(c, kb < 300 ? '021169' : '021170', K.deep);
  } else if (kb < 312) {                                                    // フシギ 3: all of her, in the middle; she takes the card, looks at it, holds it to her chest - the words go round her; ムゲン: they fly out, and the wall goes on for ever
    const u = clamp((kb - 310) / 2);
    sheets(c, 400, mid[0], mix(-TH / 2, 0, smooth(u)), mix(0.62, 0.32, smooth(u)), 241, null, { live: kb, dark: ALL });
    const x = mix(1010, 930, clamp((kb - 304) / 8)), n = kb < 306 ? 'fs_2' : 'fs_3';   // r8 (R2): one line, never back - she looks at the card she took down, then holds it to her chest (to 316)
    c.fillStyle = K.navy; c.fillRect(0, 1030, W, 50); c.fillStyle = K.blue; c.fillRect(0, 1028, W, 4);
    const P = her(c, n, x, 1032, 596);
    // r10b (C4): fs_2 has his last cup drawn on the photograph in her hands - nothing is laid on the card (onHerCard unused)
    // the words stand in two columns at her sides and go with her (フシギ ココロ on her right hand, ココロ ムゲン on her left); ムゲン: out of the frame
    const ring = n2 => { const side = n2 < 6 ? -1 : 1, q = n2 % 6, fly = 700 * smooth(u) * smooth(u); return [x + side * (330 + fly), 126 + q * 140 + (side > 0 ? 40 : 0), 112]; };   // r9 (v8): a step of 140 for a square of 112 (with its bounce, 137): they never cover each other
    squaresTo(c, lineOf(5), T, ring, ring, 0, 0);
    dayPlate(c, '182621');
  } else if (kb < 320) {                                                    // how deep: in front of all of them, the card held to her chest; on 切, close
    const u = (kb - 312) / 8, close = kb >= 316;
    sheets(c, 400, mid[0], mid[1] + u * 300, mix(0.32, 0.26, u), 241, null, { live: kb, dark: ALL });
    if (!close) { c.fillStyle = K.navy; c.fillRect(0, 1030, W, 50); c.fillStyle = K.blue; c.fillRect(0, 1028, W, 4); her(c, 'fs_3', 620, 1032, 596); }
    else { const n = card(kb < 318 ? 'en_n' : 'en_nc'), im = pic(n); fig(c, n, 620, 110 + im.height, im.height); }   // drawn at its own size (never enlarged); cut above the card
    const L = lineOf(6).filter(ch => ch.c !== '・');
    row(c, L.slice(0, 3), T, 1100, 170, 120, { font: 'Mincho X', color: K.white, track: 4 });
    L.slice(3, 5).forEach((ch, n) => { const a = T - ch.t; if (a < 0) return; const k = hit(a, 0.3, 12); c.save(); c.translate(1250 + n * 300, 430 + Math.min(260, a * 70) * (n ? 1 : 0.6)); c.scale(k, k); text(c, ch.c, 8, 8, 300, { font: 'Mincho X', color: K.blue, align: 'center', base: 'middle' }); text(c, ch.c, 0, 0, 300, { font: 'Mincho X', color: K.white, align: 'center', base: 'middle' }); c.restore(); });
    row(c, L.slice(5), T, 1100, 950, 120, { font: 'Mincho X', color: K.white, track: 4 });
  } else {                                                                  // the card in her hands is today: she holds it to her chest; takes it away and looks at it; it leaves her hands and becomes the frame (verse2 begins in it)
    c.fillStyle = K.deep; c.fillRect(0, 0, W, H); grid(c, K.paper, 40, 0.05);
    // r8 (R2): not back to fs_3 / fs_2 after the close-up: her fingertip at the empty ring on her chest (fs_1), and the card
    // - today - comes out from before her chest, turns to us and fills the frame on the bar line
    // r9 (v8 review): the card never passes over her face, and never hangs on her like a picture-in-picture. It comes out
    // of the empty ring on her chest on k320.5 and goes out to her side (right first, then up), growing, into the empty
    // half of the frame, beside her as she looks down at the ring; on k326 she is gone (a cut: the card is left) and it
    // fills the frame by k333.2 (verse2 begins in it).
    const zc = 1 + 0.06 * clamp((kb - 320) / 6), cx0 = 760 + (768 - 760) * zc, cy0 = 560 + (813 - 560) * zc;
    if (kb < 326) herNear(c, 'fs_1', 760, zc, 760, 560);
    const today = cc => nowShot(cc, kt(333.5));
    if (kb >= 320.5) {
      const p = clamp((kb - 320.5) / 5.5), e = smooth((kb - 326) / 7.2);   // full by 333.2: no held frame before verse2
      const xa = mix(cx0, 1390, out3(p)), ya = mix(cy0, 520, smooth(p)), wa = mix(60, 660, smooth(p));
      const lw = kb < 326 ? wa : Math.exp(mix(Math.log(660), Math.log(W * 1.004), e));
      photo(c, mix(xa, W / 2, e), mix(ya, H / 2, e), lw, today, { border: Math.max(lw < 120 ? 2 : 6, lw * 0.018) * (1 - e), shadow: lw > 140 && e < 0.9 });
    }
    if (kb < 324) dayPlate(c, '182621', K.deep);
  }
}