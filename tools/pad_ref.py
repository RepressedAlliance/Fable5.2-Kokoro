"""Pad a drawing with its own flat ground colour to a picture shape the image model keeps.

A master of an odd shape (764x2058) is sometimes answered with a picture of another shape, and then of other
proportions. The model answers in a few standard shapes: 1:2, 2:3 and 1:1 among the upright ones. A picture is padded,
left and right, to the narrowest of these that it fits in; src/bake_v2.py undoes exactly this.

(First rule, 2026-11-13 morning: everything to 2:3, close-ups padded on top. Narrow masters padded that way still came
back 1:2. Drawings made under that rule are still read: canvas_old.)

  python tools/pad_ref.py in.png out.png        (pictures already of a standard shape, or landscape, are copied unchanged)
"""
import sys

import cv2
import numpy as np

SHAPES = (0.5, 2 / 3, 1.0)


def canvas(w, h):
    """Size of the padded picture and where the original sits in it: (W, H, x0, y0)."""
    if w >= h:
        return w, h, 0, 0
    a = w / h
    for s in SHAPES:
        if abs(a - s) < 0.012:
            return w, h, 0, 0
        if a < s:
            W = int(round(h * s))
            return W, h, (W - w) // 2, 0
    return w, h, 0, 0


def canvas_old(w, h):
    if w >= h or abs(w / h - 2 / 3) < 0.01:
        return w, h, 0, 0
    if w / h < 2 / 3:
        W = int(round(h * 2 / 3))
        return W, h, (W - w) // 2, 0
    H = int(round(w * 3 / 2))
    return w, H, 0, H - h


if __name__ == "__main__":
    im = cv2.imread(sys.argv[1])
    h, w = im.shape[:2]
    W, H, x0, y0 = canvas(w, h)
    out = np.empty((H, W, 3), np.uint8)
    out[:] = np.median(np.concatenate([im[:6].reshape(-1, 3), im[:, :6].reshape(-1, 3), im[:, -6:].reshape(-1, 3)]), axis=0).astype(np.uint8)
    out[y0:y0 + h, x0:x0 + w] = im
    cv2.imwrite(sys.argv[2], out)
