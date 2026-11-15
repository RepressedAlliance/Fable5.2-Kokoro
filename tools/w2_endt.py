"""(w2) outro's last face: tear frames end_t0..end_t7, every one a Codex redraw of the previous frame (en_c's master first).
Only what changed against the previous frame is laid over it (build_end.py's way in shoujo-a): head, hair, bow, ear units
never move. Nothing here draws a tear: code registers, cuts and composites Codex's pixels.
  python tools/w2_endt.py gen t3 [n=3]      -> art/v2/raw/w2e/end_t3_{a,b,c}.png  (base = art/v2/raw/endt_t2.png)
  python tools/w2_endt.py comp t3 b         -> art/v2/raw/endt_t3.png  (+ work/qc/tmp/w2/comp_t3_b.jpg look sheet)
  python tools/w2_endt.py look t3           -> composites every candidate of t3 into w2e/ and a look sheet
  python tools/w2_endt.py strip             -> work/qc/tmp/w2/end_strip.jpg
"""
import concurrent.futures as cf
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "art" / "v2" / "raw"
CAND = RAW / "w2e"
QC = ROOT / "work" / "qc" / "tmp" / "w2"
MASTER = RAW / "a2x_en_c_v5d_fit.png"
STAGES = [f"t{i}" for i in range(8)]
ORDER = ["t0", "t1", "t2", "t3", "t4", "t4b", "t5", "t5b", "t6", "t7"]   # play order with the in-betweens

PRE = ("Redraw the FIRST attached image EXACTLY: the same android girl in the same front-view close-up, the same picture size and framing, "
       "the same SIZE and POSITION of her head, hair, bow and shoulders in the picture; the same face shape, the same closed smiling eyes, "
       "the same mouth, the same short blond hair in the same few big locks, the two white hair clips on the right of the picture, the big white bow "
       "at the SAME SIZE and shape, the round ear units, the sailor collar, the yellow neckerchief, the dark round slot on her chest, the sphere "
       "shoulder joints and the \"02\" on her upper arm. Uniform thin dark Prussian-blue outline, flat cel colours with one hard-edged cool "
       "grey-blue shadow shape per form; no gradients, no noise. One perfectly flat solid magenta (#FF00FF) background, no text other than the "
       "\"02\", no watermark. THE PICTURE: exactly the same pixel size and shape as the FIRST attached image (1199 x 1798 pixels, 2:3 upright); "
       "do not change the canvas, do not zoom, do not move her.\n\n"
       "This is one frame of a slow animation of a single tear: the frames must follow each other smoothly, so trace everything not named below "
       "unchanged from the first image, line for line, including every bit of water that is already on her face. ")
STYLE = (" Tear style, the same as the rest of this flat drawing: the water is a flat very pale blue-white fill edged by a thin dark "
         "Prussian-blue line (thinner than the face outline). A running tear is ONE continuous soft shape: a narrow wet streak on the skin that is "
         "thinnest at the eye corner and widens a little as it goes down, flowing WITHOUT ANY NECK OR STEP straight into its lower end, which is "
         "a teardrop-shaped tip (narrow on top where it joins the streak, round at the bottom) only slightly wider than the streak just above it. "
         "It must read at once as a tear running down a cheek: never a ball on a stick, never a pin, lollipop or microphone shape, never a round "
         "bead hanging from a line, never a stiff rod or tube. The water always lies ON her skin, inside the outline of her face. No white sparkle, no "
         "glossy shine, no gradient, no watercolour bleed, no cartoon fountain, no string of beads. The two sides of her face are not mirror copies.")
L = "the viewer's LEFT eye"
R = "the viewer's RIGHT eye"
CH = {
    "t0": ("CHANGE ONLY HER TEARS: ERASE every tear trail, tear drop and bead of water in the first image and repaint that skin as plain flat face "
           "colour. Then draw only the very start of crying: along the outer end of each closed eyelid line lies a thin sliver of pooled water, a tiny "
           f"pale blue-white crescent hugging the lash line at the outer corner, no longer than the lash flick; on {L} it is a little fuller than on "
           f"{R}. Nothing has run down yet: no drop and no trail on the cheeks."),
    "t1": (f"CHANGE ONLY ONE THING: at the outer corner of {L}, the pooled water has welled up into one SMALL tear bead (a small drop, much "
           "smaller than the eye, not a bubble: about as wide as the eyelid line is long divided by eight), sitting on the skin just below the outer end "
           "of the closed eyelid line, touching it, a little inside the outline of her face, just starting to spill over onto the cheek. No trail "
           f"on the cheek yet. {R} with its small sliver of water stays exactly as in the first image."),
    "t2": (f"CHANGE ONLY ONE THING: the tear bead at the outer corner of {L} has begun to run down her cheek a SHORT way: it has become one "
           "short wet streak that starts thin at the outer eye corner and runs down the cheek a little inward from the face outline, ending in its "
           "teardrop-shaped tip only about ONE EYE-HEIGHT below the eye corner, higher than the tip of her nose. The round bead at the eye corner is "
           "gone (it became this streak). "
           f"{R} stays exactly as in the first image."),
    "t3": (f"CHANGE ONLY ONE THING: the tear from {L} has run further down the SAME path: the streak is longer and its teardrop-shaped tip is now "
           "LEVEL WITH HER MOUTH, still on the cheek a little inward from the face outline. The upper part of the streak that was already there stays "
           "exactly where it is, the same width. "
           f"{R} stays exactly as in the first image."),
    "t4": (f"CHANGE ONLY ONE THING: the tear from {L} has run on down to the lower edge of her face: the streak now reaches the jawline and its tip "
           "has gathered into one fuller, heavier teardrop-shaped drop hanging at the jawline, its round bottom just touching the face outline, about to "
           "fall. The part of the streak already there stays exactly where it is. "
           f"{R} stays exactly as in the first image."),
    "t5": (f"CHANGE TWO THINGS. First: the heavy drop at the jaw has let go: the streak on the viewer's left cheek stays but now simply ends, "
           "thin, ON THE SKIN just inside the face outline, exactly where the drop hung (no drop on the face any more; the streak does NOT go past "
           "the face outline and does not lie over the hair; the dark face outline and the jaw stay exactly as in the first image); one small teardrop-shaped drop is falling in the air just below the jawline, a small "
           "gap under the face outline, directly beneath where it hung. Second: at the outer corner of "
           f"{R}, the sliver of pooled water has welled up into one new small tear bead, touching the outer end of the closed eyelid line, just "
           "starting to spill over."),
    "t6": ("CHANGE THREE THINGS. First: the falling drop under the jaw is gone (it has fallen out of the picture); the wet streak on the viewer's left "
           f"cheek stays exactly as it is. Second: the new tear from {R} has run down her cheek: one wet streak from that eye corner down the "
           "viewer's right cheek, a little inward from the face outline, ending in its teardrop-shaped tip at about the height of the mouth. Third: "
           "her smile deepens a tiny bit: the two corners of her small closed-mouth smile lift just slightly higher; the mouth stays the same length "
           "and in the same place."),
    "t7": ("CHANGE ONLY HER CLOSED EYES, VERY SLIGHTLY: this is her happiest moment, so each closed eyelid arc is a little more strongly curved "
           "upward, like a happy upside-down U, the same thickness and length, its outer lash flick in the same place. Everything else stays exactly as "
           "in the first image: both wet trails and the tear drop on the viewer's right cheek stay exactly where they are, the smile stays as it is."),
}


# in-betweens (r2): t4b between t4 and t5, t5b between t5 and t6; t5r redraws t5's falling drop (base: t5 as it was, kept in QC)
T5_OLD = QC / "endt_t5_v1.png"
EXTRA = {   # stage: (base the change is laid over, refs (first = base, second = the frame after), output)
    "t5r": (T5_OLD, [T5_OLD], RAW / "endt_t5.png"),
    "t4b": (RAW / "endt_t4.png", [RAW / "endt_t4.png", RAW / "endt_t5.png"], RAW / "endt_t4b.png"),
    "t5b": (RAW / "endt_t5.png", [RAW / "endt_t5.png", RAW / "endt_t6.png"], RAW / "endt_t5b.png"),
}
MID = ("THE SECOND attached image is the frame that comes right AFTER the first one. Draw the in-between frame exactly HALFWAY between the two: "
       "start from the first image, line for line, and change only what is described below. ")
CH["t5r"] = ("CHANGE ONLY THE FALLING DROP: erase the small falling tear drop that is now in the air between the hair tips at the lower left, and "
             "repaint that place exactly as the hair and background around it. Instead, the drop that has just let go from her jaw is now falling "
             "DIRECTLY UNDER HER FACE: one small teardrop-shaped drop in the air just below the lower edge of her face on the viewer's left side of "
             "the chin, over her neck, only one or two drop-lengths below the face outline, clearly under the face and NOT between the hair tips. "
             "The wet streak on the viewer's left cheek and the new bead at the viewer's right eye stay exactly as they are.")
CH["t4b"] = (f"CHANGE ONLY THE TEAR FROM {L}: its drop has gathered at the lowest point of the jawline and is just about to let go: it is stretched "
             "into one teardrop shape hanging from the edge of her face, still attached to the skin at the top, its round bottom just below the face "
             "outline. The streak above it, from the eye corner down, is a little narrower than in the first image (between the first and second "
             "images in width), on the same path. "
             f"{R} with its small sliver of water stays exactly as in the first image.")
CH["t5b"] = (f"CHANGE ONLY TWO THINGS. First: the small drop that was falling below her face is gone (it has fallen out of the picture). Second: the "
             f"new tear bead at {R} has begun to run: it is now a short wet streak from that eye corner ending in its teardrop-shaped tip on the "
             "UPPER cheek, only a short way (about one eye-height) below the eye corner, a little inward from the face outline. The wet streak on "
             "the viewer's left cheek stays exactly as it is; the mouth stays exactly as it is.")


def prev_of(st):
    if st in EXTRA:
        return EXTRA[st][0]
    i = STAGES.index(st)
    return MASTER if i == 0 else RAW / f"endt_{STAGES[i - 1]}.png"


def gen(st, n=3):
    CAND.mkdir(exist_ok=True)
    pf = CAND / f"end_{st}_{len(list(CAND.glob(f'end_{st}_?.png')))}.txt"
    refs = EXTRA[st][1] if st in EXTRA else [prev_of(st)]
    pf.write_text(PRE + (MID if len(refs) > 1 else "") + CH[st] + STYLE
                  + "\nEverything else, especially the hair, the bow and the ear units, stays exactly as in the first image.\n", encoding="utf-8")
    for b in refs:
        assert b.exists(), b
    start = len(list(CAND.glob(f"end_{st}_?.png")))
    outs = [CAND / f"end_{st}_{c}.png" for c in "abcdefghijklmnopqrstuvwxyz"[start:start + n]]
    ref_arg = "@(" + ",".join(f"'{b}'" for b in refs) + ")"

    def one(o):
        cmd = f"& '{ROOT / 'tools' / 'gen.ps1'}' -PromptFile '{pf}' -OutPath '{o}' -Ref {ref_arg}"
        r = subprocess.run(["pwsh", "-NoProfile", "-Command", cmd], capture_output=True, text=True, timeout=900)
        return r.stdout.strip()
    with cf.ThreadPoolExecutor(4) as ex:
        for s in ex.map(one, outs):
            print(s)


# ---- compositing -------------------------------------------------------------------------------------------------
def gray(b):
    return cv2.GaussianBlur(cv2.cvtColor(b, cv2.COLOR_BGR2GRAY), (0, 0), 1.2).astype(np.float32) / 255


def magenta(b):
    b_, g, r = [b[..., i].astype(int) for i in range(3)]
    return (r > 200) & (b_ > 200) & (g < 90)


def hair_mask(b):
    hsv = cv2.cvtColor(b, cv2.COLOR_BGR2HSV)
    return ((hsv[..., 0] > 15) & (hsv[..., 0] < 35) & (hsv[..., 1] > 90)).astype(np.uint8)


def face_mask(M):
    """The skin of her face (the component under her nose), holes (eyes, mouth) filled, a little past its outline."""
    b_, g, r = [M[..., i].astype(int) for i in range(3)]
    skin = ((r > 215) & (g > 200) & (b_ > 170) & (r >= g) & (g > b_) & (r - b_ < 70)).astype(np.uint8)
    n, lab = cv2.connectedComponents(skin, connectivity=4)
    face = (lab == lab[1160, 612]).astype(np.uint8)
    # the master's own tears and lash flicks sit on the face's edge: they are face too
    water = ((b_ > r + 6) & (b_ > 190) & (g > 180)).astype(np.uint8)
    near = cv2.dilate(face, np.ones((31, 31), np.uint8))
    face = cv2.morphologyEx(face | (cv2.dilate(water, np.ones((7, 7), np.uint8)) & near), cv2.MORPH_CLOSE,
                            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    cnt, _ = cv2.findContours(face, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    full = np.zeros_like(face)
    cv2.drawContours(full, cnt, -1, 1, -1)
    return full


def changed_from(a, b, tol=3, thr=42):
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * tol + 1, 2 * tol + 1))
    lo, hi = cv2.erode(b, k).astype(np.int16), cv2.dilate(b, k).astype(np.int16)
    a_ = a.astype(np.int16)
    o1 = np.maximum(a_ - hi, lo - a_).max(-1)
    lo2, hi2 = cv2.erode(a, k).astype(np.int16), cv2.dilate(a, k).astype(np.int16)
    b_ = b.astype(np.int16)
    o2 = np.maximum(b_ - hi2, lo2 - b_).max(-1)
    return ((o1 > thr) | (o2 > thr)).astype(np.uint8)


def register(C, M, mask):
    w = np.eye(2, 3, dtype=np.float32)
    crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6)
    a, b = gray(M), gray(C)
    for s in (0.25, 0.5, 1.0):   # coarse to fine
        aa, bb = cv2.resize(a, None, fx=s, fy=s), cv2.resize(b, None, fx=s, fy=s)
        mm = cv2.resize(mask, None, fx=s, fy=s, interpolation=cv2.INTER_NEAREST)
        ws = w.copy(); ws[:, 2] *= s
        try:
            _, ws = cv2.findTransformECC(aa, bb, ws, cv2.MOTION_AFFINE, crit, mm, 5)
        except cv2.error as e:
            print("ECC failed", s, e)
        w = ws.copy(); w[:, 2] /= s
    return w


def colour_fit(src, ref, mask):
    out = src.astype(np.float32).copy()
    for ch in range(3):
        a, b = src[..., ch][mask > 0].astype(np.float32), ref[..., ch][mask > 0].astype(np.float32)
        k, c = np.polyfit(a[::7], b[::7], 1)
        out[..., ch] = out[..., ch] * k + c
    return np.clip(out, 0, 255).astype(np.uint8)


def comp(st, cand, write=True):
    M = cv2.imread(str(MASTER))
    B = cv2.imread(str(prev_of(st)))
    C = cv2.imread(str(CAND / f"end_{st}_{cand}.png"))
    H, W = M.shape[:2]
    if C.shape[:2] != (H, W):
        if abs(C.shape[1] / C.shape[0] - W / H) > 0.01:
            print(f"  {st}_{cand}: other shape {C.shape[1]}x{C.shape[0]} - scaled to the height, centred, registered by the head")
            f = H / C.shape[0]
            C = cv2.resize(C, None, fx=f, fy=f, interpolation=cv2.INTER_CUBIC)
            pad = W - C.shape[1]
            if pad > 0:
                C = cv2.copyMakeBorder(C, 0, 0, pad // 2, pad - pad // 2, cv2.BORDER_CONSTANT, value=(255, 0, 255))
            else:
                C = C[:, -pad // 2:-pad // 2 + W]
        C = cv2.resize(C, (W, H), interpolation=cv2.INTER_AREA if C.shape[0] > H else cv2.INTER_CUBIC)
    face = face_mask(M)
    figure = (~magenta(M)).astype(np.uint8)
    calib = figure & (1 - cv2.dilate(face, np.ones((41, 41), np.uint8)))
    calib[:, :] &= (np.arange(H)[:, None] < 1420)          # head, bow, ear units, top of the collar
    w = register(C, M, calib)
    Cr = cv2.warpAffine(C, w, (W, H), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
    Cr = colour_fit(Cr, M, calib)
    # where this drawing differs from the frame before it, on her face only (not her hair)
    zone = cv2.dilate(face, np.ones((9, 9), np.uint8)) & (1 - cv2.dilate(hair_mask(B), np.ones((3, 3), np.uint8)))
    ch = changed_from(Cr, B) & zone
    # along the tear's path (water in either drawing) take finer changes too, so a drop that moved on leaves no ghost
    def wet(x):
        b_, g_, r_ = [x[..., i].astype(int) for i in range(3)]
        return ((b_ > r_ + 6) & (b_ > 190) & (g_ > 180)).astype(np.uint8)
    tear = cv2.dilate(wet(Cr) | wet(B), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13))) & zone
    ch = ch | (changed_from(Cr, B, tol=1, thr=25) & tear)
    # a drop falling under the jaw: the pale blue-white bits just below her face, whatever is behind them
    below = cv2.dilate(face, np.ones((121, 121), np.uint8)) & (1 - face)
    bb, gg, rr = [Cr[..., i].astype(int) for i in range(3)]
    water = ((bb > rr + 6) & (bb > 200) & (gg > 190)).astype(np.uint8)
    drop = changed_from(Cr, B) & below
    n, lab, stt, _ = cv2.connectedComponentsWithStats(cv2.dilate(drop, np.ones((5, 5), np.uint8)), 8)
    keep = np.zeros_like(drop)
    for i in range(1, n):
        if stt[i, cv2.CC_STAT_AREA] < 4000 and (water[lab == i]).sum() > 25:
            keep |= (lab == i).astype(np.uint8)
    ch = ch | (keep & drop)
    # a drop that was falling in the frame before and is gone now: take the new drawing there
    ch = ch | (drop & cv2.dilate(wet(B) & below, np.ones((9, 9), np.uint8)))
    n, lab, stt, _ = cv2.connectedComponentsWithStats(ch, 8)
    ch = np.isin(lab, [i for i in range(1, n) if stt[i, cv2.CC_STAT_AREA] >= 25]).astype(np.uint8)
    m = cv2.dilate(ch, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    a = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 1.6)[..., None]
    out = (B.astype(np.float32) * (1 - a) + Cr.astype(np.float32) * a + 0.5).astype(np.uint8)
    print(f"  {st}_{cand}: affine {np.round(w, 4).tolist()}  changed px {int(m.sum())}")
    dst = (EXTRA[st][2] if st in EXTRA else RAW / f"endt_{st}.png") if write else (CAND / f"comp_{st}_{cand}.png")
    cv2.imwrite(str(dst), out)
    # look sheet: base | candidate (registered) | result, face crop, with the mask edge
    x0, y0, x1, y1 = 360, 930, 900, 1420
    res = out.copy()
    cnt, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cv2.drawContours(res, cnt, -1, (0, 200, 0), 1)
    sheet = np.hstack([B[y0:y1, x0:x1], Cr[y0:y1, x0:x1], out[y0:y1, x0:x1], res[y0:y1, x0:x1]])
    cv2.imwrite(str(QC / f"comp_{st}_{cand}.jpg"), sheet, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return dst


def look(st):
    for f in sorted(CAND.glob(f"end_{st}_?.png")):
        comp(st, f.stem[-1], write=False)


def strip():
    seq = [s for s in ORDER if (RAW / f"endt_{s}.png").exists()]
    ims = [cv2.imread(str(RAW / f"endt_{s}.png")) for s in seq]
    ims = [i for i in ims if i is not None]
    x0, y0, x1, y1 = 300, 560, 960, 1460                       # bow to collar
    crops = [cv2.resize(i[y0:y1, x0:x1], None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA) for i in ims]
    for k, c in enumerate(crops):
        cv2.putText(c, f"end_{seq[k]}", (8, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (40, 30, 20), 2)
    cv2.imwrite(str(QC / "end_strip.jpg"), np.hstack(crops), [cv2.IMWRITE_JPEG_QUALITY, 92])
    # onion: each frame against the one before, red/cyan; anything outside the face that shows colour moved
    on = []
    for a, b in zip(ims, ims[1:]):
        ga, gb = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY), cv2.cvtColor(b, cv2.COLOR_BGR2GRAY)
        o = np.dstack([gb, gb, ga])[y0:y1, x0:x1]
        on.append(cv2.resize(o, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA))
    if on:
        cv2.imwrite(str(QC / "end_onion.jpg"), np.hstack(on), [cv2.IMWRITE_JPEG_QUALITY, 90])
    M = cv2.imread(str(MASTER))
    face = face_mask(M)
    out = 1 - cv2.dilate(face, np.ones((15, 15), np.uint8))
    for k, (a, b) in enumerate(zip([M] + ims, ims)):
        d = (np.abs(a.astype(int) - b.astype(int)).max(-1) > 30) & (out > 0)
        print(f"  {'master' if k == 0 else seq[k - 1]} -> {seq[k]}: px changed outside the face {int(d.sum())}")


if __name__ == "__main__":
    QC.mkdir(parents=True, exist_ok=True)
    cmd = sys.argv[1]
    if cmd == "gen":
        gen(sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 3)
    elif cmd == "comp":
        comp(sys.argv[2], sys.argv[3])
    elif cmd == "look":
        look(sys.argv[2])
    elif cmd == "strip":
        strip()
