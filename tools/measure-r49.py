#!/usr/bin/env python3
"""R49 DOM measurement — the home canvas color, verbatim from computed styles."""
import json
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    page = ctx.new_page()
    page.goto("http://localhost:8090", wait_until="domcontentloaded")
    page.wait_for_timeout(3000)
    try:
        sk = page.get_by_text("Skip", exact=True).first
        if sk.is_visible(timeout=1500):
            sk.click(); page.wait_for_timeout(800)
    except Exception:
        pass
    m = page.evaluate("""() => {
      // the largest scroll container = the home screen ScrollView
      const els = [...document.querySelectorAll('div')];
      const scrollers = els.filter(e => {
        const s = getComputedStyle(e);
        return (s.overflowY === 'auto' || s.overflowY === 'scroll') && e.getBoundingClientRect().height > 500;
      });
      const home = scrollers.sort((a,b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
      const out = { homeScrollBg: home ? getComputedStyle(home).backgroundColor : null };
      // quick-chip ring
      const chip = [...document.querySelectorAll('div')].find(e => /^(fever)$/i.test(e.textContent?.trim()) && e.getAttribute('role') === 'button');
      if (chip) { const s = getComputedStyle(chip);
        out.chip = { bg: s.backgroundColor, borderWidth: s.borderWidth, borderColor: s.borderColor, height: Math.round(chip.getBoundingClientRect().height) }; }
      // billboard band (ink)
      const ink = els.filter(e => getComputedStyle(e).backgroundColor === 'rgb(10, 10, 10)' && e.getBoundingClientRect().width > 300);
      out.inkBands = ink.length;
      // city chip (white + ring, hero)
      const city = [...document.querySelectorAll('div[role=button]')].find(e => e.textContent?.includes('Select city') || e.textContent?.includes(', Gandhinagar'));
      if (city) { const s = getComputedStyle(city); out.cityChip = { bg: s.backgroundColor, bw: s.borderWidth }; }
      return out;
    }""")
    print(json.dumps(m, indent=2))
    ctx.close(); browser.close()
