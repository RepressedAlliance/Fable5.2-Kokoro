"""Join the designed pages into one film on the song's clock.
   python src/assemble_pages.py OUT.mp4 [crf] [from_second]      (sections below: name, the song time it starts at; the last entry is the end)
Each page's frames are <frames>/<name>/f%05d.png (tools/capture_all.py), frame n at start + n/24. Film frame g is at T0 + g/24.
<frames> is ./frames, or the folder in the environment variable KOKORO_FRAMES; the sound is input/kokoro.wav (or KOKORO_AUDIO).
The picture runs LEAD ahead of the sound (one frame): a change drawn for a beat is on the screen when the beat sounds,
not a frame after it."""
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FR = Path(os.environ.get("KOKORO_FRAMES") or ROOT / "frames").as_posix()
AUDIO = os.environ.get("KOKORO_AUDIO") or str(ROOT / "input" / "kokoro.wav")
KT = lambda k: 20.016 + k * 0.42858
LEAD = 1 / 24
SECT = [("open", 0.0), ("verse1", KT(36)), ("ages", KT(99.5)), ("know", KT(128)), ("chorus1", KT(174)), ("wonder", KT(240)),
        ("verse2", KT(333.5)), ("say", KT(401.5)), ("thanks", KT(436)), ("finale", KT(484)), ("outro", 253.80), (None, 280.60)]          # the film ends 2.2 s before the file does: the tail is silence
if len(sys.argv) > 3: SECT = [x for x in SECT if x[0] is None or x[1] >= float(sys.argv[3]) - 1e-6]
out = sys.argv[1]; crf = sys.argv[2] if len(sys.argv) > 2 else "18"
T0, T1 = SECT[0][1], SECT[-1][1]
lines, missing = [], 0
g = 0
while T0 + g / 24 < T1 - 1e-6:
    T = min(T0 + g / 24 + LEAD, T1 - 1e-4)
    for (nm, s), (_, e) in zip(SECT[:-1], SECT[1:]):
        if s - 1e-6 <= T < e - 1e-6:
            n = int(round((T - s) * 24)); f = f"{FR}/{nm}/f{n:05d}.png"
            if not os.path.exists(f):
                # the last frame of a page is held for the one film frame that rounds past its end; anything else is a gap
                if e - T < 1.5 / 24 and lines and lines[-1].startswith(f"{FR}/{nm}/"): f = lines[-1]
                else: missing += 1; print("MISSING", f); f = lines[-1] if lines else f
            lines.append(f); break
    g += 1
lst = Path(FR) / "assemble_pages.txt"
lst.parent.mkdir(parents=True, exist_ok=True)
with open(lst, "w", encoding="utf-8") as fh:
    for f in lines: fh.write(f"file '{f}'\nduration {1/24:.8f}\n")
print(len(lines), "frames", "missing", missing, "from", T0, "to", T1)
subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-ss", str(T0), "-t", str(T1 - T0), "-i", AUDIO,
                       "-vf", "fps=24", "-c:v", "libx264", "-preset", "slow", "-crf", crf, "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", out])
