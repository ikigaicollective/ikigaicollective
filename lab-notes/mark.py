"""Draw the Ikigai Collective mark with PIL, supersampled, with round caps.

Geometry is the resolved master: 64x64 box, stroke 5, arc radii 7/11/15
about a baseline at y=39, stem to y=25, released dot r 4.6 at (47, 13.5).
Kept as code rather than an asset so the cover pipeline stays self-contained.
"""
from PIL import Image, ImageDraw

SS = 8  # supersample factor


def mark_image(size: int, colour: str) -> Image.Image:
    s = size * SS / 64.0
    im = Image.new("RGBA", (size * SS, size * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    w = 5 * s                      # stroke width
    r = w / 2                      # cap radius

    def box(cx, cy, rad):
        return [(cx - rad) * s, (cy - rad) * s, (cx + rad) * s, (cy + rad) * s]

    def cap(cx, cy):
        d.ellipse([cx * s - r, cy * s - r, cx * s + r, cy * s + r], fill=colour)

    # three alternating semicircles of increasing radius
    d.arc(box(32, 39, 7),  180, 360, fill=colour, width=int(w))
    d.arc(box(28, 39, 11),   0, 180, fill=colour, width=int(w))
    d.arc(box(32, 39, 15), 180, 360, fill=colour, width=int(w))
    # the stem, and the released dot
    d.line([47 * s, 39 * s, 47 * s, 25 * s], fill=colour, width=int(w))
    for pt in ((25, 39), (47, 39), (47, 25)):
        cap(*pt)
    dot = 4.6
    d.ellipse(box(47, 13.5, dot), fill=colour)
    return im.resize((size, size), Image.LANCZOS)
