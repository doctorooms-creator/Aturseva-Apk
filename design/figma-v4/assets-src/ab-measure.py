#!/usr/bin/env python3
"""
V4 A/B zone measurement — app render (852x1846, s=2) vs the Figma
reference render (852x1846). Measures element ink boxes in both images
and reports SIZE and RELATIVE geometry deltas per zone, immune to the
status-bar/safe-area offset (computed from the location pin) and to
font-class rendering (bbox hugging, not pixel diffing).
"""
from PIL import Image

APP = Image.open('/tmp/v4-home-2x.png').convert('RGB')
REF = Image.open('/home/z/Aturseva-Apk/design/figma-v4/figma-home-v4-reference.png').convert('RGB')

def ink_bbox(img, region, mode='dark', thresh=150):
    im = img.crop(region)
    px = im.load()
    w, h = im.size
    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            lum = (r + g + b) // 3
            if (lum < thresh) if mode == 'dark' else (lum > thresh):
                xs.append(x); ys.append(y)
    if not xs:
        return None
    return (region[0] + min(xs), region[1] + min(ys),
            region[0] + max(xs) + 1, region[1] + max(ys) + 1)

def measure(label, app_region, ref_region, mode='dark', offset=None):
    if offset is not None:
        app_region = (app_region[0], app_region[1] + offset, app_region[2], app_region[3] + offset)
    a = ink_bbox(APP, app_region, mode)
    r = ink_bbox(REF, ref_region, mode)
    if a is None or r is None:
        print(f"{label:24s} APP={'MISSING' if a is None else a} REF={'MISSING' if r is None else r}")
        return
    aw, ah = a[2]-a[0], a[3]-a[1]
    rw, rh = r[2]-r[0], r[3]-r[1]
    print(f"{label:24s} app {aw:4d}x{ah:4d} @({a[0]:4d},{a[1]:4d})  ref {rw:4d}x{rh:4d} @({r[0]:4d},{r[1]:4d})  Δsize ({aw-rw:+4d},{ah-rh:+4d})  Δpos ({a[0]-r[0]:+4d},{a[1]-r[1]:+4d})")

# ————— vertical offset: the pin ink anchors both headers —————
# ref pin: generous region around known design (24..80, 62..76)*2
ref_pin = ink_bbox(REF, (30, 100, 100, 170), 'dark')
app_pin = ink_bbox(APP, (30, 0, 100, 170), 'dark')
off = None
if ref_pin and app_pin:
    off = app_pin[1] - ref_pin[1]
    print(f"pin anchor: app y={app_pin[1]}  ref y={ref_pin[1]}  -> content offset {off:+d}px ({off/2:+.0f} dp)\n")

# ————— zone probes (ref regions in 2x design coords; app = same minus offset) —————
measure('wordmark ink',      (300, 90, 560, 180),   (300, 90, 560, 180),   'dark', off)
measure('bell ink',          (740, 100, 810, 170),  (740, 100, 810, 170),  'dark', off)
measure('hero headline',     (20, 200, 240, 300),   (20, 200, 240, 300),   'dark', off)
measure('hero sub',          (20, 340, 260, 420),   (20, 340, 260, 420),   'dark', off)
measure('hero art',          (400, 140, 852, 470),  (400, 140, 852, 470),  'nonwhite', off)
measure('search icon',       (50, 440, 120, 510),   (50, 440, 120, 510),   'dark', off)
measure('mic icon',          (730, 440, 800, 510),  (730, 440, 800, 510),  'dark', off)
measure('search field*',     (20, 420, 840, 520),   (20, 420, 840, 520),   'dark', off)   # placeholder ink as proxy
measure('tile1 art',         (30, 530, 220, 660),   (30, 530, 220, 660),   'nonwhite', off)
measure('tile1 title',       (30, 640, 220, 700),   (30, 640, 220, 700),   'dark', off)
measure('banner headline',   (30, 780, 500, 880),   (30, 780, 500, 880),   'light', off)
measure('bolt icon',         (60, 870, 130, 940),   (60, 870, 130, 940),   'light', off)
measure('token art*',        (500, 760, 852, 950),  (500, 760, 852, 950),  'light', off)  # on dark banner
measure('spec title row',    (20, 1270, 700, 1310), (20, 1270, 700, 1310), 'dark', off)
measure('spec card row*',    (20, 1320, 852, 1450), (20, 1320, 852, 1450), 'dark', off)  # label ink as proxy
measure('lab card mint',     (30, 1450, 850, 1680), (30, 1450, 850, 1680), 'nonwhite', off)
measure('nav bar ink',       (0, 1690, 852, 1810),  (0, 1690, 852, 1810),  'dark', off)
measure('nav active pill',   (10, 1690, 220, 1800), (10, 1690, 220, 1800), 'midgray', off)

def ink_bbox(img, region, mode='dark', thresh=150):  # placeholder for modes below
    raise SystemExit

# Additional mode: nonwhite (ink = anything not near-white page) and midgray (#F3F3F3 pill)
def ink2(img, region, kind, thresh=150):
    im = img.crop(region)
    px = im.load()
    w, h = im.size
    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if kind == 'nonwhite':
                hit = not (r > 240 and g > 240 and b > 240)
            elif kind == 'light':
                hit = (r + g + b) // 3 > thresh
            elif kind == 'midgray':
                # the #F3F3F3 pill vs white bar: 243±10 while bar is 255
                hit = 232 <= (r + g + b) // 3 <= 250
            else:
                hit = (r + g + b) // 3 < thresh
            if hit:
                xs.append(x); ys.append(y)
    if not xs:
        return None
    return (region[0] + min(xs), region[1] + min(ys), region[0] + max(xs) + 1, region[1] + max(ys) + 1)

# rerun the nonstandard modes
def measure2(label, app_region, ref_region, kind, off):
    app_region = (app_region[0], app_region[1] + off, app_region[2], app_region[3] + off)
    a = ink2(APP, app_region, kind)
    r = ink2(REF, ref_region, kind)
    if a is None or r is None:
        print(f"{label:24s} APP={'MISSING' if a is None else a} REF={'MISSING' if r is None else r}")
        return
    aw, ah = a[2]-a[0], a[3]-a[1]
    rw, rh = r[2]-r[0], r[3]-r[1]
    print(f"{label:24s} app {aw:4d}x{ah:4d} @({a[0]:4d},{a[1]:4d})  ref {rw:4d}x{rh:4d} @({r[0]:4d},{r[1]:4d})  Δsize ({aw-rw:+4d},{ah-rh:+4d})  Δpos ({a[0]-r[0]:+4d},{a[1]-r[1]:+4d})")

print()
measure2('hero art (nonwhite)', (400, 140, 852, 470), (400, 140, 852, 470), 'nonwhite', off)
measure2('tile1 art (nonwhite)', (30, 530, 220, 660), (30, 530, 220, 660), 'nonwhite', off)
measure2('token art (light)',    (500, 760, 852, 950), (500, 760, 852, 950), 'light', off)
measure2('lab card (nonwhite)',  (30, 1450, 850, 1680), (30, 1450, 850, 1680), 'nonwhite', off)
measure2('nav pill (midgray)',   (10, 1690, 220, 1800), (10, 1690, 220, 1800), 'midgray', off)
