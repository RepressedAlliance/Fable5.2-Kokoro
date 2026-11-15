"""When each character of the lyric is sung, measured on the voice itself.

The karaoke file gives every syllable a time, but about a twentieth of a second late on average and unevenly. Here
each syllable is moved to the onset of the separated voice nearest to it; where the voice has no clear onset (a note
tied to the one before) the file's time is kept, corrected by the average lateness. Characters then take the time of
their first syllable.

  python src/lyric_timing.py      -> web/data/lyrics.json, and a table of how far every syllable was moved
  inputs: input/karaoke.ass, input/vocals.wav (demucs -n htdemucs --two-stems vocals), input/lyric_syllables.txt,
          input/timing.json (optional: {"ass_offset_seconds": ...})
"""
from __future__ import annotations

import json
import re
from pathlib import Path

import librosa
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
INP = ROOT / "input"
# you bring these (input/README.md): the karaoke file, the separated voice (demucs), and how the karaoke file is offset
# against your copy of the song
_tj = INP / "timing.json"
OFF = json.loads(_tj.read_text(encoding="utf-8")).get("ass_offset_seconds", 0.0) if _tj.exists() else 0.0
LATE = 0.05          # measured: the file is this late on average

# The lines used: first-syllable time in the file (to find the line), then each character and how many syllables of the
# file it takes. 0 = not sung by itself (a bracket, a space, the small tsu): it arrives with its neighbour.
# input/lyric_syllables.txt, one line each:   35.70: 孤1 独2 な1 科1 学2 者1 に1
# (the lyric text is not published with this repository: write this file from your own copy of the lyrics)
LINES = {}
for _ln in (INP / "lyric_syllables.txt").read_text(encoding="utf-8").splitlines():
    if _ln.strip() and not _ln.lstrip().startswith("#"):
        _k, _v = _ln.split(":", 1)
        LINES[float(_k)] = _v.strip()

def ts(s):
    h, m, x = s.split(":")
    return int(h) * 3600 + int(m) * 60 + float(x)


def read_ass():
    out = []
    for ln in (INP / "karaoke.ass").read_text(encoding="utf-8-sig", errors="ignore").splitlines():
        if not ln.startswith("Dialogue") or ",fx," not in ln:
            continue
        f = ln.split(",", 9)
        t = ts(f[1]) + OFF
        syl = []
        for k, txt in re.findall(r"\{\\k(\d+)[^}]*\}([^{]*)", f[9]):
            if txt.strip():
                syl.append([t, int(k) / 100, txt.strip()])
            t += int(k) / 100
        if syl:
            out.append(syl)
    return out


def main():
    y, sr = librosa.load(str(INP / "vocals.wav"), sr=22050, mono=True)
    hop = 110
    fps = sr / hop
    on = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    on = (on - on.mean()) / on.std()
    peaks = librosa.util.peak_pick(on, pre_max=4, post_max=4, pre_avg=10, post_avg=10, delta=0.6, wait=8)
    pt = peaks / fps
    lines = read_ass()
    moved, kept = [], 0
    result = []
    for syl in lines:
        key = next((k for k in LINES if abs(k - syl[0][0]) < 0.06), None)
        last = -1.0
        for s in syl:
            t = s[0]
            cand = pt[(pt > t - 0.17) & (pt < t + 0.07) & (pt > last + 0.06)]
            if len(cand):
                new = float(cand[np.argmin(np.abs(cand - (t - LATE)))])
                moved.append(new - t)
            else:
                new = max(t - LATE, last + 0.06)
                kept += 1
            s.append(new)
            last = new
        if key is None:
            continue
        spec = [(p[:-1], int(p[-1])) for p in LINES[key].split(" ")]
        assert sum(n for _, n in spec) == len(syl), (key, sum(n for _, n in spec), len(syl))
        chars, i = [], 0
        for c, n in spec:
            if n:
                chars.append({"c": c, "t": round(syl[i][3], 3), "file": round(syl[i][0], 3)})
                i += n
            else:
                chars.append({"c": c, "t": None})
        # the unsung marks: an opening bracket or a space comes with the next character, the rest just after the one before
        for j, ch in enumerate(chars):
            if ch["t"] is None:
                nxt = next((q["t"] for q in chars[j + 1:] if q["t"] is not None), None)
                prv = next((q["t"] for q in reversed(chars[:j]) if q["t"] is not None), None)
                ch["t"] = nxt if (ch["c"] in "「　" and nxt is not None) else round((prv if prv is not None else nxt) + 0.12, 3)
        end = syl[-1][3] + syl[-1][1]
        result.append({"t0": chars[0]["t"], "end": round(end, 3), "text": "".join(c["c"] for c in chars), "chars": chars})
        print("%7.2f  %s" % (chars[0]["t"], "  ".join("%s %+.2f" % (c["c"], c["t"] - c["file"]) for c in chars if "file" in c)))
    moved = np.array(moved)
    print("syllables moved onto a vocal onset: %d (median %+.3f s); kept on the file's time minus %.2f s: %d" % (len(moved), np.median(moved), LATE, kept))
    out = ROOT / "web" / "data" / "lyrics.json"
    out.write_text(json.dumps({"lines": result}, ensure_ascii=False, indent=1), encoding="utf-8")
    print("wrote", out, len(result), "lines")


if __name__ == "__main__":
    main()
