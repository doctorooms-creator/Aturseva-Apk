#!/usr/bin/env python3
"""R49 monochrome E2E — golden path + device matrix shots (evidence/apk-r49).

Steps:
  1. Home at 390x844 (light) — full-page + first-viewport shots
  2. Home at 360 / 412 / 768 — matrix shots
  3. Golden path: fever chip -> listing -> doctor profile -> book sheet
     -> slot -> POST /api/public/book -> token screen
  4. DOM measurements: canvas color, chip ring, dark-mode token sanity
"""
import json, sys, time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8090"
OUT = "/home/z/Aturseva-Apk/evidence/apk-r49"
errors = []

def shot(page, name):
    page.screenshot(path=f"{OUT}/{name}.png", full_page=True)
    print(f"  shot {name}")

def wait_home(page):
    page.goto(BASE, wait_until="domcontentloaded")
    page.wait_for_timeout(3500)  # ON_LOAD + rails fetch

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()

        # ---- 1. Home 390 (primary) ----
        ctx = browser.new_context(viewport={"width": 390, "height": 844},
                                   device_scale_factor=2, locale="en-IN")
        page = ctx.new_page()
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        wait_home(page)
        shot(page, "m-390-home")

        # DOM measurements on home
        m = page.evaluate("""() => {
          const out = {};
          const els = document.querySelectorAll('*');
          let canvas = null, chip = null, pill = null;
          for (const el of els) {
            const s = getComputedStyle(el);
            const bg = s.backgroundColor;
            if (!canvas && el.scrollHeight > 800 && (bg === 'rgb(247, 248, 248)' || bg === 'rgb(244, 242, 236)')) canvas = bg;
          }
          const scroller = [...els].find(e => getComputedStyle(e).overflowX === 'scroll' && e.scrollHeight > 0);
          out.docScrollW = document.documentElement.scrollWidth;
          out.winW = window.innerWidth;
          // find a quick-chip (fever etc.)
          const spans = [...document.querySelectorAll('span,div')].filter(e => /^(fever|knee pain|skin|child)$/i.test(e.textContent?.trim()));
          if (spans.length) {
            const chipEl = spans[0].closest('[role=button]') || spans[0].parentElement;
            const s = getComputedStyle(chipEl);
            out.chip = { bg: s.backgroundColor, border: s.borderColor, bw: s.borderWidth, h: chipEl.getBoundingClientRect().height };
          }
          return out;
        }""")
        print("MEASURE-HOME:", json.dumps(m))

        # close onboarding if present
        # (fresh context = first run; previous golden flows used Skip)
        try:
            skip = page.get_by_text("Skip", exact=True).first
            if skip.is_visible(timeout=1500):
                skip.click(); page.wait_for_timeout(800)
                shot(page, "m-390-home-after-skip")
        except Exception:
            pass

        # ---- 2. Matrix widths ----
        for w, h, name in [(360, 800, "m-360"), (412, 915, "m-412"), (768, 1024, "m-768")]:
            ctx2 = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=2)
            page2 = ctx2.new_page()
            page2.goto(BASE, wait_until="domcontentloaded")
            page2.wait_for_timeout(3000)
            try:
                sk = page2.get_by_text("Skip", exact=True).first
                if sk.is_visible(timeout=1200):
                    sk.click(); page2.wait_for_timeout(600)
            except Exception:
                pass
            shot(page2, f"{name}-home")
            ctx2.close()

        # ---- 3. Golden path (390) ----
        page.goto(BASE, wait_until="domcontentloaded")
        page.wait_for_timeout(2500)
        try:
            sk = page.get_by_text("Skip", exact=True).first
            if sk.is_visible(timeout=1200):
                sk.click(); page.wait_for_timeout(600)
        except Exception:
            pass
        # fever chip -> listing
        try:
            fever = page.get_by_text("fever", exact=True).first
            fever.click(); page.wait_for_timeout(2500)
            shot(page, "g-390-listing")
        except Exception as e:
            errors.append(f"fever chip fail: {e}")

        # Rajesh card -> profile (VISIBLE only: the home tab stays mounted
        # under pushed routes — its own Rajesh rail card is display:none)
        try:
            card = page.locator('[role=button][aria-label*="Rajesh"]:visible').first
            card.click()
            page.wait_for_timeout(2500)
            shot(page, "g-390-profile")
        except Exception as e:
            errors.append(f"profile nav fail: {e}")

        # book sheet -> slot -> confirm (visible-only throughout)
        try:
            # profile's sticky CTA opens the S6 slot sheet first
            page.locator('[role=button]:visible').filter(has_text="Book appointment").first.click()
            page.wait_for_timeout(1000)
            page.locator('text=Tomorrow >> visible=true').first.click()
            page.wait_for_timeout(800)
            slots = page.locator('[role=button]:visible').filter(has_text=":")
            slots.first.click()
            page.wait_for_timeout(600)
            shot(page, "g-390-booksheet")
            confirm = page.locator('[role=button]:visible').filter(has_text="Confirm slot")
            confirm.first.click()
            page.wait_for_timeout(4000)
            shot(page, "g-390-token")
        except Exception as e:
            errors.append(f"booking fail: {e}")

        # ---- 4. Dark mode token sanity (emulate dark) ----
        ctx3 = browser.new_context(viewport={"width": 390, "height": 844},
                                   color_scheme="dark", device_scale_factor=2)
        page3 = ctx3.new_page()
        page3.goto(BASE, wait_until="domcontentloaded")
        page3.wait_for_timeout(3000)
        try:
            sk = page3.get_by_text("Skip", exact=True).first
            if sk.is_visible(timeout=1200):
                sk.click(); page3.wait_for_timeout(600)
        except Exception:
            pass
        shot(page3, "d-390-home")
        ctx3.close()
        ctx.close()
        browser.close()

    print("PAGE-ERRORS:", len(errors))
    for e in errors[:10]:
        print("  -", e)
    with open(f"{OUT}/e2e-summary.json", "w") as f:
        json.dump({"measure_home": m, "errors": errors}, f, indent=2)
    sys.exit(1 if errors else 0)

if __name__ == "__main__":
    main()
