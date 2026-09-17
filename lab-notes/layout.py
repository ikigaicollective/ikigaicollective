"""Shared composition for Ikigai Collective Lab Notes artwork.

One centred layout, rendered natively at whatever canvas is asked for, so the
cover (16:9) and the Substack social preview (14:10) are the same design rather
than one cropped out of the other. Centred means every platform crop takes
margin, never content.

Sizes, from the platforms' own docs:
  1200 x 675   16:9    site, post body, Open Graph
  1456 x 1040  14:10   Substack social / post preview
"""
from __future__ import annotations

from datetime import date
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFont

from mark import mark_image

FG, ACCENT, MUTED, GROUND = "#e8e6e3", "#c4956a", "#8a8078", "#0a0a0a"
GEORGIA = "/System/Library/Fonts/Supplemental/Georgia.ttf"
GEORGIA_I = "/System/Library/Fonts/Supplemental/Georgia Italic.ttf"

# The widest crop any surface applies. Substack shows the same upload at 14:10
# in its own docs, ~3:2 on the homepage and in thumbnails, and 1.91:1 in link
# cards and the social preview dialog. Content is laid out inside the 1.91:1
# band so the tightest of those takes margin, never content.
SAFE_RATIO = 1.91     # widest crop any surface applies

# proportions, as fractions of the SAFE BOX, so the design scales rather than shifts
DIAGRAM_W = 0.533     # diagram width, of the canvas width
DIAGRAM_CY = 0.352    # its centre, down from the top of the safe box
TEXT_W = 0.683        # the column titles wrap inside, of the canvas width
FOOT = 0.077          # lockup centre, up from the bottom of the safe box
BLOCK = 0.261         # text block baseline, up from the bottom of the safe box


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def parse_meta(path: Path) -> dict:
    head = path.read_text(encoding="utf-8").split("\n---\n", 1)[0]
    meta = dict((k.strip(), v.strip())
                for k, v in (l.split(":", 1) for l in head.strip().splitlines()))
    meta["slug"] = path.stem
    return meta


def _wrap(d, text, f, max_w):
    lines, line = [], ""
    for word in text.split():
        probe = f"{line} {word}".strip()
        if d.textlength(probe, font=f) <= max_w:
            line = probe
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def _centre(d, text, f, y, fill, W):
    d.text(((W - d.textlength(text, font=f)) / 2, y), text, font=f, fill=fill)


def _scrim(im, top, ramp, W, H):
    g = Image.new("L", (W, H), 0)
    gd = ImageDraw.Draw(g)
    for y in range(max(0, top), H):
        gd.line([(0, y), (W, y)], fill=min(255, int(255 * (y - top) / ramp)))
    return Image.composite(Image.new("RGB", (W, H), GROUND), im, g)


def _lockup(im, d, cy, W, s):
    text = " ".join("IKIGAI COLLECTIVE")
    mark_px, word_px, gap = int(30 * s), int(17 * s), int(14 * s)
    f = font(GEORGIA, word_px)
    x = (W - (mark_px + gap + d.textlength(text, font=f))) / 2
    m = mark_image(mark_px, MUTED)
    im.paste(m, (int(x), int(cy - mark_px / 2)), m)
    d.text((x + mark_px + gap, cy - word_px / 2 - 1), text, font=f, fill=MUTED)


def compose(meta: dict, W: int, H: int, diagram: Path) -> Image.Image:
    s = W / 1200                      # scale everything off the 1200-wide reference
    week = int(meta["week"])
    im = Image.new("RGB", (W, H), GROUND)
    # the band that survives every crop, centred on the canvas
    safe_h = min(H, W / SAFE_RATIO)
    safe_top = (H - safe_h) / 2

    # the diagram, centred, screen-blended so it sits in the ground
    src = Image.open(diagram).convert("RGB")
    dw = int(W * DIAGRAM_W)
    dh = int(dw * src.height / src.width)
    v = src.resize((dw, dh), Image.LANCZOS)
    x, y = (W - dw) // 2, int(safe_top + safe_h * DIAGRAM_CY - dh / 2)
    x0, y0 = max(x, 0), max(y, 0)
    x1, y1 = min(x + dw, W), min(y + dh, H)
    im.paste(ImageChops.screen(im.crop((x0, y0, x1, y1)),
                               v.crop((x0 - x, y0 - y, x1 - x, y1 - y))), (x0, y0))
    im = ImageEnhance.Brightness(im).enhance(0.94 + (week % 5) * 0.03)
    im = ImageEnhance.Color(im).enhance(0.92 + (week % 4) * 0.05)

    # measure the text block, then fade the diagram out above it
    probe = ImageDraw.Draw(im)
    max_w = int(W * TEXT_W)
    tf = font(GEORGIA, int(32 * s))
    for size in range(int(58 * s), int(30 * s), -2):
        f = font(GEORGIA, size)
        if len(_wrap(probe, meta["title"], f, max_w)) <= 3:
            tf = f
            break
    lines = _wrap(probe, meta["title"], tf, max_w)
    line_h = tf.getbbox("Ag")[3] + int(12 * s)
    top = int(safe_top + safe_h - safe_h * BLOCK - line_h * len(lines))
    im = _scrim(im, int(top - 150 * s), int(130 * s), W, H)

    d = ImageDraw.Draw(im)
    y = top
    _centre(d, " ".join("LAB NOTES"), font(GEORGIA, int(17 * s)), y - int(40 * s), MUTED, W)
    for line in lines:
        _centre(d, line, tf, y, FG, W)
        y += line_h
    y += int(18 * s)
    when = date.fromisoformat(meta["date"]).strftime("%B %-d, %Y")
    _centre(d, f"Week {week} · {when}", font(GEORGIA_I, int(21 * s)), y, ACCENT, W)
    _lockup(im, d, int(safe_top + safe_h - safe_h * FOOT), W, s)
    return im
