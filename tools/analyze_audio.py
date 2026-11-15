"""Measure tempo, beat grid and loudness curve of the song; write work/audio_analysis.json and a PNG chart.
   python tools/analyze_audio.py [song.wav]      (default input/kokoro.wav)
(The film's fixed grid, 20.016 + k * 0.42858 s = 140 BPM, was fitted to these beats; docs/按拍对点.md.)"""
import json
import sys
from pathlib import Path

import librosa
import matplotlib
import numpy as np

matplotlib.use("Agg")
import matplotlib.pyplot as plt

root = Path(__file__).resolve().parents[1]
wav = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "input" / "kokoro.wav"
y, sr = librosa.load(wav, sr=22050, mono=True)
dur = len(y) / sr

hop = 512
onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
tempo, beats = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr, hop_length=hop)
tempo = float(np.atleast_1d(tempo)[0])
beat_times = librosa.frames_to_time(beats, sr=sr, hop_length=hop)

rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0]
t = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
# one-second loudness in dB relative to the song's peak second
sec = np.arange(0, int(dur) + 1)
loud = np.array([rms[(t >= s) & (t < s + 1)].mean() if ((t >= s) & (t < s + 1)).any() else 0 for s in sec])
loud_db = 20 * np.log10(np.maximum(loud, 1e-6) / loud.max())

# spectral balance per second: low (<200 Hz), mid, high (>4 kHz)
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop)) ** 2
freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
def band(lo, hi):
    e = S[(freqs >= lo) & (freqs < hi)].sum(axis=0)
    return np.array([e[(t[: len(e)] >= s) & (t[: len(e)] < s + 1)].mean() for s in sec])
low, mid, high = band(20, 200), band(200, 4000), band(4000, 11025)
tot = low + mid + high + 1e-12

# structural boundaries from a self-similarity novelty on chroma + mfcc
chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
mfcc = librosa.feature.mfcc(y=y, sr=sr, hop_length=hop, n_mfcc=13)
feat = np.vstack([librosa.util.normalize(chroma, axis=1), librosa.util.normalize(mfcc, axis=1)])
bounds = librosa.segment.agglomerative(feat, 14)
bound_times = librosa.frames_to_time(bounds, sr=sr, hop_length=hop)

# first strong onset and end of audible sound
audible = np.where(rms > rms.max() * 0.01)[0]
first_sound, last_sound = float(t[audible[0]]), float(t[audible[-1]])

beat_iv = np.diff(beat_times)
out = {
    "duration": dur,
    "tempo_bpm": tempo,
    "beat_interval_median": float(np.median(beat_iv)),
    "first_sound": first_sound,
    "last_sound": last_sound,
    "beats": [round(float(b), 3) for b in beat_times],
    "segment_bounds": [round(float(b), 2) for b in bound_times],
    "loud_db_per_sec": [round(float(v), 1) for v in loud_db],
    "low_share_per_sec": [round(float(v), 3) for v in low / tot],
    "high_share_per_sec": [round(float(v), 3) for v in high / tot],
}
(root / "work").mkdir(exist_ok=True)
(root / "work" / "audio_analysis.json").write_text(json.dumps(out), encoding="utf-8")

fig, ax = plt.subplots(2, 1, figsize=(20, 7), sharex=True)
ax[0].plot(sec, loud_db, color="#1d4e89")
for b in bound_times:
    ax[0].axvline(b, color="#e0a100", lw=1)
ax[0].set_ylabel("loudness dB (rel.)")
ax[0].set_xticks(np.arange(0, dur, 10))
ax[0].grid(alpha=0.3)
ax[1].plot(sec, low / tot, label="low <200Hz", color="#1d4e89")
ax[1].plot(sec, high / tot, label="high >4kHz", color="#e0a100")
ax[1].legend()
ax[1].grid(alpha=0.3)
ax[1].set_xlabel("seconds")
fig.tight_layout()
fig.savefig(root / "work" / "audio_analysis.png", dpi=80)

print(f"duration {dur:.2f}s tempo {tempo:.2f} bpm beat {np.median(beat_iv):.4f}s first_sound {first_sound:.2f} last_sound {last_sound:.2f}")
print("bounds", [round(float(b), 1) for b in bound_times])
print("loud per 5s:", [round(float(loud_db[i:i+5].mean()), 1) for i in range(0, len(loud_db), 5)])
