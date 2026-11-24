#!/usr/bin/env python3
"""
V4-P1c asset extraction — FINAL. Lessons from the first two passes:

1. Node absoluteBoundingBox can LIE for icon frames (the "Location pin"
   frame is empty; the glyph renders ~4px off its box). Fix: glyph
   detection — scan a generous region, find the actual ink/light pixels,
   crop the true bounds.
2. Background keying by KNOWN surface color with a distance ramp
   (page white / banner #252525 / pill #1F2020).
3. Microscope: reconstructing the gradient from Figma handles left a
   patch — instead SAMPLE the actual per-column background from the
   card's top edge (clean gradient row above the art), then diff.
4. Hero/tile art: flood-key with a PAD margin so the flood has a clean
   runway when art touches the crop border.
"""
from PIL import Image, ImageFilter
import os

SRC = Image.open("original-mockup.png").convert("RGBA")
W, H = SRC.size
FX, FY = 1322, 0

def node_rect(x, y, w, h):
    return (round((x - FX) * 2), round((y - FY) * 2),
            round((x - FX + w) * 2), round((y - FY + h) * 2))

def glyph_bounds(region, dark=True, thresh=150):
    """Bounding box of ink (dark) or light pixels inside a region."""
    im = SRC.crop(region)
    px = im.load()
    w, h = im.size
    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            lum = (r + g + b) // 3
            if (lum < thresh) if dark else (lum > thresh):
                xs.append(x); ys.append(y)
    if not xs:
        return None
    return (region[0] + min(xs), region[1] + min(ys),
            region[0] + max(xs) + 1, region[1] + max(ys) + 1)

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

def flood_key(img, tol=14):
    px = img.load()
    w, h = img.size
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    ref = tuple(sum(c[i] for c in corners) // 4 for i in range(3))
    visited = bytearray(w * h)
    stack = []
    def push(x, y):
        if 0 <= x < w and 0 <= y < h and not visited[y * w + x]:
            visited[y * w + x] = 1
            stack.append((x, y))
    for x in range(w):
        push(x, 0); push(x, h - 1)
    for y in range(h):
        push(0, y); push(w - 1, y)
    while stack:
        x, y = stack.pop()
        r, g, b, a = px[x, y]
        if abs(r - ref[0]) <= tol and abs(g - ref[1]) <= tol and abs(b - ref[2]) <= tol:
            px[x, y] = (r, g, b, 0)
            push(x + 1, y); push(x - 1, y)
            push(x, y + 1); push(x, y - 1)
    return img

def soften(img):
    a = img.getchannel("A").filter(ImageFilter.GaussianBlur(0.6))
    img.putalpha(a)
    return img

def save_pair(img, name, out="../icons"):
    img.save(f"{out}/{name}-2x.png")
    img.resize((round(img.size[0] * 1.5), round(img.size[1] * 1.5)),
               Image.LANCZOS).save(f"{out}/{name}-3x.png")

PAGE = (253, 253, 253)
BANNER = (37, 37, 37)
PILL = (31, 32, 32)
os.makedirs("../icons", exist_ok=True)

def icon(name, region, bg, dark=True):
    """Glyph-detect inside a generous region, then key against bg."""
    gb = glyph_bounds(region, dark=dark)
    if gb is None:
        print(f"!! {name}: NO GLYPH FOUND in {region}")
        return
    img = soften(value_key(SRC.crop(gb), bg))
    save_pair(img, name)
    print(f"{name}: glyph {gb} -> {img.size}@2x")

# ---- Ink icons on page/card/bar white (glyph = dark pixels) ----
# Regions are generous (2x node bounds + slack) to survive node lies.
icon("icon-pin",          (44, 112, 80, 156), PAGE)
icon("icon-chevron-down", (218, 126, 244, 152), PAGE)
icon("icon-bell",         (752, 112, 796, 160), PAGE)
icon("icon-search",       (64, 454, 104, 494), PAGE)
icon("icon-mic",          (752, 452, 790, 494), PAGE)
icon("icon-view-chevron", (790, 972, 820, 1006), PAGE)
icon("icon-appt-chevron", (768, 1118, 798, 1150), PAGE)
icon("spec-cardiology",   (76, 1338, 130, 1390), PAGE)
icon("spec-pulmonology",  (212, 1336, 266, 1390), PAGE)
icon("spec-neurology",    (346, 1338, 404, 1386), PAGE)
icon("spec-gastro",       (478, 1334, 536, 1392), PAGE)
icon("spec-gynecology",   (610, 1336, 662, 1392), PAGE)
icon("spec-more",         (740, 1338, 786, 1386), PAGE)
icon("nav-home",          (104, 1710, 148, 1754), PAGE)
icon("nav-bookings",      (308, 1710, 352, 1754), PAGE)
icon("nav-records",       (510, 1710, 554, 1754), PAGE)
icon("nav-account",       (708, 1710, 752, 1754), PAGE)

# ---- White icons on dark surfaces (glyph = light pixels) ----
icon("icon-lightning",    (80, 882, 106, 916), BANNER, dark=False)
icon("icon-calendar",     (288, 882, 320, 914), BANNER, dark=False)
icon("icon-arrow",        (216, 1606, 248, 1638), PILL, dark=False)

# ---- Avatar: node-exact photo crop ----
avatar = SRC.crop(node_rect(1353, 515, 46, 44))
save_pair(avatar, "avatar-doctor")
print(f"avatar-doctor: {avatar.size}@2x (opaque photo)")

# ---- Microscope: per-column SAMPLED gradient key ----
# Sample the card's clean top strip (y1463, above the art which starts
# y1464... actually sample y1463 full width) as the true bg per column.
CARD = node_rect(1339, 731, 392, 104)  # (34, 1462, 818, 1670)
ART = node_rect(1511, 732, 219, 103)   # (378, 1464, 816, 1670)
srcpx = SRC.load()
# Sample row: the art starts at y1464; row y1463 might clip art tops.
# The card top edge y1462-1463 is the card's own 2px. Use y1463.
sample_y = CARD[1] + 1  # 1463
bgcol = {}
for x in range(CARD[0], CARD[2]):
    bgcol[x] = srcpx[x, sample_y][:3]
# Fill columns right of the art (>=816) with the last sample
img = SRC.crop(ART)
px = img.load()
w, h = img.size
for x in range(w):
    gx = ART[0] + x
    br, bg_, bb = bgcol.get(gx, bgcol[CARD[2] - 1])
    for y in range(h):
        r, g, b, a = px[x, y]
        d = max(abs(r - br), abs(g - bg_), abs(b - bb))
        if d <= 12:
            px[x, y] = (r, g, b, 0)
        elif d < 50:
            px[x, y] = (r, g, b, round((d - 12) * 255 / 38))
img = soften(img)
save_pair(img, "lab-microscope")
print(f"lab-microscope: sampled-gradient key {img.size}@2x")

# ---- Hero + 4 tiles + token stack: PADDED flood-key (re-run of P1a with pad) ----
def art_flood(name, rect, pad=6):
    box = (rect[0] - pad, rect[1] - pad, rect[2] + pad, rect[3] + pad)
    img = soften(flood_key(SRC.crop(box)))
    # Trim the pad back off — the design rect is the authoritative aspect.
    img = img.crop((pad, pad, img.size[0] - pad, img.size[1] - pad))
    save_pair(img, name, out="../home3d")
    print(f"{name}: padded flood {img.size}@2x")

def uv_rect(u0, v0, du, dv):
    x0, y0 = u0 * W, v0 * H
    x1, y1 = (u0 + du) * W, (v0 + dv) * H
    return round(x0), round(y0), round(x1), round(y1)

art_flood("figma-hero",
          uv_rect(0.49295774102211, 0.09209100902080536, 0.4671361446380615, 0.14409534633159637))
TILE_V = (0.3001083433628082, 0.057421453297138214)
art_flood("figma-tile-doctor",   uv_rect(0.06572769582271576, TILE_V[0], 0.1690140813589096, TILE_V[1]))
art_flood("figma-tile-hospital", uv_rect(0.30516430735588074, TILE_V[0], 0.1619718372821808, TILE_V[1]))
art_flood("figma-tile-lab",      uv_rect(0.5422534942626953, TILE_V[0], 0.16431924700737, TILE_V[1]))
art_flood("figma-tile-video",    uv_rect(0.7816901206970215, TILE_V[0], 0.15962441265583038, TILE_V[1]))

print("done")
