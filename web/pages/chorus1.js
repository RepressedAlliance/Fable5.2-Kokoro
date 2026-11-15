// Chorus 1 (94.5 - 122.9 s). What the user asked to keep: her acting from reading to tears to open arms, the sheets that
// never stop flying, the sheets that come together into ココロ. What is new: every picture is built again, flat colour
// from the film's one palette; the words stand in the scene, a layer behind her, and land when they are sung.
//   S1  she reads; the room is blueprint, no light. The line behind her heart is flat - then it beats (the band comes in),
//       she starts, her hand goes to her chest and the sheet falls from it.                        今 動き始めた
//   S2  yellow runs out from her chest: the room has light, the sheets leave the wall.               加速する奇跡
//   S3  her face: the first tear, her hand, both eyes, laughing through it.                          ナゼか ナミダが
//   S4  she opens her arms to all of it; the sheets fill the frame.                                  止まらナい
//   RUN she runs, in her own colour: every footfall is a beat on the line she runs along.            ナぜ 私 震える？ 加速する鼓動
//       She brakes; the sheets that followed her go on past her.                                     コレが私の
//   MON from behind her: they come together into the word.                                           望んだ「ココロ」？
// Cuts are on the song's own bars (work/beat_probe2.py): a beat is 20.016 + k * 0.42858 s, a bar every 4; the voice comes
// in half a beat early, so the cuts are at k = 183.5, 191.5, 199.5, 205.5 and 231.
import * as THREE from 'three';
import { W, H, K, clamp, mix, smooth, out3, out5, rnd, hit, lyrics, line, column, row, text, stamp, press, shake, windNames, windFrame } from './kit.js';
import { drawReport } from './report.js';
export const name = 'chorus1';
const T0B = 20.016, PB = 0.42858, kt = k => T0B + k * PB, kbOf = T => (T - T0B) / PB;
export const start = kt(174);
const K1 = 183.5, K2 = 191.5, K3 = 199.5, KR = 205.5, KM = 231, KE = 240, KWAVE = 184, KBEAT = 176;
export const duration = kt(KE) - start;
const F2 = 2 / 24 / PB;                                          // two frames, in beats
const INK = K.navy, LIGHT = K.white, TEAL = K.teal, TEAL_D = '#1a7587';
let L = {}, V2 = null, CCH = null, RF = null;                 // RF: the running close-up (rm_face), drawn flat

// ------------------------------------------------------------------ her acting, in beats. A pose is a new pose on a beat and
// is held; a drawing between two poses is shown two frames. (No blink: the old cc_b moved her whole head.)
// R2 (fix8): every pose held two beats or more, none comes back, no wind loop (the wind changes her once), and no
// two-frame in-betweens (they cut the holds short). S1: she takes the sheet; reads (the line beats under it, k 176);
// starts, mouth open (始); her hand to her chest, eyes down - the sheet falls (め). S2: she looks up as the yellow runs
// out (k 184); her arms open (186) and the wind takes her hair and skirt, once (189). S3 on the half-beats with the
// voice: the first tear, her hand to it, both eyes, laughing through it. S4: arms wide; open; the wind, once.
const ACT = [
  [0, 'ca_take'], [176, 'ca0'], [179, 'ca_stopo'], [181, 'cb_down'], [184, 'cb_up'], [186, 'cb_out~'],
  [K2, 'cc0'], [193.5, 'cc_2'], [195.5, 'cc_3'], [197.5, 'cc_4'],
  [K3, 'cd_b'], [201.5, 'cd0~'],
];
// r11 (fix11, 3; user: the wind is to move as well as the walk in know.js): a pose marked ~ is played as its wind loop,
// the eight drawings cb_out_w1..w8 / cd0_w1..w8 from its master, three frames each and unbroken (kit.js windFrame); the
// one-off cb_w1 / cd_w1 are gone. The loops of the poses finale.js takes from this stage are loaded here too.
const WINDS = ['cb_out', 'cd0', 'up_a', 'up0', 'cd_a'].flatMap(windNames), WINDSET = new Set(WINDS);
const CYCLE = ['rm_c1', 'rm_d1', 'rm_p1', 'rm_f1', 'rm_c2', 'rm_d2', 'rm_p2', 'rm_f2'], FLIGHT = new Set(['rm_f1', 'rm_f2']);
const B_STOP = 18.5;                                            // beats after k = 206: her heel digs in at k = 224.5, the next footfall
const STOP = [[B_STOP, 'rm_s1'], [B_STOP + 2, 'rm_s2'], [B_STOP + 4, 'rm0']];   // R2: two beats each, no in-betweens
let SPEED = 2.6;
const NAMES = [...new Set([...ACT.map(a => a[1].replace('~', '')), ...CYCLE, ...STOP.map(a => a[1]), 'tb0', 'tb_c1', 'tb_c1p1', 'tb_p1', 'tb_p1c2', 'tb_c2', 'tb_c2p2', 'tb_p2', 'tb_p2c1', 'tr0', 'tr_2', 'tk0', 'tk_l', 'tk_r', 'tk_l2', 'tk_h', 'kn_reach', 'kn_open', 'cd_a', 'up_a', 'up_b', 'up0', ...WINDS])];
const setOf = n => n.split('_')[0].replace(/\d+$/, '');
function who(kb) {
  let k = ACT[0][1], windy = false;
  for (const [k0, n] of ACT) if (kb >= k0 - 1e-6) { k = n.replace('~', ''); windy = n.endsWith('~'); }
  if (windy) k = windFrame(k, kt(kb), n => !!TEX[n]);
  return k;
}
// r11 (user: "no need to go faster and faster, just sit on the rhythm"): one step a beat, the same all the way. In this
// passage the kick and the voice are on the half-beats (k + 0.5; work/qc/tmp/p1r11/onset.py), so every footfall (rm_c1 /
// rm_c2) lands on k = 205.5, 206.5, ... 223.5, and the heel digs in on the next, 224.5. The eight drawings share the beat
// evenly (a quarter beat each) and change a frame before the sound (LEAD). The ground goes by at one stride a step.
// phi: steps done (0 at the first footfall); b = kb - 206.
const LEAD = 1 / 24 / PB, phi = b => b + 0.5 + LEAD, tStop = () => SPEED * (B_STOP + 0.5), B_AT_STOP = B_STOP - LEAD;
const travelled = b => b < B_AT_STOP ? SPEED * phi(b) : tStop() +SPEED * 1.5 * ((u => u - u * u / 2)(clamp((b - B_AT_STOP) / 1.5)));
// footfall j (0 .. 19; 19 is the heel digging in): when (b), and where the foot is on the ground (x, metres)
const FALLS = () => { const out = []; for (let j = 0; j <= B_STOP + 0.5; j++) { const k = j > B_STOP ? 'rm_s1' : j % 2 ? 'rm_c2' : 'rm_c1', g = V2.rm.ground[k]; out.push({ b: j - 0.5 - LEAD, x: -SPEED * j - V2.rm.ax + Math.min(...g) - 0.12 }); }   /* - 0.12: under the middle of the boot, not its heel */ return out; };
function runner(b) {
  let k;
  if (b < B_AT_STOP) k = CYCLE[((Math.floor(phi(b) * 4 + 1e-6) % 8) + 8) % 8]; else { k = 'rm0'; for (const [b0, n] of STOP) if (b >= b0 - LEAD - 1e-6) k = n; }
  // the drawing's lowest point is on the ground (its sole), except in the two drawings with both feet in the air
  return { k, x: -travelled(b), y: -(V2.rm.low[k] ?? 0) + (FLIGHT.has(k) ? 0.14 : 0) };
}

// ------------------------------------------------------------------ the 3D layer
const PAL = {
  A: { bg: '#0b1b45', wall: '#0b1b45', wood: '#101f4d', floor: '#0a1738', lab: '#8fa3d8', sp: ['#1b3f86', '#23509f', '#1f4690', '#2a5cb0', '#1d4490'] },
  Bs: { bg: K.navy, wall: K.navy, wood: K.navy, floor: '#17346f', lab: '#dfe6fa', sp: ['#2a5cb0', '#3468c0', '#23509f', '#3f76cf', '#2f62ba'] },
  Bl: { bg: '#f0dfae', wall: '#f0dfae', wood: K.yellow, floor: K.yellow, lab: K.blue, sp: [K.paper, '#fbf6e6', '#fbf6e6', '#fbf6e6', K.paper] },
};
const ZT = -0.3, YE = 1.375, CCS = 1.05;                         // the layer of the words; where her ears are in the close-up; its scale
const BOOKS = [];                                              // every volume on the wall: [x, y, width, height, seed] (metres, centre)
let labels;
let R, scene, cam, room, wall, wood, floor, SP = {}, her, shadow, SM = [], dummy, TEX = {};
const colLit = new THREE.Color('#ffffff'), colSh = new THREE.Color(), colTmp = new THREE.Color();
// the sheets of the room are all THE sheet (report.js, the canon art/canon/prop_report.png): v 3 is his last, as know
// shows it (最終稿, 結果 empty) - the one she reads and lets fall; v 0..2 are earlier records of the same form, a number and
// a day of their own, 草稿, 失敗 stamped in 結果
function sheetTexture(v) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 724; const x = cv.getContext('2d');
  if (v === 3) drawReport(x, 0, 0, 512, {});
  else { const no = [2300, 6477, 10654][v] ?? 2300; drawReport(x, 0, 0, 512, { no, day: no, title: '草稿', result: '失敗' }); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const flat = c => new THREE.MeshBasicMaterial({ color: c });
// the label on a volume's spine: [x, y, width, height], metres, centre
const labelOf = b => [b[0], b[1] + b[3] * 0.2, b[2] * 0.66, 0.062];
function init3d(ims) {
  R = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); R.setSize(W, H, false); R.setPixelRatio(1);
  scene = new THREE.Scene(); cam = new THREE.PerspectiveCamera(30, W / H, 0.05, 300); dummy = new THREE.Object3D();
  room = new THREE.Group(); scene.add(room);
  wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 12), flat('#000')); wall.position.set(0, 5, -1.0); room.add(wall);
  // shelves: a board every 0.42 m, an upright every 1.3 m; on every board the volumes of his record, each its own width and height
  const ROWS = 13, bars = [];
  for (let j = 0; j <= ROWS; j++) bars.push([0, 0.02 + j * 0.42, 60, 0.045]);
  for (let i = -22; i <= 22; i++) bars.push([i * 1.3 + 0.65, 2.7, 0.07, 5.6]);
  wood = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 0.34), flat('#000'), bars.length);
  bars.forEach((b, i) => { dummy.position.set(b[0], b[1], -0.80); dummy.rotation.set(0, 0, 0); dummy.scale.set(b[2], b[3], 1); dummy.updateMatrix(); wood.setMatrixAt(i, dummy.matrix); });
  room.add(wood);
  const books = BOOKS;
  for (let j = 0; j < ROWS; j++) for (let x = -29, n = 0; x < 29; n++) {
    const s = rnd(j * 911 + n), w = 0.036 + 0.05 * rnd(j * 37 + n * 3), h = 0.25 + 0.11 * rnd(j * 53 + n * 7);
    if (s < 0.05) { x += 0.1 + 0.25 * rnd(j * 3 + n); continue; }                         // a gap
    const ux = Math.round((x + w / 2 - 0.65) / 1.3) * 1.3 + 0.65; if (x < ux + 0.05 && x + w > ux - 0.05) { x = ux + 0.05; continue; }   // an upright of the shelf
    books.push([x + w / 2, 0.043 + j * 0.42 + h / 2, w * 0.9, h, s]); x += w;
  }
  for (const p of ['A', 'Bs', 'Bl']) {
    const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), flat('#fff'), books.length);
    books.forEach((b, i) => { dummy.position.set(b[0], b[1], -0.66); dummy.scale.set(b[2], b[3], 1); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); m.setColorAt(i, colTmp.set(PAL[p].sp[Math.floor(b[4] * 5)])); });
    room.add(m); SP[p] = m;
  }
  labels = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), flat('#fff'), books.length);
  books.forEach((b, i) => { const q = labelOf(b); dummy.position.set(q[0], q[1], -0.655); dummy.scale.set(q[2], q[3], 1); dummy.updateMatrix(); labels.setMatrixAt(i, dummy.matrix); });
  room.add(labels);
  floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), flat('#000')); floor.rotation.x = -Math.PI / 2; room.add(floor);
  shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: K.navy, transparent: true, opacity: 0.32 })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.008; scene.add(shadow);
  for (const n of NAMES) { if (!ims[n]) continue; const t = new THREE.Texture(ims[n]); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; t.anisotropy = 8; TEX[n] = t; }
  her = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: TEX.ca0, alphaTest: 0.5, side: THREE.DoubleSide })); scene.add(her);
  for (let v = 0; v < 4; v++) {
    const mat = new THREE.MeshBasicMaterial({ map: sheetTexture(v), side: THREE.DoubleSide });
    mat.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n\tif (!gl_FrontFacing) diffuseColor = vec4(0.984, 0.965, 0.902, 1.0);'); };   // the back of a sheet is blank
    const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.30, 0.42), mat, 700);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; m.setColorAt(0, colLit); scene.add(m); SM.push(m);
  }
}
const LDIR = new THREE.Vector3(0.45, 0.75, 0.5).normalize(), NRM = new THREE.Vector3();
// sheets: { p: [x, y, z], r: [rx, ry, rz], s: scale, v: 0..2, lit, col: a colour of its own }
function putSheets(list, shade) {
  const n = [0, 0, 0, 0]; colSh.set(shade);
  for (const p of list) {
    const v = p.v ?? 0, m = SM[v]; if (n[v] >= 700) continue;
    dummy.position.set(p.p[0], p.p[1], p.p[2]); dummy.rotation.set(p.r[0], p.r[1], p.r[2]); dummy.scale.setScalar(p.s ?? 1); dummy.updateMatrix(); m.setMatrixAt(n[v], dummy.matrix);
    NRM.set(0, 0, 1).applyEuler(dummy.rotation);
    m.setColorAt(n[v], p.col ? colTmp.set(p.col) : p.lit || Math.abs(NRM.dot(LDIR)) > 0.38 ? colLit : colSh); n[v]++;
  }
  SM.forEach((m, v) => { m.count = n[v]; m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; });
}
function setHer(k, x, y, z = 0) {
  const S = V2[setOf(k)], im = TEX[k].image; her.material.map = TEX[k];
  if (setOf(k) === 'cc') {                                       // the close-up: her ears stay where they are, whatever the drawing
    const q = CCH[k], m = S.mpp * CCS; her.scale.set(q.w * m, q.h * m, 1); her.position.set(-(q.cx - q.w / 2) * m, YE - (q.h / 2 - q.row) * m, 0); her.rotation.y = 0;
  } else {
    const h = S.h, w = h * im.width / im.height; her.scale.set(w, h, 1); her.rotation.y = Math.atan2(cam.position.x - x, cam.position.z - z) * 0.6; her.position.set(x - S.ax, y + h / 2, z);
    shadow.position.x = x; shadow.position.z = z + 0.02; const rx = Math.min(0.34, Math.max(0.15, w * 0.3)); shadow.scale.set(rx, rx * 0.5, 1);
  }
}
// one pass of the 3D: the room in a palette (or none), her (or not), a list of sheets; opaque with a ground colour, or clear
function pass(c, o) {
  room.visible = !!o.room;
  if (o.room) { const p = PAL[o.room]; wall.material.color.set(p.wall); wood.material.color.set(p.wood); floor.material.color.set(p.floor); labels.material.color.set(o.labRed ? K.red : p.lab); for (const k in SP) SP[k].visible = k === o.room; }
  her.visible = !!o.her; shadow.visible = !!o.her && o.shadow !== false;
  putSheets(o.sheets ?? [], o.shade ?? '#c3cdea');
  if (o.bg) { scene.background = colTmp.set(o.bg).clone(); R.setClearColor(0x000000, 1); } else { scene.background = null; R.setClearColor(0x000000, 0); }
  R.render(scene, cam); c.drawImage(R.domElement, 0, 0);
}
const PV = new THREE.Vector3();
const proj = (x, y, z) => { PV.set(x, y, z).project(cam); return [(PV.x + 1) / 2 * W, (1 - PV.y) / 2 * H]; };
// the camera square to the wall: `h` metres of the plane she stands in fill the frame's height
function frontal(fov, cx, cy, h, lx, ly) { cam.fov = fov; cam.position.set(cx, cy, h / (2 * Math.tan(fov * Math.PI / 360))); cam.lookAt(lx, ly, 0); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); }
// draw on the plane z = zt in centimetres: x to the right, y DOWN from the floor (a point 1.2 m up is y = -120)
function mid(c, zt, fn) {
  const O = proj(0, 0, zt), X = proj(1, 0, zt), Y = proj(0, 1, zt);
  c.save(); c.transform((X[0] - O[0]) / 100, (X[1] - O[1]) / 100, -(Y[0] - O[0]) / 100, -(Y[1] - O[1]) / 100, O[0], O[1]); fn(); c.restore();
}
// the light comes into the room in bands, down to the right: their outline on the wall, as a path
const BX0 = -1.49, BPER = 4.2, BAND = [[0, 0.95], [1.15, 0.2]];
function bands(c) {
  c.beginPath();
  for (let i = -4; i <= 4; i++) for (const [a, w] of BAND) {
    const xa = BX0 + i * BPER + a, q = [proj(xa, 5.6, -0.64), proj(xa + w, 5.6, -0.64), proj(xa + w + 3.12, 0, -0.64), proj(xa + 3.12, 0, -0.64)];
    c.moveTo(q[0][0], q[0][1]); for (let j = 1; j < 4; j++) c.lineTo(q[j][0], q[j][1]); c.closePath();
  }
}
function roomLit(c, far, floorToo) {
  pass(c, { room: 'Bs', sheets: far, bg: PAL.Bs.bg });
  c.save(); bands(c); c.clip(); pass(c, { room: 'Bl', sheets: far, bg: PAL.Bl.bg }); c.restore();
  // where a band reaches the floor it lies on it
  c.fillStyle = K.yellow;
  const zn = Math.min(2.4, cam.position.z - 0.8); if (!floorToo || zn < 0) return;
  for (let i = -4; i <= 4; i++) for (const [a, w] of BAND) {
    const xa = BX0 + i * BPER + a + 3.12, k = (zn + 0.64) * 0.5, q = [proj(xa, 0, -0.64), proj(xa + w, 0, -0.64), proj(xa + w + k, 0, zn), proj(xa + k, 0, zn)];
    c.beginPath(); c.moveTo(q[0][0], q[0][1]); for (let j = 1; j < 4; j++) c.lineTo(q[j][0], q[j][1]); c.closePath(); c.fill();
  }
}

// ---- the sheets in the room, from the wave (k = 184) on
const N1 = 250, N2 = 44, N3 = 5, NF = 90;
// a point moved out of the cone between the lens and her (radius `need` metres where she stands)
function keepOff(p, need0) {
  const e = cam.position, d = [0 - e.x, 1.2 - e.y, 0 - e.z], Ln = Math.hypot(...d), dn = d.map(v => v / Ln), v = [p[0] - e.x, p[1] - e.y, p[2] - e.z], al = v[0] * dn[0] + v[1] * dn[1] + v[2] * dn[2];
  if (al < 0.1) return p;
  const off = v.map((q, a) => q - dn[a] * al), dist = Math.hypot(off[0], off[1] * 0.62, off[2]), need = need0 * al / Ln;      // taller than wide: her shape
  if (dist >= need) return p;
  const q = dist > 1e-3 ? need / dist : 1; return [e.x + dn[0] * al + off[0] * q, e.y + dn[1] * al + off[1] * (dist > 1e-3 ? 1 + (q - 1) * 0.62 : 1), e.z + dn[2] * al + off[2] * q];
}
// -> { back: behind the words and her, front: before everything }. A sheet shows its face: it sways, it does not tumble.
const storm = (kb, wide) => stormT((kb - KWAVE) * PB, wide, (kb - 204.35) * PB * 2.3);
// tt: seconds since the wave; tf: seconds into the last rush at the lens (negative: none)
function stormT(tt, wide, tf) {
  const back = [], front = []; if (tt <= 0) return { back, front };
  const eye = cam.position, aim = [0, 1.25, 0], d = [aim[0] - eye.x, aim[1] - eye.y, aim[2] - eye.z], Ln = Math.hypot(...d), dn = d.map(v => v / Ln);
  // 1  out of the wall by the wave, then up the wall's face
  for (let i = 0; i < N1; i++) {
    const sx = (rnd(i + 0.5) - 0.5) * 10.4, sy = 0.25 + rnd(i + 1.5) * 3.9, age = tt - (Math.hypot(sx, sy - 1.14) / 7 + rnd(i + 7) * 0.2);
    if (age <= 0) continue;
    const o = smooth(age / 0.25), up = (0.4 + 0.85 * rnd(i + 4)) * Math.max(0, age - 0.12), y = 0.1 + ((sy - 0.1 + up) % 4.6), life = smooth(Math.min(y - 0.1, 4.7 - y) / 0.35) * o;
    if (life < 0.05) continue;
    const pr = keepOff([sx + 0.22 * Math.sin(age * 1.6 + i), y, mix(-0.62, -0.56 + 0.2 * rnd(i + 3), o)], wide ? 0.82 : 0.72);
    back.push({ p: pr, r: [o * 0.5 * Math.sin(age * 2.3 + i), o * 0.9 * Math.sin(age * (0.9 + rnd(i + 9)) + i), o * 0.4 * Math.sin(age * 1.9 + i * 2)], s: life * (0.8 + 0.3 * rnd(i + 11)), v: i % 3 });
  }
  // 2  round her in rising arms: beside her and before her, never across her
  const KA = 4, M = N2 / KA;
  for (let i = 0; i < N2; i++) {
    const sx = (rnd(i + 20.5) - 0.5) * 7, sy = 0.4 + rnd(i + 21.5) * 3.0, age = tt - (Math.hypot(sx, sy - 1.14) / 7 + rnd(i + 27) * 0.25);
    if (age <= 0) continue;
    const j = i % KA, s = Math.floor(i / KA) / M, span = 3.7, hgt = 0.3 + ((s * span + 0.5 * tt) % span);
    const th = 6.2832 * j / KA + 1.0 * tt - 6.2832 * 1.4 * s, r = 1.25 + 0.38 * (hgt - 0.3);
    const lane = [r * Math.cos(th), hgt, clamp(0.25 - r * Math.sin(th) * 0.5, -0.24, 0.75)];
    const joinK = smooth((age - 0.1) / 0.8);
    let p = [mix(sx, lane[0], joinK), mix(sy, lane[1], joinK), mix(-0.5, lane[2], joinK)];
    const v = [p[0] - eye.x, p[1] - eye.y, p[2] - eye.z], al = v[0] * dn[0] + v[1] * dn[1] + v[2] * dn[2];
    if (al > 0.1 && p[2] > -0.2) {                                             // nothing that is before her crosses her
      const off = v.map((q, a) => q - dn[a] * al), dist = Math.hypot(...off), need = (wide ? 1.05 : 0.8) * (0.3 + 0.7 * al / Ln);
      if (dist < need) { const q = dist > 1e-3 ? need / dist : 1; p = p.map((u, a) => [eye.x, eye.y, eye.z][a] + dn[a] * al + (dist > 1e-3 ? off[a] * q : (a === 0 ? need : 0))); }
    }
    const zl = Math.min(hgt - 0.3, span - (hgt - 0.3)), life = joinK < 1 ? joinK : smooth(zl / 0.4);
    if (life < 0.05) continue;
    back.push({ p, r: [0.35 * Math.sin(tt * 2.6 + i), 0.85 * Math.sin(tt * 1.3 + i), 0.3 * Math.sin(tt * 2.1 + i * 1.7)], s: life, v: i % 3 });
  }
  // 3  a few close to the lens, at the frame's edge, going up fast
  for (let i = 0; i < N3; i++) {
    const t0 = 0.3 + i * 0.6 + rnd(i + 40) * 0.2, age = (tt - t0) % 3.0;
    if (tt < t0 || age > 1.0) continue;
    const side = wide ? (i % 2 ? 1 : -1) : 1, z = eye.z - 1.9 - 0.5 * rnd(i + 41), hw = (eye.z - z) * Math.tan(cam.fov * Math.PI / 360) * (W / H);
    front.push({ p: [eye.x + side * hw * (wide ? 0.97 : 0.84 + 0.14 * rnd(i + 42)), eye.y - 1.2 + age * 2.6, z], r: [0.5 * Math.sin(age * 5 + i), 0.9 * Math.sin(age * 3 + i) * side, 0.4 * side], s: 1, v: i % 3 });
  }
  // 4  at the end they come at the lens until the frame is paper
  if (wide && tf > 0) for (let i = 0; i < NF; i++) {
    const e = clamp((tf - rnd(i + 60) * 0.5) / 0.55); if (e <= 0) continue;
    const a = rnd(i + 61) * 6.2832, r0 = 1.4 + 1.6 * rnd(i + 62), q = e * e;
    front.push({ p: [mix(r0 * Math.cos(a), eye.x + (rnd(i + 63) - 0.5) * 1.5, q), mix(1.1 + r0 * 0.6 * Math.sin(a), eye.y + (rnd(i + 64) - 0.5) * 0.9, q), mix(0.2, eye.z - 0.45 - 0.5 * rnd(i + 65), q)], r: [0.6 * Math.sin(tf * 3 + i), 0.8 * Math.sin(tf * 2 + i * 2), i], s: 1, v: i % 3 });
  }
  return { back, front };
}

// ---- the run: the sheets after her, far ones hanging in the air, some close to the lens; when she stops they go on past her
function field(b, x) {
  const out = [], t = b * PB, vx = SPEED / PB;                                // her speed, metres a second
  for (let i = 0; i < 230; i++) {                                           // the band, each a little behind the one before
    const lag = 0.6 + i * 0.06 + rnd(i) * 0.4, ph = i * 0.21 - t * 5.0, lanei = (i % 5) - 2;
    let px, y = 1.25 + 0.5 * Math.sin(ph) + lanei * 0.2 + 0.25 * Math.sin(i * 1.7), z = -0.4 - lanei * 0.24 - 0.5 * rnd(i + 3), s = 1;
    if (b < B_AT_STOP) px = x + lag + 0.5;
    else {                                                                  // she has stopped; they have not
      const dt = (b - B_AT_STOP) * PB, go = vx * (dt + 0.7 * dt * dt / (dt + 0.3)) * (0.9 + 0.2 * rnd(i + 5))   /* r11: they go on at 1.7 times her pace, as before (from her pace, no jump) - at her pace they hung round her and hid her */, past = Math.max(0, go - lag - 0.5), q = smooth(past / 9);
      px = -tStop() + lag + 0.5 - go;
      y += q * (2.2 + 2.5 * rnd(i + 6)); z -= q * (5 + 9 * rnd(i + 7)); if (past > 0) px -= past * 0.4;
    }
    out.push({ p: [px, y, z], r: [0.3 * Math.sin(ph * 1.3 + i), 0.6 * Math.sin(ph + i), 0.3 * Math.sin(ph * 0.7 + i)], s, v: i % 3 });
  }
  const far0 = Math.floor((x - 34) / 1.1);                                  // far off, hanging: she passes them
  for (let i = 0; i < 80; i++) {
    const n = far0 + i, s = rnd(n * 3.7);
    out.push({ p: [n * 1.1 + s * 0.8, 0.7 + rnd(n * 9.3) * 5.5 + 0.25 * Math.sin(t * 1.7 + n), -5 - rnd(n * 5.1) * 16], r: [0.5 * Math.sin(t * 1.1 + n), n * 1.3 + 0.4 * Math.sin(t * 0.9 + n * 2), 0.3 * Math.sin(t + n)], s: 1, v: ((n % 3) + 3) % 3 });
  }
  // sheets lying on the floor along her way, before her and behind her: as she runs past one it is thrown up and back
  const sp = SPEED / PB, f0 = Math.floor((x - 9) / 0.85);
  for (let i = 0; i < 26; i++) {
    const n = f0 + i, sx = n * 0.85 + rnd(n * 2.3) * 0.5, sz = rnd(n * 4.1) < 0.5 ? 0.45 + 0.35 * rnd(n * 1.9) : -0.2 - 0.2 * rnd(n * 1.9), d = sx - x - 0.1;
    const turn = rnd(n * 6.7) * 6.28;
    if (d <= 0) { out.push({ p: [sx, 0.004, sz], r: [-1.5708, 0, turn], s: 0.9, v: ((n % 3) + 3) % 3 }); continue; }
    const a = d / sp, up = 1 - Math.exp(-a * 3.2);                         // seconds since her foot passed it
    out.push({ p: [sx + 1.6 * a + 0.9 * up, 0.004 + (0.7 + 0.6 * rnd(n * 8.1)) * up, sz - 1.4 * a * (sz > 0 ? 0.3 : 1)], r: [-1.5708 + 2.4 * up + 0.6 * Math.sin(a * 5 + n), 1.2 * up * Math.sin(a * 3 + n), turn + 1.5 * a], s: 0.9, v: ((n % 3) + 3) % 3 });
  }
  return out;
}

// ---- the word: ココロ as squares, each character 14 x 11 with strokes three thick; sheet i belongs to character CELLS[i][3]
// p8: no ？ in this shot (the line's question is in her looking up at the word); the word as it was: three characters, centred.
let CELLS = [];
function wordCells() {
  const cells = [], CW = 0.27, CHH = 0.37, cols = 14, rows = 11, gap = 3, total = 3 * cols + 2 * gap;
  ['コ', 'コ', 'ロ'].forEach((ch, k) => {
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) if (j < 3 || j >= rows - 3 || i >= cols - 3 || (ch === 'ロ' && i < 3)) cells.push([(k * (cols + gap) + i - total / 2 + 0.5) * CW, 6.25 - j * CHH, -9, k]);
  });
  return cells;
}
function flock(T, ts) {
  const out = [];
  CELLS.forEach((q, i) => {
    const t1 = ts[q[3]], dep = t1 - 1.45 - 0.75 * rnd(i + 0.3), e = clamp((T - dep) / (t1 - dep)), a = Math.pow(e, 2.6);
    const sx = (rnd(i + 1) < 0.5 ? -1 : 1) * (2.2 + rnd(i + 1.5) * 8), sy = 0.4 + rnd(i + 2) * 7, sz = 1.5 + rnd(i + 3) * 12, sw = (1 - a) * (1 - a);
    const hitK = e >= 1 ? 1 + 0.4 * Math.exp(-(T - t1) * 9) : 1;
    out.push({ p: [mix(sx, q[0], a) + sw * 1.2 * Math.sin(T * 1.7 + i), mix(sy, q[1], a) + sw * 0.8 * Math.cos(T * 1.3 + i * 2), mix(sz, q[2], a)], r: e >= 1 ? [0, 0, 0.03 * Math.sin(T * 2 + i)] : [(1 - a) * 0.7 * Math.sin(i + T * 3), (1 - a) * 0.9 * Math.sin(i * 2 + T * 2.2), (1 - a) * Math.sin(i)], s: 0.8 * hitK, v: i % 3, lit: e >= 1 });
  });
  const tm = T - kt(KM);
  for (let i = 0; i < 80; i++) { const z1 = -3.5 - rnd(i + 91) * 9, z = Math.max(z1, 1.5 + rnd(i + 92) * 10 - tm * (9 + 9 * rnd(i + 93))), k = z > z1 ? 1 : 0; out.push({ p: [(rnd(i + 94) < 0.5 ? -1 : 1) * (1.3 + rnd(i + 95) * 7.5), 0.5 + rnd(i + 96) * 5.5 + 0.2 * tm, z], r: [0.6 * Math.sin(T * (1 + 2 * k) + i), 0.8 * Math.sin(T * (0.8 + 2 * k) + i * 2), Math.sin(i)], s: 0.8, v: i % 3 }); }
  for (let i = 0; i < 46; i++) out.push({ p: [(rnd(i + 80) - 0.5) * 26, 0.4 + ((rnd(i + 81) * 9 + T * (0.2 + 0.3 * rnd(i + 82))) % 9), -3 - rnd(i + 83) * 12], r: [T * 0.7 + i, T * 0.5 + i * 2, i], s: 0.8, v: i % 3 });   // others, adrift
  return out;
}

let READY = null;
export function prepare() { return READY ??= prepare1(); }
async function prepare1() {
  await lyrics();
  V2 = await (await fetch('data/cards/v2.json?' + Date.now())).json();
  CCH = await (await fetch('data/cards/cc_heads.json?' + Date.now())).json();
  const ims = {};
  // one at a time, each retried: sixty large drawings decoded at once fail when the machine is short of memory
  const stamp0 = Date.now();
  for (const n of NAMES) for (let a = 0; ; a++) { try { const im = new Image(); im.src = `data/cards/v2_${n}_lit_day.png?${stamp0}${a ? '-' + a : ''}`; await im.decode(); ims[n] = im; break; } catch (e) { if (WINDSET.has(n) && a >= 1) break; if (a >= 3) throw e; await new Promise(r => setTimeout(r, 400)); } }
  const g = V2.rm.ground, a = g.rm_c1, p = g.rm_p1;
  if (a?.length && p?.length) { const v = 2 * (Math.max(...p) - Math.min(...a)); if (v > 1.2 && v < 4) SPEED = v; }
  try { const im = new Image(); im.src = 'data/cards/v2_rm_face_lit_day.png?' + stamp0; await im.decode(); RF = im; } catch (e) { RF = null; }
  init3d(ims); CELLS = wordCells();
  L = { a: line('今動き始めた'), b: line('加速する奇跡'), c: line('ナゼかナミダが止まらナい・・・'), d: line('ナぜ私震える？'), e: line('加速する鼓動'), f: line('コレが私の'), g: line('望んだ「ココロ」？') };
}

// ---- the line behind her heart (centimetres on the layer of the words): flat, then every beat goes out along it both ways
function heartLine(c, kb, y, color, lw, gap = 0) {
  c.save(); c.strokeStyle = color; c.lineWidth = lw; c.lineJoin = 'round'; c.beginPath(); let pen = false;
  const n = Math.floor(kb - KBEAT);
  for (let x = -700; x <= 700; x += 2) {
    let v = 0;
    for (let j = Math.max(0, n - 4); j <= n; j++) {
      const age = kb - KBEAT - j, u = (Math.abs(x) - age * 250) / 16, amp = 30 * Math.exp(-age * 0.55);
      if (u > -1 && u < 1) v += amp * (u < -0.5 ? -(u + 1) * 0.5 : u < 0 ? -0.25 + (u + 0.5) * 2.5 : u < 0.5 ? 1 - u * 3 : -0.5 + (u - 0.5));
    }
    if (gap && Math.abs(x) < gap) { pen = false; continue; }
    pen ? c.lineTo(x, -y - v) : c.moveTo(x, -y - v); pen = true;
  }
  c.stroke(); c.restore();
}
function rings(c, kb, cx, cy, r0, color, lw) {
  if (kb < KBEAT) return;
  for (let j = 0; j < 3; j++) { const age = (kb - KBEAT) % 1 + j; if (kb - KBEAT < age) continue; const ph = age / 3; c.save(); c.globalAlpha = (1 - ph) * 0.85; c.strokeStyle = color; c.lineWidth = lw * (1 - ph) + lw * 0.2; c.beginPath(); c.arc(cx, cy, r0 * (0.25 + age * 0.9), 0, 7); c.stroke(); c.restore(); }
}
function seal(c, cv, x, y, age, rot) {
  const lead = 0.07; if (age < -lead) return;
  const k = age < 0 ? mix(1.3, 1, out3((age + lead) / lead)) : 1 + 0.05 * Math.exp(-age * 18);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k); if (age < 0) c.globalAlpha *= 0.6; c.drawImage(cv, -cv.width / 2, -cv.height / 2); c.restore();
}
const big = (c, s, x, y, size, col, sh, k = 1, sd = 3) => { c.save(); c.translate(x, y); c.scale(k, k); if (sh) text(c, s, sd, sd, size, { font: 'Mincho X', color: sh, align: 'center', base: 'middle' }); text(c, s, 0, 0, size, { font: 'Mincho X', color: col, align: 'center', base: 'middle' }); c.restore(); };

// r9: p9 took out the two-frame in-betweens, so a change of pose is a straight cut on its beat. Each one inside a shot (not on
// a cut) is carried by the camera: a light push of about 1.5 % that lands with the new drawing and settles within the beat.
const SWAPS = ACT.map(a => a[0]).filter(k => k > 0 && ![K1, K2, K3].includes(k));
const nudge = kb => { let a = -1; for (const k of SWAPS) if (kb >= k) a = kb - k; return a < 0 || a > 1.5 ? 1 : 1 - 0.015 * (a / 0.18) * Math.exp(1 - a / 0.18); };
function shotRoom(c, kb, T) {
  const s1 = kb < K1, s2 = !s1 && kb < K2, s3 = !s1 && !s2 && kb < K3, s4 = kb >= K3, nz = nudge(kb);
  // her whole figure, the soles and her shadow in the frame (never cut across the boots)
  if (s1) { const u = clamp((kb - 173.8) / (K1 - 173.8)), cx = mix(0.44, 0.38, u), hh = mix(2.12, 1.92, smooth(u)) * nz, cy = hh / 2 - 0.1; frontal(27, cx, cy, hh, cx * 0.9, cy); }
  else if (s2) { const u = (kb - K1) / (K2 - K1), hh = mix(1.98, 2.3, out3(u)) * nz, cy = hh / 2 - 0.1; frontal(27, mix(0.1, -0.1, u), cy, hh, 0, cy + 0.04); }
  else if (s3) { const u = (kb - K2) / (K3 - K2); frontal(15, mix(-0.03, 0.03, u), 1.405, mix(0.575, 0.545, u) * nz, 0, 1.405); }
  else { const u = (kb - K3) / (KR - K3); frontal(36, 0.15, 0.85, mix(2.5, 2.3, u) * nz, 0, 1.14); }
  // r10 (C4): her soles on the floor, not the card's bottom edge (the redrawn ca_stopo stands 2.9 cm up its card: she floated)
  const k = who(kb); setHer(k, 0, -(V2[setOf(k)]?.low?.[k] ?? 0)); shadow.material.color.set(K.navy); shadow.material.opacity = 0.4;
  const st = s3 ? { back: [], front: [] } : storm(kb, s4), clear = s2 && kb >= 187.5 ? (p => { const q = proj(p.p[0], p.p[1], p.p[2]); return !(q[0] > 1140 && q[0] < 1880 && q[1] > 80 && q[1] < 540); }) : () => true;
  const far = st.back.filter((p, i) => i % 3 !== 1 && clear(p)), near = st.front.filter(clear);
  // the sheet she was reading: it leaves her hand when her hand goes to her chest, and the wave takes it
  if (kb >= 181 && kb < K2) {
    const a = (kb - 181) * PB, w = Math.max(0, (kb - KWAVE) * PB), fall = Math.min(1, a / 0.62), y0 = mix(1.1, 0.012, fall * fall), down = fall >= 1;
    near.push({ p: [-0.16 - 0.42 * fall + 0.07 * Math.sin(fall * 9) * (1 - fall) - w * 1.3, y0 + w * (1.6 + w * 2.6), 0.16 + 0.1 * fall],
      r: down && w <= 0 ? [-1.5708, 0, 0.5] : [-1.5708 * fall + 0.6 * Math.sin(w * 6), 0.5 * Math.sin(fall * 7) * (1 - fall) + 0.7 * Math.sin(w * 4), 0.5 * fall + 0.5 * Math.sin(w * 5)], s: 0.5, v: 3, lit: true });   // the sheet she read: know's last one (v 3), not one of the failures
  }
  const chest = proj(0, 1.14, 0), wv = out3((kb - KWAVE) * PB / 0.55);
  // before the light: the wall as know left it, every volume marked red (失敗); the yellow takes them as it comes
  if (wv <= 0) pass(c, { room: 'A', sheets: far, bg: PAL.A.bg, labRed: true });
  else if (wv >= 1) { if (s3) pass(c, { room: 'Bs', sheets: far, bg: PAL.Bs.bg }); else roomLit(c, far, s4 || s2); }   // r9: in the face close-up only a corner of one light band showed (a yellow sliver at the top right): the close-up is the lit room's shade alone
  else { pass(c, { room: 'A', sheets: far, bg: PAL.A.bg, labRed: true }); c.save(); c.beginPath(); c.arc(chest[0], chest[1], wv * 2300, 0, 7); c.clip(); roomLit(c, far, true); c.restore(); c.strokeStyle = K.yellow; c.lineWidth = 30 * (1 - wv) + 6; c.beginPath(); c.arc(chest[0], chest[1], wv * 2300, 0, 7); c.stroke(); }
  // ---- the layer of the words, behind her
  mid(c, ZT, () => {
    if (!s3) heartLine(c, kb, 114, K.yellow, s4 ? 2.2 : 1.4, 34);   // it stops at her outline (she stands before it)
    if (!s3) rings(c, kb, 0, -114, s4 ? 70 : 46, K.yellow, s4 ? 2.4 : 1.4);
    if (s1) {
      big(c, '今', 96, -128, 96, LIGHT, K.blue, hit(T - L.a[0].t, 0.3, 12) || 0, 2.4);
      row(c, L.a.slice(1), T, 53, -66, 16.5, { color: LIGHT, track: 1 });
    } else if (s2) {
      c.save(); c.transform(1, 0, -0.2, 1, 0, 0);
      row(c, L.b.slice(0, 2), T, -152, -152, 37, { font: 'Dela', color: K.yellow, shadow: INK, sd: 2.4, amt: 0.4 });
      row(c, L.b.slice(2, 4), T, -139, -110, 37, { font: 'Dela', color: K.yellow, shadow: INK, sd: 2.4, amt: 0.4 });
      c.restore();
    } else if (s3) {
      const why = L.c.slice(0, 3), tear = L.c.slice(3, 7);
      column(c, why, T, -43, -166, 11.5, { font: 'Mincho X', color: LIGHT, lead: 1.1 });
      column(c, tear, T, 43, -170, 10.6, { font: 'Dela', color: LIGHT, shadow: INK, sd: 0.9, lead: 1.04, amt: 0.35 });
    } else {
      const stop = L.c.slice(7, 12), dots = L.c.slice(12);
      column(c, stop.slice(0, 3), T, -152, -212, 50, { font: 'Dela', color: K.yellow, shadow: INK, sd: 3.4, lead: 1.06, amt: 0.35 });
      column(c, stop.slice(3), T, 152, -212, 50, { font: 'Dela', color: K.yellow, shadow: INK, sd: 3.4, lead: 1.06, amt: 0.35 });
      column(c, dots, T, 152, -100, 22, { font: 'Dela', color: K.yellow, shadow: INK, sd: 1.6, lead: 0.7 });
    }
  });
  pass(c, { her: true, shadow: !s3 });
  if (near.length) pass(c, { sheets: near });
  if (s4) mid(c, ZT, () => {
    const stop = L.c.slice(7, 12), dots = L.c.slice(12);
    column(c, stop.slice(0, 3), T, -152, -212, 50, { font: 'Dela', color: K.yellow, shadow: INK, sd: 3.4, lead: 1.06, amt: 0.35 });
    column(c, stop.slice(3), T, 152, -212, 50, { font: 'Dela', color: K.yellow, shadow: INK, sd: 3.4, lead: 1.06, amt: 0.35 });
    column(c, dots, T, 152, -100, 22, { font: 'Dela', color: K.yellow, shadow: INK, sd: 1.6, lead: 0.7 });
  });
  // 奇跡: a seal for each character, each landing as it is sung (a frame early), coming down from just above the sheet - never across her
  if (s2) { const q = L.b.slice(4, 6); [[q[0], 1350, 290, -0.1], [q[1], 1655, 320, 0.07]].forEach(([ch, x, y, r]) => seal(c, stamp(ch.c, 190, K.red), x, y, T - (ch.t - 1 / 24), r)); }
  const kf = clamp((kb - (KR - 0.3)) / 0.28);   /* r9: the white on the cut is a flash of about 3 frames, not a held white screen */ if (kf > 0) { c.globalAlpha = kf * kf; c.fillStyle = K.white; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
}

// ---- her face as she runs (k 217 - 218.5, in the middle of the count): head and shoulders, the hair and the tears blown
// back; she looks ahead (left) at the count; the floor's colour, speed lines and sheets go past behind her
const KFACE = 216.5;                                             // r11: on a footfall (was 217 - 218.5, cut mid-stride)
function faceRun(c, kb, T) {
  const b = kb - 206, p = phi(b), t = b * PB, sp = 1;
  c.fillStyle = TEAL; c.fillRect(0, 0, W, H);
  c.save(); c.beginPath(); c.rect(0, 0, W, H); c.rect(30, 70, 590, 560); c.rect(620, 70, 300, 140); c.clip('evenodd');   // nothing crosses the count
  for (let i = 0; i < 16; i++) {                                   // speed lines, going back (to the right) fast
    const y = 60 + ((i * 397) % 960), len = 260 + 340 * rnd(i + 3), x = ((rnd(i) * 3000 + t * 2600 * sp * (0.7 + 0.6 * rnd(i + 1))) % 3000) - 600;
    c.fillStyle = i % 3 ? TEAL_D : LIGHT; c.fillRect(x, y, len, i % 3 ? 10 : 4);
  }
  for (let i = 0; i < 7; i++) {                                    // sheets blown past
    const x = ((rnd(i + 20) * 2600 + t * 1900 * sp * (0.8 + 0.5 * rnd(i + 21))) % 2600) - 300, y = 790 + rnd(i + 22) * 200, r = 0.6 * Math.sin(t * 3 + i);   // low in the frame: never across the count
    c.save(); c.translate(x, y); c.rotate(r); c.fillStyle = K.white; c.fillRect(-70, -95, 140, 190); c.fillStyle = K.blue; for (let j = 0; j < 5; j++) c.fillRect(-52, -70 + j * 26, j % 2 ? 70 : 104, 6); c.restore();
  }
  c.restore();
  // the count, before her face
  const bpm = bpmAt(T);
  // where the wide shot has them (BPM, the line, the count), so nothing jumps at the cuts
  text(c, 'BPM', 66, 150, 54, { font: 'Shoulders', weight: 700, color: LIGHT, track: 6 });
  text(c, String(bpm).padStart(3, '0'), 58, 598, 400, { font: 'Shoulders', weight: 800, color: INK });
  text(c, String(bpm).padStart(3, '0'), 50, 590, 400, { font: 'Shoulders', weight: 800, color: LIGHT });
  row(c, L.e, T, 290, 150, 92, { font: 'Mincho X', color: LIGHT, track: 4 });
  // her: 1807 x 1576 drawn 1040 high (0.66 : 1), bobbing with her stride: once a step, lowest just after the footfall
  const bob = (0.5 - 0.5 * Math.cos(2 * Math.PI * (p - 0.25))) * 14, hh = 1040, ww = RF.width * hh / RF.height;
  c.drawImage(RF, 690, H - hh + 16 - bob, ww, hh);
}
// the words in the sky of the run: they stand far off and she passes them (px they have slid since beat k0)
const FARPX = 15;
// the count is her heart (加速する鼓動), not her feet: it climbs from 40 and catches up with her steps and the song (140) on 鼓,
// k 220, where it turns yellow. It moves in the song's eighths (a new number every half-beat, a frame early), never smoothly.
function bpmAt(T) {
  const k220 = kt(220); if (T >= k220 - 1 / 24) return 140;
  const kq = Math.floor((kbOf(T) + LEAD) * 2) / 2, u = clamp((kt(kq) - L.e[0].t) / (k220 - L.e[0].t));
  return Math.min(139, Math.round(mix(40, 139, Math.pow(u, 0.7))));
}
const camXat = b => -travelled(b) - mix(0.58, 0.5, smooth((b - B_STOP) / 4));
function shotRun(c, kb, T) {
  if (RF && kb >= KFACE - LEAD && kb < KFACE + 2 - LEAD) return faceRun(c, kb, T);   // r11: in and out with a footfall, two beats
  const b = kb - 206, h = runner(b), cx = camXat(b), slide = k0 => (camXat(k0 - 206) - cx) * FARPX;
  // three framings, cut on the beat: alongside her; down by her boots, the floor going by (k 209.5 - 211);
  // high and far, the whole flight of sheets behind her while the count climbs (k 215.5 - 220)
  const low = kb >= 209.5 - LEAD && kb < 211, high = kb >= 215.5 - LEAD && kb < 220;   // r11: the cuts on footfalls come with the footfall's drawing (a frame early)
  if (low) { const u = (kb - 209.5) / 1.5; cam.fov = 34; cam.position.set(h.x - 0.42 + 0.06 * u, 0.32, 2.85); cam.lookAt(h.x - 0.42, 0.76, 0); }   // r11: a little wider and lower, so the boot that comes down stays above the frame's bottom edge
  else if (high) { const u = (kb - 215.5) / 4.5; cam.fov = 31; cam.position.set(h.x - 0.62, mix(1.85, 1.95, u), mix(3.9, 4.1, u)); cam.lookAt(h.x - 0.62, 0.66, 0); }   // from above, nearer: the floor and the flight of sheets, she still half the frame
  else { cam.fov = 31; cam.position.set(cx, 1.22, 4.5); cam.lookAt(cx, 0.9, 0); }
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const gy = proj(cx, 0, -0.45)[1];
  c.fillStyle = TEAL; c.fillRect(0, 0, W, H); c.fillStyle = TEAL_D; c.fillRect(0, gy, W, H - gy);
  // the floor's marks: bold, a metre apart in rows going towards us, so the speed shows in every framing
  c.save(); c.fillStyle = LIGHT; c.globalAlpha = 0.5;
  for (const zr of [-0.45, 0.9, 2.3]) {
    if (zr > cam.position.z - 0.6) continue;
    for (let n = Math.floor((cx - 9) / 0.6); n * 0.6 <= cx + 9; n++) {
      const q = proj(n * 0.6, 0, zr), q2 = proj(n * 0.6, 0, zr + (n % 5 === 0 ? 0.3 : 0.14)), pw = proj(n * 0.6 + 0.03, 0, zr)[0] - q[0];
      if (q[0] < -40 || q[0] > W + 40 || q[1] > H + 10) continue;
      c.beginPath(); c.moveTo(q[0] - pw, q[1]); c.lineTo(q[0] + pw, q[1]); c.lineTo(q2[0] + pw, q2[1]); c.lineTo(q2[0] - pw, q2[1]); c.closePath(); c.fill();
    }
  }
  c.restore();
  // ---- the words
  const sh = L.d.slice(3, 7), kE = kbOf(L.e[0].t) - 0.1, kF = kbOf(L.f[0].t) - 0.1;
  const words = () => {
  if (kb < 211 - 0.1) {
    const dx = slide(205.6);
    row(c, L.d.slice(0, 2), T, 64 + dx, 210, 230, { font: 'Mincho X', color: LIGHT });
    row(c, L.d.slice(2, 3), T, 500 + dx, 240, 330, { font: 'Mincho X', color: LIGHT, shadow: INK, sd: 10, amt: 0.35 });
  } else if (kb < Math.min(kE, 215.5 - LEAD)) {   // r11: the count comes in with the cut to the high shot
    const dx = slide(211), f = Math.floor(kb * 4 + 1e-6), amp = 4;   /* r9: the shiver at a third of what it was - the word must read through it */
    row(c, L.d.slice(0, 3), T, 96 + dx, 420, 92, { font: 'Mincho X', color: LIGHT, all: true, track: 8 });
    [[INK, 1], [K.yellow, 2], [LIGHT, 3]].forEach(([col, n]) => { c.save(); c.translate((rnd(f * 3 + n) - 0.5) * amp * (4 - n), (rnd(f * 7 + n) - 0.5) * amp * (4 - n)); const o = { font: 'Mincho X', color: col, track: 10, amt: 0.25 }, w = row(c, sh.slice(0, 3), T, 40 + dx, 190, 240, o); row(c, sh.slice(3), T, 40 + dx + w - 44, 190, 240, o); c.restore(); });   // 震える？: the ？ set in the row after る, on its line; -50 px: the full-width ？ sits in the middle of its em, so this makes the gap before it the row's own (~90 px); r9: 240 px, so the ？ stays clear of her bow as she runs under it
  } else if (kb < kF) {
    const dx = slide(215.5), k220 = kt(220) - 1 / 24, bpm = bpmAt(T);
    // after it lands, 140 throbs with each footfall (k + 0.5)
    const kh = T >= k220 ? 1 + 0.22 * Math.exp(-(T - k220) * 9) + 0.04 * Math.exp(-((((kb + LEAD - 0.5) % 1) + 1) % 1) * 5) : 1;
    text(c, 'BPM', 66 + dx, 150, 54, { font: 'Shoulders', weight: 700, color: LIGHT, track: 6 });
    c.save(); c.translate(50 + dx, 590); c.scale(kh, kh); text(c, String(bpm).padStart(3, '0'), 8, 8, 440, { font: 'Shoulders', weight: 800, color: INK }); text(c, String(bpm).padStart(3, '0'), 0, 0, 440, { font: 'Shoulders', weight: 800, color: T >= k220 ? K.yellow : LIGHT }); c.restore();
    row(c, L.e, T, 290 + dx, 150, 92, { font: 'Mincho X', color: LIGHT, track: 4 });
  }
  };
  // ---- the line she runs along: a beat stands up where each foot came down
  c.save(); c.strokeStyle = LIGHT; c.lineWidth = 6; c.lineJoin = 'round'; c.beginPath();
  // r11: each pulse stands where that foot came down (the sole of rm_c1 / rm_c2 / rm_s1), as it comes down (a frame early)
  const falls = FALLS().filter(f => b >= f.b - 1e-6 && Math.abs(f.x - cx) < 3.8);
  for (let x = cx - 3.4; x <= cx + 3.4; x += 0.012) {
    let v = 0;
    for (const f of falls) {
      const u = (x - f.x) / 0.2; if (u <= -1 || u >= 1) continue;
      v += 0.46 * out3((b - f.b) / 0.3) * (u < -0.5 ? -(u + 1) * 0.5 : u < 0 ? -0.25 + (u + 0.5) * 2.5 : u < 0.5 ? 1 - u * 3 : -0.5 + (u - 0.5));
    }
    const q = proj(x, v, -0.45); x === cx - 3.4 ? c.moveTo(q[0], q[1]) : c.lineTo(q[0], q[1]);
  }
  c.stroke(); c.restore();
  // r11: a ring goes out from her chest with each footfall - except while the count (her heart, BPM) is still climbing to
  // 140 (k 215.5 - 220): a ring at the steps' 140 beside a count of 90 would say two things. The rings come back on the
  // first footfall after the count lands (k 220.5), fresh, so the heart and the steps are one from there.
  const counting = kb >= 215.5 - LEAD && kb < 220.5 - LEAD;
  const ch = proj(h.x - 0.1, h.y + 1.12, 0); if (!counting) rings(c, kb + 0.5 + LEAD, ch[0], ch[1], 90, K.yellow, 5);
  setHer(h.k, h.x, h.y); shadow.material.color.set('#0f4f5c'); shadow.material.opacity = 0.55;
  { // the shadow lies under the foot that is down (between both when both are), small under her when she is in the air
    const g = V2.rm.ground[h.k], cx0 = h.x - V2.rm.ax;
    if (FLIGHT.has(h.k) || !g?.length) shadow.scale.multiplyScalar(0.8);
    else { shadow.position.x = cx0 + g.reduce((a, q) => a + q, 0) / g.length; if (g.length > 1) shadow.scale.x = Math.max(shadow.scale.x, (Math.max(...g) - Math.min(...g)) / 2 + 0.12); }
  }
  const fl = field(b, h.x);
  // r9: no sheet, near or far, sits in the words' corner (a blank sheet-back beside 加 read as an extra stroke)
  // while she runs (the words in the top left); a sheet going into that corner shrinks away over 150 px instead of popping
  const inWords = kb < kF, shrink = s => { if (!inWords) return s; const q = proj(s.p[0], s.p[1], s.p[2]), d = Math.min(1300 - q[0], 660 - q[1]), k = d <= 0 ? 1 : clamp(1 - d / 150); return k >= 1 ? s : { ...s, s: (s.s ?? 1) * k }; };
  pass(c, { sheets: fl.filter(s => s.p[2] < 0.3).map(shrink).filter(s => (s.s ?? 1) > 0.02), shade: '#bfe2e5' });
  words();                                                       // over the sheets behind her, and never where she is
  // r9: a sheet nearer than her never crosses her face or the words (it was seen square on her mouth, and as an extra
  // stroke beside 加): those are left out while they would be there
  // (it shrinks away as it comes near her face, from 260 px to 150 px off it, so nothing pops)
  const face = proj(h.x - 0.15, h.y + 1.42, 0), nearFace = s => { const q = proj(s.p[0], s.p[1], s.p[2]), k = clamp((Math.hypot(q[0] - face[0], q[1] - face[1]) - 150) / 110); return k >= 1 ? s : { ...s, s: (s.s ?? 1) * k }; };
  pass(c, { her: true, sheets: fl.filter(s => s.p[2] >= 0.3).map(shrink).map(nearFace).filter(s => (s.s ?? 1) > 0.02), shade: '#bfe2e5' });
  if (kb >= kF) row(c, L.f, T, 110 + slide(223.56), 560, 150, { font: 'Mincho X', color: INK, shadow: LIGHT, sd: 7 });
  const kf = 1 - clamp((kb - KR) / 0.35); if (kf > 0) { c.globalAlpha = kf * kf; c.fillStyle = K.white; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
}

function shotMon(c, kb, T) {
  // from low behind her: she stands big in the foreground (cut cleanly at the hips, 60 % of the frame), looking up
  // at the word as the sheets put it together above; on the beat the first コ lands she lifts her head (tk0 -> tk_h)
  const e = smooth(clamp((kb - KM) / (KE - KM)));
  cam.fov = 36; cam.position.set(mix(0.12, 0.0, e), mix(0.86, 0.9, e), mix(4.12, 4.18, e)); cam.lookAt(mix(0.1, 0.02, e), mix(4.2, 4.45, e), -9); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  c.fillStyle = '#10214f'; c.fillRect(0, 0, W, H);
  ground(c);
  const ts = L.g.filter(ch => 'ココロ'.includes(ch.c)).map(ch => ch.t), all = flock(T, ts);
  pass(c, { sheets: all.filter(s => s.p[2] < -0.5), shade: '#aab8e2' });
  setHer(kb >= 236 ? 'tk_r' : kb >= 234 ? 'tk_h' : 'tk0', -0.18, 0, 1.75); shadow.material.color.set('#070f2b'); shadow.material.opacity = 0.7;   // under the middle コ, clear of ロ; her shadow dark under her feet (p8: was left inside the comment)
  pass(c, { her: true, sheets: all.filter(s => s.p[2] >= -0.5), shade: '#aab8e2' });
  // her words, to her left - r9: set after the near sheets, so no flying sheet covers them (they stand clear of her)
  mid(c, -0.6, () => {
    row(c, L.g.slice(0, 3), T, -232, -110, 42, { font: 'Mincho X', color: LIGHT, track: 3 });
  });
}// the ground is drafting paper: a grid going away
function ground(c) {
  c.save(); c.strokeStyle = K.blue; c.lineWidth = 1.6;
  const zN = cam.position.z - 0.6;
  for (let x = -16; x <= 16; x++) for (let z = Math.floor(zN); z > -22; z--) { const a = proj(x, 0, Math.min(z, zN)), b2 = proj(x, 0, z - 1); c.globalAlpha = 0.75 * clamp(1 - (cam.position.z - z) / 30); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b2[0], b2[1]); c.stroke(); }
  for (let z = Math.floor(zN); z > -22; z--) { const a = proj(-16, 0, z), b2 = proj(16, 0, z); c.globalAlpha = 0.75 * clamp(1 - (cam.position.z - z) / 30); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b2[0], b2[1]); c.stroke(); }
  c.restore();
}

export const stage = { has: n => !!TEX[n], pass, frontal, mid, proj, setHer, bands, PAL, kt, kbOf, heartLine, rings, big, roomLit, stormT, ground, get cam() { return cam; }, get shadow() { return shadow; }, get L() { return L; }, BOOKS, labelOf };

export function draw(c, t) {
  const T = t + start, kb = kbOf(T);
  (kb < KR ? shotRoom : kb < KM ? shotRun : shotMon)(c, kb, T);
}
