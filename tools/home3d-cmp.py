#!/usr/bin/env python3
"""Fair side-by-side: tight-bbox both images, same canvas, then sheet."""
from PIL import Image
import sys

def tight(img_path, size=512):
    im = Image.open(img_path).convert('RGB')
    # find non-background bbox: bg = corner pixel color, tolerance
    bg = im.getpixel((1, 1))
    px = im.load()
    xs, ys = [], []
    W, H = im.size
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            c = px[x, y]
            d = sum(abs(c[k]-bg[k]) for k in range(3))
            if d > 40:
                xs.append(x); ys.append(y)
    if not xs:
        return im.resize((size, size))
    box = (min(xs), min(ys), max(xs)+1, max(ys)+1)
    crop = im.crop(box)
    # pad to square
    w, h = crop.size
    m = max(w, h)
    sq = Image.new('RGB', (m, m), tuple(bg))
    sq.paste(crop, ((m-w)//2, (m-h)//2))
    return sq.resize((size, size))

a, b, out = sys.argv[1], sys.argv[2], sys.argv[3]
A, B = tight(a), tight(b)
sheet = Image.new('RGB', (1034, 512), (255, 255, 255))
sheet.paste(A, (0, 0)); sheet.paste(B, (522, 0))
sheet.save(out)
print(f'sheet: {out}')
