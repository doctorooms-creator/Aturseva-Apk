#!/usr/bin/env python3
"""
V4-P1 asset extraction — EXACT crops from the owner's original Figma mockup.

Decodes each Figma IMAGE fill's imageTransform (object-UV -> image-UV matrix)
into a pixel rectangle on the 852x1846 source, crops it, and (for art that
sits on the page background) flood-key-fills the connected background to
transparent so the art lands clean on any surface.

Targets are 2x the Figma design frame (426x923 -> 852x1846), so a crop at
native resolution IS the @2x variant; @3x is a 1.5x LANCZOS upscale.
"""
from PIL import Image, ImageFilter
import os

SRC = Image.open("original-mockup.png").convert("RGBA")
W, H = SRC.size  # 852 x 1846

def uv_rect(u0, v0, du, dv):
    """Figma imageTransform -> pixel rect (x0, y0, x1, y1) on the source."""
    x0, y0 = u0 * W, v0 * H
    x1, y1 = (u0 + du) * W, (v0 + dv) * H
    return round(x0), round(y0), round(x1), round(y1)

def flood_key(img, tol=14):
    """Remove the connected near-uniform background (flood from all edges).

    Only the region REACHABLE from the border within tolerance is keyed —
    white/light areas INSIDE the artwork (coats, highlights) survive.
    Anti-aliased fringes get a soft alpha pass afterwards.
    """
    px = img.load()
    w, h = img.size
    # Reference color = average of the four corners
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

    # Slightly padded tolerance: background is one flat wash
    while stack:
        x, y = stack.pop()
        r, g, b, a = px[x, y]
        if abs(r - ref[0]) <= tol and abs(g - ref[1]) <= tol and abs(b - ref[2]) <= tol:
            px[x, y] = (r, g, b, 0)
            push(x + 1, y); push(x - 1, y)
            push(x, y + 1); push(x, y - 1)
    return img

def soften_edges(img):
    """Feather the 1px alpha fringe so keyed edges don't look cut out."""
    a = img.getchannel("A").filter(ImageFilter.GaussianBlur(0.6))
    img.putalpha(a)
    return img

def crop(name, rect, target_2x, key=False, out_dir="../home3d"):
    box = (rect[0], rect[1], rect[2], rect[3])
    img = SRC.crop(box)
    if img.size != target_2x:
        img = img.resize(target_2x, Image.LANCZOS)
    if key:
        img = soften_edges(flood_key(img))
    img.save(f"{out_dir}/{name}-2x.png")
    x3 = (round(target_2x[0] * 1.5), round(target_2x[1] * 1.5))
    img.resize(x3, Image.LANCZOS).save(f"{out_dir}/{name}-3x.png")
    print(f"{name}: crop{box} -> {target_2x} @2x, {x3} @3x{' (keyed)' if key else ''}")

os.makedirs("../home3d", exist_ok=True)

# ——— Hero illustration (node 3:42) — 199x133 design — keyed ————
crop("figma-hero",
     uv_rect(0.49295774102211, 0.09209100902080536, 0.4671361446380615, 0.14409534633159637),
     (398, 266), key=True)

# ——— Service tile art (nodes 3:54/3:58/3:62/3:66) — 72x53 design — keyed ——
TILE_V = (0.3001083433628082, 0.057421453297138214)
crop("figma-tile-doctor",   uv_rect(0.06572769582271576,  TILE_V[0], 0.1690140813589096,  TILE_V[1]), (144, 106), key=True)
crop("figma-tile-hospital", uv_rect(0.30516430735588074,  TILE_V[0], 0.1619718372821808,  TILE_V[1]), (144, 106), key=True)
crop("figma-tile-lab",      uv_rect(0.5422534942626953,   TILE_V[0], 0.16431924700737,    TILE_V[1]), (144, 106), key=True)
crop("figma-tile-video",    uv_rect(0.7816901206970215,   TILE_V[0], 0.15962441265583038, TILE_V[1]), (144, 106), key=True)

# ——— Token stack (node 3:70) — 145x81, right radii baked by the mockup ————
crop("figma-token-stack",
     uv_rect(0.6173709034919739, 0.42145177721977234, 0.3403755724430084, 0.08775731176137924),
     (290, 162))

# ——— Whole lab card (node 3:134+3:135) — 392x104 gradient+microscope+r15 ————
crop("figma-lab-card",
     uv_rect(17 / 426 * 0, 0, 0, 0) if False else (34, 1462, 818, 1670),
     (784, 208))

print("done")
