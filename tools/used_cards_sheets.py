"""Exactly the character drawings the film draws (from the per-frame audit records), in film order: contact sheets to look
over every drawing before the film is rendered (all of them approved, none still waiting for a redraw).
   node tools/audit_swaps.mjs                       (first: writes <frames>/audit/cards_<page>.json)
   python tools/used_cards_sheets.py OUTDIR [H] [ONEDIR]
      -> OUTDIR/used_01.jpg ...  (H: tile height, default 440); ONEDIR: also one file per drawing, numbered in film order
<frames>: ./frames, or the folder in the environment variable KOKORO_FRAMES."""
import json
import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
AUD = Path(os.environ.get("KOKORO_FRAMES") or ROOT / "frames") / "audit"
CARDS = ROOT / "web" / "data" / "cards"
out = sys.argv[1]; H = int(sys.argv[2]) if len(sys.argv) > 2 else 440
os.makedirs(out, exist_ok=True)
PAGES = ['open', 'verse1', 'ages', 'know', 'chorus1', 'wonder', 'verse2', 'say', 'thanks', 'finale', 'outro']


def load_font(px):
    for f in ("C:/Windows/Fonts/arialbd.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/Library/Fonts/Arial Bold.ttf"):
        if os.path.exists(f):
            return ImageFont.truetype(f, px)
    return ImageFont.load_default()


font, big = load_font(20), load_font(44)
BG, PAGE_W, PAGE_H, PAD, LAB = (27, 63, 134), 3600, 2760, 10, 52
seen, rows = {}, []                      # name -> record ; film order
for p in PAGES:
    d = json.load(open(AUD / f'cards_{p}.json', encoding='utf-8'))
    for i, fr in enumerate(d['frames']):
        t = d['start'] + i / d['fps']
        for e in fr:
            n, x0, y0, x1, y1 = e[:5]
            a = max(0, min(1920, x1) - max(0, x0)) * max(0, min(1080, y1) - max(0, y0)) / (1920 * 1080)
            r = seen.get(n)
            if r is None:
                r = seen[n] = {'name': n, 'page': p, 't': t, 'n': 0, 'a': 0, 'pages': []}; rows.append(r)
            r['n'] += 1; r['a'] = max(r['a'], a)
            if p not in r['pages']: r['pages'].append(p)
card = lambda name: CARDS / f"v2_{name}_lit_day.png"
if len(sys.argv) > 3:                               # also one file per drawing, numbered in film order, on the film's blue
    one = sys.argv[3]; os.makedirs(one, exist_ok=True)
    k = 0
    for r in rows:
        f = card(r['name'])
        if not f.exists(): continue
        k += 1
        im = Image.open(f).convert('RGBA'); m = 60
        bg = Image.new('RGB', (im.width + 2 * m, im.height + 2 * m), BG); bg.paste(im, (m, m), im)
        if max(bg.size) > 2200:
            s = 2200 / max(bg.size); bg = bg.resize((round(bg.width * s), round(bg.height * s)), Image.LANCZOS)
        bg.save(os.path.join(one, f"{k:03d}_{r['page']}_{r['name']}.jpg"), quality=92)
    print(k, 'single images ->', one)
tiles, missing = [], []
for r in rows:
    f = card(r['name'])
    if not f.exists():
        missing.append(r['name']); continue
    im = Image.open(f).convert('RGBA')
    h = H if im.height >= im.width * 0.9 else int(H * 0.62)
    im = im.resize((max(1, int(im.width * h / im.height)), h), Image.LANCZOS)
    w = max(im.width, 190)
    t = Image.new('RGB', (w, H + LAB), BG); t.paste(im, ((w - im.width) // 2, H - h), im)
    dr = ImageDraw.Draw(t)
    small = r['a'] < 0.03
    dr.text((4, H + 2), r['name'] + (' (small)' if small else ''), font=font, fill=(255, 255, 255))
    dr.text((4, H + 26), f"{r['page']} {int(r['t'] // 60)}:{r['t'] % 60:04.1f}", font=font, fill=(255, 220, 120))
    tiles.append((r['page'], t))
pages, page, x, y, cur = [], Image.new('RGB', (PAGE_W, PAGE_H), 'white'), PAD, PAD, None
def newline():
    global x, y
    x, y = PAD, y + H + LAB + PAD
for pg, t in tiles:
    if pg != cur:
        if cur is not None: newline()
        if y + 60 + H + LAB + PAD > PAGE_H:
            pages.append(page.crop((0, 0, PAGE_W, y))); page, x, y = Image.new('RGB', (PAGE_W, PAGE_H), 'white'), PAD, PAD
        ImageDraw.Draw(page).text((PAD, y), pg, font=big, fill=(20, 30, 70)); y += 58; cur = pg
    if x + t.width + PAD > PAGE_W: newline()
    if y + H + LAB + PAD > PAGE_H:
        pages.append(page.crop((0, 0, PAGE_W, y))); page, x, y = Image.new('RGB', (PAGE_W, PAGE_H), 'white'), PAD, PAD
    page.paste(t, (x, y)); x += t.width + PAD
pages.append(page.crop((0, 0, PAGE_W, y + H + LAB + PAD)))
for i, p in enumerate(pages):
    f = os.path.join(out, f'used_{i + 1:02d}.jpg'); p.save(f, quality=88); print(f, p.size)
print(len(tiles), 'drawings;', 'not character cards / no file:', missing)
