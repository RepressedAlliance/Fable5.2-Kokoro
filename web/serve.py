"""Local server for the pages: serves web/, the project's own files under /p/ (fonts, your audio), and saves the frames
the page posts back.

  python web/serve.py [port]                      (default port 8765)

Frames and stills go to ./frames (next to web/), or to the folder named by the environment variable KOKORO_FRAMES
(a whole page at 24 fps is a few hundred PNGs of about 2-4 MB each: put it on a disk with room).
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent
OUT = Path(os.environ.get("KOKORO_FRAMES") or PROJECT / "frames")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)

    def translate_path(self, path):
        clean = unquote(urlparse(path).path)
        if clean.startswith("/p/"):                                   # read-only view of the project (art, audio, fonts)
            target = (PROJECT / clean[3:]).resolve()
            if PROJECT in target.parents:
                return str(target)
        return super().translate_path(path)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *a):
        pass

    def do_POST(self):
        q = parse_qs(urlparse(self.path).query)
        rel = Path(q.get("name", ["frame.png"])[0])
        target = (OUT / rel).resolve()
        if OUT.resolve() not in target.parents:
            self.send_response(400)
            self.end_headers()
            return
        body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(body)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"ok")


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
