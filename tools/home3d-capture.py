#!/usr/bin/env python3
"""P1 capture tool: screenshot the render host at given params."""
import argparse, sys
from playwright.sync_api import sync_playwright

p = argparse.ArgumentParser()
p.add_argument('--url', required=True)
p.add_argument('--out', required=True)
p.add_argument('--w', type=int, default=512)
p.add_argument('--h', type=int, default=512)
p.add_argument('--timeout', type=int, default=30000)
a = p.parse_args()

with sync_playwright() as pw:
    b = pw.chromium.launch(headless=True)
    ctx = b.new_context(viewport={'width': a.w, 'height': a.h}, device_scale_factor=1)
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(a.url, wait_until='domcontentloaded', timeout=a.timeout)
    page.wait_for_function('() => window.__IMG2THREEJS_READY__ === true', timeout=a.timeout)
    page.wait_for_timeout(250)
    canvas = page.query_selector('canvas')
    if 'transparent=1' in a.url:
        data = page.evaluate('() => document.querySelector(\'canvas\').toDataURL(\'image/png\')')
        import base64
        with open(a.out, 'wb') as f:
            f.write(base64.b64decode(data.split(',', 1)[1]))
    else:
        canvas.screenshot(path=a.out)
    if errors:
        print('PAGE ERRORS:', errors, file=sys.stderr)
    b.close()
print(f'captured {a.out}')
