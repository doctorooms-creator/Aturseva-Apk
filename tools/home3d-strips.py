#!/usr/bin/env python3
"""P1-1a: extract zone strips from the FULL mockup so VLM can locate asset bboxes precisely."""
from PIL import Image
import os

MOCKUP = "design/owner-home-v3-FULL-reference.png"
OUT = "workspace/home3d/strips"
os.makedirs(OUT, exist_ok=True)

img = Image.open(MOCKUP)
W, H = img.size
print(f"mockup {W}x{H}")

# zone strips (y-ranges from design/19 zone map, generous padding)
strips = {
    "hero":   (140, 350),    # zone 4: hero copy + hero-3d right
    "tiles":  (400, 600),    # zone 6: 4 quick-action tiles 2x2
    "banner": (585, 750),    # zone 7: ink token banner + token-stack right
    "trust":  (1940, 2055),  # zone 13: lavender trust banner + shield-3d left
}
for name, (y0, y1) in strips.items():
    s = img.crop((0, y0, W, y1))
    p = f"{OUT}/{name}-strip.png"
    s.save(p)
    print(f"{name}: y{y0}-{y1} -> {p} ({s.size[0]}x{s.size[1]})")
