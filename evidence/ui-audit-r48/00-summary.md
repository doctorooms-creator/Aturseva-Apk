# UI-AUDIT-R48 — Owner-requested redesign audit (ANALYSIS ONLY, zero product code)

Owner message (2026-11-22): tested APK — no doctor/hospital profile pictures; UI "maza nahi aa raha" (app + website landing); wrong logo used; app secondary color must match the WEBSITE's blue-like secondary (not the app's teal); Practo reference screenshots uploaded (41, Google Drive 1-AiFzsL8QMP2FnOppllOoZh9srArfMfd) + Aturseva reference folder (8 screenshots, Drive 1YIsD6QYVOqmaeKibT_HF8CbnokU2Vfvn); device compatibility across phones required; asked about Google Stitch for screens. Explicit: DO NOT START DEVELOPMENT — act as system architect, audit, propose direction.

## Method
- Downloaded + analyzed all 49 owner screenshots (PIL-downscaled to 780w, ~6MB).
- 10 VLM calls (glm-4.6v via z-ai-web-dev-sdk, scripts/ui-audit-r48-vlm.mjs in web repo): A (8 Aturseva refs), D (logo compare), P1–P7 (41 Practo refs), C (5 current-app evidence screens + app icon).
- Live-site color forensics: aturseva.com homepage + 4 compiled CSS files.
- API truth probes (prod): /api/doctors, /api/hospitals photo fields.
- Code-side: app tokens (src/lib/tokens.ts), app assets, web-repo design system + brand kit + photo pipeline.
- Sandbox reset #11 recovered mid-round (Aturseva-Apk re-cloned at ed75dee; my-project bun install restored; zero lost commits).

## Findings (all measured)

### 1. No profile pictures — TWO stacked root causes
- DATA: prod DB has zero real photos — all 90 doctors `profileImg: "default.png"`, hospitals `image:""` + `logoUrl:""` (measured via live API).
- APP CODE: app Avatar renders initials ONLY (B1 stub: "photos arrive with profile polish in B2" — never shipped; Avatar doesn't even accept a photo URL).
- WEBSITE SOLVED THIS (owner directive 2026-11-16): `src/lib/website/doctor-photo.ts` — curated Indian doctor portraits (11 VLM-QA'd faces in public/website/photos/faces/), deterministic id-hash + gender-aware assignment, real-photo-wins-automatically, "Representative photo" honesty caption. The app needs this pipeline ported (RN Image, same face URLs — app hits the same domain).

### 2. Secondary color mismatch (the "teal vs blue-like" complaint) — exact root cause
- App accent: `tealLive #0F766E` (teal-700, deep GREEN-teal) light / #2DD4BF dark.
- Website accent family (measured in live CSS): teal-400 `#2dd4bf`, teal-500 `≈#00baa7/#14b8a6` (bright AQUA — reads blue-ish on phone), used 49× bg-teal-500, 40× text-teal-400, plus teal-600/700 for text; warm cream `#f4f2ec` surfaces (50×).
- Same "teal" name, different shades, different feel. Fix = adopt the website's exact RAMP (aqua for fills/washes/selection/live, teal-600/700 for AA text). Contrast measured: #00BAA7 2.45:1 on white (fills only), #0D9488 3.74 (large text), #0F766E 5.47 (AA text), white-on-#00BAA7 2.45 (NOT for CTA fills with white text).

### 3. Wrong logo — measured
- App icon = droplet-over-smile (own invention). VLM compare vs brand kit: matches NEITHER official concept ("two different design families").
- Website ships an official kit: `public/brand/aturseva/` — lockup.svg (nav), symbol-black/white, lockup-tagline, reverse-lockup, and **app-icon-light.svg / app-icon-dark.svg (512×512, made FOR app icons)**. History: 5 AI concepts QA'd (diya 7/10 best), final rebrand shipped the geometric black symbol lockup everywhere (nav/footer/favicon/PWA/OG).
- Fix: swap app icon/splash/adaptive + add in-app brand usage from the official kit (rasterize SVGs → PNG at build time).

### 4. Current app VLM critique (C1–C6: home/listing/profile/token/reports/icon)
"Colorless, image-less, lifeless — not a structure problem": brand color ~3 uses in whole app; letter-circles everywhere (no photography/illustration); flat hairline cards, no elevation; black slab CTAs (grim/fintech); dead whitespace bottom-thirds; joyless success moment; no verified badges/trust layer; icon = clip-art, mushy at 48dp. Bones (IA/spacing/type scale/pill grammar) are decent.

### 5. Practo extract (41 screenshots → 10 transferable patterns)
1. Strict color architecture: two-zone (dark brand header/hero → white sheet); action color vs trust color vs savings-green each reserved.
2. Photography everywhere — square rounded doctor portraits, clinic-interior strips inside cards, photo category tiles. THE #1 trust lever.
3. Floating pill bottom nav with filled-circle active tab (most distinctive shell component).
4. Persistent dual CTA bar on profile (filled primary + outlined Call) at every scroll state.
5. Availability-first: "Next available 09:15am Tomorrow" on every card; slot counts in green.
6. Trust stacking per card: % rating + patient-stories count + verified badge + excellence rating + clinic photo strip.
7. Editorial section chunking: ~28-30px bold section heads + gray explainer + divider bands.
8. Booking = transaction mode: solid navy header, receipt-style bill (dashed dividers), named guarantee card ("Practo Promise" → "Aturseva Promise").
9. Onboarding: carousel above persistent login form; illustration set; localized scale stat ("1 Crore Indians").
10. Home: location-as-header-control, search+AI chip row, two photo consultation tiles, 4-up action cards, billboard trust stats ("5 Lakh+ DOCTORS / 30 Crore+ USERS").

## Proposed direction (GO-gated batch ladder — NOT started)
- APK-B16 REBRAND+COLOR: official brand kit into app (icon/splash/adaptive/in-app), website aqua ramp + warm cream canvas, CTA language. Token-layer change, touches every screen cheaply.
- APK-B17 PHOTOS: port website doctor-photo pipeline (curated faces + gender inference + real-photo-wins + Representative caption) + hospital imagery.
- APK-B18 HOME+DISCOVERY REDESIGN: floating pill nav, photo consultation tiles, two-zone color, availability-first cards, trust stats billboard.
- APK-B19 PROFILE+BOOKING REDESIGN: magazine hero header + collapsing header, persistent dual CTA, grouped slot grid, receipt bill + Aturseva Promise card, token/queue delight moment.
- APK-B20 DEVICE MATRIX: E2E at 360/390/412/768 widths, font-scale 1.3×, dark mode, full regression.
- (Optional web-repo GO, separate repo law): website landing page redesign.
- Stitch question answered: optional (owner visual control), not required — Practo refs + website language are the spec; Stitch mockups would still need RN re-implementation.
- OTA advantage: every batch auto-delivers to installed APKs on next open (checkAutomatically ON_LOAD).

## Honest limits
- Real-device behaviour (install/camera/push/battery across phone models) remains owner-side verified (my checklists); my loop = browser E2E at multi-widths + VLM.
- Curated faces are placeholders (honesty law preserved: "Representative photo" caption).
- QA-named prod records cleanup remains owner data-side (standing B12 ruling).
