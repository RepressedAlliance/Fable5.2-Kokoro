"""(w1) Put a wind redraw on its master's canvas with ONE uniform scale + shift (no warping of the drawing): the fit is
taken only from what must not move (boots, legs, arms, hands, face) - first from the boots/legs band, then refined over the
whole figure with the parts that really differ (hair, bow, neckerchief, hem: big local differences) left out.
  python tools/w1_align.py <master_stem> <stem> ...   -> art/v2/raw/<stem>_al.png (+ work/qc/tmp/w1/ov_<stem>.jpg)
Prints: scale, sx/sy of the affine fit (drawn fatter/thinner if far from 1), and how much of the still body differs.
"""
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "art" / "v2" / "raw"
TMP = ROOT / "work" / "qc" / "tmp" / "w1"
H = 0.5
CRIT = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6)


def fg(im):
    b, g, r = im[..., 0], im[..., 1], im[..., 2]
    return ~((r > .7) & (b > .7) & (g < .4))


def to3(M):
    return np.vstack([M, [0, 0, 1]]).astype(np.float64)


def main():
    mstem, stems = sys.argv[1], sys.argv[2:]
    ref = cv2.imread(str(RAW / f"{mstem}.png")).astype(np.float32) / 255
    RH, RW = ref.shape[:2]
    rm = fg(ref)
    ys = np.where(rm.any(1))[0]; top, bot = ys.min(), ys.max()
    yellow = (ref[..., 2] > .7) & (ref[..., 1] > .55) & (ref[..., 0] < .55)
    rg = cv2.resize(cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY), None, fx=H, fy=H, interpolation=cv2.INTER_AREA)
    sh = rg.shape
    S = np.array([[1 / H, 0, 0], [0, 1 / H, 0], [0, 0, 1]])
    band = np.zeros(sh, np.uint8)
    band[int((top + 0.68 * (bot - top)) * H):] = 255                     # knees to soles
    band &= cv2.resize(cv2.dilate(rm.astype(np.uint8) * 255, np.ones((15, 15), np.uint8)), (sh[1], sh[0]))
    for s in stems:
        im = cv2.imread(str(RAW / f"{s}.png")).astype(np.float32) / 255
        h, w = im.shape[:2]
        k = h / RH                                                           # other canvas shapes: same height, centred
        Wm = np.float32([[k, 0, (w - k * RW) / 2], [0, k, 0]])                              # master px -> candidate px
        warp = lambda M, sz, flags=cv2.INTER_LINEAR: cv2.warpAffine(im, M, sz, flags=flags | cv2.WARP_INVERSE_MAP,
                                                                       borderMode=cv2.BORDER_CONSTANT, borderValue=(1, 0, 1))
        small = lambda M: cv2.cvtColor(warp((to3(M) @ S)[:2].astype(np.float32), (sh[1], sh[0])), cv2.COLOR_BGR2GRAY)
        try:
            _, Wa = cv2.findTransformECC(rg, small(Wm), np.eye(2, 3, dtype=np.float32), cv2.MOTION_AFFINE, CRIT, band, 5)
            T = (to3(Wm) @ S @ to3(Wa) @ np.linalg.inv(S))[:2]
            # refine: whole figure minus what differs (wind parts) and minus hair/neckerchief yellow
            cur = cv2.cvtColor(warp(T.astype(np.float32), (RW, RH)), cv2.COLOR_BGR2GRAY)
            d = cv2.GaussianBlur(np.abs(cur - cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY)), (0, 0), 6) > 0.10
            bad = cv2.dilate((d | yellow).astype(np.uint8), np.ones((25, 25), np.uint8)) > 0
            still = cv2.dilate(rm.astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
            mk = cv2.resize(((still & ~bad) * 255).astype(np.uint8), (sh[1], sh[0]), interpolation=cv2.INTER_NEAREST)
            _, Wb = cv2.findTransformECC(rg, small(T), np.eye(2, 3, dtype=np.float32), cv2.MOTION_AFFINE, CRIT, mk, 5)
            T = (to3(T) @ S @ to3(Wb) @ np.linalg.inv(S))[:2]
        except cv2.error as ex:
            print(s, "ECC failed", ex); continue
        sx = np.hypot(T[0, 0], T[1, 0]); sy = np.hypot(T[0, 1], T[1, 1])
        kk = float(np.sqrt(sx * sy)); cx, cy = RW / 2, (top + bot) / 2
        px, py = T[0, 0] * cx + T[0, 1] * cy + T[0, 2], T[1, 0] * cx + T[1, 1] * cy + T[1, 2]
        Ws = np.float32([[kk, 0, px - kk * cx], [0, kk, py - kk * cy]])
        try:
            _, Wt = cv2.findTransformECC(rg, small(Ws), np.eye(2, 3, dtype=np.float32), cv2.MOTION_TRANSLATION, CRIT, mk, 5)
            Ws[0, 2] += kk * Wt[0, 2] / H; Ws[1, 2] += kk * Wt[1, 2] / H
        except cv2.error:
            pass
        big = warp(Ws, (RW, RH), cv2.INTER_LANCZOS4)
        out = np.clip(big * 255, 0, 255).astype(np.uint8)
        cv2.imwrite(str(RAW / f"{s}_al.png"), out)
        bm = fg(big)
        stillm = still & ~bad
        diff = (rm ^ bm)[stillm].mean() * 100
        ov = np.zeros((RH, RW, 3), np.uint8) + 255
        ov[rm & bm] = (200, 200, 200); ov[rm & ~bm] = (50, 60, 220); ov[bm & ~rm] = (220, 90, 40)
        cv2.imwrite(str(TMP / f"ov_{s}.jpg"), cv2.resize(ov, (RW // 2, RH // 2)))
        print(f"{s:28s} {w}x{h} scale {1 / kk:.4f} sx/sy {sx / sy:.4f} still-body outline diff {diff:.2f}%  "
              f"(left out {bad[rm].mean() * 100:.0f}% of figure)")


if __name__ == "__main__":
    main()
