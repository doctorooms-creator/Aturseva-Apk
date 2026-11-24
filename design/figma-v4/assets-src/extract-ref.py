#!/usr/bin/env python3
"""
V4-P2 asset extraction — from the AUTHORITATIVE reference render
(figma-home-v4-reference.png, 852x1846 = 2x of the 426x923 frame).

The original mockup is an EARLIER iteration: its baked vector icons differ
from the final design. The reference render is the final Figma render —
the only correct source for:
  - all vector icons (glyph-detected + value-keyed against known surfaces)
  - the whole lab card (final text baked)
  - the token stack (reference render = final compositing)

Artworks that are IMAGE fills (hero, 4 tiles) are crops of the mockup
image bank placed 1:1 — the existing mockup-based extracts stand.

Also MEASURES the notification dot (rendered natively in-app as live
state, not baked art).
"""
from PIL import Image, ImageFilter
import os

SRC = Image.open("../figma-home-v4-reference.png").convert("RGBA")
W, H = SRC.size  # 852 x 1846
FX, FY = 1322, 0

def node_rect(x, y, w, h):
    return (round((x - FX) * 2), round((y - FY) * 2),
            round((x - FX + w) * 2), round((y - FY + h) * 2))

def glyph_bounds(im, dark=True, thresh=150, exclude_red=False):
    """Bounding box of ink (dark) or light pixels inside a PIL image.

    exclude_red: skip red-ish pixels (the notification dot) so the glyph
    box hugs the bell ink only.
    """
    px = im.load()
    w, h = im.size
    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if exclude_red and r > 150 and g < 120 and b < 160:
                continue
            lum = (r + g + b) // 3
            if (lum < thresh) if dark else (lum > thresh):
                xs.append(x); ys.append(y)
    if not xs:
        return None
    return (min(xs), min(ys), max(xs) + 1, max(ys) + 1)

def value_key(img, bg, lo=12, hi=55):
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

def red_key(img):
    """Strip the red notification dot from the bell crop (rendered
    natively in-app — it is live state, not baked art)."""
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r > 150 and g < 120 and b < 160:
                px[x, y] = (253, 253, 253, 0) if False else (r, g, b, 0)
    return img

def soften(img):
    a = img.getchannel("A").filter(ImageFilter.GaussianBlur(0.6))
    img.putalpha(a)
    return img

def save_pair(img, name, out="../icons"):
    img.save(f"{out}/{name}-2x.png")
    img.resize((round(img.size[0] * 1.5), round(img.size[1] * 1.5)),
               Image.LANCZOS).save(f"{out}/{name}-3x.png")

PAGE = (253, 253, 253)   # #FDFDFD page / #FFFFFF cards & bar
BANNER = (37, 37, 37)    # #252525 token banner
os.makedirs("../icons", exist_ok=True)

def icon(name, region, bg, dark=True, exclude_red=False):
    reg = SRC.crop(region)
    gb = glyph_bounds(reg, dark=dark, exclude_red=exclude_red)
    if gb is None:
        print(f"!! {name}: NO GLYPPH in {region}")
        return
    img = reg.crop(gb)
    img = soften(value_key(img, bg))
    if exclude_red:
        img = red_key(img)
    save_pair(img, name)
    print(f"{name}: glyph@{gb} in {region} -> {img.size}@2x")

# ————— measurement: notification dot (native render spec) —————
hdr = SRC.crop((740, 100, 810, 170))
px = hdr.load()
red_px = [(x, y) for y in range(hdr.size[1]) for x in range(hdr.size[0])
          if px[x, y][0] > 150 and px[x, y][1] < 120 and px[x, y][2] < 160 and px[x, y][3] > 128]
if red_px:
    xs = [p[0] for p in red_px]; ys = [p[1] for p in red_px]
    x0, y0 = min(xs), min(ys); x1, y1 = max(xs) + 1, max(ys) + 1
    # most common red color
    from collections import Counter
    cc = Counter((px[x, y][0], px[x, y][1], px[x, y][2]) for x, y in red_px)
    dot_rgb = cc.most_common(1)[0][0]
    print(f"DOT: bounds=({740+x0},{100+y0})-({740+x1},{100+y1}) "
          f"size={x1-x0}x{y1-y0} rgb={dot_rgb} -> design "
          f"{(x1-x0)/2:.0f}x{(y1-y0)/2:.0f}dp at ({740+x0-FX*2+FX*2- (FX*2)+ (1322*0):.0f}..)"
          f" frame-x={(740+x0)/2+ (FX- FX) + 0:.0f}")
    # simpler: frame coords
    print(f"DOT(frame): x={(740+x0)/2:.1f} y={(100+y0)/2:.1f} w={(x1-x0)/2:.1f} h={(y1-y0)/2:.1f}")
else:
    print("DOT: none found")

# ————— header / search / section icons —————
icon("icon-pin",          (40, 108, 84, 160), PAGE)
icon("icon-chevron-down", (214, 122, 248, 156), PAGE)
icon("icon-bell",         (748, 108, 800, 164), PAGE, exclude_red=True)
icon("icon-search",       (60, 450, 108, 498), PAGE)
icon("icon-mic",          (748, 448, 794, 496), PAGE)
icon("icon-view-chevron", (786, 968, 824, 1012), PAGE)
icon("icon-appt-chevron", (764, 1114, 802, 1154), PAGE)

# ————— banner chips (white on #252525) —————
icon("icon-lightning", (76, 880, 110, 920), BANNER, dark=False)
icon("icon-calendar",  (284, 880, 322, 918), BANNER, dark=False)

# ————— specialty line icons —————
icon("spec-cardiology", (72, 1336, 134, 1394), PAGE)
icon("spec-pulmonology", (208, 1334, 270, 1394), PAGE)
icon("spec-neurology",   (342, 1336, 406, 1390), PAGE)
icon("spec-gastro",      (474, 1332, 540, 1396), PAGE)
icon("spec-gynecology",  (606, 1334, 666, 1396), PAGE)
icon("spec-more",        (736, 1336, 790, 1390), PAGE)

# ————— bottom nav icons (home = filled active state by design) —————
icon("nav-home",     (100, 1708, 152, 1756), PAGE)
icon("nav-bookings", (304, 1708, 356, 1756), PAGE)
icon("nav-records",  (506, 1708, 558, 1756), PAGE)
icon("nav-account",  (704, 1708, 756, 1756), PAGE)

# ————— lab card: whole card, final text baked —————
LAB = node_rect(1339, 731, 392, 104)  # (34, 1462, 818, 1670)
lab = SRC.crop(LAB)
lab.save("../home3d/figma-lab-card-2x.png")
lab.resize((round(lab.size[0] * 1.5), round(lab.size[1] * 1.5)),
           Image.LANCZOS).save("../home3d/figma-lab-card-3x.png")
print(f"figma-lab-card: {lab.size}@2x (reference, final text)")

# ————— token stack: from reference (final compositing) —————
TS = node_rect(1585, 389, 145, 81)  # (526, 778, 816, 940)
ts = SRC.crop(TS)
ts.save("../home3d/figma-token-stack-2x.png")
ts.resize((round(ts.size[0] * 1.5), round(ts.size[1] * 1.5)),
          Image.LANCZOS).save("../home3d/figma-token-stack-3x.png")
print(f"figma-token-stack: {ts.size}@2x (reference)")

print("done")
