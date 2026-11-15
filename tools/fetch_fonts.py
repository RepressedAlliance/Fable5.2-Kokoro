"""Get the ten fonts the pages load (web/page.html) into assets/fonts/. All are SIL Open Font License fonts from the
google/fonts repository; they are not kept in this repository.

  python tools/fetch_fonts.py                 download from github.com/google/fonts
  python tools/fetch_fonts.py --from DIR      copy from a folder where you already have them (same file names, or the
                                              upstream names on the right)
"""
import shutil
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "assets" / "fonts"
BASE = "https://raw.githubusercontent.com/google/fonts/main/ofl/"
# file name the page loads: (folder in google/fonts/ofl, upstream file name)
FONTS = {
    "ShipporiMinchoB1-ExtraBold.ttf": ("shipporiminchob1", "ShipporiMinchoB1-ExtraBold.ttf"),
    "ZenOldMincho-Medium.ttf": ("zenoldmincho", "ZenOldMincho-Medium.ttf"),
    "ZenOldMincho-Black.ttf": ("zenoldmincho", "ZenOldMincho-Black.ttf"),
    "ZenKakuGothicNew-Black.ttf": ("zenkakugothicnew", "ZenKakuGothicNew-Black.ttf"),
    "ZenKakuGothicNew-Medium.ttf": ("zenkakugothicnew", "ZenKakuGothicNew-Medium.ttf"),
    "DelaGothicOne-Regular.ttf": ("delagothicone", "DelaGothicOne-Regular.ttf"),
    "DotGothic16-Regular.ttf": ("dotgothic16", "DotGothic16-Regular.ttf"),
    "IBMPlexMono-Regular.ttf": ("ibmplexmono", "IBMPlexMono-Regular.ttf"),
    "BigShouldersDisplay.ttf": ("bigshouldersdisplay", "BigShouldersDisplay[wght].ttf"),
    "KleeOne-SemiBold.ttf": ("kleeone", "KleeOne-SemiBold.ttf"),
}


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    src = Path(sys.argv[sys.argv.index("--from") + 1]) if "--from" in sys.argv else None
    bad = []
    for name, (fam, up) in FONTS.items():
        target = DEST / name
        if target.exists() and target.stat().st_size > 0:
            print("have", name); continue
        if src:
            f = next((p for p in (src / name, src / up) if p.exists()), None)
            if not f:
                bad.append(name); print("not in", src, name); continue
            shutil.copyfile(f, target); print("copied", name)
            continue
        url = BASE + fam + "/" + urllib.parse.quote(up)
        req = urllib.request.Request(url, headers={"User-Agent": "font-fetch"})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                target.write_bytes(r.read())
            print("got", name, target.stat().st_size)
        except Exception as e:  # noqa: BLE001
            bad.append(name); print("FAILED", name, url, e)
        if fam == "zenoldmincho" and not (DEST / "OFL.txt").exists():
            try:
                with urllib.request.urlopen(urllib.request.Request(BASE + fam + "/OFL.txt", headers={"User-Agent": "font-fetch"}), timeout=60) as r:
                    (DEST / "OFL.txt").write_bytes(r.read())
            except Exception:  # noqa: BLE001
                pass
    if bad:
        sys.exit(f"missing: {bad}")


if __name__ == "__main__":
    main()
