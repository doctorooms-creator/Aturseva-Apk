#!/usr/bin/env python3
"""Shield-aligned fair comparison: detect blue shield in both, align bboxes, same canvas."""
from PIL import Image
import sys

def shield_bbox(im):
    px = im.convert('RGBA').convert('RGB').load()
    W, H = im.size
    xs, ys = [], []
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            r, g, b = px[x, y]
            if b > r + 40 and b > 150:  # vivid blue family only (excludes gray-lavender shadow)
                xs.append(x); ys.append(y)
    return (min(xs), min(ys), max(xs)+1, max(ys)+1)

def aligned(img_path, size=512):
    im = Image.open(img_path).convert('RGBA').convert('RGB')
    box = shield_bbox(im)
    crop = im.crop(box)
    w, h = crop.size
    m = max(w, h)
    bg = (255, 255, 255)
    sq = Image.new('RGB', (m, m), bg)
    sq.paste(crop, ((m-w)//2, (m-h)//2))
    return sq.resize((size, size))

a, b, out = sys.argv[1], sys.argv[2], sys.argv[3]
A, B = aligned(a), aligned(b)
sheet = Image.new('RGB', (1034, 512), (255, 255, 255))
sheet.paste(A, (0, 0)); sheet.paste(B, (522, 0))
sheet.save(out)
print(f'shield-aligned sheet: {out}')
