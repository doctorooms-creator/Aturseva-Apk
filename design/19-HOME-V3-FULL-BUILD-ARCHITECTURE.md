# 19 — HOME v3 FULL BUILD ARCHITECTURE (round R51, ANALYSIS + BUILD PLAN ONLY)

> **Directive**: owner uploaded the FULL home UI/UX mockup
> (`design/owner-home-v3-FULL-reference.png`, 724×2172 — 14 zones). "Exact
> same" build wanted, **the 3D-asset question explicitly asked**
> ("kis tarike se build hoga ye jo ye 3d assets hai"). **NO DEVELOPMENT
> STARTED** (owner's explicit instruction) — this is the architecture.
> Method: VLM 3-pass (structure · verbatim text · asset forensics) + live-API
> contract grounding + R49 codebase gap analysis.
> **This mockup SUPERSEDES the 11-zone one** (doc 18 / `owner-home-v3-reference.png`
> — kept archived for comparison).

---

## PART 0 — THE TWO MOCKUPS, RECONCILED

| Zone | 11-zone mockup (doc 18) | **14-zone FULL mockup (this doc — authoritative)** |
|---|---|---|
| Header / location | header + location row inside | same, but location row is its own zone w/ chevron (city-picker reuse) |
| Hero / search / quick-actions-4 / token banner / appointment card | ✓ | ✓ same |
| Explore by Specialty rail (6 icon pills) | ✓ | **REPLACED by "Find Doctors Near You"** (filter chips + 3 doctor rows w/ Next-Slot mini-cards) |
| Mint lab promo card (Book Lab Tests) | ✓ | **REPLACED by "Popular Lab Tests"** (3 price pills) |
| — | — | **NEW: "Nearby Hospitals"** photo rail |
| — | — | **NEW: "Health Tools"** (Symptoms Checker / Upload Reports / Family Profiles) |
| — | — | **NEW: lavender trust banner** ("Your health, in one place.") |
| Bottom nav 4 tabs | ✓ | ✓ same floating pill |

Zone order (verbatim content in PART 1): status → header → location → hero →
search → quick-actions → token-banner → your-appointment → find-doctors →
nearby-hospitals → popular-lab-tests → health-tools → trust-banner → nav.

---

## PART 1 — THE 14-ZONE SPEC (VLM-decoded, build-faithful)

| # | Zone (%Y) | Content (verbatim) | Key style |
|---|---|---|---|
| 1 | Status (0–2%) | 9:41, dark island pill | system |
| 2 | Header (2–6%) | `AturSeva` wordmark 700 ~34sp −0.5 track · bell circle (red `#FF3B30` dot) + person circle, both `#F2F3F5` 44px | wordmark left, icons right |
| 3 | Location (5.5–7%) | pin + `Gandhinagar, Gujarat` + chevron-down → **city-picker sheet reuse** | tap = city change |
| 4 | Hero (7–15.5%) | `Healthcare, made simpler.` 700–800 ~46px @2x (≈23sp) −1 track · sub `Find doctors, book appointments and track your turn in real time.` 400 ~20px gray · **hero-3D right** | sentence case, 2-line H1 |
| 5 | Search (16–18.5%) | pill r28 `#F5F5F6` h56 no border · placeholder `Search doctors, hospitals, tests, symptoms…` · magnifier + **mic** line icons | restyle current glass crown OR flat (decision D) |
| 6 | Quick actions (19–27%) | 4 tiles r20 `#F7F7F8` centered: `Doctors`/`Clinic & Video` · `Hospitals`/`OPD & Departments` · `Lab Tests`/`Diagnostics` · `Video Consult`/`Consult from home` — **each with a 3D prop ~64px** | 2×2 or 4-across (grid at 360: 2×2) |
| 7 | Token banner (27.5–34%) | r24 dark `#141414→#1E1E1E` subtle diagonal sheen · `Skip the wait.` 500 24px + `Book your token online.` 700 30px white · chips `⚡ Real-time queue` `📅 Confirmed slot` on rgba(255,255,255,.12) pills 15px · **token-stack 3D right (~120px)** | the ink billboard restyled |
| 8 | Your appointment (34.5–47%) | header 700 ~27px + `View all →` · card r24 `#F7F7F8` p20: 48px avatar · `Dr. Adam Max` 600 21px · `Psychologist · City Care Clinic` 17px gray · green `Live Queue` pill (bg `#DCF5E3` dot/text `#22A94F`) · metric strip 3-col 1px `#E5E5E5` dividers: `#24`/`Your Token` · `#18`/`Now Serving` · `06`/`Patients Ahead` (numbers 700 ~30px, labels 17px `#6E6E73`) · 36px circular white chevron btn · progress h6 r999 track `#E5E5E5` black fill ~75% | **the live queue card** |
| 9 | Find Doctors Near You (47–66%) | header + `View all →` · chips: `All` (ACTIVE black bg white text) `General Physician` `Cardiology` `Orthopedic` `More` (inactive `#F0F0F1`) h40 pill · 3 doctor rows r24 `#F7F7F8`: avatar 64px + name 600 21px + `Internal Medicine · 12 yrs exp` 17px `#8A8A8E` + `★4.8 (1.2K)` yellow `#F5B301` + `📍2.1 km` + right **Next-Slot mini-card** r18 white (`Next Slot` / `Today` / `4:30 PM`) + chevron | **new zone** |
| 10 | Nearby Hospitals (66–76%) | header + `View all →` · horizontal rail cards r20: photo h~110 cover + `City Care Hospital` + `Multispecialty · 2.4 km` + `★4.7 (2.8K)` + chevron square · 3+ cards, peek affordance | **new zone** (reuses hospital rail grammar) |
| 11 | Popular Lab Tests (76–82%) | header + `View all →` · 3 pill cards r20 `#F7F7F8` h~100: flask outline icon + `CBC` / `Complete Blood Count` + `₹299` 700 21px · `Thyroid (T3, T4, TSH)`/`Thyroid Function Test`/`₹699` · `Vitamin D`/`25-OH Vitamin D`/`₹899` | restyles Z7 labs strip |
| 12 | Health Tools (82.5–90%) | 3 cards r20 `#F7F7F8` centered outline icons 32px: `Symptoms Checker`/`Understand your symptoms` (calendar) · `Upload Reports`/`Store & access anytime` (doc+) · `Family Profiles`/`Manage care for loved ones` (shield+) | **new zone** |
| 13 | Trust banner (90–94%) | r24 lavender `#E7E6FA`/`#EDEBFC` · **shield-3D ~52px** blue-violet `#6B5CE7→#8B7BF0` glossy + white cross · `Your health, in one place.` bold + `Appointments · Reports · Prescriptions · History` 15px + white circular chevron 40px | **new zone** |
| 14 | Nav (94–100%) | floating pill r~36 white margins 16 · 4 tabs stacked icon+label: `Home` (active: filled icon in `#EFEFEF` pill r28 + bold label) `Bookings` `Health Records` (clipboard+) `Account` | the R49 glass pill adapts to 4 |

Type/spacing grammar: screen margins **24px**, section rhythm ~48px, card
padding 20, gaps 10–14, sentence case everywhere, no uppercase anywhere.
Colors: white canvas + `#F7F7F8` soft cards + ink CTAs + functional-only
accents (green live, yellow star, red badge, lavender trust) — **R49's
monochrome language, extended**.

---

## PART 2 — THE 3D ASSET STUDIO (the owner's question, answered)

### 2.1 Inventory — 8 generated clay assets (VLM forensics per asset)

| Asset | Subject (prompt-core) | Size | Placed |
|---|---|---|---|
| `hero-3d` | 3D cartoon male doctor, arms crossed, white coat + blue shirt/tie, grey stethoscope, beside small white hospital w/ black cross + glossy green blob-trees, on soft gray blob | ~35% width (~160dp) | hero, right |
| `tile-doctor` | mini same doctor bust | ~64dp | tile 1 |
| `tile-hospital` | mini white hospital, blue windows, black cross, green shrubs | ~64dp | tile 2 |
| `tile-labtubes` | 3–4 glossy test tubes w/ red liquid in white rack | ~64dp | tile 3 |
| `tile-video` | silver laptop, blue video-call screen w/ avatar frame | ~64dp | tile 4 |
| `token-stack` | fanned white rounded token cards (2–4), tilted ~25° | ~120dp | dark banner right |
| `shield-3d` | glossy blue-violet shield, embossed white cross | ~55dp | trust banner |
| *(avatars/hospital photos are PHOTOGRAPHIC — not this studio; see 2.4)* | | | |

Style-lock (every prompt shares this suffix): *"soft 3D claymorphic render,
[subject], matte white/blue medical palette, rounded inflated forms, soft
studio lighting from upper front, subtle contact shadow, front-facing slight
¾ view, clean white background, no text"* — locked from the VLM style
parameters: desaturated pastel props, one red + one green accent only,
pillow-soft volumes, broad gradient shading on matte, rim highlights on glass.

### 2.2 The pipeline (7 steps, repeat per asset)

1. **Generate** (Image-Generation skill, z-ai CLI): 1024×1024, white bg, the
   style-locked prompt. 2 takes per asset.
2. **Background removal** (Python/PIL — white-threshold flood from edges →
   alpha) → transparent PNG. Blob-props (hero) keep their painted blob.
3. **VLM audit** per take: compare against `owner-home-v3-FULL-reference.png`
   crop — reject off-style, regenerate (max 2 loops; VLM gate questions:
   style? colors? subject fidelity?).
4. **Trim + resize**: crop to content bbox, export @2x and @3x (tile 128/192,
   hero 320/480, shield 110/165, token-stack 240/360).
5. **Optimize**: PNG quantize (pngquant-style via sharp/PIL) or WebP —
   target ≤40KB/asset (8 assets ≈ ≤320KB added; OTA budget: 27→~43 Android
   assets vs limit 2000 — safe).
6. **Bundle**: `assets/images/home3d/*.png` + a generated
   `assets/home3d-manifest.json` (name, aspect, focal) for layout.
7. **Gate**: E2E pageErrors=0 + VLM full-zone audit on the rendered home.

### 2.3 THE KEY ARCHITECT INSIGHT — the Token card must NOT bake its number

The mockup's banner shows "Token #24" baked into the 3D card. Baked = every
patient sees #24 forever. Architecture: **generate the token-stack BLANK**
(fanned cards, no text) and code-render the live number on the top card
(Geit 700, tabular, black) from the user's actual booking API value.
The 3D asset = the container; the number = data. Same law the queue screen
already follows.

### 2.4 Photographic assets (NOT generated — honesty pipelines)

- Doctor avatars (rows + appointment card): the **H1 doctor-photo pipeline**
  (curated-or-real, `photoRepresentative` label) already serves these —
  real names/photo data flow from prod.
- Hospital photos: prod `HospitalCard` images are mostly empty today → the
  Avatar-initials fallback stays the honest hero (B7 ruling) until the owner
  supplies real building photos (owner-side asset request logged). Mockup's
  building photos = placeholder reference, not fabricated into the app.
- Lab icons: flat Lucide line icons (per mockup itself — flask is line, not 3D).

---

## PART 3 — DATA ARCHITECTURE (every zone → live API, zero fabrication)

| Zone | Endpoint (exists) | Fields ✓ | Mockup-vs-truth rulings |
|---|---|---|---|
| Header stats (if live strip kept) | `/api/public/stats` | doctors/hospitals/visits | not in mockup — drop or keep as micro-row (decision E) |
| Quick actions | routes | — | Doctors→/search · Hospitals→/hospitals · Lab Tests→labs handoff · Video Consult→search video-filter **if** API flag exists else doorway |
| Appointment card | `/api/public/booking/*` + queue token API | token/nowServing/ahead/progress ✓ | the queue screen's exact data, condensed; guest=doorway, no-booking=**section hides** (broken-trust law) |
| Doctor rows | `/api/public/doctors` (search) `DoctorCard` | name/specialization/city/fees/experience/rating/ratingCount/photo ✓ | **`2.1 km` OMITTED** — no geo field in contract (honest omission; distance arrives only if the API ever grows geo). `★4.8 (1.2K)` ✓ real |
| Next-Slot mini-cards | `/api/public/slots?doctorId&date` | today's slots ✓ | per-row parallel slots(today) for visible 3 rows (cached, hide-if-empty); fallback = fees mini-card (`₹300 · View Slots`) if slots call is too heavy — **decision B** |
| Filter chips | same search endpoint | specialization ✓ | All/GP/Cardiology/Orthopedic/More → query filters (the search screen's own chips pattern) |
| Hospitals rail | `/api/hospitals` | name/type/city/departments/doctors ✓ rating? | star only if the endpoint carries ratings (verify at build; else omit) |
| Lab pills | D3 measured table (labs-strip source) | CBC ₹170 · Blood Sugar ₹60 · Urine ₹100 + TAT | **mockup's ₹299/₹699/₹899 are placeholder art — REAL DATA WINS** (no-fabrication law). Adding Thyroid/Vitamin D requires verified prices from aturseva.com/labs first (web-reading pass, D3 discipline) — otherwise keep the 3 verified tests |
| Health tools | routes | — | Symptoms Checker→symptom flow (symptom-search lib exists) · Upload Reports→reports route ✓ · Family Profiles→**app has no family feature — doorway-or-hide = decision C** |
| Trust banner | static copy | — | verbatim from mockup |

---

## PART 4 — FONT + TOKEN LAYER DELTAS

- **Geist + Geist Mono** (website uniformity — established in doc 18 PART 2;
  Geist via `@expo-google-fonts/geist` or bundled TTFs, `useFonts` splash gate).
  Numerals (metrics, prices, token) = Geist Mono tabular — the website's own
  grammar. Type scale: hero ~23sp/700 · section 13.5sp/700 · names 10.5sp/600 ·
  body 8.5sp/400 · metric numbers 15sp/700 mono.
- New color tokens: `liveGreen #22A94E` (+soft `#DCF5E3`), `starYellow #F5B301`,
  `promoLavender #E7E6FA` (+shield accent), `chipActive` = ink, `chipIdle
  #F0F0F1`, card soft `#F7F7F8` (≈ current canvasSoft — map). Red badge
  `#FF3B30` (semantic only). All dual-defined dark at GO.
- Radius map updates: rows/cards r24 (was 16) — mockup's rounder language;
  nav pill r36 active-pod r28.

## PART 5 — COMPONENT ARCHITECTURE (new N / adapted A)

N `home-header` (wordmark/bell/avatar) · N `home-hero` (copy + hero-3d) ·
N `quick-actions` (4 tiles + props) · N `token-banner` (ink billboard restyle +
blank token-stack + live number) · N `appointment-card` (metric strip +
progress) · N `doctor-rows` (chip filter + row + next-slot mini-card) ·
A `hospital-rail-card` (photo slot + restyle) · A `labs-strip`→`lab-pills`
(3 cards, price-forward) · N `health-tools` · N `trust-banner` ·
A `nav-pill` (4 tabs, active-pod treatment) · N `home3d` `<Asset/>` component
(manifest-driven, aspect-faithful sizing). Zones Z1–Z8 (H2/H3) retire;
Practo structure laws (rails, doorways, clearance, scroll-end) carry over.

## PART 6 — EXECUTION ORDER AT GO (gates between every step)

1. Geist font gate + token layer (tsc/eslint) →
2. Asset studio: 8 clay assets through the 7-step pipeline (VLM-audited) →
3. Zone build: header→hero→search→tiles→banner→appointment (skeletons first) →
4. Doctor rows + chips + next-slot data (E2E on :8090, real API) →
5. Hospitals rail + lab pills + health tools + trust banner →
6. Nav 4th tab (Health Records host) + routes →
7. Full gates: tsc · eslint · E2E golden path + matrix 360/390/412/768 + dark ·
   VLM full-zone audit vs the mockup side-by-side →
8. `eas update` (re-export web after — known gotcha) → dual-repo push → worklog.

## PART 7 — SAVED THIS ROUND (zero app code touched)

- `design/owner-home-v3-FULL-reference.png` — the authoritative mockup
- `design/19-HOME-V3-FULL-BUILD-ARCHITECTURE.md` — this document
- VLM raw: `/tmp/design-v3-analysis.json` · `/tmp/design-v3-assets.json`
- Open decisions for the owner at GO: **A** green live accent (mockup) vs teal
  (brand) · **B** next-slot live (3 slots calls) vs fees mini-card ·
  **C** Family Profiles doorway vs hide · **D** search crown glass vs flat
  `#F5F5F6` pill · **E** keep the stats strip anywhere.
- Expo Go tunnel still dead from the sandbox reset — restart on request.

*Round R51 · analysis + build architecture only, per owner directive · architect: Z.ai*
