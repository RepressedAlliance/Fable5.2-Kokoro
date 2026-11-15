"""Capture pages whole, in pieces of 10 seconds (a long run sometimes fails to save), each piece retried.
   python tools/capture_all.py [page ...]      (no names: every page)
Needs the preview server (python web/serve.py). Frames land in <frames>/<page>/f%05d.png (see web/serve.py).
The section table is the same as src/assemble_pages.py: page name and the song second it starts at."""
import math
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KT = lambda k: 20.016 + k * 0.42858
SECT = [("open", 0.0), ("verse1", KT(36)), ("ages", KT(99.5)), ("know", KT(128)), ("chorus1", KT(174)), ("wonder", KT(240)),
        ("verse2", KT(333.5)), ("say", KT(401.5)), ("thanks", KT(436)), ("finale", KT(484)), ("outro", 253.80), (None, 280.60)]
want = sys.argv[1:] or [n for n, _ in SECT if n]
bad = []
for (nm, s), (_, e) in zip(SECT[:-1], SECT[1:]):
    if nm not in want: continue
    dur = e - s; n = math.ceil(dur / 10)
    for i in range(n):
        a, b = i * 10, None if i == n - 1 else (i + 1) * 10
        job = f"page={nm}&capture=1&from={a}" + (f"&to={b}" if b is not None else "")
        for attempt in range(4):
            try:                                    # a hung Chrome once stalled a whole run for an hour: give each piece 4 minutes
                r = subprocess.run(["node", str(ROOT / "tools" / "render.mjs"), job], capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=240, cwd=ROOT)
            except subprocess.TimeoutExpired:
                print(f"{job}: TIMEOUT, retrying", flush=True); continue
            line = ((r.stdout or '').strip().splitlines() or [''])[0]
            print(line, flush=True)
            if r.returncode == 0: break
        else: bad.append(job)
print("FAILED:", bad if bad else "none")
