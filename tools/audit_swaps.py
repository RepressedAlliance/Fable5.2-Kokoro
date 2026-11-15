"""R2 / R1 audit from the per-frame card records of tools/audit_swaps.mjs (<frames>/audit/cards_<page>.json).

  node tools/audit_swaps.mjs          # record (needs python web/serve.py on 8765)
  python tools/audit_swaps.py         # analyse -> stdout, and <frames>/audit/audit.json
  (<frames>: ./frames, or the folder in the environment variable KOKORO_FRAMES)
R2: no drawing is replaced in its place before two beats have passed, and no A -> B -> A. R1 (the film's own rule): his
ageing is told in one place only - the 'ageing' list shows every place one age of him is replaced by another.

Every frame: the cards drawn (bbox on the 1920x1080 frame, alpha). Draws of consecutive frames are linked into "slots" by
overlap (a place on the screen); a slot's card sequence gives the swaps. Checks:
  short  a card replaced in its slot after less than two beats (0.857 s), runs of 1-3 frames listed apart (in-betweens / blinks)
  aba    A -> B -> A in one slot
  back2  A -> B -> C -> A in one slot within 4 s
Exempt: walk/run cycles (rm/rn running, wl/tw/tb walking). Wind loops (cb_out/cd0/up0 with *_w*) are listed as their own kind.
"""
import json, os, re, sys, collections
from pathlib import Path

AUD = Path(os.environ.get("KOKORO_FRAMES") or Path(__file__).resolve().parent.parent / "frames") / "audit"
WEB = Path(__file__).resolve().parent.parent / "web" / "pages"
PAGES = ['open', 'verse1', 'ages', 'know', 'chorus1', 'wonder', 'verse2', 'say', 'thanks', 'finale', 'outro']
FPS, BEAT, T0 = 24, 0.42858, 20.016
TWO = 2 * BEAT
kb = lambda T: (T - T0) / BEAT
setof = lambda n: n.split('_')[0].rstrip('0123456789') if not n.startswith(('jbc', 'jfc')) else n.split('_')[0]

CYCLE = re.compile(r'^(rm_(c|d|p|f)\d|rn_(c|d|p|f)\d|wl_|tw_|tb_)')
WIND = re.compile(r'^(cb_out|cd0|up0|up_a|cd_a|ov_burst)(_w[1-8])?$|^(cb|cd|up)_w\d$')   # the eight-drawing wind loops (kit.js windFrame)
HIS_SETS = {'la', 'ls', 'me', 'mf', 'lb', 'ki', 'ol', 'jb', 'jt', 'jf', 'jbc', 'jfc', 'hc', 'kv'}
NOT_HIM = {'mf_gone', 'me_gone', 'kv_gone'}
def his(n):
    b = n.split('#')[0]
    return b not in NOT_HIM and (setof(b) in HIS_SETS)
AGE = {'mf0': 20, 'mf_30': 30, 'mf_45': 45, 'mf_65': 65, 'mf_78': 78, 'me0': 20, 'me_30': 30, 'me_45': 45, 'me_65': 65, 'me_78': 78,
       'me0w': 20, 'me_30w': 30, 'me_45w': 45, 'me_65w': 65, 'me_78w': 78, 'kv_30': 30, 'kv_45': 45, 'kv_65': 65, 'kv_78': 78}

def load(p):
    j = json.loads((AUD / f"cards_{p}.json").read_text(encoding='utf-8'))
    frames = []
    for f in j['frames']:
        out = []
        for n, x0, y0, x1, y1, a, hops, tinted in f:
            if a < 0.05: continue
            ix0, iy0, ix1, iy1 = max(x0, 0), max(y0, 0), min(x1, 1920), min(y1, 1080)
            if ix1 <= ix0 or iy1 <= iy0 or (ix1 - ix0) * (iy1 - iy0) < 0.002 * 1920 * 1080: continue
            name = n + ('#sil' if tinted else '')
            box = [ix0, iy0, ix1, iy1]
            for o in out:                                  # the same card twice in one place (shadow, rim): one draw
                if o[0] == name and ov(o[1], box) > 0.5: o[1] = [min(o[1][0], box[0]), min(o[1][1], box[1]), max(o[1][2], box[2]), max(o[1][3], box[3])]; o[2] = max(o[2], a); break
            else: out.append([name, box, a])
        frames.append(out)
    return j, frames

def ov(a, b):
    ix = min(a[2], b[2]) - max(a[0], b[0]); iy = min(a[3], b[3]) - max(a[1], b[1])
    if ix <= 0 or iy <= 0: return 0
    sa = (a[2] - a[0]) * (a[3] - a[1]); sb = (b[2] - b[0]) * (b[3] - b[1])
    return ix * iy / min(sa, sb)

def track(frames):
    tracks = []                                            # {'seq': [(f, name)], 'box', 'last'}
    for f, D in enumerate(frames):
        live = [t for t in tracks if t['last'] == f - 1]
        pairs = sorted(((ov(t['box'], d[1]) + (0.3 if t['seq'][-1][1] == d[0] else 0), i, j) for i, t in enumerate(live) for j, d in enumerate(D)), reverse=True)
        ut, ud = set(), set()
        for s, i, j in pairs:
            if s < 0.45 or i in ut or j in ud: continue
            # her slot and his slot are not the same slot: a card of his does not replace one of hers
            if his(live[i]['seq'][-1][1]) != his(D[j][0]) and s < 1.0: continue
            ut.add(i); ud.add(j); t = live[i]; t['seq'].append((f, D[j][0], round((D[j][1][2]-D[j][1][0])*(D[j][1][3]-D[j][1][1])/(1920*1080)*100,1))); t['box'] = D[j][1]; t['last'] = f
        for j, d in enumerate(D):
            if j not in ud: tracks.append({'seq': [(f, d[0], round((d[1][2]-d[1][0])*(d[1][3]-d[1][1])/(1920*1080)*100,1))], 'box': d[1], 'last': f})
    return tracks

def runs(seq):
    R = []
    for f, n, *ar in seq:
        if R and R[-1][0] == n and R[-1][2] == f - 1: R[-1][2] = f
        else: R.append([n, f, f, ar[0] if ar else 0])
    return R

def code_lines(page, names):
    src = (WEB / f"{page}.js").read_text(encoding='utf-8').splitlines()
    hits = {}
    for n in names:
        b = n.split('#')[0]
        hits[b] = [i + 1 for i, l in enumerate(src) if re.search(r"['\"`~]" + re.escape(b) + r"['\"`~]", l)][:6]
    return hits

def main():
    report = {'pages': {}, 'his': collections.defaultdict(list)}
    for p in PAGES:
        j, frames = load(p)
        st = j['start']; T = lambda f: st + f / FPS
        tr = track([[d for d in D if not d[0].endswith('#sil')] for D in frames])   # flat shapes (sheets not looked at) are not acting
        items = []
        for t in tr:
            R = runs(t['seq'])
            if len(R) < 2: continue
            for i, (n, f0, f1, area) in enumerate(R):
                d = (f1 - f0 + 1) / FPS
                nxt = R[i + 1] if i + 1 < len(R) else None
                prv = R[i - 1] if i else None
                ctx = ' -> '.join(f"{r[0]}({(r[2]-r[1]+1)/FPS:.2f})" for r in R[max(0, i - 3): i + 4])
                if nxt and nxt[1] == f1 + 1:
                    cyc = bool(CYCLE.match(n) and CYCLE.match(nxt[0]))
                    wind = bool(WIND.match(n) and WIND.match(nxt[0]))
                    if d < TWO - 1 / FPS and not cyc:
                        kind = 'wind' if wind else ('inb' if f1 - f0 + 1 <= 3 else 'short')
                        items.append({'kind': kind, 'card': n, 'next': nxt[0], 'T': T(f0), 'k': kb(T(f0)), 'tp': f0 / FPS, 'dur': d, 'area': area, 'ctx': ctx})
                    if prv and prv[2] == f0 - 1 and prv[0] == nxt[0] and not cyc:
                        kind = 'aba_wind' if wind else ('aba_blink' if f1 - f0 + 1 <= 3 else 'aba')
                        items.append({'kind': kind, 'card': f"{prv[0]}->{n}->{nxt[0]}", 'T': T(f0), 'k': kb(T(f0)), 'tp': f0 / FPS, 'dur': d, 'area': area, 'ctx': ctx})
                    if prv and i + 2 < len(R) and R[i + 2][0] == prv[0] and prv[0] != n and nxt[0] != prv[0] and not (CYCLE.match(n) or WIND.match(n)):
                        a = R[i + 2]
                        if (a[1] - prv[2]) / FPS <= 4:
                            items.append({'kind': 'back2', 'card': f"{prv[0]}->{n}->{nxt[0]}->{a[0]}", 'T': T(f0), 'k': kb(T(f0)), 'tp': f0 / FPS, 'dur': d, 'area': area, 'ctx': ctx})
        names = sorted({x for it in items for x in re.split(r'->', it['card']) + [it.get('next', '')] if x})
        report['pages'][p] = {'start': st, 'items': sorted(items, key=lambda x: x['T']), 'lines': code_lines(p, names)}
        # his cards: when and where
        on = collections.defaultdict(list)
        for f, D in enumerate(frames):
            for n, box, a in D:
                if his(n): on[n].append(f)
        for n, fs in on.items():
            segs = []
            for f in fs:
                if segs and f - segs[-1][1] <= 12: segs[-1][1] = f
                else: segs.append([f, f])
            for a, b in segs: report['his'][n].append([p, round(T(a), 2), round(T(b) + 1 / FPS, 2), round(a / FPS, 2), round((b + 1) / FPS, 2)])
        # ageing: his age cards replacing one another in a slot
        ag = []
        for t in tr:
            R = [r for r in runs(t['seq']) if r[0].split('#')[0] in AGE]
            for x, y in zip(R, R[1:]):
                if AGE[y[0].split('#')[0]] != AGE[x[0].split('#')[0]] and y[1] - x[2] <= 24:
                    ag.append([x[0], y[0], round(T(y[1]), 2), round(y[1] / FPS, 2)])
        report['pages'][p]['ageing'] = sorted(ag, key=lambda a: a[2])
    (AUD / 'audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding='utf-8')
    for p, r in report['pages'].items():
        print(f"\n== {p} (start {r['start']:.2f})")
        for it in r['items']:
            print(f"  {it['kind']:9s} T={it['T']:7.2f} page {it['tp']:6.2f} k={it['k']:6.1f} {it['card']:28s} {it['dur']:.2f}s {it['area']:5.1f}% | {it['ctx']}")
        if r['ageing']: print('  ageing:', r['ageing'])
        print('  lines:', r['lines'])
    print('\n== his cards')
    for n in sorted(report['his'], key=lambda n: (setof(n), n)):
        L = report['his'][n]; tot = sum(b - a for _, a, b, _, _ in L)
        print(f"  {n:12s} {tot:6.2f}s  " + '; '.join(f"{p} {a:.2f}-{b:.2f}" for p, a, b, _, _ in L))

if __name__ == '__main__':
    main()
