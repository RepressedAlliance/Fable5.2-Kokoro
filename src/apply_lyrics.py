"""Put your own copy of the lyrics onto the film's timing:  web/data/lyrics_timing.json + input/lyrics_lines.txt
   -> web/data/lyrics.json (the file the pages read; not in the repository).

  python src/apply_lyrics.py              write web/data/lyrics.json
  python src/apply_lyrics.py --strip      (maintainers) make web/data/lyrics_timing.json from a full web/data/lyrics.json

input/lyrics_lines.txt: the sung phrases the film uses, one per line, in film order, exactly as many lines as the timing
file has (44) - blank lines and lines starting with # are skipped. Every character counts, the full-width space
too, because every character has its own time: a line of the timing file with n = 12 needs a phrase of 12 characters.
The pages find a line by its text (web/pages/kit.js line()), so write the phrases the way the pages quote them.
See web/data/lyrics.example.json for the shape of the result.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TIMING = ROOT / "web" / "data" / "lyrics_timing.json"
FULL = ROOT / "web" / "data" / "lyrics.json"
TEXT = ROOT / "input" / "lyrics_lines.txt"


def strip():
    j = json.loads(FULL.read_text(encoding="utf-8"))
    lines = [{"t0": L["t0"], "end": L["end"], "n": len(L["chars"]), "t": [c["t"] for c in L["chars"]],
              "file": [c.get("file") for c in L["chars"]]} for L in j["lines"]]
    note = ("When each character of the sung lines appears, without the lyric text (bring your own: src/apply_lyrics.py). "
            "Per line: t0 / end (seconds of the song), n characters, t: the second each character lands (measured on the "
            "separated voice, src/lyric_timing.py), file: the karaoke file's own time for it (null: not sung by itself).")
    TIMING.write_text(json.dumps({"note": note, "lines": lines}, ensure_ascii=False, indent=0), encoding="utf-8")
    print("wrote", TIMING, len(lines), "lines")


def apply():
    tm = json.loads(TIMING.read_text(encoding="utf-8"))["lines"]
    if not TEXT.exists():
        sys.exit(f"missing {TEXT}: see input/README.md")
    text = [l.rstrip("\r\n") for l in TEXT.read_text(encoding="utf-8-sig").splitlines()]
    text = [l for l in text if l.strip() and not l.lstrip().startswith("#")]
    if len(text) != len(tm):
        sys.exit(f"{TEXT.name} has {len(text)} lines, the timing has {len(tm)}")
    out, bad = [], 0
    for i, (L, s) in enumerate(zip(tm, text)):
        if len(s) != L["n"]:
            print(f"line {i + 1}: {len(s)} characters, the timing has {L['n']} (t0 {L['t0']})"); bad += 1; continue
        chars = []
        for c, t, f in zip(s, L["t"], L["file"]):
            ch = {"c": c, "t": t}
            if f is not None:
                ch["file"] = f
            chars.append(ch)
        out.append({"t0": L["t0"], "end": L["end"], "text": s, "chars": chars})
    if bad:
        sys.exit(f"{bad} lines do not match: nothing written")
    FULL.write_text(json.dumps({"lines": out}, ensure_ascii=False, indent=1), encoding="utf-8")
    print("wrote", FULL, len(out), "lines")


if __name__ == "__main__":
    strip() if "--strip" in sys.argv else apply()
