#!/usr/bin/env python3
"""
V4-P1b asset extraction — the small vector ICONS + avatar + microscope,
exact crops from the owner's original Figma mockup (852x1846 = 2x of the
426x923 design frame).

Node coordinates (absoluteBoundingBox, frame origin x1322 y0) map to PNG
pixels as (node - origin) * 2. Icons are ink line art on the flat page
white -> flood-keyed to transparency (same machinery as extract.py).
The avatar is a photo (kept opaque). The microscope sits on the mint
GRADIENT -> background-diffed with the reconstructed linear gradient.
"""
from PIL import Image, ImageFilter
import os

SRC = Image.open("original-mockup.png").convert("RGBA")
W, H = SRC.size  # 852 x 1846
FX, FY = 1322, 0  # frame origin in node coords

def node_rect(x, y, w, h):
    """Node absoluteBoundingBox -> PNG pixel rect (x0,y0,x1,y1)."""
    return (round((x - FX) * 2), round((y - FY) * 2),
            round((x - FX + w) * 2), round((y - FY + h) * 2))

def value_key(img, bg, lo=12, hi=55):
    """Global key against a KNOWN background color (distance ramp).

    Icon strokes can touch the crop borders, which defeats the corner-
    reference flood — but every icon's surface color is known from the
    zone it lives in (page white, banner #252525, pill #1F2020), so key
    by pixel distance to that color instead. Enclosed background pockets
    (e.g. inside the magnifier ring) key too — they render identically
    on the same-colored surface.
    """
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            d = max(abs(r - bg[0]), abs(g - bg[1]), abs(b - bg[2]))
            if d <= lo:
                px[x, y] = (r, g, b, 0)
            elif d < hi:
                px[x, y] = (r, g, b, round((d - lo) * 255 / (hi - lo)))
    return img

def soften_edges(img):
    a = img.getchannel("A").filter(ImageFilter.GaussianBlur(0.6))
    img.putalpha(a)
    return img

PAGE = (253, 253, 253)   # #FDFDFD page / white cards / white nav bar
BANNER = (37, 37, 37)    # #252525 token banner
PILL = (31, 32, 32)      # #1F2020 Book Tests pill

def crop(name, rect, out_dir="../icons", bg=PAGE, pad=0):
    box = (rect[0] - pad, rect[1] - pad, rect[2] + pad, rect[3] + pad)
    img = SRC.crop(box)
    if bg is not None:
        img = soften_edges(value_key(img, bg))
    img.save(f"{out_dir}/{name}-2x.png")
    x3 = (round(img.size[0] * 1.5), round(img.size[1] * 1.5))
    img.resize(x3, Image.LANCZOS).save(f"{out_dir}/{name}-3x.png")
    print(f"{name}: {box} -> {img.size}@2x bg={bg}")

os.makedirs("../icons", exist_ok=True)

# ---- Header + search + section icons (ink on page white) ----
crop("icon-pin",          node_rect(1346, 62, 12, 13))
crop("icon-chevron-down", node_rect(1434, 66, 7, 7))
crop("icon-bell",         node_rect(1700, 58, 18, 20))
crop("icon-search",       node_rect(1356, 229, 16, 16))
crop("icon-mic",          node_rect(1701, 229, 13, 16))
crop("icon-view-chevron", node_rect(1719, 489, 11, 11))
crop("icon-appt-chevron", node_rect(1709, 562, 9, 10))

# ---- Banner chips (white on #252525) + CTA arrow (white on #1F2020) ----
crop("icon-lightning",    node_rect(1364, 444, 9, 12), bg=BANNER)
crop("icon-calendar",     node_rect(1469, 444, 10, 11), bg=BANNER)
crop("icon-arrow",        node_rect(1433, 806, 10, 10), bg=PILL)

# ---- Specialty line icons (ink on white card) ----
crop("spec-cardiology", node_rect(1362, 672, 23, 21))
crop("spec-pulmonology", node_rect(1430, 671, 23, 22))
crop("spec-neurology", node_rect(1497, 672, 25, 20))
crop("spec-gastro", node_rect(1563, 670, 25, 24))
crop("spec-gynecology", node_rect(1629, 671, 22, 23))
crop("spec-more", node_rect(1694, 672, 19, 20))

# ---- Bottom nav icons (ink on white bar; home = active state art) ----
crop("nav-home",     node_rect(1376, 857, 18, 18))
crop("nav-bookings", node_rect(1478, 857, 18, 18))
crop("nav-records",  node_rect(1579, 857, 18, 18))
crop("nav-account",  node_rect(1678, 857, 18, 18))

# ---- Dr. Adam Max portrait (photo; opaque) ----
crop("avatar-doctor", node_rect(1353, 515, 46, 44), bg=None)

# ---- Microscope art — gradient-diff key ----
# Card node 3:134: x1339 y731 w392 h104, gradient #F8F9F8 -> #DCE5DC
# horizontal (handle (0,.5)->(1,.5)). Art node 3:135: x1511 y732 w219 h103.
CARD = node_rect(1339, 731, 392, 104)  # (34, 1462, 818, 1670)
ART = node_rect(1511, 732, 219, 103)   # (378, 1464, 816, 1670)
C0 = (0xF8, 0xF9, 0xF8)
C1 = (0xDC, 0xE5, 0xDC)
img = SRC.crop(ART).convert("RGBA")
px = img.load()
w, h = img.size
for x in range(w):
    t = (ART[0] + x - CARD[0]) / (CARD[2] - CARD[0])
    t = max(0.0, min(1.0, t))
    br = C0[0] + (C1[0] - C0[0]) * t
    bg = C0[1] + (C1[1] - C0[1]) * t
    bb = C0[2] + (C1[2] - C0[2]) * t
    for y in range(h):
        r, g, b, a = px[x, y]
        d = max(abs(r - br), abs(g - bg), abs(b - bb))
        # distance -> alpha: 0..10 fully bg, 60+ fully art
        alpha = 0 if d <= 10 else (255 if d >= 60 else round((d - 10) * 255 / 50))
        px[x, y] = (r, g, b, alpha)
img = soften_edges(img)
img.save("../icons/lab-microscope-2x.png")
img.resize((round(w * 1.5), round(h * 1.5)), Image.LANCZOS).save("../icons/lab-microscope-3x.png")
print(f"lab-microscope: gradient-diff keyed {img.size}@2x")

print("done")
