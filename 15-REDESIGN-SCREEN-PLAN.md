# 15 — REDESIGN SCREEN PLAN (APK-B16 → APK-B20) — GO-gated, zero code shipped

Owner question (2026-11-22): *should we make a detailed plan for the main screens —
home, doctor profiles, labs, hospitals?* — **Yes. This doc is that plan.**

Built on the measured Round-48 audit (evidence/ui-audit-r48) + fresh live-site
forensics (2026-11-22, this round): website compiled-CSS tokens re-verified,
live homepage card grammar extracted, face URLs + brand-kit URLs probed 200.

**Nothing in this doc is built.** Every section is spec awaiting owner GO.
Standing laws hold: honesty (no fabricated photos/stats), WCAG AA,
hide-if-empty, OTA-per-batch.

---

## 1. One-line diagnosis (measured, not opinion)

The app's bones are decent (IA, spacing, type scale, pill grammar — VLM C-audit
agreed). The app is **colorless, image-less, lifeless** next to the website and
Practo. Three root causes, all measured in R48:

1. **Photos** — prod DB has 0 real doctor photos (90/90 `default.png`) AND the
   app's Avatar never renders a source at all (B1 stub never finished). The
   website already solved this (curated-face pipeline, 11 VLM-QA'd faces).
2. **Color** — app accent is green-teal `#0F766E`; the website family the owner
   calls "blue jesa" is the bright aqua `#14B8A6/#00BAA7` + warm cream
   `#F4F2EC` system. Same name, different feel.
3. **Logo** — app droplet-over-smile is our own invention; the official kit
   (`public/brand/aturseva/`, incl. `app-icon-light/dark.svg` made FOR apps)
   was never used.

---

## 2. B16 — DESIGN FOUNDATION (rebrand + color). Cheapest, widest batch.

Token-layer change; touches every screen without touching any screen's logic.

### 2.1 Color tokens (light / dark) — website-measured sources

| token | today | → B16 | source (measured) |
|---|---|---|---|
| `canvas` | `#FFFFFF` | `#FFFFFF` | website `--w-surface` |
| `canvasSoft` | `#F4F4F2` | `#F4F2EC` warm cream | website cream ×50 live |
| `ink` | `#0A0A0A` | `#151515` | website `--w-ink` |
| `body` / `mute` / `hairline` | keep | keep | B10/B14 AA ledger holds |
| `aqua` **(new)** | — | `#14B8A6` | website bright aqua (teal-500 family, the owner's "blue jesa") |
| `aquaSoft` **(new)** | — | `#F0FDFA` | teal-50 wash for selected/chips |
| `tealLive` | `#0F766E` | `#0D9488` | website `--w-teal` (live accents, large text 3.74:1) |
| `tealText` **(new)** | — | `#0F766E` | AA small text 5.47:1 (unchanged job) |
| `steel` / `steelTint` **(new, optional)** | — | `#3F6A94` / `rgba(153,182,210,.16)` | website trust bands |
| `tealLiveSoft` | `#CCFBF1` | `#F0FDFA` (merge into aquaSoft) | simplification |
| success / warn / error | keep | keep | B14 systemic AA fix preserved |

**Usage law (website's own law, adopted):** aqua = fills, washes, selection,
live data accents — **never small text, never white text on aqua**
(`#00BAA7` on white = 2.45:1 — measured, fails AA). Text accents use
`tealText #0F766E`. Cream bands replace dead whitespace walls.

### 2.2 CTA language — website ruling (fresh forensic, this round)

The live website's primary CTA (`.w-bookbtn`, every doctor card) is an
**ink pill**: `#161616` fill, white text, `border-radius:100px`, height 38,
`:active scale(0.98)`, hover shadow `0 4px 18px rgba(21,21,21,.16)`.

→ **The app's black CTA stays — it is the website's own grammar.** What R48's
VLM called "grim" gets fixed by context, not by recoloring: full-pill radius
(some slabs today), press-scale 0.98, soft shadow, and aqua/cream/photo life
around it. One primary per surface (B14 law) holds.

### 2.3 Logo — official kit (with an honest delivery constraint)

- In-app brand usage (headers, onboarding, About row): from
  `public/brand/aturseva/` — `lockup.svg`, `symbol-black/white.svg`,
  `reverse-lockup.svg`. SVG→PNG rasterized at build time; same domain as API.
- **App icon / splash / adaptive icon: requires a NEW EAS BUILD + manual APK
  reinstall.** Expo OTA delivers JS+assets only — native icons cannot be
  OTA'd (honesty law: we do not promise OTA icon swaps). B16 therefore ships
  in two parts: (a) OTA: tokens + in-app brand + CTA language; (b) build:
  icon/splash from `app-icon-light/dark.svg` → APK versionCode 3 alongside.

### 2.4 Typography / radius / spacing

Keep — the audit called these bones decent. No rework where there's no defect.

---

## 3. B17 — PHOTOS (the #1 trust lever, Practo pattern 2)

Port the website pipeline; the app already talks to the same domain.

1. `src/lib/website/doctor-photo.ts` (app port of web's): deterministic
   id-hash → 11 curated faces (live-verified:
   `https://aturseva.com/website/photos/faces/face-*.jpg` → 200 image/jpeg),
   gender-aware assignment, **real-photo-wins** (`profileImg !== 'default.png'`
   → real URL), "Representative photo" caption kept (honesty law).
2. `Avatar` component: + optional `source` (48×48 r12 — the website `w-avatar`
   grammar; profile hero 96). Doctor rail, cards, profile, similar-doctors,
   department rows all adopt it.
3. Hospitals: image-if-real else **lettermark in aquaSoft circle** — the exact
   website HospitalsBand grammar (`logoUrl ?? image ?? initials`). No
   fabricated hospital photos (0/DB measured).

---

## 4. SCREEN SPECS — the detailed plan (owner's ask)

### S3 — HOME ("first 3 seconds")

Top→bottom:

1. **Greeting + location row** — "Good morning, Aarav · Jaipur" with city chip
   (existing sheet) on a **cream hero band** with aqua wash.
2. **Search crown** (keep `SearchField`; aqua focus ring).
3. **Symptom quick-chips** (keep; selected = `aquaSoft` + `tealText`).
4. **Two consultation tiles** (Practo pattern 10): "Talk to a doctor" (→
   search) + "Lab tests at home" (→ **website `/labs` handoff**, honest
   "on aturseva.com" label). Photo tiles, cream cards.
5. **Trust billboard** (Practo pattern 1): big ink numbers, aqua tick dots —
   90 doctors · N hospitals · N visits (live stats contract; real only).
6. **Doctor rail** — cards with PHOTOS, name+verified, spec+experience, fee,
   ink-pill Book (website `w-dcard` grammar mirrored).
7. **Hospitals section** — lettermark/photo cards, See all → `/hospitals`.
8. **Labs strip (new, small)** — "Labs with public rates · on aturseva.com":
   3 cards (test name, ₹ fee, TAT) + handoff chip. Data source = owner
   decision point §7-D2.
9. Footer Privacy·Terms·version (keep).

Shell: **floating pill bottom nav** (Practo pattern 3) — Home/Bookings/
Profile in a pill with filled-circle active tab; 44px targets.

### S4 — SEARCH / DISCOVERY

- Persistent filter chips (specialty/city) with aqua selection state.
- Result cards = rail card + rating row (hide-if-empty) + city.
- Availability: **profile screen shows `nextFreeSlot`** (contract exists
  today); listing cards stay honest without per-card slot spam — optional
  web-repo additive field = §7-D3.
- Skeletons keep; empty states get lettermark + aqua life.

### S5 — DOCTOR PROFILE (magazine hero)

1. Cream hero band: 96px photo, Dr.-name (website parity), verified chip,
   spec + quals, city.
2. Rating row (stars + count; hide-if-empty).
3. **Persistent dual CTA bar** (Practo pattern 4): ink "Book appointment" +
   outlined "Call hospital" — pinned above nav at every scroll state.
4. **Grouped slot grid** (Morning/Afternoon/Evening; existing slots contract):
   free = aqua chip, taken = hairline, past = mute.
5. Sections (Practo pattern 7 — 28px bold heads + grey explainer + divider):
   About · Experience · services/procedures/awards (B15 hide-if-empty zones
   keep) · clinic card (hospital lettermark + address) · similar-doctors rail
   with photos · fee block (₹ tabular + "Pay at hospital" caption, B14 law).

### S5b/c/d — BOOKING (transaction mode, Practo pattern 8)

- Dark ink header "Confirm your booking"; **receipt-style summary** (dashed
  dividers): doctor · slot · hospital · fee · patient.
- **"Aturseva Promise" card** (aqua wash) — ONLY real policy lines; wording =
  owner decision §7-D4.
- Confirm = ink pill. Success = delight moment (aqua pulse + booking card —
  replaces the joyless current toast).

### S8/S9 — HOSPITALS + DETAIL

- List: lettermark/photo cards; city, departments count, doctors count.
- Detail: hero band → departments accordion → doctors-at-department rows
  with PHOTOS + live availability dot (`isAvailable` in contract) → book door.

### LABS — architecture ruling (owner-confirmed 2026-11-22)

**"Labs booking happens on the website."** The app's Labs surfaces, all
honest, no booking in-app:

1. Home labs tile + labs strip → handoff chip → `aturseva.com/labs`
   (generalized B14 pattern, 44px, Linking).
2. **Reports screen = the in-app Labs section** (order tracker): status
   timeline Placed→Confirmed→SampleCollected→Processing→Completed (all states
   exist in `LabOrderRow` today), report download (`fetchLabReport` exists),
   prep note, pay-on-collection caption.
3. Rate-after-Completed (existing flow).

No duplicate Rx-upload flow, no new auth surface, zero risk to the live
website lab flow. In-app catalog browsing beyond the small strip = §7-D2.

### RECORDS FAMILY + PROFILE TAB

- Reports/Bills/Medical-history: keep B14 AA chips; add cream section bands
  + consistent lettermark headers; unify section-head grammar.
- Profile: user photo (if real), grouped account rows, official app icon in
  About row, logout danger zone.

---

## 5. B20 — DEVICE MATRIX (owner's compatibility requirement)

- Browser E2E at **360 / 390 / 412 / 768** widths + **font-scale 1.3×**
  (Android large-font): no clipped lines, no horizontal scroll, CTA
  bottom-third (one-handed), safe-area notches, dark mode every screen.
- Full regression of booking golden path per width.
- Physical-device reality (install/push/camera across models) stays
  owner-side checklist — honest limit, unchanged.

---

## 6. Ladder order + why

**B16 foundation → B17 photos → B18 home+discovery → B19 profile+booking+records
→ B20 matrix.** Tokens are cheapest and touch everything; photos are the
trust lever and independent; surfaces then get one redesign each; matrix runs
last as full regression. Each batch = 1 round, OTA-live on app open (B16's
icon/splash part excepted — new APK, §2.3).

---

## 7. Owner decision points (the GO form)

- **D1 — GO**: B16–B20 ladder as-is, subset, or re-order?
- **D2 — Labs strip data**: (a) static top-3 tests curated from the live labs
  page (no API; dated, honest) / (b) web-repo GO: add read-only public
  `/api/public/lab-catalog` (live data, cleanest) / (c) hide strip for now.
- **D3 — Availability on listing cards**: (a) profile-only (honest today) /
  (b) web-repo GO: additive `nextSlotToday` on `/api/doctors`.
- **D4 — "Aturseva Promise"**: owner supplies the 2 real policy lines
  (e.g. free cancellation till X, pay at visit) — we print nothing unverified.
- **D5 — Google Stitch**: optional owner-side visual control only. Not needed
  for the build: the website language + Practo refs ARE the spec, and Stitch
  mockups would still require RN re-implementation — it adds a step, not speed.

---

## 8. Explicitly NOT changing

Honesty laws (hide-if-empty, real numbers, Representative-photo caption) ·
WCAG AA ledger (B10/B14 measured fixes hold; aqua is fill/wash-only) ·
navigation IA · no new screens beyond this spec · web repo stays read-only
unless §7-D2/D3 GO'd · OTA delivery per batch.
