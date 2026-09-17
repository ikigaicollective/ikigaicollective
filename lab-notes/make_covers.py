#!/usr/bin/env python3
"""Per-post cover images for Lab Notes, 1200x675 (16:9).

Used by the site, the post body, and Open Graph link previews. The layout
itself lives in layout.py.

Requires Pillow and macOS (layout.py hardcodes the Georgia paths):
    python3 -m pip install --user Pillow

Usage: python3 lab-notes/make_covers.py
Re-runnable; overwrites lab-notes/img/<slug>.jpg for every post, not only
the newest.
"""
from __future__ import annotations

from pathlib import Path

from layout import compose, parse_meta

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "img"
W, H = 1200, 675


def main() -> None:
    OUT.mkdir(exist_ok=True)
    diagram = SRC / "diagram.png"
    for p in sorted(SRC.glob("*.md")):
        meta = parse_meta(p)
        im = compose(meta, W, H, diagram)
        out = OUT / f"{meta['slug']}.jpg"
        im.save(out, quality=90)
        print("cover", out.name, im.size)


if __name__ == "__main__":
    main()
