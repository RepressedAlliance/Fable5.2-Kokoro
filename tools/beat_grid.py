"""Where the beats and the bar lines really are (numpy only): the fixed grid every page uses, t(k) = t0 + k * period.
   python tools/beat_grid.py [song.wav]        (default input/kokoro.wav, 16-bit or 24-bit PCM)   -> work/beat_grid.json
For this film: period 0.42858 s (140.0 BPM), t0 = 20.016 s; k divisible by 4 is a bar line.

How: a spectral-flux onset curve (all bands, and the kick band 30-160 Hz); the tempo is the period at which the curve
repeats best over 1, 2, 4, 8, 16 periods (a comb); then period and phase are scanned finely so that the grid's points sit
on the strongest onsets (the kick counted twice). It also prints the kick strength on each of the four beats of a bar
(to find the bar line) and, for the first chorus, the strength on every beat and half-beat: in the second half of this
song the voice and the kick land on the half-beats (k + 0.5), and that is where the swaps of those pages go."""
import json
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
wav = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "input" / "kokoro.wav"
w = wave.open(str(wav)); sr = w.getframerate(); n = w.getnframes(); ch = w.getnchannels(); sw = w.getsampwidth()
raw = np.frombuffer(w.readframes(n), dtype={2: np.int16, 3: np.uint8, 4: np.int32}[sw])
if sw == 3:
    raw = raw.reshape(-1, 3); x = (raw[:, 0].astype(np.int32) | (raw[:, 1].astype(np.int32) << 8) | (raw[:, 2].astype(np.int8).astype(np.int32) << 16)).astype(np.float32)
else:
    x = raw.astype(np.float32)
x = x.reshape(-1, ch).mean(1); x /= np.abs(x).max()
print("sr", sr, "dur", len(x) / sr)
N, Hp = 2048, 441
win = np.hanning(N)
frames = 1 + (len(x) - N) // Hp
on_all, on_low, on_high = (np.zeros(frames - 1, np.float32) for _ in range(3))
freqs = np.fft.rfftfreq(N, 1 / sr)
prev = None
for a in range(0, frames, 4000):                       # in blocks: the whole song at once is a few GB
    b = min(frames, a + 4000)
    idx = np.arange(N)[None, :] + Hp * np.arange(a, b)[:, None]
    L = np.log1p(50 * np.abs(np.fft.rfft(x[idx] * win, axis=1)))
    if prev is not None: L = np.vstack([prev, L])
    flux = np.maximum(0, np.diff(L, axis=0)); o = a - (1 if prev is not None else 0)
    on_all[o:o + len(flux)] = flux.sum(1); on_low[o:o + len(flux)] = flux[:, (freqs > 30) & (freqs < 160)].sum(1)
    on_high[o:o + len(flux)] = flux[:, freqs > 4000].sum(1); prev = L[-1:]
ft = (np.arange(1, frames) * Hp + N / 2) / sr; fps = sr / Hp


def tempo(env, a, b):
    m = (ft >= a) & (ft < b); e = env[m] - env[m].mean(); best = None
    for bpm in np.arange(120, 160, 0.02):
        per = 60 / bpm * fps; s = 0
        for k in (1, 2, 4, 8, 16):
            lag = per * k; i0 = int(np.floor(lag)); fr = lag - i0
            if i0 + 1 >= len(e): continue
            sh = e[i0:-1] * (1 - fr) + e[i0 + 1:] * fr
            s += (e[:len(sh)] * sh).sum() / len(sh)
        if best is None or s > best[0]: best = (s, bpm)
    return best[1]


for a, b in ((30, 70), (60, 95), (93, 123), (120, 160), (160, 240), (20, 260)):
    print("tempo %d-%d s: all %.2f  low %.2f" % (a, b, tempo(on_all, a, b), tempo(on_low, a, b)))


def at(env, t):
    i = (t - ft[0]) * fps; i0 = np.clip(np.floor(i).astype(int), 0, len(env) - 2); fr = i - i0
    return env[i0] * (1 - fr) + env[i0 + 1] * fr


def sm(env, k=5):
    return np.convolve(env, np.hanning(k) / np.hanning(k).sum(), mode="same")


ea, el = sm(on_all), sm(on_low)
best = None
for P in np.arange(0.42800, 0.42920, 0.00002):         # around 140 BPM: widen this for another song
    for ph in np.arange(0, P, 0.004):
        t = np.arange(20 + ph, 260, P)
        s = at(ea, t).mean() + at(el, t).mean() * 2
        if best is None or s > best[0]: best = (s, P, ph)
_, P, ph = best
t0 = 20 + ph
print("period %.5f s  (%.3f BPM)  phase: a beat at %.3f s" % (P, 60 / P, t0))
beat = lambda k: t0 + k * P
for a, b, name in ((93, 123, "chorus1"), (35, 63, "verse1"), (20, 260, "all")):
    ks = np.arange(int(np.ceil((a - t0) / P)), int((b - t0) / P))
    lo = at(el, beat(ks))
    print(name, "kick by k mod 4:", [round(float(lo[ks % 4 == m].mean()), 2) for m in range(4)])
k_ch = int(round((94.59 - t0) / P))
print("beats in the first chorus (k, time, kick, all | the half-beat after it):")
for k in range(k_ch - 4, k_ch + 68):
    t, th = beat(k), beat(k + 0.5)
    print("%4d %7.3f  kick %5.1f all %6.1f | half %7.3f kick %5.1f all %6.1f" % (k, t, at(el, t), at(ea, t), th, at(el, th), at(ea, th)), "  <- k%4==0" if k % 4 == 0 else "")
(ROOT / "work").mkdir(exist_ok=True)
json.dump({"period": float(P), "t0": float(t0)}, open(ROOT / "work" / "beat_grid.json", "w"))
