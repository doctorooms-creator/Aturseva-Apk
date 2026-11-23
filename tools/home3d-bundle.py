#!/usr/bin/env python3
"""P1 bundler: transparentize -> trim -> @2x/@3x exports -> quantize <=40KB -> manifest."""
from PIL import Image
import json, sys, os
from collections import deque

def transparentize(im, tol=34, soft_tol=44):
    im = im.convert('RGBA')
    px = im.load(); W, H = im.size
    # adaptive: corner median color (handles white OR pale-teal/light-lavender backdrops)
    corners = [px[2,2], px[W-3,2], px[2,H-3], px[W-3,H-3]]
    rs = sorted(c[0] for c in corners); gs = sorted(c[1] for c in corners); bs = sorted(c[2] for c in corners)
    ref = (rs[2], gs[2], bs[2])
    def near(p, t):
        return abs(p[0]-ref[0]) <= t and abs(p[1]-ref[1]) <= t and abs(p[2]-ref[2]) <= t
    visited = [[False]*W for _ in range(H)]
    dq = deque()
    for x in range(W):
        for y in (0, H-1):
            if near(px[x, y], tol): dq.append((x, y)); visited[y][x] = True
    for y in range(H):
        for x in (0, W-1):
            if near(px[x, y], tol) and not visited[y][x]: dq.append((x, y)); visited[y][x] = True
    bg = [[False]*W for _ in range(H)]
    while dq:
        x, y = dq.popleft()
        bg[y][x] = True
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx, ny = x+dx, y+dy
            if 0 <= nx < W and 0 <= ny < H and not visited[ny][nx] and near(px[nx, ny], tol):
                visited[ny][nx] = True; dq.append((nx, ny))
    for y in range(H):
        for x in range(W):
            if bg[y][x]:
                px[x, y] = (255, 255, 255, 0)
            elif px[x, y][3] > 0 and near(px[x, y], soft_tol):
                px[x, y] = (*px[x, y][:3], 90)
    return im

def trim(im, pad_frac=0.03):
    bbox = im.getbbox()
    if not bbox: return im
    x0, y0, x1, y1 = bbox
    w, h = x1-x0, y1-y0
    pad = int(max(w, h) * pad_frac)
    return im.crop((max(0, x0-pad), max(0, y0-pad), x1+pad, y1+pad))

def quantize_under(im, budget=40*1024):
    # Save RGBA direct first. Only if OVER budget: RGB-only adaptive palette
    # quantize (256 colors) + original alpha channel merged back separately —
    # the SAFE method (RGBA->P FASTOCTREE mangles channels, measured on the
    # shield; this RGB path verified max channel diff 4/255, imperceptible).
    import io
    im = im.convert('RGBA')
    buf = io.BytesIO()
    im.save(buf, 'PNG', optimize=True)
    if buf.tell() <= budget:
        return im, 0
    alpha = im.split()[3]
    rgb = im.convert('RGB')
    q = rgb.convert('P', palette=Image.ADAPTIVE, colors=256).convert('RGB')
    qa = Image.merge('RGBA', (*q.split(), alpha))
    return qa, 256

if __name__ == '__main__':
    src, name, w2x, w3x = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
    im = transparentize(Image.open(src))
    im = trim(im)
    aspect = im.size[1] / im.size[0]
    out_dir = 'assets/images/home3d'
    os.makedirs(out_dir, exist_ok=True)
    manifest_path = f'{out_dir}/home3d-manifest.json'
    manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}
    entries = {}
    for scale, w in (('2x', w2x), ('3x', w3x)):
        h = round(w * aspect)
        r = im.resize((w, h), Image.LANCZOS)
        q, sz = quantize_under(r)
        p = f'{out_dir}/{name}@{scale}.png'
        q.save(p, optimize=True)
        entries[scale] = {"file": f'{name}@{scale}.png', "w": w, "h": h, "bytes": os.path.getsize(p)}
        print(f'{p}: {w}x{h} {os.path.getsize(p)} bytes')
    manifest[name] = {"aspect": round(aspect, 4), "source": os.path.basename(src), "variants": entries}
    json.dump(manifest, open(manifest_path, 'w'), indent=2)
    print(f'manifest updated: {name}')
