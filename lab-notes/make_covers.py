#!/usr/bin/env python3
"""Per-post cover images for Lab Notes, in the Ikigai design language.

Reads lab-notes/src/*.md frontmatter (title/date/week) and composes a
1200x675 cover per post: deterministic PIL typography over the text-free
master (src/master-16x9.png). Each week gets a slightly different crop and
tone of the master, seeded by the week number, so the series reads as a
family without being identical. No personal bylines — collective assets.

Usage: python3 lab-notes/make_covers.py   (run from anywhere; paths are
relative to this file). Re-runnable; overwrites lab-notes/img/<slug>.jpg.
"""
from __future__ import annotations

from datetime import date
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "img"

FG, ACCENT, MUTED = "#e8e6e3", "#c4956a", "#8a837c"
GEORGIA = "/System/Library/Fonts/Supplemental/Georgia.ttf"
GEORGIA_I = "/System/Library/Fonts/Supplemental/Georgia Italic.ttf"
W, H = 1200, 675
TEXT_X, TEXT_MAX_W = 64, 520


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def parse_meta(path: Path) -> dict:
    head = path.read_text(encoding="utf-8").split("\n---\n", 1)[0]
    meta = dict(
        (k.strip(), v.strip())
        for k, v in (line.split(":", 1) for line in head.strip().splitlines())
    )
    meta["slug"] = path.stem
    return meta


# Weeks where the seeded flip would land the Venn cluster on the text (left) side.
NO_FLIP = {13}


def background(week: int) -> Image.Image:
    """Week-seeded crop + tone of the master: same family, distinct feel."""
    m = Image.open(SRC / "master-16x9.png").convert("RGB")
    mw, mh = m.size  # 1376x768
    x_off = (week * 37) % max(1, mw - W)
    y_off = (week * 23) % max(1, mh - H)
    im = m.crop((x_off, y_off, x_off + W, y_off + H))
    if week % 2 and week not in NO_FLIP:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    im = ImageEnhance.Brightness(im).enhance(0.94 + (week % 5) * 0.03)
    im = ImageEnhance.Color(im).enhance(0.92 + (week % 4) * 0.05)
    return im


def wrap(draw: ImageDraw.ImageDraw, text: str, f: ImageFont.FreeTypeFont,
         max_w: int) -> list[str]:
    lines, line = [], ""
    for word in text.split():
        probe = f"{line} {word}".strip()
        if draw.textlength(probe, font=f) <= max_w:
            line = probe
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def title_font(draw: ImageDraw.ImageDraw, text: str) -> ImageFont.FreeTypeFont:
    for size in range(54, 30, -2):
        f = font(GEORGIA, size)
        if len(wrap(draw, text, f, TEXT_MAX_W)) <= 3:
            return f
    return font(GEORGIA, 32)


def cover(meta: dict) -> None:
    week = int(meta["week"])
    im = background(week)
    d = ImageDraw.Draw(im)
    kicker = "LAB NOTES"
    kf = font(GEORGIA, 20)
    tf = title_font(d, meta["title"])
    lines = wrap(d, meta["title"], tf, TEXT_MAX_W)
    line_h = tf.getbbox("Ag")[3] + 10
    mf = font(GEORGIA_I, 24)
    when = date.fromisoformat(meta["date"]).strftime("%B %-d, %Y")
    sub = f"Week {week} · {when}"
    block_h = 30 + 18 + len(lines) * line_h + 20 + 2 + 24 + 34 + 30
    y = (H - block_h) // 2
    d.text((TEXT_X, y), " ".join(kicker), font=kf, fill=MUTED)
    y += 30 + 18
    for line in lines:
        d.text((TEXT_X, y), line, font=tf, fill=FG)
        y += line_h
    y += 20
    d.rectangle([TEXT_X, y, TEXT_X + 72, y + 2], fill=ACCENT)
    y += 26
    d.text((TEXT_X, y), sub, font=mf, fill=ACCENT)
    y += 34 + 14
    d.text((TEXT_X, y), "ikigaicollective.org", font=font(GEORGIA, 18), fill=MUTED)
    out = OUT / f"{meta['slug']}.jpg"
    im.save(out, quality=90)
    print("cover", out.name, im.size)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for p in sorted(SRC.glob("*.md")):
        cover(parse_meta(p))


if __name__ == "__main__":
    main()
