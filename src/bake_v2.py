"""Bake the redo's drawing sets (art/v2/sets.json) into cards the film can stand in a scene.

What this fixes, by construction, from the first cut:
  - one crop for a whole set (the union of everything drawn in it): nothing is fitted drawing by drawing;
  - SIZE IN THE SCENE IS MEASURED, NOT EYEBALLED: metres per pixel come from a drawing of the set in which the figure
    stands upright (hair top to soles = her height), or, for a close-up, from the height of the hair against the
    canonical figure's, or from something of known size drawn with the figure (the stool he sits on);
  - the iris keeps its teal in shadow: the shadow tint is applied to everything but the iris, which is only darkened.

  python src/bake_v2.py [set ...]
     -> web/data/cards/v2_<name>_{lit_day,sh_day,lit_night,sh_night}.png, web/data/cards/v2.json,
        work/look/v2_<set>_onion.jpg

sets.json:  { "<set>": { "canon": "rin_side", "height": 1.52, "shade": [r,g,b],
                         "scale": "stand" (default) | "hair_h" (close-ups);  "scale_item": the drawing to measure (default: master)
                         "hair": [x0, x1]        (optional: look for the hair only in this part of the width, 0..1)
                         "mpp": metres per pixel, given outright;  "mpp_of": "<set>" take it from another set
                         "items": { "<card name>": "<file stem in art/v2/raw>" , ... } } }   first item = the master
v2.json:    { "<set>": { names, px: [w, h], mpp, h: metres of the card, ax: metres from the card's centre to the master's
                         feet (give the card dx = -ax to stand the feet on its anchor) } }
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import matte  # noqa: E402
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
import pad_ref  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "web" / "data" / "cards"
RAW = ROOT / "art" / "v2" / "raw"
CANON = ROOT / "art" / "canon"


def read(path):
    """A drawing as float RGBA. Magenta ground is cut; a white ground (the sheets the canon was cut from) too."""
    try:
        return matte.cut(str(path))
    except ValueError:
        im = cv2.imread(str(path)).astype(np.float32) / 255
        a = (im.min(2) < 0.92).astype(np.float32)
        a = cv2.morphologyEx(a, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
        a[(np.ptp(im, axis=2) < 0.06) & (im.mean(2) > 0.55)] = 0          # the soft shadow under the feet is not the figure
        return np.dstack([im[..., ::-1], a])


def hair(r, span=None):
    """Area (px) and box of the hair: the largest blond piece; white hair (the old man) counts as hair too."""
    rgb, a = r[..., :3], r[..., 3]
    m = (a > 0.5) & (rgb[..., 0] > 0.75) & (rgb[..., 1] > 0.6) & (rgb[..., 2] < 0.72) & (rgb[..., 0] - rgb[..., 2] > 0.2)      # his blond is paler than hers
    if span:
        w = m.shape[1]; m[:, :int(span[0] * w)] = False; m[:, int(span[1] * w):] = False
    # the hair is the largest blond piece that starts in the top quarter of the figure (a yellow necktie does not),
    # together with the blond pieces beside it at the same height (a headband or a clip cuts the hair in two)
    ys = np.where(a.max(1) > 0.5)[0]
    n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8))
    if n < 2:
        return None
    areas = st[1:, cv2.CC_STAT_AREA].astype(np.float64).copy()
    areas[st[1:, cv2.CC_STAT_TOP] > ys.min() + 0.25 * (ys.max() - ys.min())] = 0
    k = 1 + int(np.argmax(areas))
    x, y, w, h = [int(v) for v in st[k, :4]]
    total, box = 0.0, [x, y, x + w, y + h]
    for j in range(1, n):
        xj, yj, wj, hj, aj = [int(v) for v in st[j]]
        cy, cx = yj + hj / 2, xj + wj / 2
        if j == k or (y <= cy <= y + h and x - 0.5 * w <= cx <= x + 1.5 * w and aj > 30):
            total += aj
            box = [min(box[0], xj), min(box[1], yj), max(box[2], xj + wj), max(box[3], yj + hj)]
    return total, [box[0], box[1], box[2] - box[0], box[3] - box[1]]


def main_only(rgba):
    a = (rgba[..., 3] > 0.5).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(a, connectivity=8)
    if n <= 2:
        return rgba
    big = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    near = cv2.dilate((lab == big).astype(np.uint8), np.ones((61, 61), np.uint8)) > 0
    keep = np.zeros(n, bool)
    for k in range(1, n):
        keep[k] = k == big or bool(near[lab == k].any())
    rgba = rgba.copy(); rgba[..., 3] *= keep[lab]
    return rgba


def iris(rgb, a):
    """The teal of an eye: saturated blue-green. Not the Prussian blue of collar, boots and ink (that is bluer)."""
    hsv = cv2.cvtColor(np.ascontiguousarray(rgb.astype(np.float32)), cv2.COLOR_RGB2HSV)       # H in degrees
    m = (a > 0.5) & (hsv[..., 0] > 165) & (hsv[..., 0] < 214) & (hsv[..., 1] > 0.4) & (hsv[..., 2] > 0.46)        # the navy of collar and boots is as blue but darker
    return cv2.dilate(m.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0


def save4(im, name, shade):
    sh = im.copy()
    sh[..., :3] *= np.array(shade, np.float32)
    m = iris(im[..., :3], im[..., 3])
    lum = float(np.dot(shade, (0.3, 0.5, 0.2)))
    sh[m, :3] = im[m, :3] * lum
    for tag, x in (("lit_day", im), ("sh_day", sh), ("lit_night", im), ("sh_night", sh)):
        cv2.imwrite(str(OUT / f"{name}_{tag}.png"), cv2.cvtColor((np.clip(x, 0, 1) * 255).astype(np.uint8), cv2.COLOR_RGBA2BGRA))


def onion(cuts, path, cols=5):
    """Each drawing over the master, half and half: what should not move must coincide."""
    names = list(cuts); base = cuts[names[0]]
    tiles = []
    for k in names:
        c = cuts[k]
        bg = np.full(c.shape[:2] + (3,), 0.78, np.float32)
        one = bg * (1 - c[..., 3:]) + c[..., :3] * c[..., 3:]
        two = one * 0.5 + (bg * (1 - base[..., 3:]) + base[..., :3] * base[..., 3:]) * 0.5
        t = np.vstack([one, two])
        s = 520 / t.shape[0] * 2 if t.shape[0] > 1040 else 1.0
        t = cv2.resize(t, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
        t = np.ascontiguousarray((np.clip(t, 0, 1) * 255).astype(np.uint8)[..., ::-1])
        cv2.putText(t, k, (6, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (140, 20, 20), 2)
        tiles.append(t)
    while len(tiles) % cols:
        tiles.append(np.full_like(tiles[0], 200))
    cv2.imwrite(str(path), np.vstack([np.hstack(tiles[i:i + cols]) for i in range(0, len(tiles), cols)]), [cv2.IMWRITE_JPEG_QUALITY, 86])


def main():
    sets = json.loads((ROOT / "art" / "v2" / "sets.json").read_text(encoding="utf-8"))
    p = OUT / "v2.json"
    info = json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}
    for s in (sys.argv[1:] or list(sets)):
        cfg = sets[s]
        cuts = {}
        # "frame_of": "<set>": that set's drawings fix this set's crop, master (ax) and picture size, so a card of this set lies
        # exactly on that set's cards (a swap-in for one of them); they are only measured, not saved again
        frame = {"\0" + k: v for k, v in sets[cfg["frame_of"]]["items"].items()} if cfg.get("frame_of") else {}
        for k, stem in {**frame, **cfg["items"]}.items():
            f = RAW / f"{stem}.png"
            if not f.exists():
                print("  missing", f.name)
                continue
            # two people in one drawing may stand apart: both are the drawing (sets.json "keep_all")
            keep_all = sets[cfg["frame_of"]].get("keep_all") if k in frame else cfg.get("keep_all")
            c = read(f) if keep_all else main_only(read(f))
            rgb = c[..., :3]                                            # a sheet of paper is drawn as flat pale cyan: it is paper
            cyan = (rgb[..., 2] > 0.8) & (rgb[..., 1] > 0.75) & (rgb[..., 0] < rgb[..., 2] - 0.15) & (c[..., 3] > 0.5)
            cyan = cv2.morphologyEx(cyan.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)) > 0
            if cfg.get("paper_min"):                                    # only sheet-sized patches are paper: a pale teal iris or a tear is not
                n_, lab_, st_, _ = cv2.connectedComponentsWithStats(cyan.astype(np.uint8), 8)
                cyan &= np.isin(lab_, [i for i in range(1, n_) if st_[i, cv2.CC_STAT_AREA] >= cfg["paper_min"]])
            if cfg.get("keep_print"):                                   # print drawn on the sheet (thin dark ink): closing must not paint it over
                cyan &= rgb @ np.array([0.299, 0.587, 0.114], np.float32) > 0.62
            rgb[cyan] = np.array([0.97, 0.94, 0.84], np.float32)
            if cfg.get("drop_brown"):                                   # a seat drawn under her: in the scene she sits on the real stool
                hsv = cv2.cvtColor(np.ascontiguousarray(rgb.astype(np.float32)), cv2.COLOR_RGB2HSV)
                brown = (c[..., 3] > 0.3) & ((hsv[..., 0] < 40) | (hsv[..., 0] > 340)) & (hsv[..., 1] > 0.25) & (hsv[..., 2] < 0.62) & (hsv[..., 2] > 0.12)
                brown = cv2.morphologyEx(brown.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
                brown = cv2.dilate(brown, np.ones((7, 7), np.uint8)) > 0
                c[..., 3] *= ~brown
                c = main_only(c)
            cuts[k] = c
        if not cuts:
            continue
        master = next(iter(cuts.values()))
        sizes = {c.shape[:2] for c in cuts.values()}
        if len(sizes) > 1:                                              # drawings of one set must share one picture size
            h, w = master.shape[:2]
            for k, c in list(cuts.items()):
                if c.shape[:2] != (h, w):
                    done = False
                    for rule in (pad_ref.canvas, pad_ref.canvas_old):
                        PW, PH, px0, py0 = rule(w, h)
                        if (PW, PH) != (w, h) and abs(c.shape[1] / c.shape[0] - PW / PH) < 0.006:
                            # drawn from the padded master (tools/pad_ref.py): undo the padding exactly
                            c = cv2.resize(c, (PW, PH), interpolation=cv2.INTER_AREA if c.shape[0] > PH else cv2.INTER_CUBIC)
                            cuts[k] = np.clip(c[py0:py0 + h, px0:px0 + w], 0, 1)
                            done = True
                            break
                    if done:
                        continue
                    if abs(c.shape[1] / c.shape[0] - w / h) > 0.004 * w / h:
                        # another shape of picture: bring its head to the size and place of the master's head (right when
                        # the drawing changes the legs or the arms and leaves the head alone: say so in sets.json, "refit")
                        if k not in cfg.get("refit", []):
                            print(f"  WRONG SIZE {k}: {c.shape[1]}x{c.shape[0]}, the master is {w}x{h}: draw it again, or list it under refit")
                            del cuts[k]
                            continue
                        am, bm = hair(master, cfg.get("hair")); ak, bk = hair(c, cfg.get("hair"))
                        f = (am / ak) ** 0.5
                        c = cv2.resize(c, None, fx=f, fy=f, interpolation=cv2.INTER_AREA)
                        _, bk = hair(c, cfg.get("hair"))
                        dx, dy = round(bm[0] + bm[2] / 2 - bk[0] - bk[2] / 2), bm[1] - bk[1]
                        canvas = np.zeros_like(master)
                        ys0, xs0 = max(0, dy), max(0, dx)
                        hh, ww = min(h - ys0, c.shape[0] - max(0, -dy)), min(w - xs0, c.shape[1] - max(0, -dx))
                        canvas[ys0:ys0 + hh, xs0:xs0 + ww] = c[max(0, -dy):max(0, -dy) + hh, max(0, -dx):max(0, -dx) + ww]
                        print(f"  refit {k}: scaled {f:.3f}, moved {dx},{dy}")
                        cuts[k] = canvas
                        continue
                    cuts[k] = cv2.resize(c, (w, h), interpolation=cv2.INTER_AREA)
        # a drawing between two poses is sometimes drawn whole but smaller: bring its head to the master's size and
        # stand its feet where the master's feet are (sets.json "rescale_feet": only for drawings whose feet have not moved)
        for k in cfg.get("rescale_feet", []):
            if k not in cuts:
                continue
            c = cuts[k]
            f = (hair(master, cfg.get("hair"))[0] / hair(c, cfg.get("hair"))[0]) ** 0.5
            c = cv2.resize(c, None, fx=f, fy=f, interpolation=cv2.INTER_CUBIC if f > 1 else cv2.INTER_AREA)

            def feet(r):
                m_ = r[..., 3] > 0.5
                ys_ = np.where(m_.any(1))[0]
                xs_ = np.where(m_[max(ys_.max() - int(0.03 * (ys_.max() - ys_.min())), 0):ys_.max() + 1].any(0))[0]
                return int(round((xs_.min() + xs_.max()) / 2)), int(ys_.max())
            (mx, my), (kx, ky) = feet(master), feet(c)
            dx, dy = mx - kx, my - ky
            canvas = np.zeros_like(master)
            H, W = master.shape[:2]
            ys0, xs0 = max(0, dy), max(0, dx)
            hh, ww = min(H - ys0, c.shape[0] - max(0, -dy)), min(W - xs0, c.shape[1] - max(0, -dx))
            canvas[ys0:ys0 + hh, xs0:xs0 + ww] = np.clip(c[max(0, -dy):max(0, -dy) + hh, max(0, -dx):max(0, -dx) + ww], 0, 1)
            print(f"  rescaled {k}: {f:.3f}, feet moved {dx},{dy}")
            cuts[k] = canvas
        boxes = [np.where(c[..., 3] > 0.5) for c in cuts.values()]
        h, w = master.shape[:2]
        y0 = max(0, min(b[0].min() for b in boxes) - 4); y1 = min(h, max(b[0].max() for b in boxes) + 5)
        x0 = max(0, min(b[1].min() for b in boxes) - 4); x1 = min(w, max(b[1].max() for b in boxes) + 5)
        # metres per pixel
        if "mpp_of" in cfg:
            mpp = info[cfg["mpp_of"]]["mpp"]
        elif "mpp" in cfg:                                              # read off something of known size in the drawing (his stool)
            mpp = cfg["mpp"]
        elif cfg.get("scale", "stand") == "stand":
            # a drawing in which she stands upright and whole: the top of her hair to her soles is her height
            ref = cuts[cfg.get("scale_item", next(iter(cuts)))]
            _, hb = hair(ref, cfg.get("hair"))
            mpp = cfg["height"] / (np.where(ref[..., 3] > 0.5)[0].max() - hb[1])
        else:
            # a close-up: the height of the hair against the hair of the canonical figure of the same view
            c = read(CANON / f"{cfg['canon']}.png")
            _, bc = hair(c)
            _, bm = hair(master, cfg.get("hair"))
            mpp = cfg["height"] / (np.where(c[..., 3] > 0.5)[0].max() - bc[1]) * bc[3] / bm[3]
        # where the master's feet are, across the card
        m = master[y0:y1, x0:x1, 3] > 0.5
        rows = np.where(m.any(1))[0]
        low = m[max(rows.max() - int(0.03 * m.shape[0]), 0):rows.max() + 1]
        xs = np.where(low.any(0))[0]
        ax = ((xs.min() + xs.max()) / 2 - m.shape[1] / 2) * mpp
        cut_bottom = bool(master[-3:, :, 3].max() > 0.5)
        cuts = {k: c for k, c in cuts.items() if k not in frame}
        for k, c in cuts.items():
            save4(c[y0:y1, x0:x1], "v2_" + k, cfg.get("shade", (0.74, 0.80, 0.96)))
        # where each drawing touches the ground: metres from the card's centre, one entry per boot down; and how far its
        # lowest point is above the card's bottom edge (a walk's contact drawing sinks: lower the card by this much)
        ground, low = {}, {}
        for k, c in cuts.items():
            mk = c[y0:y1, x0:x1, 3] > 0.5
            gy = np.where(mk.any(1))[0].max()                           # this drawing's own lowest line
            low[k] = round(float((m.shape[0] - 1 - gy) * mpp), 4)       # how far above the card's bottom edge that is
            band = mk[max(gy - int(0.012 * m.shape[0]), 0):gy + 1].any(0).astype(np.uint8)
            n, lab, st, _ = cv2.connectedComponentsWithStats(band[None, :])
            ground[k] = [round(float((st[j, 0] + st[j, 2] / 2 - m.shape[1] / 2) * mpp), 4) for j in range(1, n) if st[j, 2] > 4]
        info[s] = {"names": list(cuts), "px": [int(x1 - x0), int(y1 - y0)], "mpp": float(mpp), "h": float((y1 - y0) * mpp), "ax": float(ax), "cut_bottom": cut_bottom, "ground": ground, "low": low}
        print(f"{s:6s} {len(cuts):2d} drawings  card {(x1 - x0) * mpp:.2f} x {(y1 - y0) * mpp:.2f} m  feet at {ax:+.2f} m" + ("  (cropped by the picture's bottom edge: a close-up)" if cut_bottom else ""))
        (ROOT / "work" / "look").mkdir(parents=True, exist_ok=True)
        onion({k: c[y0:y1, x0:x1] for k, c in cuts.items()}, ROOT / "work" / "look" / f"v2_{s}_onion.jpg")
    p.write_text(json.dumps(info, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
