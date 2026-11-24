# 22 · FIGMA V4 HOME — BUILD RECORD

**Status**: SHIPPED. The V4 home (doc 21) rebuilt zone-for-zone on the 426-frame
scale system, verified against the authoritative reference render
(`design/figma-v4/figma-home-v4-reference.png`, 852×1846 = 2× of 426×923).

## What shipped

| Piece | File(s) |
|---|---|
| Scale system + palette + type ramp | `src/components/home4/v4.ts` |
| Asset map (FigArt/FigIcon, density-picked @2x/@3x) | `src/components/home4/figma.tsx` |
| Zone 1 header (location · script wordmark · bell) | `home4-header.tsx` |
| Zone 2 hero · 3 search · 4 services · 5 token banner | `home4-hero/search/services/token.tsx` |
| Zone 6 appointment (live data only) | `home4-appointment.tsx` |
| Zone 7 specialties · 8 lab promo | `home4-specialties.tsx` · `home4-lab.tsx` |
| Zone 9 nav pill (V4 restyle) | `src/components/nav-pill.tsx` |
| Screen wiring + booking zone resolution | `src/app/(tabs)/index.tsx` |
| Dancing Script Bold (the ONLY script face) | `src/app/_layout.tsx` + package.json |

## Asset provenance law (the mockup is an EARLIER iteration)

- **Artworks** (hero, 4 service tiles, token stack, whole lab card) are
  image-fill nodes — they decode 1:1 from the mockup's image bank, so the
  mockup crops ARE the assets (`assets/images/figma/*.png`, @2x exact +
  @3x 1.5× LANCZOS). Lab card + token stack re-cropped from the reference
  render (final compositing + baked text).
- **Vector icons** differ between the mockup and the final design — the
  mockup's header has a letter-A glyph where the final has the true pin.
  ALL icons are glyph-detected crops of the REFERENCE render
  (`assets-src/extract-ref.py`): scan a generous region → true ink bounds →
  value-key against the known surface (page #FDFDFD / banner #252525) →
  0.6px alpha soften. `ICON_SIZE` in `figma.tsx` = the measured INK box.
- **Bell red dot** is stripped from the bell crop and rendered natively
  (live unread state, never baked art).

## Measured geometry (final A/B, `ab-v5-final.png`)

Reference ink positions (design px) vs live build at 426×923 DPR1:

| Feature | Reference | Build | Δ |
|---|---|---|---|
| pin ink | y 58.5 | y 59.0 | +0.5 |
| city 2-line | y 58–80.5 | y 61–82 | +3.0 (Geist metrics) |
| wordmark ink (x159 w109) | y 56.5–79.5 | y 58–79 | +1.5 |
| bell ink | y 58–77.5 | y 58–77 | ±0 |
| hero headline | y 114.5–167.5 | y 116–166 | +1.5 |
| search icon / mic | y 229.5–244 | y 230–244 | +0.5 |
| token banner fill | x17 y388–470 | x17 y388–469 | ±0 |
| service tiles | x16.5/108.5/116/208.5/217.5/309.5/318/411 | matches within ~1px | ✓ |
| nav pill | y845–903, pod x28.5–98 y850–895 | y845–903, x28–99 | ±0 |
| search bar | x17 w392 h38 r22, y218–256 | identical | ✓ |

Fixes applied during verification (measured on the reference, not guessed):

1. **Top pad floor 42·s** — the design's zone 0 is a 42px status area; web
   (insets 0) rendered content 36px high. `paddingTop = max(insets.top+6, 42·s)`.
2. **City 2-line anatomy** — the design shows "Gandhinagar,\nGujarat"; stored
   single-word cities resolve their state via `CITY_STATE` (all 20 of
   `TOP_CITIES`), comma-forms normalize to the hard break.
3. **Location block top** 20 → **16.5** into the zone (pin ink y58.5 measured);
   chevron marginTop 3.6 → **8.25** (baseline-rides line 1, measured y67).
4. **Nav pill float gap** 12 → **20·s** (pill bottom y903 = 20 above frame);
   `NAV_PILL_FOOTPRINT` = 94 (conservative dp ceiling, B9 law safe).
5. Bell dot micro-nudge (right −5.5, top −1.5) to the measured dot center.

## Verification record

- `bunx tsc --noEmit` clean · `bunx expo lint` clean (src).
- E2E (agent-browser, 426×923 + 390×844): city sheet → pick → 2-line header
  + storage round-trip; search doorway → /search; bell → /notifications;
  all 4 tabs navigate + return; Cardiology card → /search?q=Cardiology;
  zero page errors (only the known web useNativeDriver warnings).
- 390-width scale check: banner x16–373 (expected 16–374), pill gap scales.
- VLM A/B (`upload/figma-v4/vlm-ab-v5.json`): 6 MATCH · 3 CLOSE ·
  1 OFF-expected. VLM's "placeholder truncates" and "tile sub touches
  edges" flags were pixel-disproved (the "…" is the design's own copy;
  tile sub w80 vs ref w78.5).
- **Honesty laws held**: appointment zone hides for guests/no-booking/error
  (real booking data only — never a fake Dr. Adam Max); avatar is
  initials-on-soft; progress fill computed from live token figures.

## Deliberate deviations (all measured, all documented)

- Geist replaces Roboto (doc 21 ruling) — ≤3px metric drift on some text.
- Guest home compresses ~150px where the reference shows the appointment
  card (zone 6 honesty law, doc 21).
- Web pins art/icons to @2x (`figma.tsx`); native picks @3x at ≥2.5 dpr.
