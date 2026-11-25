#!/usr/bin/env python3
"""Crop the 3 side-by-side mobile mockups out of the 1080x2400 reference sheet.

Reality check vs. the naive plan: the sheet is NOT 3 full-height white columns.
It is a light-gray (#E9E9E9) canvas band (rows ~795-1605) sandwiched between
pure-black letterbox rows, containing THREE staggered phone-screen mockups
(~276x595 px each, vertically offset by ~44 px steps). The right mockup has an
off-white (#F0F0F0) background instead of pure white, and dark content cards
inside mockups split naive white-threshold bounding boxes. So:

  1. work only inside the gray canvas band,
  2. label connected components of "brighter than canvas" pixels (>236),
  3. keep the 3 large components (one per mockup),
  4. refine each edge by scanning row/column medians (bridging interior dark
     bands like status bars / dark cards),
  5. crop with a 1 px safety margin.

Outputs: find-care.png, find-doctor.png, doctors-profile.png
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "src", "0ec0df2b.png")
NAMES = ["find-care", "find-doctor", "doctors-profile"]  # left -> right
BAND = (780, 1620)      # rows that contain the gray canvas + mockups
BRIGHT = 236            # > canvas (233), < mockup bg (240/255)
EDGE = 234.5            # median crossing for edge refinement
MIN_W, MIN_H = 200, 400
MARGIN = 1
BRIDGE_V = 40            # max dark rows to bridge (status bars, dark cards)
BRIDGE_H = 6             # max dark cols to bridge -- mockups are 40px apart, must NOT bridge gaps


def row_med(a, y, x0, x1):
    return float(np.median(a[y, x0:x1].mean(axis=1)))


def col_med(a, x, y0, y1):
    return float(np.median(a[y0:y1, x].mean(axis=1)))


def refine(a, bbox, band_rows, band_cols):
    """Grow bbox to the true mockup edges using median scans that bridge
    short dark interior runs (status bars, dark cards)."""
    x0, x1, y0, y1 = bbox  # x1/y1 exclusive

    # --- vertical: core columns (15%..85%) ---
    cx0 = x0 + int((x1 - x0) * 0.15)
    cx1 = x0 + int((x1 - x0) * 0.85)
    top = y0
    dark = 0
    y = y0 - 1
    while y >= band_rows[0]:
        m = row_med(a, y, cx0, cx1)
        if m > EDGE:
            top, dark = y, 0
        else:
            dark += 1
            if dark > BRIDGE_V:
                break
        y -= 1
    bottom = y1 - 1
    dark = 0
    y = y1
    while y < band_rows[1]:
        m = row_med(a, y, cx0, cx1)
        if m > EDGE:
            bottom, dark = y, 0
        else:
            dark += 1
            if dark > BRIDGE_V:
                break
        y += 1

    # --- horizontal: core rows ---
    ry0 = top + int((bottom - top) * 0.15)
    ry1 = top + int((bottom - top) * 0.85)
    left = x0
    dark = 0
    x = x0 - 1
    while x >= band_cols[0]:
        m = col_med(a, x, ry0, ry1)
        if m > EDGE:
            left, dark = x, 0
        else:
            dark += 1
            if dark > BRIDGE_H:
                break
        x -= 1
    right = x1 - 1
    dark = 0
    x = x1
    while x < band_cols[1]:
        m = col_med(a, x, ry0, ry1)
        if m > EDGE:
            right, dark = x, 0
        else:
            dark += 1
            if dark > BRIDGE_H:
                break
        x += 1

    return left, top, right + 1, bottom + 1  # PIL box, exclusive


def main():
    img = Image.open(SRC).convert("RGB")
    W, H = img.size
    a = np.asarray(img).astype(np.float64)
    print(f"source: {SRC} {W}x{H}")

    band = a[BAND[0]:BAND[1]]
    bright = (band > BRIGHT).all(axis=2)
    lbl, n = ndimage.label(bright, structure=np.ones((3, 3)))
    boxes = []
    for sl in ndimage.find_objects(lbl):
        ys, xs = sl
        w, h = xs.stop - xs.start, ys.stop - ys.start
        area = int((lbl[sl] > 0).sum())
        if w >= MIN_W and h >= MIN_H and area >= MIN_W * MIN_H * 0.3:
            boxes.append((xs.start, BAND[0] + ys.start, xs.stop, BAND[0] + ys.stop, area))
    boxes.sort(key=lambda b: b[0])
    print(f"large bright components found: {len(boxes)}")
    assert len(boxes) == 3, f"expected 3 mockups, got {len(boxes)}"

    results = {}
    for (bx0, by0, bx1, by1, area), name in zip(boxes, NAMES):
        l, t, r, b = refine(a, (bx0, bx1, by0, by1), BAND, (0, W))
        l, t = max(0, l - MARGIN), max(0, t - MARGIN)
        r, b = min(W, r + MARGIN), min(H, b + MARGIN)
        crop = img.crop((l, t, r, b))
        out = os.path.join(BASE, f"{name}.png")
        crop.save(out, "PNG")
        results[name] = (crop.size, (l, t, r, b))

        cpx = np.asarray(crop)
        samples = [tuple(int(v) for v in cpx[2, int(crop.size[0] * f)]) for f in (0.05, 0.275, 0.5, 0.725, 0.95)]
        avg = tuple(sum(s[k] for s in samples) // 5 for k in range(3))
        print(f"[{name}] box=({l},{t},{r},{b}) size={crop.size[0]}x{crop.size[1]} "
              f"top-edge avg=#{avg[0]:02x}{avg[1]:02x}{avg[2]:02x} samples={samples}")

    print("DONE " + ", ".join(f"{n}={results[n][0]}" for n in NAMES))


if __name__ == "__main__":
    main()
