"""Does the picture change when the music does? Measured on the finished file, not on the page scripts.
For each film: how much the picture changes at each frame (a small grey copy, mean absolute difference), and, for the
changes that stand out (cuts, swaps, stamps: the top 8 % of frames), how far the nearest half-beat of the song is.
   python tools/sync_check.py film.mp4 [film2.mp4 ...]
Prints: the share of big changes that land within one frame of a half-beat / of a whole beat, and the mean offset
(negative = the picture changes before the beat sounds). Beats: 20.016 + k * 0.42858 s; from 8 s on (before that the
music box is not on the grid)."""
import subprocess, sys
import numpy as np
T0, P, FPS, W, H = 20.016, 0.42858, 24, 96, 54
for f in sys.argv[1:]:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-vf", f"fps={FPS},scale={W}:{H},format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
    a = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
    d = np.abs(np.diff(a, axis=0)).mean((1, 2)); d = np.concatenate([[0], d])      # d[g]: frame g against frame g-1
    t = np.arange(len(d)) / FPS                                                      # the change is on screen from t[g]
    sel = t > 8.2
    thr = np.quantile(d[sel], 0.92)
    big = np.where(sel & (d >= thr) & (d >= np.roll(d, 1)) & (d >= np.roll(d, -1)))[0]
    def stats(step):
        k = (t[big] - T0) / P; off = (k - np.round(k / step) * step) * P             # seconds from the nearest grid point
        return off
    o2, o1 = stats(0.5), stats(1.0)
    fr = 1 / FPS
    print("%s: %d frames, %d big changes" % (f.split("/")[-1], len(d), len(big)))
    print("   within one frame of a half-beat: %4.1f %%   (chance: %.0f %%)   mean offset %+.0f ms" % (100 * np.mean(np.abs(o2) <= fr), 100 * 2 * fr / (P / 2), 1000 * o2[np.abs(o2) <= fr * 1.5].mean()))
    print("   within one frame of a whole beat: %4.1f %%   (chance: %.0f %%)   mean offset %+.0f ms" % (100 * np.mean(np.abs(o1) <= fr), 100 * 2 * fr / P, 1000 * o1[np.abs(o1) <= fr * 1.5].mean()))
    h, _ = np.histogram(o1 * 1000, bins=np.arange(-214, 215, 42.86)); print("   offsets from the whole beat, ms (-214 .. +214, 43 ms bins):", h.tolist())
