"""(g1, round 9) Whole-picture redraws, the shoujo-a way (work/qc/gen_like_shoujo_a.md): every card is ONE Codex picture
with both people and every prop in it; nothing is pasted afterwards. Prompt = fixed blocks + one plain sentence of acting.
Reference order: character sheets -> prop sheet -> one picture for framing / size only (or the approved master of the set).

  python tools/g1_r9_prompts.py KEY[:N][:MASTER_STEM] ...  -> art/v2/raw/g1r9_<key>.txt and work/qc/tmp/g1/jobs.json
     N = number of candidates (letters continue after the ones already on disk), MASTER_STEM = raw stem of the master
  pwsh -NoProfile -File tools/run_jobs.ps1 -Jobs work/qc/tmp/g1/jobs.json
(art/v2/raw and art/v2/raw/pad are not published - the character sheets are in art/canon: pad them with tools/pad_ref.py
into art/v2/raw/pad/g1_<name>.png. The fixed blocks below - STYLE, KEY, SHEET_RULE, RIN, RIN_HANDS, LEN_*, NEVER, TABLE,
PAPER - are the part worth reading.)
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "art" / "v2" / "raw"
PAD = RAW / "pad"
CANON = ROOT / "art" / "canon"

STYLE = ("DRAWING: exactly the drawing of the attached character sheets: an even, thin, crisp dark Prussian-blue outline; flat cel "
         "colours; ONE hard-edged cool grey-blue shadow shape per form; hair as a few big smooth locks lying close to the head, not a "
         "burst of thin spiky strands; few cloth folds; eyes drawn like the eyes on the sheets. No gradients, no shine, no sparkles, "
         "no blush, no noise, no texture, no hatching, no blur.")
KEY = ("BACKGROUND: one perfectly flat solid magenta #FF00FF from edge to edge, because the figures will be cut out: no floor, no "
       "ground line, no cast shadow, no wall, no frame, no motion lines, no watermark, no text other than the \"02\" on her upper arm"
       " (and the paper's marks where the text asks for them).")
SHEET_RULE = ("The attached character sheets decide how the two look: stay true to them and do not improve on them. The picture attached "
              "LAST only shows the framing and how big the figures are in the picture; its drawing has mistakes (hands, cut-out edges), so "
              "do not copy its hands, its arms or its details.")
RIN = ("THE ANDROID GIRL (Rin; her character sheet is attached): 14 years old, 152 cm, slim, not chibi. Short golden-blond bob in a few "
       "big locks; one big stiff white ribbon bow on top of her head (two loops, one small knot); two parallel white hair clips on HER "
       "OWN LEFT side of the fringe; a round white ear unit over each ear; teal eyes (#218EA3) with flat concentric rings; fair cream "
       "skin. White sleeveless dress with a dark-navy sailor collar edged with one yellow line, a yellow neckerchief tied in front, a "
       "small dark round socket in the middle of her chest just under the collar (an empty ring, as on the sheet). Her arms and legs "
       "are smooth white doll limbs with plain white SPHERE joints at shoulder, elbow, wrist and knee and NOTHING else on them: no "
       "screws, no screw holes, no panel lines. The \"02\" in dark navy on her LEFT upper arm. Dark-navy flared boots with a yellow band "
       "at the top.")
NOHEART = "She has no heart yet: her face is completely EXPRESSIONLESS, the mouth one short straight flat line, eyebrows level, no smile, no blush."
RIN_HANDS = ("Her hands, wherever one shows: the small hands of her sheet: smooth white doll hands joined to the forearm by a white sphere "
             "wrist joint; a narrow palm, four slim fingers and one thumb with simple rounded tips; nothing drawn inside the hand (no "
             "creases, no knuckle lines, no nails); at most one simple hard-edged shadow shape on a hand. Each hand is the correct left "
             "or right hand for its own arm, with the thumb on the correct side.")
LEN_YOUNG = ("THE YOUNG SCIENTIST (Len; his character sheet is attached): a slim boy of about 17, 179 cm, so nearly a head taller than "
             "her when both stand upright. Messy golden-blond hair in a few big locks, a small ponytail sticking up at the top-back of his "
             "head tied with a blue band, ONE short yellow pencil tucked behind his ear exactly as on his sheet (it sits in the gap between "
             "the top of the ear and the head, lying along the side of the head, point toward the back), no glasses. White lab coat worn "
             "open, sleeves rolled up to the elbows, dark-navy shirt with an open collar, a loose yellow necktie.")
LEN_40 = ("THE SCIENTIST at about 40 (Len; his character sheet at age 45 is attached): a grown man, 179 cm, light sandy-blond hair in a few "
          "big locks gathered in a low small ponytail at the nape, round thin-rimmed glasses, a very faint stubble, kind eyes; white lab "
          "coat worn open, sleeves rolled up to the elbows, dark-navy shirt, yellow necktie, dark-navy trousers.")
LEN_HANDS = ("His hands, wherever one shows: a slim man's hands drawn as simply as his face: narrow palm, four slim fingers and one thumb, "
             "a clean outline with at most a couple of short inner lines, no veins, no tendons, no knuckle detail, the nails at most a tiny "
             "simple shape; a hand is about as long as his face from eyebrows to chin, never bigger. A nearer hand gets a little bigger, "
             "never more detailed. Each hand is the correct left or right hand for its own arm, joined at the wrist to its own forearm and "
             "rolled white sleeve, with the thumb on the correct side.")
NEVER = ("Must NOT have: extra or missing fingers; two left hands or two right hands on one person; a hand not joined to its own arm; any "
         "cut-out or pasted look; hair broken into many thin strands; gradients, glow or soft shadows; screws or screw holes on her; "
         "floating objects.")
TABLE = ("THE TABLE is exactly the plain lab table of the attached prop sheet: a flat, LEVEL, rectangular top in pale grey-blue (#CBD4E6), "
         "4 cm thick, with a thin dark outline and one darker grey-blue (#7C8AAC) band on its front edge, straight square legs; no drawers, "
         "nothing slanted.")

KV_FRAME = ("THE PICTURE: landscape 3:2, 1536 x 1024 pixels, a bust two-shot cut at the bottom edge about at the waist, framed and sized "
            "like the last attached image: the young scientist on the LEFT, the android girl on the RIGHT, close together. She stands "
            "upright and faces us, a straight front view exactly like her front sheet, her head about as big in the picture as in the last "
            "attached image, the whole bow inside the picture with a margin above it. He stands just beside and behind her on the "
            "viewer's left, turned three-quarter toward her; he is nearly a head taller, so he BENDS forward and lowers his head toward "
            "her, and his head is beside hers and a little higher. His shoulders are a slim boy's shoulders, a little broader than hers. "
            "Nothing of him passes through her.")
KV_TRACE = ("The LAST attached image is the finished picture of this same shot a moment earlier: draw it again as one whole new picture, "
            "with the same framing, the same size and place of both people, the same faces, hair, bow, clothes and drawing, and change "
            "only what is written here: ")

TH_FRAME = ("THE PICTURE: upright 2:3, full figure from the top of the bow to the soles of the boots with a margin all round, framed and "
            "sized like the last attached image. She is seen in an exact side view facing the viewer's LEFT, like her side sheet.")
PAPER = ("THE SHEET: one stiff sheet of warm off-white A4 paper (not cyan), held almost level in front of her chest, tilted a little toward "
         "us so that we see its printed upper face, squeezed by the perspective into a long narrow shape. The TOP of the page is at the FAR "
         "end of the sheet, away from her, toward the person she offers it to (on the viewer's left): there a dark-blue title bar runs "
         "across the top of the page with ONE large kanji 心 in a circle beside it. The middle of the page has four or five plain thin "
         "horizontal lines. The BOTTOM of the page, at HER end, near her hands, is one empty rectangular box. Nothing else is printed: no "
         "other letters, no scribbles, no fake text. The underside is plain white and is not seen. "
         "HOW SHE HOLDS IT: with BOTH hands, the respectful Japanese way, at her end of the sheet: each hand supports one corner of her "
         "end from below, the fingers under the sheet and the thumb on top of it; the hand nearer to us is fully seen, the far hand is "
         "partly hidden behind the sheet and shows at least its thumb on top. Each hand is joined at its own sphere wrist to its own "
         "forearm. ")
TEAR = ("She is crying quietly: a single short tear on her cheek that ends well above the jawline: it starts at her lower eyelid, runs a short way down the skin of the cheek and stops in a small drop in the middle of the cheek, far inside the outline of her face; nothing of it reaches the jaw outline, the chin or the air. A quiet, moved face, lips slightly parted.")

CLOSE2 = "THE PICTURE: landscape 3:2, 1536 x 1024 pixels, a close shot of two people from about the waist up, framed and sized like the last attached image; both faces whole, the bow inside the picture."

def pad(n):
    return str(PAD / f"g1_{n}.png")

def raw(s):
    return str(RAW / f"{s}.png")

def join(*parts):
    return " ".join(p.strip() for p in parts)

def kv_spec(key, master):
    """kv cards: the master (kv_done) from the sheets and the old framing; the rest from the chosen master."""
    sheets = [pad("len_young"), pad("rin_front")]
    base = [LEN_YOUNG, LEN_HANDS, RIN, RIN_HANDS, SHEET_RULE, KV_FRAME]
    closed = "HER EYES ARE CLOSED: each eye one simple downward-curved lash line, as if asleep; her face expressionless, mouth one short flat line."
    acts = {
        "kv_done": ("He has just finished tying the big white bow on her head and has let go of it: both his hands are raised open in front "
                    "of his own chest at about the height of her shoulder, palms half turned toward her, fingers relaxed, a little away from "
                    "her and not touching her or the bow. He looks at her face with his lips pressed together and his eyebrows slightly "
                    "raised: waiting to see if the machine he built will wake. " + closed),
        "kv_tie": ("He is tying the big white bow on top of her head: both his hands are at the bow, his nearer hand pinching the outer "
                   "loop on the viewer's left and his other hand pinching the knot in the middle, pulling it tight; fingers on the front of "
                   "the cloth, thumbs behind it. The bow keeps its size and shape. His arms do not cover her face. He looks up at the bow "
                   "with a small absorbed smile. " + closed),
        "kv_e1": "ONLY HER EYES: they have just opened a crack: two narrow slits under heavy lids, a thin sliver of teal iris in each, empty. Everything else exactly as before, his hands open in front of his chest.",
        "kv_e2": "ONLY HER EYES: now half open: the upper lids still low across the top of the teal irises with concentric rings, empty, looking straight ahead. Everything else exactly as before, his hands open in front of his chest.",
        "kv_joy": ("Her eyes are now fully open, round, teal with flat concentric rings, EMPTY, staring straight ahead; face expressionless. "
                   "He bursts into a big, open, delighted grin: mouth open in a wide smile, eyes bright and wide on her face, eyebrows "
                   "raised: pure joy that she has woken. His arms have dropped down by his sides, out of the picture below: no hands of "
                   "his in the picture."),
        "kv_grin": ("He shows her how to smile: he raises both hands to his own face and with his two INDEX fingers pushes up the corners "
                    "of his own mouth into a big exaggerated grin; the other fingers of each hand are curled loosely, thumbs along them; "
                    "both forearms raised in front of his own chest. His eyes wide and encouraging, looking at her: \"like this!\". Her "
                    "eyes open, empty, expressionless as before; her arms down."),
        "kv_mimic": ("She copies him like a machine: she raises both her doll hands to her face, forearms coming up in front of her chest "
                     "from the sphere elbows low near the bottom edge, and with her two INDEX fingers presses the corners of her own "
                     "mouth upward; the other fingers curled, thumbs along them; her hands do not cover her eyes or the hair clips. Her "
                     "eyes stay wide open, round, teal, EMPTY, staring straight ahead; eyebrows unmoved. Her closed mouth stays small "
                     "and flat in the middle (she is not smiling) and only its two ends are dragged up where each fingertip presses, the "
                     "soft cheek bulging a little around each fingertip. He does the same beside her: with his two index fingers he pushes up the corners of his own mouth into a big exaggerated grin, other fingers curled, forearms raised in front of his own chest, eyes wide and encouraging on her."),
        "kv_pat": ("His grin softens into a gentle, slightly sad smile, eyes soft and a little lowered. He raises his nearer hand and lays "
                   "it gently ON TOP OF HER HEAD: the palm rests on her blond hair just in front of the knot of the bow, the fingers curve "
                   "along the round top of her head, pressing the hair down a little, really resting on it; his forearm slopes up from "
                   "his shoulder to her head below the bow's left loop and does not cover her eyes. His other arm stays down out of the "
                   "picture. Her eyes open, empty, expressionless; she does not react."),
    }
    if key == "kv_done" and not master:
        refs = sheets + [raw("a3x_kv3_done_b")]
        return join(*base, "THIS MOMENT:", acts[key], STYLE, NEVER, KEY), refs
    refs = sheets + [raw(master)]
    return join(*base, KV_TRACE, acts[key], STYLE, NEVER, KEY), refs

def other_spec(key):
    if key == "th_p":
        act = ("She stands still and upright, both boots flat on the ground side by side, and holds out a sheet of paper with both hands "
               "to someone in front of her on the viewer's left, her forearms forward and a little down. ")
        return join(RIN, RIN_HANDS, SHEET_RULE, TH_FRAME, act, PAPER, TEAR, STYLE, NEVER, KEY), [pad("rin_side"), raw("a3x_r2thp3_v6b_fit")]
    if key == "th_step":
        act = ("She takes one step forward toward the viewer's left as she holds out a sheet of paper with both hands to someone there: "
               "her front boot is planted ahead with its heel on the ground, her back boot behind with the heel lifted and only the toes "
               "on the ground, her body upright, forearms forward and a little down. ")
        return join(RIN, RIN_HANDS, SHEET_RULE, TH_FRAME, act, PAPER, TEAR, STYLE, NEVER, KEY), [pad("rin_side"), raw("a3x_r2ths3_v6b_fit")]
    if key == "jsc_1":
        act = ("THE SCENE: both standing. HIM on the LEFT, turned three-quarter toward her, holding out ONE sheet of handwritten sheet music "
               "in front of him with BOTH hands to show it to her: his one hand grips the sheet's left edge and his other hand grips its "
               "right edge, one hand on each side, thumbs on the written face and fingers behind the sheet, really holding it. The sheet "
               "is turned at an angle so its written face is toward her and partly toward us: a few hand-drawn staves with notes on it, "
               "in the sheet's perspective, no words. Nothing floats in the air: no music notes, no symbols. He smiles at her happily, "
               "mouth open. HER on the RIGHT, in profile facing LEFT, standing straight, arms hanging at her sides, looking AT THE SHEET "
               "MUSIC and SINGING from it: mouth open in a small round singing shape; otherwise expressionless, no smile, eyebrows level. "
               "He is nearly a head taller than her.")
        return join(LEN_YOUNG, LEN_HANDS, RIN, RIN_HANDS, SHEET_RULE, CLOSE2, act, STYLE, NEVER, KEY), [pad("len_young"), pad("rin_side"), raw("a5x_jsc1g_v5b_nn_k")]
    if key == "jdc_2":
        act = ("THE SCENE, a pure side view: HER on the RIGHT, in profile facing LEFT, standing straight, both arms hanging relaxed at her "
               "sides, her head bowed, looking down at his hands at her collar; expressionless. HIM on the LEFT, facing RIGHT, standing "
               "close in front of her and BENDING forward from the hips with his knees a little bent, so that his face comes down to "
               "just above the height of hers. With BOTH hands he ties her yellow neckerchief at the front of her sailor collar: his two "
               "hands meet at the knot just under her chin, his fingers holding the yellow cloth and really touching it, his forearms "
               "coming forward from his rolled sleeves. He looks at the knot, gentle and concentrated, lips closed. A grown man, clearly "
               "taller and broader than her. Both are cut by the bottom edge at about the middle of the thigh.")
        return join(LEN_40, LEN_HANDS, RIN, NOHEART, RIN_HANDS, SHEET_RULE, CLOSE2, act, STYLE, NEVER, KEY), [pad("len_age45"), pad("rin_side"), raw("a5x_jdc2h_v5a_k")]
    if key == "jdc_1":
        act = ("THE SCENE: he teaches her to write. They sit side by side on stools BEHIND the lab table, facing us, seen from the front "
               "and slightly from above; HIM on the LEFT, HER on the RIGHT. One sheet of paper lies flat on the table between them, a "
               "flat rectangle in the table's perspective. Her RIGHT hand holds a yellow pencil, its point on the paper; his LEFT hand "
               "(the one on her side) rests gently over her hand and guides it. His other forearm rests on the table; her other hand lies "
               "flat on the table. On the paper only a short row of large, wobbly, childish grey pencil practice strokes: shaky loops, hooks "
               "and lines like a child's very first try at writing, with NO readable letter or kana in it. She looks down at the paper, expressionless. He looks at the paper with a gentle smile. The table "
               "top runs across the lower part of the picture, its front edge one straight horizontal line, and its legs go down out of "
               "the picture.")
        return join(LEN_40, LEN_HANDS, RIN, NOHEART, RIN_HANDS, TABLE, SHEET_RULE, CLOSE2, act, STYLE, NEVER, KEY), [pad("len_age45"), pad("rin_front"), str(CANON / "prop_desk.png"), raw("a5x_jdc1t_v5a_k")]
    if key == "jbc_1":
        act = ("THE SCENE, a close shot: the young scientist has fallen asleep at the lab table: he sits bent forward on the left, his "
               "folded forearms lie on the level table top and his cheek rests on them, face turned toward us, eyes closed, peaceful. "
               "The pencil is tucked behind his upper ear exactly as on his sheet, nowhere else on his head. A sheet of paper lies flat "
               "under his arms, and a second yellow pencil lies on the paper. Only the right end of the table top shows, at the lower "
               "left of the picture: a level flat surface whose front edge is one straight horizontal line. HER on the RIGHT, standing, in "
               "profile facing LEFT, looking down at him; her LEFT arm (the near one, with the \"02\") reaches out and her hand rests "
               "gently on his shoulder, really touching it; her other arm hangs at her side. Expressionless.")
        return join(LEN_YOUNG, LEN_HANDS, RIN, NOHEART, RIN_HANDS, TABLE, SHEET_RULE, CLOSE2, act, STYLE, NEVER, KEY), [pad("len_young"), pad("rin_side"), str(CANON / "prop_desk.png"), raw("a4x_jbc_1_v6jb_fit_dc")]
    raise KeyError(key)

if __name__ == "__main__":
    jobs = []
    for arg in sys.argv[1:]:
        parts = arg.split(":")
        key, n = parts[0], int(parts[1]) if len(parts) > 1 else 2
        master = parts[2] if len(parts) > 2 else ""
        text, refs = kv_spec(key, master) if key.startswith("kv_") else other_spec(key)
        pf = RAW / f"g1r9_{key}.txt"
        pf.write_text(text, encoding="utf-8")
        have = sorted(p.name for p in RAW.glob(f"g1r9_{key}_?.png"))
        start = len(have)
        for i in range(start, start + n):
            jobs.append({"prompt": str(pf), "out": str(RAW / f"g1r9_{key}_{chr(97 + i)}.png"), "ref": refs})
    out = ROOT / "work" / "qc" / "tmp" / "g1" / "jobs.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(jobs, ensure_ascii=False, indent=1), encoding="utf-8")
    print(len(jobs), "jobs ->", out)
