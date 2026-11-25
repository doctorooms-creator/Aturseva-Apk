# DOC 23 — WEB-PARITY ANALYSIS + FIGMA SCREEN LIST (PATIENT APP)

**Date:** 2026-11-25
**Type:** ANALYSIS-ONLY · zero app code touched · zero changes to `Doctorooms2` (read-only clone used)
**Purpose:** Owner asked — "web repo ka patient side analyse karo, compare karo APK se, aur Figma pe build karne wali screens ki list banao." This doc is that list, grounded in code evidence, not memory.

**Sources (all verified by reading code, not docs alone):**
- `Doctorooms2` (aturseva.com production web) — shallow clone of `main`, patient routes + `src/app/api` + `src/components` + `lib/queue-eta.ts` read directly.
- `Aturseva-Apk` — full route tree of `src/app` read directly (19 route files, v0.3.0, HEAD `a609ab1`).
- Owner planning docs in `Doctorooms2`: `PATIENT-APP-PROMPT.md`, `PATIENT-MODULE-AUDIT.md`, `STITCH-UI-BRIEF.md`, `AI-NURSE-PLAN.md`, `ATURSEVA-AGENT-PLAN.md`, `DOCTOROOMS-HANDBOOK.md`, `docs/website-v2/00-MASTER-PLAN.md`, `NEXT-STEPS.md`.

---

## 1. WHERE WE LEFT THE APK DEVELOPMENT (state at HEAD a609ab1)

Shipped and browser/VLM-verified:
- **V4 Figma home** (design/21 spec + design/22 record) — 10 zones, 426-frame scale system, zone-for-zone match vs Figma reference.
- **APP SHELL** (bf38ba7) — anchored top/bottom chrome + elastic middle + stretch bands: screen always fills on 360–768dp, font-scale hardened (ravi/anna class), 6-phone persona matrix audit shipped as skill.
- **19 routes**, all LIVE-API backed (client of `https://aturseva.com`): tabs (Home/Bookings/Records/Profile) + onboarding + search + doctor profile + book + booking token + queue + hospitals + hospital detail + notifications + reports + rate + bills + medical-history.
- Guest-first identity (booking phone + optional AuthSheet JWT in SecureStore). Honesty laws enforced in code (hide-if-empty, no fake pay, ratings ≥3 gate respected via API truth).
- OTA live on channel `preview` (runtime 0.3.0). EAS: owner `aturseva-team`.

Known deliberate gaps (stated in code/docs, not bugs): no bill payment, no lab-test ORDER flow (tracking only), no AI nurse/Sevika, no appointment-detail depth (chat/prescription/video), no documents vault upload, no insurance/consents, no OTP, no location permission, no websocket (20s polling law), home3d legacy code orphaned.

---

## 2. WHAT THE WEB PATIENT SIDE HAS (evidence-based inventory)

### 2.1 Guest rail (no login)
| Web surface | Functionality |
|---|---|
| `/book` | Guest booking: mode toggle (in-person/video), date chips, live slot grid (30s poll), guest name+phone form, live token screen, QR entry mode |
| `/b/[bookingId]` | Live token status (20s poll, ETA ladder via `lib/queue-eta.ts`), WhatsApp share, rate door |
| `/bookings/print-token/[id]` | 58mm thermal token slip |
| `/rate/[ref]` | Stars + sub-ratings + review + anonymous, resolves booking OR lab order |
| `/doctors` + `/doctors/[id]` | Directory (search/facets/pagination), profile (fees, gallery, posts, reviews, schedule, Book CTA) |
| `/hospitals` + `/hospitals/[id]` | Directory; detail with departments + **live OPD queue per department** |
| `/specialties/[slug]` | Programmatic SEO page per specialty (symptom chips, doctor grid, FAQ) |
| `/labs`, `/labs/[id]`, `/labs/order` | Lab directory with real test catalogs + rates; order flow with **Rx photo upload**, pay-on-collection |
| `/emergency` | Static first-aid + 108 helpline (no API) |
| `/health-tools` | BMI/TDEE/water/IBW calculators (client-side only) |
| `/family/[accessCode]` | Family portal: ward/bed/doctor/vitals/diet/bills of an admitted relative (reception-generated code) |
| `/kiosk/[hospitalId]` | Lobby self check-in wizard + 3s status polling |
| `/r/[code]` | Doctor referral invite → register with code |
| `/hospital/[hospitalId]/queue-display` | Waiting-room TV queue board |

### 2.2 Logged-in patient (`/dashboard/patient`, sidebar has 18 sections — all functional)
- Dashboard home: next-appointment hero, KPI strip, upcoming list **with live queue position per booking (30s poll)**, quick actions, activity feed.
- **Appointments** list (tabs/filters) + **appointment detail**: queue section, **doctor chat thread (10s poll)**, prescription view + print, **video-call join (Jitsi)**, feedback check, cancel.
- **Aturseva AI Sahayika**: chat, check-in, book-through-chat (human confirm), voice in/out. 11 AI tools incl. GPS nearby-30km.
- **Sevika (Dawai reminders)**: today's doses (tick/snooze), schedule CRUD, import-from-prescription, **AI photo-RX parse**, weekly adherence report, diet.
- **Health records**: document upload/download/delete (multipart). **Lab tests + reports** viewers. **Medical history** timeline. **Rx access** approve/deny.
- **Bills**: OPD/IPD/gateway list + **Razorpay online payment** (IPD payable, OPD read-only).
- **Insurance** CRUD, **Consents** (sign/revoke endpoints exist), **Blog** (patient author), **Feedback**, **Notifications** (+channel preferences), **Profile** (+avatar upload), **Settings**, **Change password**.
- Auth: email+password custom JWT (DB-revocable sessions), OTP forgot-password flow, email verification, referral codes.

### 2.3 APIs the app can already consume today
Patient-relevant endpoint groups exist and are live: `public/book|slots|booking/*|rate|lab-order|family-portal|hospital queue|kiosk`, `patient/bookings(+queue,cancel,check-slot,book-again)`, `bookings/[id]/chat`, `dashboard/patient/*` (stats, appointments, aturseva/*, sevika/*), `patient/medical-documents`, `patient/lab-orders(+report)`, `patient/medical-history`, `patient/bills`, `patient/feedback`, `patient/notifications`, `patient/profile|avatar|settings`, `patient-insurance`, `patient-consent*`, `prescription-access/*`, `payments/razorpay/*`, `video-call/[roomId]`, `auth/*` (incl. verify-otp), `notifications/*` engine (WhatsApp/SMS), `referral/*`.

---

## 3. GAP MATRIX (web vs APK today)

| Feature | Web | APK | Verdict |
|---|---|---|---|
| Guest booking → token → queue | ✅ full | ✅ full | parity (golden journey done) |
| Doctor/hospital/specialty discovery | ✅ full | ✅ core (specialty SEO pages = home rail deep-links) | near-parity |
| Booking phone-lookup list | ✅ via dashboard (login) | ✅ guest-first | APK actually ahead for guests |
| Live queue ETA honesty ladder | ✅ | ✅ (same endpoint) | parity |
| Rate a visit | ✅ | ✅ | parity |
| Notifications | ✅ + channel prefs | ✅ (prefs missing) | gap: prefs |
| Bills | ✅ + Razorpay pay | ✅ read-only | gap: payment |
| Lab order flow | ✅ (order + Rx upload) | ✅ tracking only | gap: order flow |
| Appointment detail (chat/prescription/video/rate/re-book) | ✅ | ❌ (token screen only) | **biggest gap** |
| Health documents vault (upload) | ✅ | ❌ | gap |
| Medical history timeline | ✅ | ✅ | parity |
| Rx access approve/deny | ✅ | ❌ | gap |
| Aturseva AI chat + check-in + book-through-chat | ✅ | ❌ | **flagship gap** |
| Sevika reminders + photo-RX + adherence + diet | ✅ | ❌ | **flagship gap** |
| Insurance / Consents | ✅ | ❌ | gap (owner decision on consents) |
| Settings + notification prefs + change password | ✅ | ❌ | gap |
| Family booking ("Kiske liye?") | ❌ banned on web | ❌ | owner decision pending (docs disagree) |
| Emergency / health-tools / family portal / kiosk | ✅ | ❌ | later-phase |
| Video call join | ✅ (Jitsi iframe) | ❌ | gap (security audit wants authed video later) |

---

## 4. FIGMA SCREEN LIST (the deliverable)

Design system law to carry into every frame: V4 rules from design/21 — 426×923 master frame, `s = width/426` scale, white cards + hairline + soft shadow, monochrome chrome + teal <1% live-data accent, Geist + GeistMono + Dancing Script wordmark only, honesty labels, 44px+ targets, Hinglish toasts sparingly. Dark variants for all screens (dual palette already in tokens.ts).

### BATCH 0 — Foundation (design once, reuse everywhere)
| # | Frame | Status | Notes |
|---|---|---|---|
| 0.1 | Figma component library: tokens, colors, type scale, cards, buttons, chips, sheets, nav pill, skeletons, badges, empty states | NEW | mirrors tokens.ts + home4/v4.ts |
| 0.2 | App Shell template (status area + anchored chrome + stretch bands) | NEW | already built in code — draw the frame source of truth |
| 0.3 | Dark mode palette sheet | NEW | |

### BATCH 1 — Golden journey (exists in APK as code; bring to Figma-authoritative state)
| # | Screen | Status | Data backing |
|---|---|---|---|
| 1.1 | Home V4 | ✅ DONE (design/21) | live booking zone |
| 1.2 | Onboarding 3 slides + city sheet | Figma-frame it (art exists) | static |
| 1.3 | Search / doctor listing (chips, pagination, honesty line) | Figma-frame | live |
| 1.4 | Doctor profile (fee, schedule table, ratings, reviews) | Figma-frame | live |
| 1.5 | Slot sheet (date + live slot grid) | Figma-frame | live |
| 1.6 | Booking confirm S7 | Figma-frame | live |
| 1.7 | Token screen S8/S11 (incl. pending "being assigned") | Figma-frame | live |
| 1.8 | Live queue S9 (ETA ladder states) | Figma-frame | live |
| 1.9 | Bookings tab (phone lookup, segments) | Figma-frame | live |
| 1.10 | Hospitals list + hospital detail + dept→doctors sheet | Figma-frame | live |
| 1.11 | City picker sheet | Figma-frame | static top-20 |

### BATCH 2 — Records & account (mostly exists; a few NEW)
| # | Screen | Status |
|---|---|---|
| 2.1 | Records hub | Figma-frame |
| 2.2 | Lab orders tracker + report viewer | tracker Figma-frame; viewer NEW build |
| 2.3 | Medical history timeline | Figma-frame |
| 2.4 | Bills (read-only) | Figma-frame |
| 2.5 | **Pay bill sheet (Razorpay)** | NEW (needs design + build; RN SDK per security audit) |
| 2.6 | Auth sheet (sign in / register) | Figma-frame; decide OTP later |
| 2.7 | Profile tab + edit profile sheet | Figma-frame |
| 2.8 | Notifications center | Figma-frame |
| 2.9 | **Settings page** (appearance, city, notification prefs, change password, sign out) | NEW |
| 2.10 | **Documents vault** (upload/download list) | NEW |

### BATCH 3 — AI flagship (biggest NEW surface; owner docs define it)
| # | Screen | Status | Source spec |
|---|---|---|---|
| 3.1 | **Aturseva AI chat** (action cards, quick chips, voice ≤45s waveform, TTS toggle) | NEW | STITCH §2/§4 |
| 3.2 | Placement decision frame: **center AI tab vs FAB sheet** | OWNER DECISION | docs disagree (see §5) |
| 3.3 | **Dawai reminders home** (subah/dopahar/raat timeline, dose tick/snooze/skip, catch-up "Abhi Le Li", streak) | NEW | STITCH 4.x, AI-NURSE P1 |
| 3.4 | **Add reminder sheet** (Manual / Import Rx / Photo-RX camera) | NEW | AI-NURSE P2 |
| 3.5 | Daily check-in diary card (mood/energy/symptoms) | NEW | AGENT-PLAN P3 |
| 3.6 | Weekly adherence report | NEW | AI-NURSE P2 |
| 3.7 | Diet plan view | NEW | AI-NURSE (diet API broken on web — flag before build) |

### BATCH 4 — Consultation depth (web parity gaps)
| # | Screen | Status |
|---|---|---|
| 4.1 | **Appointment detail** (queue + chat entry + prescription + status timeline + video banner + rate + re-book) | NEW |
| 4.2 | **Doctor chat thread** (≤2000 chars, per-booking) | NEW |
| 4.3 | **Video call join** (patient joins only) | NEW |
| 4.4 | Prescription viewer | NEW |
| 4.5 | Rx access requests (approve/deny) | NEW |

### BATCH 5 — Ecosystem extras (later)
| # | Screen | Status |
|---|---|---|
| 5.1 | Lab test order flow (labs list → catalog → order + Rx upload) | NEW |
| 5.2 | Family portal viewer (access code) | NEW |
| 5.3 | Insurance CRUD | NEW |
| 5.4 | Consents | OWNER DECISION (read-only vs sign/revoke) |
| 5.5 | Emergency (static + 108 strip) | NEW |
| 5.6 | Health tools (calculators) | NEW |
| 5.7 | Referral landing | NEW |
| 5.8 | Blog / health feed | NEW |
| 5.9 | Feedback form | NEW |

Suggested Figma order: **0 → 1 → 2.1–2.4,2.6–2.8 → 4.1–4.4 → 3 (AI) → rest**. Rationale: batch 1 makes existing screens Figma-authoritative (cheap, unifies quality); batch 4 closes real product gaps patients feel today; batch 3 is the flagship but has open owner decisions and one broken upstream API (diet).

---

## 5. OWNER DECISIONS REQUIRED (docs disagree — resolved here or screens get blocked)

1. **Family booking ("Kiske liye?")** — banned in STITCH §8/audit §7, planned in PATIENT-APP-PROMPT Phase 3. Design in or out?
2. **AI placement** — center tab (STITCH) vs FAB sheet on every screen vs current 4-tab layout (Home/Bookings/Records/Profile) + AI entry inside. Affects nav pill redesign.
3. **Consents** — read-only (web reality for patient) vs sign/revoke endpoints that exist.
4. **Login upgrade** — keep email+password AuthSheet, or add OTP (web has OTP forgot-password; mobile-first users expect OTP).
5. **Video call stack** — ship Jitsi join now vs wait for authed video (security audit flags public SaaS).
6. **Diet plan** — web diet API reported broken for patients (audit §8); fix upstream before designing screen 3.7?

## 6. WHAT WAS NOT DONE
- No changes to `Doctorooms2` (read-only shallow clone at `/home/z/analysis/web-ref`; never pushed, never edited).
- No app code changes in `Aturseva-Apk`; no development started. This doc + commit only.
