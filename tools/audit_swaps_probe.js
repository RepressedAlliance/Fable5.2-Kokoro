// Browser side of work/audit_swaps.mjs: loads one page module, draws it frame by frame at 24 fps on a canvas of its own and
// records, per frame, which character cards (data/cards/v2_NAME_lit_day.png) reached that canvas and where (bbox, alpha).
// Cards reach the frame directly, through offscreen canvases (tints, silhouettes, compositing buffers) or through three.js
// planes (chorus1 and the pages that borrow its stage). Pixels are drawn as usual; only the bookkeeping is added.
// Evaluated by the driver as an async function expression taking (pageName, fps).
async (pageName, fps) => {
  const W = 1920, H = 1080;
  // ---- the import map page.html has (three)
  if (!document.querySelector('script[type=importmap]')) {
    const s = document.createElement('script'); s.type = 'importmap';
    s.textContent = JSON.stringify({ imports: { three: '/vendor/three.module.js' } }); document.head.appendChild(s);
  }
  const FONTS = [['Mincho X', 'ShipporiMinchoB1-ExtraBold.ttf'], ['Mincho', 'ZenOldMincho-Medium.ttf'], ['Mincho K', 'ZenOldMincho-Black.ttf'],
    ['Gothic X', 'ZenKakuGothicNew-Black.ttf'], ['Gothic', 'ZenKakuGothicNew-Medium.ttf'], ['Dela', 'DelaGothicOne-Regular.ttf'],
    ['Dot', 'DotGothic16-Regular.ttf'], ['Mono', 'IBMPlexMono-Regular.ttf'], ['Shoulders', 'BigShouldersDisplay.ttf', { weight: '100 900' }],
    ['Klee', 'KleeOne-SemiBold.ttf']];
  await Promise.all(FONTS.map(async ([n, f, d]) => { try { const ff = new FontFace(n, `url(/p/assets/fonts/${f})`, d || {}); await ff.load(); document.fonts.add(ff); } catch (e) { } }));

  let FRAME = -1;
  const MAIN = document.createElement('canvas'); MAIN.width = W; MAIN.height = H;
  const rec = [];                                                 // rec[frame] = [[name, x0, y0, x1, y1, alpha, hops, tinted], ...]
  const cardOf = src => { const m = /v2_(.+?)_lit_day\.png/.exec(src || ''); return m ? m[1] : null; };

  // tag card images when they are decoded (every page loads them with im.decode())
  const dec = HTMLImageElement.prototype.decode;
  HTMLImageElement.prototype.decode = function () { const n = cardOf(this.src); if (n) this.__card = n; return dec.call(this); };
  // offscreen canvases remember what was drawn into them since they were last cleared
  const wd = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'width'), hd = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'height');
  Object.defineProperty(HTMLCanvasElement.prototype, 'width', { get() { return wd.get.call(this); }, set(v) { this.__cards = []; wd.set.call(this, v); }, configurable: true });
  Object.defineProperty(HTMLCanvasElement.prototype, 'height', { get() { return hd.get.call(this); }, set(v) { this.__cards = []; hd.set.call(this, v); }, configurable: true });
  const P = CanvasRenderingContext2D.prototype, dI = P.drawImage, cR = P.clearRect, fR = P.fillRect;
  P.clearRect = function (x, y, w, h) {
    const cv = this.canvas, t = this.getTransform();
    if (cv !== MAIN && cv.__cards && t.a === 1 && t.d === 1 && t.b === 0 && t.c === 0 && x + t.e <= 0 && y + t.f <= 0 && x + t.e + w >= cv.width && y + t.f + h >= cv.height) cv.__cards = [];
    return cR.call(this, x, y, w, h);
  };
  P.fillRect = function (x, y, w, h) {
    const cv = this.canvas;
    if (cv !== MAIN && cv.__cards && cv.__cards.length && this.globalCompositeOperation === 'source-in') for (const e of cv.__cards) e[7] = 1;   // a flat silhouette of what is there
    return fR.call(this, x, y, w, h);
  };
  const entriesOf = src => {
    if (src.__card) return [[src.__card, 0, 0, src.naturalWidth || src.width, src.naturalHeight || src.height, 1, 0, 0]];
    const L = src.__cards; if (!L || !L.length) return [];
    const now = L.filter(e => e[8] === FRAME);
    return now.length ? now : L;
  };
  P.drawImage = function (src, ...a) {
    const r = dI.call(this, src, ...a);
    try {
      const E = entriesOf(src); if (!E.length) return r;
      const sw0 = src.naturalWidth || src.videoWidth || src.width, sh0 = src.naturalHeight || src.videoHeight || src.height;
      let sx = 0, sy = 0, sw = sw0, sh = sh0, dx, dy, dw, dh;
      if (a.length === 2) { [dx, dy] = a; dw = sw0; dh = sh0; } else if (a.length === 4) { [dx, dy, dw, dh] = a; } else { [sx, sy, sw, sh, dx, dy, dw, dh] = a; }
      const t = this.getTransform(), cv = this.canvas, al = this.globalAlpha;
      for (const e of E) {
        const ix0 = Math.max(e[1], sx), iy0 = Math.max(e[2], sy), ix1 = Math.min(e[3], sx + sw), iy1 = Math.min(e[4], sy + sh);
        if (ix1 <= ix0 || iy1 <= iy0) continue;
        const map = (u, v) => { const X = dx + (u - sx) / sw * dw, Y = dy + (v - sy) / sh * dh; return [t.a * X + t.c * Y + t.e, t.b * X + t.d * Y + t.f]; };
        const q = [map(ix0, iy0), map(ix1, iy0), map(ix0, iy1), map(ix1, iy1)];
        const xs = q.map(p => p[0]), ys = q.map(p => p[1]);
        const out = [e[0], Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), e[5] * al, e[6] + (src.__card ? 0 : 1), e[7], FRAME];
        if (cv === MAIN) { if (FRAME >= 0) (rec[FRAME] ??= []).push(out.slice(0, 8)); }
        else (cv.__cards ??= []).push(out);
      }
    } catch (err) { }
    return r;
  };
  // three.js: after each render, the visible planes textured with a card, projected to the renderer's canvas
  const THREE = await import('three');
  // (WebGLRenderer.render is an own property of each renderer, so the hooks are the scene's and the objects' callbacks)
  let DBG = { renders: 0, cardMeshes: 0 };
  THREE.Scene.prototype.onBeforeRender = function (r) { r.domElement.__cards = []; DBG.renders++; };
  THREE.Object3D.prototype.onBeforeRender = function (r, scene, cam, geo, mat) {
    try {
      const im = this.isMesh && mat && mat.map && mat.map.image; if (!im || !im.__card) return;
      const cv = r.domElement, cw = cv.width, ch = cv.height;
      if (!geo.boundingBox) geo.computeBoundingBox();
      const b = geo.boundingBox, xs = [], ys = [];
      for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) {
        const v = new THREE.Vector3(x, y, 0).applyMatrix4(this.matrixWorld).project(cam); xs.push((v.x + 1) / 2 * cw); ys.push((1 - v.y) / 2 * ch);
      }
      (cv.__cards ??= []).push([im.__card, Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), mat.opacity ?? 1, 0, 0, FRAME]); DBG.cardMeshes++;
    } catch (err) { }
  };
  window.__auditDbg = DBG;

  const page = await import(`/pages/${pageName}.js?audit=${Date.now()}`);
  if (page.prepare) await page.prepare();
  const c = MAIN.getContext('2d');
  const n1 = Math.round(page.duration * fps), errors = [];
  for (let n = 0; n < n1; n++) {
    FRAME = n; rec[n] = rec[n] || [];
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    try { page.draw(c, n / fps); } catch (e) { errors.push([n, String(e)]); }
  }
  return JSON.stringify({ page: pageName, start: page.start, duration: page.duration, fps, frames: rec.map(f => (f || []).map(e => [e[0], Math.round(e[1]), Math.round(e[2]), Math.round(e[3]), Math.round(e[4]), +e[5].toFixed(3), e[6], e[7]])), errors: errors.slice(0, 20), dbg: DBG });
}
