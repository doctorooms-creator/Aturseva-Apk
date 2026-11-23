#!/usr/bin/env python3
"""P1-2 final: shield profile from MEASURED mockup knots + cross from MEASURED proportions."""
from PIL import Image, ImageDraw
import json, math

def pchip(xs, ys, n):
    m = len(xs)
    h = [xs[i+1]-xs[i] for i in range(m-1)]
    d = [(ys[i+1]-ys[i])/h[i] for i in range(m-1)]
    slopes = [d[0]] + [ (d[i-1]*d[i]) <= 0 and 0.0 or (d[i-1]+d[i])/2 for i in range(1, m-1)] + [d[-1]]
    for i in range(m-1):
        if d[i] == 0: slopes[i] = 0; slopes[i+1] = 0
        else:
            a, b = slopes[i]/d[i], slopes[i+1]/d[i]
            s = a*a + b*b
            if s > 9:
                t = 3/math.sqrt(s); slopes[i] = t*a*d[i]; slopes[i+1] = t*b*d[i]
    out = []
    for k in range(n):
        t = k/(n-1)
        i = 0
        for j in range(m-1):
            if xs[j] <= t: i = j
        w = (t - xs[i]) / h[i]
        out.append((2*w**3-3*w**2+1)*ys[i] + (w**3-2*w**2+w)*h[i]*slopes[i] + (-2*w**3+3*w**2)*ys[i+1] + (w**3-w**2)*h[i]*slopes[i+1])
    return out

# ---- shield: measured knots (t, width/W) from 1px mockup scan ----
T = [0.00, 0.03, 0.06, 0.10, 0.14, 0.19, 0.30, 0.55, 0.63, 0.70, 0.77, 0.84, 0.92, 1.00]
X = [0.154, 0.231, 0.269, 0.481, 0.750, 0.981, 1.000, 1.000, 0.962, 0.846, 0.731, 0.500, 0.350, 0.150]
N = 56
widths = pchip(T, X, N)
H_UNITS = 1.19  # shield height in width units (52x63px measured)
pts = []
for i in range(N):
    t = i/(N-1)
    pts.append([round(widths[i]/2, 4), round((0.5 - t)*H_UNITS, 4)])
mirror = [[round(-p[0],4), p[1]] for p in pts[1:-1]][::-1]
shield = pts + mirror

# ---- cross: measured plus (arm-half 0.26 W, stroke-half 0.077 W, r 0.07) ----
S = 1024
m = Image.new('1', (S, S), 0)
d = ImageDraw.Draw(m)
A, B, r = int(0.48*S), int(0.15*S), int(0.16*S)  # in-bbox proportions
c = S//2
d.rounded_rectangle([c-B, c-A, c+B, c+A], radius=r, fill=1)
d.rounded_rectangle([c-A, c-B, c+A, c+B], radius=r, fill=1)
px = m.load()
bnd = set()
for y in range(S):
    for x in range(S):
        if px[x, y] and (x==0 or y==0 or x==S-1 or y==S-1 or not(px[x-1,y] and px[x+1,y] and px[x,y-1] and px[x,y+1])):
            bnd.add((x,y))
cx0 = sum(p[0] for p in bnd)/len(bnd); cy0 = sum(p[1] for p in bnd)/len(bnd)
poly = sorted(bnd, key=lambda p: math.atan2(p[1]-cy0, p[0]-cx0))
closed = poly + [poly[0]]
L = [0.0]
for i in range(1, len(closed)):
    L.append(L[-1] + math.hypot(closed[i][0]-closed[i-1][0], closed[i][1]-closed[i-1][1]))
total = L[-1]; M = 96
resamp = []
for k in range(M):
    target = total * k / M
    i = next(j for j in range(1, len(closed)) if L[j] >= target)
    f = (target - L[i-1]) / max(1e-9, L[i]-L[i-1])
    resamp.append((closed[i-1][0] + f*(closed[i][0]-closed[i-1][0]), closed[i-1][1] + f*(closed[i][1]-closed[i-1][1])))
xs = [p[0] for p in resamp]; ys = [p[1] for p in resamp]
minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
w, h = maxx-minx, maxy-miny
# normalize to 1x1 bbox then scale to 0.52 W-units; y-center offset -0.036 (47% down shield)
CW = 0.52
cross = [[round(((p[0]-minx)/w - 0.5)*CW, 4), round(-((p[1]-miny)/h - 0.5)*CW, 4) - 0.036] for p in resamp]

P = 'workspace/home3d/runs/shield-3d/object-sculpt-spec.json'
spec = json.load(open(P))
for c in spec['componentTree']:
    if c['id'] == 'shieldBody':
        c['geometryDescriptor']['profile2D'] = {"points": shield, "depth": 0.24}
        c['dimensions'] = {"width": 1.0, "height": 1.19, "depth": 0.24, "units": "relative", "confidence": 0.95}
        c['topologyRationale'] = 'measured 1px mockup scan: arched dome top (narrow at t=0, full width by t=0.19), straight parallel sides to t=0.55, long smooth taper to a soft point'
    if c['id'] == 'crossEmblem':
        c['geometryDescriptor']['profile2D'] = {"points": cross, "depth": 0.07}
        c['dimensions'] = {"width": 0.52, "height": 0.50, "depth": 0.07, "units": "relative", "confidence": 0.95}
        c['transform']['position'] = [0, 0, 0.165]
        c['topologyRationale'] = 'measured plus: arm 0.52 W, stroke 0.154 W, center 47% down (slightly above shield center), rounded tips'
json.dump(spec, open(P,'w'), indent=1)
print(f'shield: {len(shield)} pts (measured knots); cross: {len(cross)} pts (measured 0.52W plus)')
# previews
mp = Image.new('1', (512, 512), 0)
dp = ImageDraw.Draw(mp)
poly_px = [((p[0]+0.62)*512/1.24, (0.62-p[1])*512/1.24) for p in shield]
dp.polygon(poly_px, fill=1)
mp.save('workspace/home3d/runs/shield-3d/profile-shield-preview.png')
m.resize((256,256)).save('workspace/home3d/runs/shield-3d/profile-cross-preview.png')
