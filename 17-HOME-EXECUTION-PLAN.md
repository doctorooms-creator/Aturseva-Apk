# 17 — DECISION RECORD + HOME EXECUTION PLAN (implementation bible, H1–H4)

Owner delegation (2026-11-22, trace 1a2027c5c7d499bd): *"Go ahead act as
system Architect and take a decision by your self make a detailed plan."*
All D1–D5 (doc 16) + one new D6 are decided below by the architect, with
rationale + reversal triggers. This doc is the execution bible for the HOME
build; doc 16 = principles + ladder; doc 15 = other screens later.

---

## PART 1 — DECISIONS TAKEN (no further owner asks on these)

| ID | Decision | Ruling | Rationale | Reversal trigger |
|---|---|---|---|---|
| D1 | GO ladder | **H1 → H2 → H3 → H4, as-is** | Foundation (tokens+photos) is cheapest-widest; shell second; content third; matrix last = full regression gate. Each batch OTA-shippable. | H4 VLM fails → targeted H3.x fix batch before moving on |
| D2 | Third tile | **NO — two tiles only** (doctor + labs-at-home) | Practo's own home = two tiles; 360px width floor; hospitals already own a rail (Z6) — door count stays 3 (glanceability law B4) | Post-H4 VLM says home lacks entry points |
| D3 | Labs strip data | **(a) static top-3, REAL numbers, dated 2026-11-22, extracted from live aturseva.com/labs today** | Zero web-repo changes (web repo read-only until explicit web GO — architect law); zero new API surface; website's own "from ₹X = network minimum" law mirrored | Owner grants web GO → add read-only `/api/public/lab-catalog`, flip strip to live |
| D4 | New APK vc3 | **YES — ONE EAS build bundling official icon + splash + `expo-blur` (glass v2)** — timed AFTER H3 lands and owner smoke-verifies | Three native upgrades, one build, one reinstall; new APK's first open pulls the already-polished home via OTA baseline | Owner declines reinstall → icon/real-blur stay deferred, glass v1 permanent |
| D5 | Hide-on-scroll nav | **DEFER — floating pill ships static v1** | Reanimated scroll-listener cost across every screen + jank risk on low-end Android; owner's device-compatibility priority beats the flourish | H4 perf numbers comfortable on 360px |
| D6 (new) | Tile imagery | **Iconographic cream tiles v1 — NO photography on tiles** | We have zero real tile photos; fabricating "doctor photos" for tiles breaks the honesty law; curated faces are for doctor identities only (website law) | Owner supplies real art assets → photo tiles |

### D3's curated strip (real, measured today — 2026-11-22)

From live `aturseva.com/labs` (10 named partner labs, all Gujarat; extracted
from the page's own catalog data):

| Test | From ₹ (network min) | TAT | Bookable | Labs offering |
|---|---|---|---|---|
| CBC (Complete Blood Count) | ₹170 | Same day | self | 9 of 10 |
| Blood Sugar (Fasting) | ₹60 | Same day | self | 5+ |
| Urine Routine Examination | ₹100 | Same day | self | 5 |

Strip copy law: "from ₹X" + "on aturseva.com" chip → Linking handoff
(B14 pattern, 44px). Data date shown in the strip's quiet caption
("rates as on 22 Nov"). **Fabrication-free.**

---

## PART 2 — H1 · FOUNDATION-FOR-HOME (1 round, OTA)

**Goal**: token system + photo pipeline + CTA law land; every later batch
consumes them. No layout changes yet.

### Work items (file-level)

1. **`src/lib/tokens.ts`** — new/changed tokens (light | dark):

   | token | light | dark | role |
   |---|---|---|---|
   | `canvasSoft` | `#F4F2EC` (was #F4F4F2) | `#1A1A19` | warm cream bands (website cream, ×50 live) |
   | `aqua` | `#14B8A6` | `#2DD4BF` | fills · washes · selection · live accents — NEVER small text |
   | `aquaSoft` | `#F0FDFA` | `#0F3D38` | selected-chip wash, lettermark circles |
   | `tealText` | `#0F766E` | `#5EEAD4` | AA text accents (5.47:1 light) |
   | `tealLive` | `#0D9488` (was #0F766E) | `#2DD4BF` | live pulse/graphics only (3.74:1) |
   | `tealLiveSoft` | merges into `aquaSoft` | — | simplification |
   | `glassFill` | `rgba(255,255,255,0.82)` | `rgba(20,20,20,0.85)` | G1/G2 v1 simulated glass |
   | `glassEdge` | `rgba(255,255,255,0.20)` | `rgba(255,255,255,0.12)` | 1px glass border |
   | `glassShine` | `rgba(255,255,255,0.25)` | `rgba(255,255,255,0.08)` | inset top hairline |
   | `navShadow` | `0 8px 24px rgba(21,21,21,0.12)` | `0 8px 24px rgba(0,0,0,0.4)` | floating pill elevation |
   | success/warn/error/ink/body/mute/hairline | unchanged | unchanged | B14 AA ledger preserved |

   Doc-03 header comment updated to the new law (aqua = fills/washes/live;
   tealText = text accents; ink CTA).

2. **`src/lib/theme.tsx`** — both palettes extended with the new keys.

3. **`src/lib/website/doctor-photo.ts` (NEW)** — port of web-repo
   `src/lib/website/doctor-photo.ts` verbatim logic: deterministic id-hash →
   11 curated faces, gender-aware assignment, **real-photo-wins**
   (`profileImg !== 'default.png' && profileImg !== ''` → real URL), returns
   face URL against `${API_BASE}/website/photos/faces/face-*.jpg`
   (verified 200 image/jpeg today). No bundled binary — remote URLs keep the
   OTA payload small.

4. **`src/components/avatar.tsx`** — `source?: string` prop: RN `Image`
   (48×48 r12 cards / 96 hero) when present; initials fallback unchanged;
   `accessibilityLabel` carries "Representative photo" when curated.

5. **`src/components/press.tsx`** — primary CTA press grammar: `scale 0.98`
   + shadow `0 4px 18px rgba(21,21,21,0.16)` (website `.w-bookbtn:active`).

6. **`src/components/doctor-card.tsx` + rail cards** — accept + render
   `photoUrl` via the pipeline (home surfaces only this batch).

### States
Loading/empty/error/dark unchanged in behavior — only palette values shift.

### Gates (per-batch standard, every batch below reuses this list)
`tsc` 0 errors · eslint full-repo 0/0 · `:8090` E2E golden path (guest
3-tap booking) PASS · VLM first-take on home + one profile screen ·
`eas update` (runtime 0.3.0, preview) + dist re-export + `:8090` re-verify ·
dual-repo push · worklog.

### Rollback
`eas update` rollback = republish prior group id (ledger kept in worklog).

---

## PART 3 — H2 · HOME SHELL — floating glass pill nav (1 round, OTA)

**Goal**: the brand signature shell (Practo pattern 3, our glass grammar).

1. **`src/components/nav-pill.tsx` (NEW)** — custom tabBar for
   `src/app/(tabs)/_layout.tsx`:
   - Geometry: height 64 · radius 999 · horizontal margin 16 · bottom =
     safe-area inset + 12 · floats over content.
   - Glass v1 (no native blur): fill `glassFill` + 1px `glassEdge` border +
     inset top `glassShine` hairline + `navShadow`.
   - Tabs: Home · Bookings · Profile, **labels always** (doc 03 law),
     44px+ targets; active = ink filled-circle behind white icon + ink
     label; inactive = mute icon + mute label.
2. **Tab screens** — bottom content padding +80 (clear the floating bar);
   existing bordered `tabBarStyle` removed.
3. Stack screens (doctor/hospital/booking/etc.) — unchanged headers; only
   the 3 tab hosts get the pill.

**Gates** + **Rollback**: standard (PART 2).

---

## PART 4 — H3 · HOME CONTENT — zones Z1–Z8 (1 round, OTA)

`src/app/(tabs)/index.tsx` restructured top→bottom (+ 3 small components):

| Zone | Component (new unless noted) | Data source | States |
|---|---|---|---|
| Z1 hero | `home-hero.tsx` — cream band; greeting (real name if logged in via existing auth, else "Namaste"); **city chip in header** (existing CityPickerSheet promoted from footer); search crown = existing SearchField with glass-shine chrome + aqua focus ring; symptom chips (selected = aquaSoft + tealText) | auth + city storage (existing) | unchanged suggest sheet; offline banner stays |
| Z2 billboard | `trust-billboard.tsx` — ink band, big tabular numbers + aqua pulse dots | existing stats contract (doctors · hospitals · bookings — real only) | skeleton band while loading; hide-on-error (existing degraded law) |
| Z3 tiles | `consultation-tiles.tsx` — 2 cream iconographic tiles (D6): "Talk to a doctor" → /search · "Lab tests at home" → Linking aturseva.com/labs + honest "on aturseva.com" caption | static | none needed |
| Z4 book-again | existing rail + photos (H1 pipeline), promoted above Doctors when present | existing bookings hook | hide-if-empty (already) |
| Z5 doctors | existing rail, photo cards (48×48 r12) + verified mark + spec/experience + ₹ + ink Book pill (H1 press grammar); G2 white-glass live chip with PulseDot | existing doctors hook | skeletons (existing) · empty doorway row (existing) |
| Z6 hospitals | existing rail; lettermark in aquaSoft circle or real image when logoUrl/image exists | existing hospitals hook | hide-if-empty (already) |
| Z7 labs strip | `labs-strip.tsx` — 3 static cards (D3 table: CBC ₹170 · Blood Sugar ₹60 · Urine ₹100, Same day, "on aturseva.com") + quiet "rates as on 22 Nov" caption + handoff chip | static (dated) | none (static, always honest) |
| Z8 footer | existing quiet footer (city row drops — promoted to header) | — | — |

**One-primary-per-surface law**: Z1 search crown owns home; ink Book pills
exist per doctor card (card-level primary — website's own d-card grammar).

**Gates** + **Rollback**: standard. VLM this round = full zone audit.

---

## PART 5 — H4 · DEVICE MATRIX + WORLD-CLASS AUDIT (1 round, OTA)

1. **Matrix**: browser E2E at **360 / 390 / 412 / 768** widths ×
   **font-scale 1.3×** × light+dark: no clipped lines, no horizontal scroll,
   Z1+Z2 in first viewport at 360, all targets ≥44px, footer + nav clear.
2. **Perf**: skeleton ≤300ms (law 5) · tap ack ≤100ms (law 15) · scroll
   60fps target on :8090 · glass v1 zero native cost confirmed.
3. **Golden-path regression**: guest 3-tap booking E2E PASS at every width.
4. **The world-class verdict**: re-run the R48 C-audit VLM prompts on the
   new home — "colorless / image-less / lifeless" must flip to PASS on the
   same criteria (brand color presence · photography · delight moment).
   Acceptance = doc 16 PART 5 list, all measured.

---

## PART 6 — D4 EXECUTION — new APK versionCode 3 (after H3 + owner smoke)

1. EAS build (android, production): official icon from
   `public/brand/aturseva/app-icon-light/dark.svg` (rasterized 1024 + adaptive
   layers) · splash from lockup · `expo-blur` added to native binary.
2. Install = manual one-time reinstall; first open pulls H1–H3 (or H4) OTA
   baseline — polished home immediately.
3. **Glass v2 flip (small OTA after install base updates)**: nav pill +
   live chips swap simulated fill → `BlurView` blur 12–14 / saturation
   ~1.4, exact web recipe. Android guard: blur ONLY on nav pill + ≤2 chips.
4. Install link + smoke checklist handed to owner (honest limit:
   real-device install/perf remains owner-verified).

---

## PART 7 — RISK REGISTER (top 5, all bounded)

| Risk | Bound |
|---|---|
| OTA payload growth | faces are remote URLs, zero bundled images; payload delta ≈ tokens+JS only |
| Cream recolor ripples into other screens (canvasSoft is app-wide) | INTENTIONAL — warm cream is the new canvas law; B14 AA ledger re-measured in H4 (all text pairs already pass on cream per R48 measurements) |
| Floating nav overlaps content on small screens | +80 bottom padding + H4 matrix gate |
| Static labs strip ages | dated caption + D3 reversal trigger (live API when web GO) |
| Glass v1 reads flat on white home | home has cream bands + photos behind the pill by design (glass needs backdrop variety — zones deliver it) |

## PART 8 — Explicitly NOT doing (decided)

No third tile (D2) · no tile photography (D6) · no hide-on-scroll (D5) ·
no web-repo changes (D3 ruling holds; landing redesign stays a separate
web GO) · no new API surface · no fabricated numbers/photos anywhere ·
other screens (S4/S5/records) untouched until home passes H4 and owner
re-GOes doc 15.
