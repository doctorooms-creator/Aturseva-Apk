# 21 · FIGMA V4 — THE OWNER'S AUTHORITATIVE HOME SPEC

**Source**: Figma file `koY1wZRoJtIP72D0YpbEZm` ("Untitled", owner: Joshi Aditya, role: owner)
**Frame**: `AturSeva · Home` (node 3:2) · 426×923 · bg `#FDFDFD` · single-viewport design
**Fetched**: via Figma API (full node JSON @ depth 3 + 2x render 852×1846)
**Status**: ANALYSIS ONLY — zero app code touched. Awaiting owner GO.
**Supersedes**: doc 19's visual targets where they conflict (structure/zones now follow THIS doc).
**Artwork law**: owner sliced crops from the ORIGINAL mockup PNG (852×1846, imageRef a41a9493…) — our P1 home3d studio assets (7/7) are the clean equivalents; only NEW asset needed = microscope+plant for lab promo.

---

## THE DESIGN — 10 zones, single screen (426w × 923h)

| # | Zone (Figma name) | Y-range | H | Children |
|---|---|---|---|---|
| 0 | Status bar | 0–42 | 42 | (empty frame — safe area) |
| 1 | Header | 42–96 | 54 | location-left · wordmark-right · bell-right |
| 2 | Healthcare hero | 96–218 | 122 | headline+sub left · illustration right |
| 3 | Search | 218–263 | 45 | white pill + shadow · mic right |
| 4 | Services | 263–379 | 116 | 4 quick-action cards |
| 5 | Online token | 379–479 | 100 | dark banner + token stack + inline chips |
| 6 | Your appointment | 479–633 | 154 | header row + LIVE appointment card |
| 7 | Specialties | 633–725 | 92 | 6 small white cards w/ line icons |
| 8 | Lab tests | 725–840 | 115 | mint gradient promo + Book Tests pill |
| 9 | Bottom navigation | 840–904 | 64 | floating white pill, 4 tabs |

**Everything fits ONE viewport.** Previous 14-zone home's lower half (Find Doctors rail, Hospitals rail, lab price rail, Health Tools, trust banner) is NOT in this design.

---

## ZONE SPECS (exact, from Figma JSON)

### 1 · Header — NEW ANATOMY (location moves LEFT, script wordmark)
- Location LEFT (x≈24 from frame): pin icon (12×13, ink) + `"Gandhinagar,\nGujarat"` — **2 lines, Roboto 10.5 SemiBold**, ink — + chevron-down (7×7, stroke 2.5)
- Wordmark: **"Atur Seva" — Dancing Script Bold 29px** (SCRIPT/HANDWRITING FONT — new dependency `@expo-google-fonts/dancing-script`), positioned right-of-center (x≈159/426)
- Bell RIGHT (x1700): 20h outline icon + **red unread dot 6×6 r3** (fill rgb(255,25,50))
- NO gear, NO account circle, NO gray-filled circles (current build's defect)

### 2 · Hero — compact 2-line
- `"Healthcare,\nmade simpler."` **Roboto Bold 26**, 2 lines, ink, LEFT (x≈29)
- Sub `"Find doctors, book appointments\nand track your turn in real time."` Roboto 11.3 Regular `#4E4F52`, 2 lines
- Illustration RIGHT: 199×133 (hero-3d asset ≈47% frame width) — the doctor+hospital clay art
- Total hero height 122 (current build ≈2× — must shrink)

### 3 · Search — WHITE not gray
- 392×38 r22 **WHITE fill** + stroke `#EDEDED` 0.7 + **drop shadow** (0,6,9, rgba(0,0,0,0.075))
- Placeholder 12.6 `#606063` full text "Search doctors, hospitals, tests, symptoms..."
- Search icon left 16, mic icon right (ink strokes)

### 4 · Services — 4 white cards + shadows
- Card **92×98 r17 WHITE** + stroke `#F2F2F2` 0.5 + shadow (0,6,9,7.5%) — NOT gray fill
- Layout: margins ≈17/15, gaps 8–9 → 4-across
- Artwork 72×53 top (tile-doctor / tile-hospital / tile-labtubes / tile-video from P1 studio)
- Title 11.7 Bold ink CENTER, sub 9 Regular `#4E4F52` CENTER — one line each

### 5 · Online token banner — shorter, #252525, inline chips
- **392×82 r14 fill `#252525`** (not pure black), margins 17
- Headline `"Skip the wait.\nBook your token online."` 16.5 Bold white, 2 lines
- Chips **INLINE one row** at y444: ⚡"Real-time queue" + 📅"Confirmed slot" — 10 Medium white, icon+text, NO pill borders
- Token stack artwork RIGHT 145×81 (token-stack asset, right-radii 14 — flush to banner's right edge)

### 6 · Your appointment — THE CARD (build's #1 missing gap)
- Section row: `"Your appointment"` 17 Bold ink + `"View all"` 10.5 `#414141` + chevron
- Card **392×116 r16 WHITE** + shadow + stroke `#F3F3F3` 0.6, margins 17
- Row 1: avatar **46×44 r23** (real photo) · `"Dr. Adam Max"` 13.2 Bold · `"Psychologist • City Care Clinic"` 10 Regular gray
- **Live Queue badge**: 83×23 **r13 fill `#E7F7E7`** + dot `#068006` 6×6 + text `#067D06` 10 Medium (RIGHT of row 1)
- Row 2 stats (divided by 0.7px `#DDDDDD` verticals at x1460/x1578):
  - `#24` 17 Bold / `"Your Token"` 10 gray
  - `#18` 17 Bold / `"Now Serving"` 10 gray
  - `06` 17 Bold / `"Patients Ahead"` 10 gray
  - chevron button 23×23 r12 white+shadow (far right)
- Row 3 **progress bar**: track 331×6 r4 `#E8E8E8`, fill 226×6 r4 `#050505` (68%)
- Honesty law stays: real booking data only; guest state = this whole zone hides (or teaser), NO fake Dr. Adam Max in production

### 7 · Specialties — 6 SMALL cards, line icons, labels inside
- Title `"Explore by Specialty"` 15.5 Bold + View all 8.5
- Cards **60×55 r14 WHITE** + stroke `#F2F2F2` 0.6 + shadow, margins 21, gap ≈8
- Icons ~20–25px **INK line style** (stroke 0.9–0.95): heart-pulse · lungs · brain · stomach · woman · 2×2-dots grid
- Labels 8.4 Medium ink, centered, INSIDE card bottom: Cardiology · Pulmonology · Neurology · Gastro · Gynecology · More
- (Current build has the rail already — restyle to these small white cards)

### 8 · Lab tests — MINT GRADIENT promo
- **392×104 r15 linear gradient `#F8F9F8` → `#DCE5DC`** (horizontal→diagonal)
- Microscope+samples artwork RIGHT 219×103 (right-radii 15, flush right) — **NEW ASSET needed** (AI-gen or 3D: microscope + tube rack + small plant, clay style)
- `"Book Lab Tests\nfrom trusted labs"` 15.3 Bold ink
- `"Home collection available"` 10.2 Regular gray
- **CTA pill: 99×25 r15 fill `#1F2020`**, "Book Tests" 10.5 Medium white + arrow icon
- (Note: the real-price ₹170/₹60/₹100 rail moves OFF this design — keep honesty caption law where lab tests actually land)

### 9 · Bottom navigation — LIGHT selected pill (not ink square)
- Bar **402×58 r30 WHITE** + stroke `#EBEBEB` 0.6 + shadow, x-margin 12 (side insets 12+12)
- **Home selected: pill 71×47 r25 fill `#F3F3F3`** + FILLED ink home icon (not inverted black square)
- Home label 10 SemiBold ink; others 10 Regular `#414141`
- 4 tabs CONFIRMED: Home · Bookings · Health Records · Account
- Icons 18×18 line style ink

---

## TYPE SYSTEM (Figma)
- Wordmark: **Dancing Script Bold 29** (the ONLY script font — everything else Roboto)
- Body/UI: Roboto 8.4–17 (build's Geist ≈ Roboto-class; keep Geist, add Dancing Script only for wordmark)
- Ink `rgb(8,9,9)` ≈ `#080909` · gray-1 `#4E4F52` · gray-2 `#606063` · gray-3 `#414141` · borders `#EBEBEB–#F3F3F3`
- Accents (the ONLY color): Live-Queue green pair (`#E7F7E7` bg / `#068006` dot / `#067D06` text) · mint gradient `#F8F9F8→#DCE5DC` · red dot rgb(255,25,50) · banner `#252525` · CTA `#1F2020`

## SHADOW LAW (the big style shift)
Figma uses **white cards + soft drop shadow (0,6,9, 7.5% black) + hairline borders** on a white page — replacing the current gray-fill cards (`#F7F7F8`). This is THE global restyle.

---

## BUILD vs FIGMA — VLM-verified gap list (top 8, ranked)
1. **Appointment card MISSING** — avatar, Live Queue pill, #24/#18/06 stats, progress bar (zone 6 whole)
2. **Header wrong** — needs script wordmark right, location left w/ pin+chevron, red bell dot, gear/account circles REMOVED, safe-area fix
3. **Token banner wrong** — needs #252525 r14 82h, inline chips, Token-stack artwork visible, no nav overlap
4. **Bottom nav wrong** — needs light `#F3F3F3` selected pill w/ filled ink icon (current = black square inversion)
5. **Services cards wrong fill** — gray → white + shadow + border, compact height, one-line titles
6. **Specialty cards restyle** — small 60×55 white cards, line icons, labels inside (current = outlined icon cards)
7. **Lab promo restyle** — mint gradient + microscope artwork + ink Book Tests pill (text already matches)
8. **Hero proportions** — 26px 2-line headline, illustration 47% width, total 122h (current ≈2×)

## OPEN QUESTION for owner (scope)
Figma = **single-viewport home** (10 zones, ends at lab promo + nav). The previous 14-zone home's lower half — Find Doctors rail · Hospitals rail · Lab price rail · Health Tools · trust banner — is NOT in this design.
- **Option A (literal)**: home = exactly the Figma screen; those sections move to their own screens (search/listings) or drop.
- **Option B (hybrid)**: Figma screen first, then the removed sections continue below the fold as scroll content.
Recommendation: **Option A** — the design's compact single-screen promise is the point; discovery is already covered by Services tiles + Specialties + search.

## EXECUTION PLAN (on GO) — V4
- V4-P0: deps (`dancing-script` font) + tokens (shadow system, new grays) — foundations
- V4-P1: microscope artwork (image-gen ladder + VLM gate, P1 studio law)
- V4-P2: zones 1–5 restyle (header/hero/search/services/token)
- V4-P3: zone 6 appointment card (real-data wiring, guest=hide law)
- V4-P4: zones 7–9 (specialties restyle, lab promo, nav pill)
- V4-P5: gates — tsc/eslint 0 · E2E matrix · VLM A/B vs Figma render · OTA push + GitHub push
