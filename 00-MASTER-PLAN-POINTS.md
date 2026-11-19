# 00 — MASTER PLAN POINTS — Aturseva User App (React Native)

> **STATUS: PLANNING-ONLY.** No app development is authorized by this file.
> This file is the **planning index / seed bank**: every point below will become its own
> planning section (numbered doc) that we write and lock **point-by-point with the owner**,
> BEFORE any build batch starts. This mirrors the web-repo law (plan → owner GO → build →
> evidence → Hinglish report) that ran 25 successful rounds.
>
> Repo: `doctorooms-creator/Aturseva-Apk` (private). Created by owner 2026-12-07.
> Companion reference: `DESIGN-uber.md` (Google Stitch DESIGN.md format, from
> voltagent/awesome-design-md) — the design-system reference the owner selected.

---

## 0. LOCKED GROUND RULES (owner directives — not open for re-debate)

| # | Rule | Source |
|---|---|---|
| G1 | **Planning first, GO-gated batches.** App builds happen in batches (APK-B1, APK-B2, …), each gated by an explicit owner GO. Same law as the web repo. | Owner, standing pattern |
| G2 | **ZERO new backend.** The app talks to the EXISTING production API (doctorooms-hms). No separate app server, no duplicate database. One brain, two surfaces. | Owner + architect alignment |
| G3 | **AI agent is OUT OF SCOPE for this app.** The user-side AI assistant ("Aturseva AI saathi") is NOT included in the mobile app. Owner directive, this session (2026-12-07). Every feature list below must respect this. | Owner directive (trace 1a1f3397f7917a85) |
| G4 | **Repo is separate** (`Aturseva-Apk`), never mixed with the web repo (web deploy safety law). | Owner + architect alignment |
| G5 | **Design base = DESIGN-uber.md** (structure + discipline), adapted to Aturseva healthcare skin — adapted, never blindly copied (Uber is a transport brand; we are healthcare trust). | Owner selection + architect law |
| G6 | **QA loop:** browser E2E via react-native-web preview (agent-browser) + VLM visual audit + mobile-390 checks + owner phone protocol (Expo Go). Evidence files use `apk-b{n}-*` prefix naming. | Standing pattern |
| G7 | **Accounts LAST** (owner standing law). Expo/EAS → Firebase → Play Console ($25) → Apple ($99) happen at the END, in that ladder, only when a batch needs them. | Owner standing law |
| G8 | **Reporting language:** owner-facing reports in Hinglish only. | Standing law |

---

## 1. HOW THIS FILE IS USED (the planning workflow)

1. We take the points **in order, part by part** (A → B → C → D → E → F).
2. For each point I write a **planning doc** (numbered, same pattern as `docs/website-v2/`
   in the web repo): decisions to lock, options with honest trade-offs, my recommendation.
3. Owner reviews, corrects, and says GO (or changes the decision) — point gets **LOCKED**.
4. When all points of a part are locked → that part is frozen and we move to the next part.
5. When ALL parts locked → **consolidated MASTER PLAN** exists → first build batch
   (APK-B1) can be proposed.
6. Nothing in this file itself is a final decision — except the ground rules (§0),
   which are owner directives already given.

Point status legend: `OPEN` (to decide) · `PRE-ANSWERED` (owner already decided the
direction; plan doc just formalizes it) · `LOCKED` (plan doc written & owner GO'd).

---

# 2. THE POINTS — 30 points, 6 parts

## PART A — FOUNDATIONS (decide first — everything depends on these)

### A1. Product Vision & Scope Definition — `PRE-ANSWERED` (needs formalizing)
**What to decide:** What exactly is this app, for whom, and what is it NOT.
- The one-line product sentence (healthcare booking + live queue in pocket).
- Target user: patients (demand side). Doctors/hospital staff side stays on web (their dashboards are working tools — NOT this app).
- Core value loop: **find → book → token → track queue → revisit** (repeat = the goal).
- **Explicit OUT-OF-SCOPE list** (must be written into the vision doc):
  - AI agent / AI chat of ANY kind (G3 — owner directive).
  - Doctor/hospital/receptionist/staff dashboards (web product, separate).
  - Video consultation (possible Phase 3, separate GO, never bundled).
  - Online payments (Phase 2+; web flow exists via Razorpay).
  - Family portal, lab partner tools, OPD cockpit (web-side machinery).
- Phase ladder definition: what "MVP (P0)" means vs P1 vs P2 (matched to batch ladder APK-B1..B5).
**Deliverable:** `01-VISION-AND-SCOPE.md` — the constitution every later doc cites.

### A2. Design System & Brand Adaptation — `OPEN`
**What to decide:** Turn `DESIGN-uber.md` into OUR app's `APP-DESIGN.md`.
- What we take from the Uber doc: restraint philosophy (mono + near-zero accent), pill
  radius language (999px on interactive elements), 4:3 editorial photography geometry,
  one-primary-action-per-screen, typography-scale-driven hierarchy (not decoration).
- What we CHANGE (healthcare ≠ transport): ink/canvas palette → Aturseva web identity
  (white + ink + steel + teal-as-live-only — the web repo's palette v1.1 law), trust
  cues (Reg numbers, NABL chips, verified badges), warm-care copy tone vs Uber's
  transactional tone.
- Token table to lock: colors, type scale (display/body/caption), spacing scale,
  radius scale, elevation, icon set, dark mode (P1/P2? — decide), photography rules.
- Component inventory + states: buttons (primary/secondary/ghost + pressed/disabled),
  cards, inputs, chips, bottom sheets, list rows, badges, skeletons, toasts.
- Do's & Don'ts section (the Uber doc's strongest section — we write our own).
**Deliverable:** `02-DESIGN-SYSTEM.md` + `APP-DESIGN.md` (machine-readable, DESIGN.md format).

### A3. Tech Stack & App Architecture — `PRE-ANSWERED` (core chosen, details open)
**What to decide:**
- **Chosen already:** Expo (React Native) + TypeScript + expo-router (file routes, mirrors Next.js mental model). react-native-web export for browser preview (my E2E loop — proven by the demo experiment).
- Folder structure: `app/` (routes: tabs + stacks), `components/`, `lib/` (api client, session, symptom search), `design/` (tokens).
- Rendering strategy per screen: static lists vs server-driven; skeleton-first loading law.
- State architecture: server state (fetch + cache — decide simple custom hook vs lib), local UI state, form state. NO heavy global store unless a real need shows.
- Error boundary + offline behaviour policy (P0: graceful "can't reach hospital board" states; full offline cache = P2 decision).
- Version pinning law (Expo SDK version + lockfile discipline — the demo experiment proved author-lockfile lessons).
**Deliverable:** `03-TECH-ARCHITECTURE.md`.

### A4. Backend & API Contract — `PRE-ANSWERED` (backend = existing prod API)
**What to decide:**
- Endpoint inventory the app consumes (public surfaces only):
  - `GET /api/doctors?search=&city=&specialty=` (symptom-language search — batch-19 dictionary is a SHARED lib, reusable here)
  - `GET /api/doctors/[id]` + schedule/slots (`GET /api/slots`, `check-slot`)
  - `POST /api/public/book` (guest booking), `GET /api/public/booking/[bookingId]/token`, leave-ping
  - `GET /api/queue/doctor/[doctorId]` (live queue), `GET /api/public/stats`
  - `GET /api/public/doctor/[id]/ratings|posts` (P1)
  - Auth: login/register/me/logout endpoints (email+password P0)
  - Patient-side: bookings list, reports, notifications (auth-gated, P1)
- **Contract doc format** (the demo-agent's biggest miss): a table — endpoint · request · response shape · app screen(s) using it · failure behaviour. Rule: web repo changes touching a contract row MUST bump the contract doc; app side reads it before every batch (no silent breakage).
- Auth token/cookie handling in React Native (cookie jar vs bearer token — decide after checking how NextAuth session works from a non-browser client; may need a thin bearer endpoint — DDL-free, code-only, deploy-safe).
- CORS/proxy strategy for the browser preview only (prod app hits the API directly).
- Rate-limit and abuse notes (public endpoints are rate-limited already on web side).
**Deliverable:** `04-API-CONTRACT.md` (the single most load-bearing doc for app survival).

### A5. Data, Caching & Offline Policy — `OPEN`
**What to decide:**
- What data lives on the device: session, city preference, recent searches, cached doctor cards? (Law: NO health data stored in device storage beyond session tokens — privacy doc feeds off this.)
- Cache strategy: stale-while-revalidate for doctor lists/queue; no-cache for live queue (freshness beats caching there).
- Pull-to-refresh + retry policies; optimistic updates only where safe (e.g., recent-search chips), never for booking confirm (money/visit is involved — transparency law).
- Image strategy: doctor avatars, clinic photos — sizing, placeholders (web's proven photo pipeline reuse).
**Deliverable:** `05-DATA-AND-CACHE.md`.

## PART B — USER & IDENTITY (who is holding the phone)

### B6. User Types & Roles in the App — `PRE-ANSWERED`
**What to decide:**
- Guest (default — browse everything, book with phone+name only: web's guest-booking law carries over), Logged-in patient (history, reports, book-again), (P2: family member view?). Staff roles explicitly NOT in this app (G3-adjacent law).
- What each type sees differently (progressive disclosure — no login wall for discovery).
**Deliverable:** folded into `01-VISION-AND-SCOPE.md` + `06-AUTH-ARCHITECTURE.md`.

### B7. Authentication Architecture — `PRE-ANSWERED` (P0 shape), `OPEN` (details)
**What to decide:**
- Guest-first law (Uber/Zomato lesson from the earlier owner question-set: login only at conversion, never at entry).
- P0: email + password (matches web today — one account system, both surfaces).
- P2: phone OTP login (Zomato-style) — **blocked on Twilio creds (accounts-last)**; design the seam now, build later.
- Session persistence, logout, forgot-password flows in RN.
- Bookings-by-phone recovery (guest bookings list — matches web's phone-lookup pattern) so guests aren't forced to register to see their bookings.
**Deliverable:** `06-AUTH-ARCHITECTURE.md`.

### B8. Privacy, Health Data & Compliance — `OPEN`
**What to decide:**
- What the app stores/never stores (feeds off A5); secure token storage (expo-secure-store vs asyncstorage — decide).
- Consent + privacy screens required by Play/App Store health categories (data-safety forms — factual answers only; the web repo's privacy policy pages are the source).
- Health-data declaration strategy for store review (Apple scrutinizes healthcare apps — honest forms, no overclaiming).
**Deliverable:** `07-PRIVACY-AND-COMPLIANCE.md`.

## PART C — SCREEN ARCHITECTURE (the owner's core ask: kitne screens, kya hoga)

### C9. Complete Screen Map — `OPEN` (inventory below is the draft to be finalized)
**What to decide:** final screen inventory, per-screen element list, data needs, states.
Draft inventory (20 screens + cross-cutting states; P0 = MVP, P1 = polish phase, P2 = later):

| # | Screen | Purpose & key elements | Data (API) | States to design | Phase |
|---|---|---|---|---|---|
| 1 | Splash / Launch | Logo, auto-route (session? → Home), version chip | local session only | cold-start, slow-network | P0 |
| 2 | Onboarding (3 slides, skippable) | value loop intro (find→book→token→track), city ask | none | skip/next/replay | P0 |
| 3 | **Home** | ONE search field ("Doctor name or problem"), symptom quick-chips (fever/knee pain/skin…), live trust strip (N doctors · hospitals · labs), doctor rail (live cards), book-again row (logged-in only, hide-if-empty), city context line | /api/public/stats, doctors rail, bookings (book-again) | loading skeletons, empty city, error | P0 |
| 4 | Search Results / Listing | doctor cards (avatar+name+spec+₹fee+distance-text), symptom context honesty line ("fever → General Physician"), filter chips (specialty/city), paged list | /api/doctors?search= | 0-results doorway (problem-word chips), offline | P0 |
| 5 | **Doctor Profile** | photo, name+Reg badge, specialization, experience, ₹fee upfront, timing table, ratings summary, "Book appointment" sticky CTA, share row | doctor by id, ratings | slot-less day, unbookable | P0 |
| 6 | Slot Picker (bottom sheet or page) | date strip (7 days), time-slot grid with live availability counts, fee reminder | slots API | full-day, past-time disable | P0 |
| 7 | Confirm Booking | guest minimal fields (name+phone) or logged-in auto-fill, visit fee shown BEFORE confirm, city/pincode carry | POST /api/public/book | validation, rate-limit, fail-retry | P0 |
| 8 | **Booking Success / Token** | booking ID (APT-…), token number LARGE, position, date/time, share-to-WhatsApp, add reminder | booking + token APIs | pending-token state | P0 (HERO) |
| 9 | **Live Queue Tracker** | token position, people-ahead, wait estimate, leave-by advisory, leave-ping, queue board link | queue API (poll cadence — decide) | not-started, paused, done | P0 (HERO) |
| 10 | My Bookings | upcoming/past tabs, cards with status chips, one-tap detail | auth bookings list | guest-lookup fallback | P0 |
| 11 | Booking Detail | full info + actions: view token, track queue, cancel, rate, book again | booking by id | cancelled/rated states | P0 |
| 12 | Login | email+password, guest-continue link, forgot link | auth login | error, lockout note | P0 |
| 13 | Register | name/email/phone/password (+ later OTP) | auth register | validation | P0 |
| 14 | OTP Verify | seam designed, built only when Twilio live | otp | (P2) | P2 |
| 15 | Notifications Center | booking/queue pings list, read/unread | notifications API | empty | P1 (in-app), P2 (push) |
| 16 | Profile & Settings | account info, city, language pref (EN/Hinglish copy), notification prefs, logout, about/legal links | me/settings | guest view | P0 |
| 17 | Reports & Records | lab reports/prescriptions list, view + download | lab-reports API | empty | P1 |
| 18 | Ratings & Feedback | post-visit rating (web's rate flow adapted) | rate API | already-rated | P1 |
| 19 | Lab Browse / Order | labs hub + test order flow | labs APIs | — | P2 |
| 20 | Hospital Profile | hospital page adapted | hospital APIs | — | P2 |
| — | Cross-cutting: error screens, empty screens, offline banner, skeletons, permission-denied (location later) | system-wide | — | — | P0 |
**Deliverable:** `08-SCREEN-MAP.md` (final, with wireframe-level element lists per screen).

### C10. Navigation Architecture — `OPEN`
**What to decide:** root tab bar (Home · Bookings · (Reports P1) · Profile — decide 3 vs 4 tabs), stack per flow, deep-link scheme (aturseva://b/APT-… + https app links for Play listing), back-button semantics, tab-order rationale (thumb-reach law).
**Deliverable:** `09-NAVIGATION.md`.

### C11. The Golden Journey (spec-level) — `OPEN`
**What to decide:** the ONE flow we optimize above all: *problem-word → right doctor → slot → book → token → live queue → home*. Written step-by-step with: screen, tap, API call, loading state, failure path. This is the acceptance test for APK-B3. Include the guest variant (no login anywhere in the path — conversion law).
**Deliverable:** `10-GOLDEN-JOURNEY.md`.

## PART D — Feature Architecture (one doc per feature cluster)

### D12. Search & Discovery — `PRE-ANSWERED` (reuse batch-19 lib)
Symptom-language search (fever/haddi/knee pain) — the web's `symptom-search.ts` dictionary is a pure-TS shared lib: reuse verbatim in `lib/`. Suggest rows with "Treats fever" meta (Uber suggest grammar). Recent-search chips (local). Decide: search history retention, city filter default.
**Deliverable:** `11-SEARCH-AND-DISCOVERY.md`.

### D13. Doctor Profile Screen — `OPEN`
Elements per C9-#5; decide rating display policy (web's honest-rating law carries), share format (WhatsApp text card), sticky-CTA retreat behavior on small screens.
**Deliverable:** `12-DOCTOR-PROFILE.md`.

### D14. Booking Flow — `OPEN`
3-step law (slot → confirm → done) with slot-sheet UX (Uber bottom-sheet adapted), guest-info minimality, fee-upfront (never surprise), failure/retry honesty, booking-ID prominence.
**Deliverable:** `13-BOOKING-FLOW.md`.

### D15. Token & Live Queue — `OPEN` (HERO feature, most detailed doc)
Token screen layout, queue poll cadence (battery-friendly interval — decide 30s vs 60s vs push-driven later), people-ahead math, leave-by advisory (web's token engine reuse), leave-ping, celebration state on completion (Uber-grade moment), queue-board public link carry.
**Deliverable:** `14-TOKEN-AND-QUEUE.md`.

### D16. My Bookings & History — `OPEN`
Upcoming/past, guest phone-lookup (no forced login), cancel flow with confirmation, book-again one-tap (ties to D19).
**Deliverable:** `15-MY-BOOKINGS.md`.

### D17. Reports & Documents — `OPEN` (P1)
Lab reports/prescriptions list + viewer (PDF/image), download-to-device policy (privacy doc ties), share policy.
**Deliverable:** `16-REPORTS.md` (P1 batch).

### D18. Notifications — `OPEN`
P1 in-app center; P2 real push (Firebase — accounts-last). Decide P0/P1 placeholder seam so push is additive, never a rewrite.
**Deliverable:** `17-NOTIFICATIONS.md`.

### D19. Book-Again / Anticipatory Rows — `OPEN`
Uber's saved-places lesson (the web audit's #1 gap — R1). Home row of last 3-5 doctors for logged-in patients (hide-if-empty), one-tap book. Decide guest equivalent (recent searches only).
**Deliverable:** `18-BOOK-AGAIN.md`.

### D20. Ratings & Feedback — `OPEN` (P1)
Post-visit rating flow (web's rate/[ref] pattern), honesty rules, doctor-profile surfacing.
**Deliverable:** folded into `16-REPORTS.md` if thin — decide when writing.

### D21. Profile & Settings — `OPEN`
Account, city, language (app copy is EN + Hinglish — decide scope of Hinglish in-app strings), legal links (web's privacy/terms pages), logout.
**Deliverable:** `19-PROFILE-SETTINGS.md`.

## PART E — Services, Release & Quality (the "kon kon si services" answer)

### E22. Third-Party Services Inventory — `PRE-ANSWERED` (draft; finalize in doc)
| Service | Purpose | When needed | Account? | Cost |
|---|---|---|---|---|
| Our production API | the ONLY backend | day 1 | existing | $0 |
| Expo SDK / expo-router | app framework | day 1 | no | $0 |
| react-native-web | browser preview + my E2E loop | day 1 | no | $0 |
| Expo Go (owner's phone) | owner live preview via QR | batch 1 | no | $0 |
| EAS Build | APK builds | final batch | **Expo account (free tier)** | $0 |
| Firebase Cloud Messaging | real push notifications | P2 | Google account | $0 |
| Google Play Console | Play Store listing | post-MVP | Google account | $25 one-time |
| Apple Developer | App Store | P3 | Apple account | $99/yr |
| Maps SDK (location pin view) | only if P2 location features | P2 | Google | free tier |
| NO payment SDK in app P0/P1 | payments stay on web | — | — | — |
| Analytics | reuse web's event taxonomy via /api/analytics/track | P1 | existing | $0 |
**Deliverable:** `20-SERVICES-INVENTORY.md` (+ accounts-list update note for the web repo's ACCOUNTS doc).

### E23. Accounts & Cost Ladder — `PRE-ANSWERED`
Ladder: Expo (free) → Firebase (free) → Play ($25) → Apple ($99) — strictly accounts-last, each added to the 9-item accounts ledger as items 10-13 when its batch arrives. No account blocks ANY planning or browser-preview work.
**Deliverable:** folded into `20-SERVICES-INVENTORY.md`.

### E24. Release & Distribution Ladder — `PRE-ANSWERED`
(1) browser preview (dev sandbox) → (2) Expo Go on owner's phone via QR → (3) internal APK via EAS → (4) Play Store → (5) App Store. Each step gated; each step's verification method defined (browser E2E / owner eyeball / install smoke / store review).
**Deliverable:** folded into `21-RELEASE-LADDER.md`.

### E25. QA & Evidence Strategy — `PRE-ANSWERED` (pattern), `OPEN` (tooling details)
Browser E2E via react-native-web export + agent-browser (login → book → token → queue golden path per batch); VLM visual audits (layout/contrast/mobile-390); tsc strict + eslint; **owner phone protocol** (my honest limit: real device behaviour — camera/push/install — verified by owner with my guided checklist; I never claim device-verified what I couldn't run). Evidence naming: `apk-b{n}-*`.
**Deliverable:** `21-RELEASE-LADDER.md` (combined with E24).

### E26. Performance Budget & Quality Gates — `OPEN`
Set budgets: cold-start time, list scroll smoothness, API timeout UX, bundle size targets, 44px touch law, empty-state law, crash-noise policy. Gates per batch (lint 0/0, pageErrors 0, VLM PASS — mirror web).
**Deliverable:** `22-PERFORMANCE-AND-GATES.md`.

### E27. Launch & Maintenance Discipline — `OPEN`
Web↔app contract-sync law (A4 doc is the bond), version naming, changelog/worklog in THIS repo (worklog.md — same pattern), owner report cadence, post-launch ownership (owner handles store consoles with my guided docs — non-technical-owner law).
**Deliverable:** `23-LAUNCH-MAINTENANCE.md`.

## PART F — Process

### F28. Batch Ladder Definition (APK-B1..B5) — `PRE-ANSWERED` (draft)
- **APK-B1:** scaffold + design tokens + navigation shell + Home (static + live stats) + browser E2E loop standing.
- **APK-B2:** search + doctor profile + listing (symptom dictionary live).
- **APK-B3:** booking flow + token + queue tracker (golden journey END-TO-END = acceptance test).
- **APK-B4:** auth + my bookings + book-again + profile/settings + notifications-in-app + polish + reports (P1 set).
- **APK-B5:** Expo Go owner-beta round → EAS APK build → owner phone install.
Each: plan → GO → build → evidence (`apk-b{n}-*`) → push → report. Scope flexes per locked points; ladder shape holds.
**Deliverable:** confirmed in each batch's plan header.

### F29. Risk Register — `OPEN` (living section)
Standing entries: two-codebases maintenance cost; store review delays; device-verification limit (owner is QA-2); Expo SDK upgrade debt; API drift (contract doc mitigates); Hinglish copy breadth. Each risk: likelihood × impact × mitigation × owner-visible note (honesty law).
**Deliverable:** `24-RISK-REGISTER.md` (updated every batch).

### F30. Point-by-Point Working Order — `PRE-ANSWERED`
Order of planning sessions: A1 → A2 → A3+A4 → A5 → B → C9+C10+C11 (the heart) → D (in journey order) → E → F confirmation → **MASTER PLAN consolidated** → APK-B1 GO request.
**Deliverable:** this file's §2 order; sessions tracked in worklog.

---

## 3. WHAT IS ALREADY BUILT / REUSABLE (no re-invention — the web repo's gifts)

| Asset | Reuse in app |
|---|---|
| Symptom-language dictionary (`symptom-search.ts`) | verbatim (pure TS) |
| Public API surface (doctors/slots/book/token/queue/stats) | direct consumption |
| Queue/token/leave-by engine (web's GO-4/9 machinery) | API reuse, UI rebuild |
| Rate/feedback flow patterns | adapted |
| Event taxonomy (analytics) | same events, app surface tag |
| DESIGN-uber.md (this repo) | A2's base |
| Web's 10-Uber-laws scorecard (docs/website-v2/17) | app UX checklist |
| 25 rounds of GO-batch discipline + evidence pattern | the process itself |

## 4. HONEST LIMITS (stated up front, owner's trust law)

1. I write all code; my verification runs to browser-E2E + VLM. Real-device behaviour (install, camera, push, battery) is verified by the owner with my checklists — never claimed by me.
2. Store accounts and console handling belong to the owner (accounts-last law) — I guide, never hold credentials beyond repo push PAT.
3. Two codebases = every patient feature is built twice (web + app) from here on. This cost is real and was stated when the idea was first rated (8/10 idea · timing-gated). The contract doc (A4) is the mitigation.
4. This file plans; it does not build. Zero app code exists at this commit — by design.
