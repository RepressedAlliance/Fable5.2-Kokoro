"""Cut a character drawing off its flat magenta ground.

No colour in the character palette (ivory, yellow, Prussian blue, teal, grey-blue shadow) has more
red-and-blue than green, so "magenta-ness" m = min(r, b) - g is ~0 on the drawing and ~1 on the ground.
Alpha comes straight from m and the ground colour is unmixed from edge pixels, which keeps the thin
ink line intact and leaves no fringe.

CLI:  python src/matte.py in.png out.png
"""
from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np


def cut(path):
    bgr = cv2.imread(str(path), cv2.IMREAD_COLOR).astype(np.float32) / 255.0
    rgb = bgr[..., ::-1]
    h, w = rgb.shape[:2]
    border = np.concatenate([rgb[:6].reshape(-1, 3), rgb[-6:].reshape(-1, 3), rgb[:, :6].reshape(-1, 3), rgb[:, -6:].reshape(-1, 3)])
    ground = np.median(border, axis=0)
    m_ground = min(ground[0], ground[2]) - ground[1]
    if m_ground < 0.5:
        raise ValueError(f"{path}: border is not magenta (median {ground})")
    m = np.minimum(rgb[..., 0], rgb[..., 2]) - rgb[..., 1]
    alpha = 1.0 - np.clip(m / m_ground, 0, 1)
    alpha = np.clip((alpha - 0.04) / 0.92, 0, 1)                 # absorb compression noise at both ends
    a3 = alpha[..., None]
    fg = np.where(a3 > 0.02, (rgb - (1 - a3) * ground) / np.maximum(a3, 0.02), 0)
    fg = np.clip(fg, 0, 1)
    # drop specks that are not attached to the figure
    n, lab, stats, _ = cv2.connectedComponentsWithStats((alpha > 0.5).astype(np.uint8), connectivity=8)
    if n > 2:
        keep = np.zeros(n, bool)
        areas = stats[:, cv2.CC_STAT_AREA]
        keep[1:] = areas[1:] >= max(40, 0.002 * areas[1:].max())
        solid = keep[lab]
        solid = cv2.dilate(solid.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
        alpha = alpha * solid
    rgba = np.dstack([fg, alpha])
    return rgba


def bbox(rgba, pad=4):
    ys, xs = np.where(cv2.erode((rgba[..., 3] > 0.3).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0)
    h, w = rgba.shape[:2]
    return max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad + 1, w), min(ys.max() + pad + 1, h)


def save_rgba(rgba, path):
    out = (np.clip(rgba, 0, 1) * 255 + 0.5).astype(np.uint8)
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(path), cv2.cvtColor(out, cv2.COLOR_RGBA2BGRA))


if __name__ == "__main__":
    r = cut(sys.argv[1])
    x0, y0, x1, y1 = bbox(r)
    save_rgba(r[y0:y1, x0:x1], sys.argv[2])
    print("saved", sys.argv[2], r[y0:y1, x0:x1].shape, "ground coverage %.3f" % (1 - (r[..., 3] > 0.5).mean()))
