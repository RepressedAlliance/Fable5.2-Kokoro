// What the designed pages share: the colours (hers: cream, navy, yellow, teal; his blueprint blue; one red for stamps),
// the song's beat, her and his drawings as flat pictures, type that lands when it is sung.
export const W = 1920, H = 1080, BEAT = 60 / 140, BAR = 4 * BEAT;
export const K = { blue: '#1b3f86', deep: '#142c63', navy: '#16214a', paper: '#f2e9cf', yellow: '#f6c945', red: '#d43a2f', teal: '#218ea3', white: '#fbf6e6' };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const mix = (a, b, t) => a + (b - a) * t;
export const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
export const out3 = t => 1 - Math.pow(1 - clamp(t), 3);
export const out5 = t => 1 - Math.pow(1 - clamp(t), 5);
export const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// a thing that lands at time t0: 0 before; overshoots and settles (scale to multiply by)
export const hit = (age, amt = 0.28, rate = 16) => age < 0 ? 0 : 1 + amt * Math.exp(-age * rate);
// アリガトウ held: after the word has landed, it is typed again in the same place, a syllable a sixteenth, every
// `every` beats on the beat grid, while she holds the note (until tEnd). -> the start times of the repeats
export function echoTimes(chars, tEnd, every = 2, pb = 0.42858) {
  const step = pb / 4, last = chars[chars.length - 1].t, out = [];
  for (let k = Math.ceil((last + 0.55 - 20.016) / pb); ; k += every) {
    const s = 20.016 + k * pb; if (s + step * (chars.length - 1) > tEnd - 0.12) break; out.push(s);
  }
  return out;
}
// the latest stamp of syllable n at T: { age, rep } (rep: one of the repeats, not the sung onset), or null before it
// reps: each sung repeat of the word as its measured syllable times [t0..t4] (vocal stem), or a start time (then a
// syllable a sixteenth)
// アリガトウ is sung four times a line, in two pairs. Where each time begins was tapped by ear at quarter speed
// (web/tap.html -> work/align/taps.json), the reaction taken off by each line's first time (known from the lyric timing).
// The syllables of each time keep the line's own measured spacing. ARI_T[line] = the four starts (film s)
export const ARI_T = [[206.91, 207.80, 208.59, 209.48], [213.75, 214.58, 215.375, 216.225], [220.63, 221.555, 222.414, 223.284],
  [227.47, 228.318, 229.206, 230.004], [234.29, 235.18, 236.07, 236.94]];       // the last: the pair twice after 永遠に歌う
export function ariReps(chars, starts) { const b = chars[0].t, syl = chars.slice(0, 5).map(ch => ch.t - b); return starts.map(o => syl.map(s => o + s)); }
export function stampOf(chars, n, reps, T, pb = 0.42858) {
  let s = chars[n].t, rep = false;
  for (const r of reps) { const t = Array.isArray(r) ? r[n] : r + n * pb / 4; if (t <= T && t > s) { s = t; rep = true; } }
  return T < chars[n].t ? null : { age: T - s, rep };
}

const IM = {};
export async function img(name, url) {
  if (IM[name]) return IM[name];
  const im = new Image(); im.src = url ?? `data/cards/v2_${name}_lit_day.png`;
  await im.decode(); IM[name] = im; return im;
}
export const pic = name => IM[name];
// a drawing with its feet (bottom centre) on (x, y), h pixels tall
export function fig(c, name, x, y, h, o = {}) {
  const im = typeof name === 'string' ? IM[name] : name, w = im.width * h / im.height;
  c.save(); c.translate(x, y); if (o.flip) c.scale(-1, 1); if (o.rot) c.rotate(o.rot);
  if (o.alpha != null) c.globalAlpha *= o.alpha;
  c.drawImage(im, -w * (o.ax ?? 0.5), -h, w, h); c.restore();
}
// the drawing's outline as one flat colour (cached)
const TINT = {};
export function tint(name, color) {
  const k = name + color; if (TINT[k]) return TINT[k];
  const im = IM[name], cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
  const x = cv.getContext('2d'); x.drawImage(im, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, cv.width, cv.height);
  return TINT[k] = cv;
}

let LINES = [];
export async function lyrics() { if (!LINES.length) LINES = (await (await fetch('data/lyrics.json')).json()).lines; return LINES; }
// the sung times of a line's characters: line(text) -> [{c, t}]
export const line = text => { const L = LINES.find(l => l.text.replace(/[\s　]/g, '') === text.replace(/[\s　]/g, '')); if (!L) throw new Error('no line ' + text); return L.chars.filter(ch => ch.c.trim() && ch.c !== '　'); };

// characters set upright in a column from (x, y0) down, each landing when sung. chars: [{c, t}]
// ?clean=1: the pages draw without their sung words (the opening's rewind shows the film's pictures bare)
export const CLEAN = typeof location !== 'undefined' && new URLSearchParams(location.search).get('clean') === '1';
export function column(c, chars, T, x, y0, size, o = {}) {
  if (CLEAN && !o.keep) return;
  c.save(); c.font = `${o.weight ?? 400} ${size}px "${o.font ?? 'Mincho X'}"`; c.fillStyle = o.color ?? K.paper; c.textAlign = 'center'; c.textBaseline = 'middle';
  let y = y0 + size / 2;
  for (const ch of chars) {
    const k = o.all ? 1 : hit(T - ch.t, o.amt, o.rate);
    if (k > 0) {
      c.save(); c.translate(x, y); c.scale(k, k);
      if ('っゃゅょぁぃぅぇぉッャュョァィゥェォ'.includes(ch.c)) c.translate(size * 0.1, -size * 0.1);
      if ('「」ー（）'.includes(ch.c)) c.rotate(Math.PI / 2);
      if (o.shadow) { c.fillStyle = o.shadow; c.fillText(ch.c, o.sd ?? 8, o.sd ?? 8); c.fillStyle = o.color ?? K.paper; }
      c.fillText(ch.c, 0, 0); c.restore();
    }
    y += size * (o.lead ?? 1.06);
  }
  c.restore();
}
// the same in a row from x0 to the right; returns the row's width
export function row(c, chars, T, x0, y, size, o = {}) {
  if (CLEAN && !o.keep) return 0;
  c.save(); c.font = `${o.weight ?? 400} ${size}px "${o.font ?? 'Mincho X'}"`; c.fillStyle = o.color ?? K.paper; c.textAlign = 'center'; c.textBaseline = 'middle';
  let x = x0;
  for (const ch of chars) {
    const w = c.measureText(ch.c).width + (o.track ?? 0), k = o.all ? 1 : hit(T - ch.t, o.amt, o.rate);
    if (k > 0) {
      c.save(); c.translate(x + w / 2, y); c.scale(k, k);
      if (o.shadow) { c.fillStyle = o.shadow; c.fillText(ch.c, o.sd ?? 8, o.sd ?? 8); c.fillStyle = o.color ?? K.paper; }
      c.fillText(ch.c, 0, 0); c.restore();
    }
    x += w;
  }
  c.restore(); return x - x0;
}
export function text(c, s, x, y, size, o = {}) {
  c.save(); c.font = `${o.weight ?? 400} ${size}px "${o.font ?? 'Mono'}"`; c.fillStyle = o.color ?? K.paper; c.textAlign = o.align ?? 'left'; c.textBaseline = o.base ?? 'alphabetic';
  if (o.alpha != null) c.globalAlpha *= o.alpha;
  if (o.track) c.letterSpacing = o.track + 'px';
  c.fillText(s, x, y); c.restore();
}
// THE DAY, one way for the whole film: no plate, no block over the corner. A short yellow rule, DAY small above the number,
// the number in yellow; where the picture behind is busy the letters carry a thin edge of the page's own ground (o.edge),
// so they read without anything being covered.  dayMark(c, 182621)  or  dayMark(c, '004380', { x, y, size, color, edge, label })
// (x, y): the left end of the rule's foot = the number's baseline. Default: lower left, 72 px from both edges.
export function dayMark(c, n, o = {}) {
  const s = typeof n === 'number' ? String(Math.max(0, Math.round(n))).padStart(6, '0') : n, size = o.size ?? 92, x = o.x ?? 72, y = o.y ?? H - 72;
  const col = o.color ?? K.yellow, edge = o.edge === undefined ? K.navy : o.edge, a = o.alpha ?? 1;
  c.save(); c.globalAlpha *= a; c.lineJoin = 'round';
  const put = (str, tx, ty, px, font, weight, color, track) => {
    c.font = `${weight} ${px}px "${font}"`; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.letterSpacing = (track || 0) + 'px';
    if (edge) { c.strokeStyle = edge; c.lineWidth = Math.max(6, px * 0.16); c.strokeText(str, tx, ty); }
    c.fillStyle = color; c.fillText(str, tx, ty);
  };
  if (o.gap) {                                        // a line of the page runs through here (a floor line, a trace): break it behind the letters, in the page's own ground
    c.font = `800 ${size}px "Shoulders"`; const w = c.measureText(s).width + 22;
    c.fillStyle = o.gap === true ? edge : o.gap; c.fillRect(x - 14, y - size * 1.2, w + 30, size * 1.2 + 16);
  }
  if (edge) { c.fillStyle = edge; c.fillRect(x - 3, y - size * 1.12 - 3, 12, size * 1.12 + 6); }
  c.fillStyle = o.rule ?? col; c.fillRect(x, y - size * 1.12, 6, size * 1.12);
  // o.labelGap: how much higher the small label sits (r9: default about 5 px at size 92, so that a label such as
  // 'DAY  08 空席' clears the number's edge stroke)
  put(o.label ?? 'DAY', x + 24, y - size * 0.84 - (o.labelGap ?? size * 0.055), size * 0.3, 'Mono', 400, o.labelColor ?? (col === K.yellow ? K.paper : col), size * 0.07);
  put(s, x + 22, y, size, 'Shoulders', 800, col, 0);
  c.restore();
}
export function grid(c, color, step = 40, alpha = 0.1) {
  c.save(); c.globalAlpha = alpha; c.strokeStyle = color; c.lineWidth = 1; c.beginPath();
  for (let x = step; x < W; x += step) { c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, H); }
  for (let y = step; y < H; y += step) { c.moveTo(0, y + 0.5); c.lineTo(W, y + 0.5); }
  c.stroke(); c.restore();
}
// a rubber stamp (cached): heavy type in a double frame, the ink broken up
const STAMP = {};
export function stamp(label, size, color, o = {}) {
  const key = label + size + color; if (STAMP[key]) return STAMP[key];
  const cv = document.createElement('canvas'), x = cv.getContext('2d');
  x.font = `400 ${size}px "${o.font ?? 'Mincho X'}"`;
  const tw = x.measureText(label).width, pad = size * 0.22, bw = size * 0.075;
  cv.width = Math.ceil(tw + 2 * pad + 4 * bw); cv.height = Math.ceil(size * 1.24 + 2 * pad);
  x.font = `400 ${size}px "${o.font ?? 'Mincho X'}"`; x.fillStyle = color; x.strokeStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.lineWidth = bw; x.strokeRect(bw, bw, cv.width - 2 * bw, cv.height - 2 * bw);
  x.lineWidth = bw * 0.3; x.strokeRect(bw * 2.3, bw * 2.3, cv.width - 4.6 * bw, cv.height - 4.6 * bw);
  x.fillText(label, cv.width / 2, cv.height / 2 + size * 0.02);
  x.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 1400; i++) { const r = 1 + rnd(i * 3) * size * 0.012 * (rnd(i * 7) < 0.06 ? 6 : 1); x.beginPath(); x.arc(rnd(i) * cv.width, rnd(i + 0.5) * cv.height, r, 0, 7); x.fill(); }
  return STAMP[key] = cv;
}
// press it at (x, y): comes down large, lands, stays. age in seconds since it landed (negative: on its way)
export function press(c, cv, x, y, age, rot = -0.14, lead = 0.09) {
  if (age < -lead) return;
  const k = age < 0 ? mix(2.4, 1, out3((age + lead) / lead)) : 1 + 0.05 * Math.exp(-age * 18);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k); c.globalAlpha *= age < 0 ? clamp((age + lead) / lead + 0.3) : 1;
  c.drawImage(cv, -cv.width / 2, -cv.height / 2); c.restore();
}
// the frame knocked by something landing at age 0
export const shake = (age, amp = 14) => age < 0 || age > 0.3 ? [0, 0] : [Math.sin(age * 90) * amp * (1 - age / 0.3), Math.cos(age * 70) * amp * 0.6 * (1 - age / 0.3)];
// r11 (fix11, 3): the wind loops. base_w1 .. base_w8 are drawn from the one master (only hair, bow, scarf and skirt
// move), round and round like the walk in know.js: each drawing three frames (1/8 s), eight a second, counted on the
// song's own frames so that the loop goes on unbroken across shots and pages. has(name): is that drawing there (default:
// loaded by img()); if any of the eight is missing the master stands in, whole.
export const WIND8 = 8;
export const windNames = base => Array.from({ length: WIND8 }, (_, i) => `${base}_w${i + 1}`);
export function windFrame(base, T, has = n => !!IM[n]) {
  const all = windNames(base); if (!all.every(has)) return base;
  return all[Math.floor(Math.round(T * 24) / 3) % WIND8];
}
