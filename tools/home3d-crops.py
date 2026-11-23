#!/usr/bin/env python3
"""P1-1b: final asset crops from FULL mockup (VLM bboxes + strip offsets + 20% pad)."""
from PIL import Image
import json

MOCKUP = "design/owner-home-v3-FULL-reference.png"
img = Image.open(MOCKUP)
W, H = img.size

# strip y-offsets used during VLM bbox pass
strip_offsets = {"hero": 140, "tiles": 400, "banner": 585, "trust": 1940}

assets = {
    # name: (strip, x1, y1, x2, y2)  <- strip-relative VLM bboxes
    "hero-3d":       ("hero",   340,   0, 680, 209),
    "tile-doctor":   ("tiles",   75,  45, 140, 125),
    "tile-hospital": ("tiles",  240,  45, 330, 125),
    "tile-labtubes": ("tiles",  410,  40, 490, 125),
    "tile-video":    ("tiles",  570,  45, 665, 120),
    "token-stack":   ("banner", 470,  40, 700, 145),
    "shield-3d":     ("trust",   60,  25, 115,  85),
}

manifest = {}
for name, (strip, x1, y1, x2, y2) in assets.items():
    oy = strip_offsets[strip]
    mx1, my1, mx2, my2 = x1, y1 + oy, x2, y2 + oy  # mockup coords
    # 20% pad on each side
    pw, ph = int((mx2 - mx1) * 0.20), int((my2 - my1) * 0.20)
    cx1, cy1 = max(0, mx1 - pw), max(0, my1 - ph)
    cx2, cy2 = min(W, mx2 + pw), min(H, my2 + ph)
    crop = img.crop((cx1, cy1, cx2, cy2))
    p = f"workspace/home3d/crops/{name}.png"
    crop.save(p)
    manifest[name] = {"crop": p, "mockup_bbox": [mx1, my1, mx2, my2], "size": crop.size}
    print(f"{name}: mockup({mx1},{my1})-({mx2},{my2}) pad->({cx1},{cy1})-({cx2},{cy2}) {crop.size}")

json.dump(manifest, open("workspace/home3d/crops/manifest.json", "w"), indent=2)
print("manifest saved")
