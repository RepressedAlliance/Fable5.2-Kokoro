"""(w1, round 11) Wind loops for the looking-up cards: 8 drawings per loop, every one the group's approved master redrawn
line for line with ONLY the things the wind moves changed (hair ends, the bow's two loops/tails, the neckerchief tails,
the dress hem). Four key phases (w1, w3, w5, w7) are drawn from the master; the four in-betweens (w2, w4, w6, w8) are drawn
from the master + the two neighbouring keys ("the drawing exactly half way").
  python tools/w1_wind_prompts.py keys <loop> [variant]   -> work/qc/tmp/w1/jobs_<loop>_keys<variant>.json
  python tools/w1_wind_prompts.py inb  <loop> [variant] k1=stem k3=stem k5=stem k7=stem
Loops: up0, up_a, cd_a, cb_out, cd0.  Run the jobs with pwsh -File tools/run_jobs.ps1 -Jobs <json>.
(The masters and raw drawings in art/v2/raw are not published: read this as the way the loops were prompted, or point
MASTER at drawings of your own.)
"""
import json
import sys
from pathlib import Path

import cv2

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "art" / "v2" / "raw"
TMP = ROOT / "work" / "qc" / "tmp" / "w1"
CANON = "art/canon/rin_front.png"

MASTER = {"up0": "up0_v5l_fit", "up_a": "up_a_v5a_fit", "cd_a": "cd_a_v5a_fit", "cb_out": "cb_out_v5d_fit", "cd0": "cd0_v5a_fit"}
POSE = {
    "up0": "both arms raised high in a V above her head with open hands, eyes closed, tears, mouth wide open crying out",
    "up_a": "both arms spread open at her sides, palms forward, eyes closed, tears, mouth open singing",
    "cd_a": "both hands hanging at her sides with open palms, looking up with open teal eyes full of tears and a small smile",
    "cb_out": "her right hand pressed to her chest and her left hand raised palm up at shoulder height, looking up with teary teal eyes and a small smile",
    "cd0": "both arms lowered and opened at her sides, palms up, eyes closed in a smile, tears",
}

TRACE = ("Redraw the FIRST attached image EXACTLY, line for line, as if traced: the same android girl ({pose}), the same front "
         "view, the same picture size and framing, the same SIZE and POSITION of her head and body in the picture. Her face "
         "(eyes, tears, mouth), head, ear units, hair clips, the knot of the bow, both arms, both hands with every finger, all "
         "sphere joints, the \"02\" on her left upper arm, her torso, the sailor collar, the neckerchief knot, both legs and the "
         "boots are EXACTLY where they are and EXACTLY as large as in the first image: nothing of her body moves, nothing is "
         "scaled, nothing turns. The same uniform thin dark Prussian-blue outline, the same colors, flat fills and the same "
         "one hard-edged cool grey-blue shadow shape per form; hair in a few big clean locks with sharp points, few folds, no "
         "gradients, no gloss, no noise. One perfectly flat solid magenta (#FF00FF) background, no ground, no cast shadow, no "
         "motion lines, no speed lines, no blur, no text other than the \"02\", no watermark. The whole figure, bow and hair "
         "stay inside the picture with a margin. {extra}THE PICTURE: exactly the same pixel size and shape as the first attached "
         "image ({w} x {h} pixels); do not change the canvas, do not zoom in or out. ")
EXTRA_KEY = "The LAST attached image is her model sheet: use it only to keep her design (bow shape, hair, colors) right. "
EXTRA_INB = ("This is ONE IN-BETWEEN drawing of a hand-drawn wind loop: the SECOND attached image is the drawing just BEFORE "
             "it and the THIRD attached image is the drawing just AFTER it. ")
WIND_ONLY = ("ONLY THE WIND CHANGES, and the wind moves only these: the ends of her hair (the locks below the ear units and the "
             "loose tips around her face; the bangs only at their very tips), the two loops and the hanging tail ends of the big "
             "white bow (the knot stays in place, the loops keep their size), the two tails of the yellow neckerchief (the knot "
             "stays), and the hem of the white dress below the hips. The wind blows sideways across the picture, from the "
             "viewer's left toward the viewer's right. ")
KEY = {
    "w1": "PHASE 1, a steady light breeze: everything that the wind moves leans a little toward the viewer's RIGHT, about as "
          "much as in the first image - the hair ends on the viewer's right swing out a little to the right, the bow's right "
          "loop trails a little to the right, the neckerchief tails drift a little to the right, the dress hem flares a little "
          "on the viewer's right.",
    "w3": "PHASE 2, the gust at its strongest: everything that the wind moves is blown clearly toward the viewer's RIGHT, "
          "clearly further than in the first image but not wild - the hair on the viewer's right streams out to the right in "
          "a few big locks, their points reaching out about half a head-width further than in the first image; the hair on the "
          "viewer's left is swept inward across toward her face side; the bow's right loop and tail stream out flat to the "
          "right, the left loop leans right; both neckerchief tails lift and fly out to the right; the dress hem is swept to "
          "the right, flaring out on the viewer's right and pressed against her leg on the viewer's left.",
    "w5": "PHASE 3, the gust has passed and everything swings back through the middle, just past it: the hair ends hang "
          "almost straight down on both sides, evenly, only the points still curving a little; the two bow loops are nearly "
          "symmetrical and relaxed, tails hanging down; the neckerchief tails hang straight down over her chest; the dress hem "
          "hangs level and symmetrical, its left side swinging out very slightly.",
    "w7": "PHASE 4, a small swing back the other way, clearly smaller than the gust: everything that the wind moves leans a "
          "little toward the viewer's LEFT - the hair ends on the viewer's left swing out a little to the left, the hair on the "
          "viewer's right hangs close to her cheek; the bow's loops lean a little to the left; the neckerchief tails swing a "
          "little to the left; the dress hem flares a little on the viewer's left.",
}
INB = {"w2": ("w1", "w3"), "w4": ("w3", "w5"), "w6": ("w5", "w7"), "w8": ("w7", "w1")}
INB_TEXT = ("THIS MOMENT: exactly half way between the second and the third attached images. Every hair lock, bow loop, "
            "neckerchief tail and the dress hem is drawn in the position half way between where it is in those two drawings - "
            "the same shapes, part way along their swing; nothing new appears. Her body, arms, hands, face and boots are the "
            "first attached image, unchanged.")


def size(stem):
    h, w = cv2.imread(str(RAW / f"{stem}.png")).shape[:2]
    return w, h


def main():
    mode, loop = sys.argv[1], sys.argv[2]
    var = sys.argv[3] if len(sys.argv) > 3 and "=" not in sys.argv[3] else "a"
    picks = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a)
    m = MASTER[loop]
    w, h = size(m)
    TMP.mkdir(parents=True, exist_ok=True)
    jobs = []
    if mode == "keys":
        only = [a[5:] for a in sys.argv[3:] if a.startswith("only:")]
        for k, txt in KEY.items():
            if only and k not in only:
                continue
            name = f"w1_{loop}_{k}_{var}"
            p = TMP / f"{name}.txt"
            p.write_text(TRACE.format(pose=POSE[loop], extra="", w=w, h=h) + WIND_ONLY + "CHANGE ONLY THIS: " + txt,
                         encoding="utf-8")
            jobs.append({"prompt": str(p.relative_to(ROOT)), "out": f"art/v2/raw/{name}.png",
                         "refs": [f"art/v2/raw/{m}.png"]})   # master only: a 2nd (1:2) ref made the model answer on a 1:2 canvas
    else:
        for k, (a, b) in INB.items():
            name = f"w1_{loop}_{k}_{var}"
            p = TMP / f"{name}.txt"
            p.write_text(TRACE.format(pose=POSE[loop], extra=EXTRA_INB, w=w, h=h) + WIND_ONLY + INB_TEXT, encoding="utf-8")
            jobs.append({"prompt": str(p.relative_to(ROOT)), "out": f"art/v2/raw/{name}.png",
                         "refs": [f"art/v2/raw/{m}.png", f"art/v2/raw/{picks['k' + a[1]]}.png",
                                  f"art/v2/raw/{picks['k' + b[1]]}.png"]})
    out = TMP / f"jobs_{loop}_{mode}{var}.json"
    out.write_text(json.dumps(jobs, indent=1), encoding="utf-8")
    print(out)


if __name__ == "__main__":
    main()
