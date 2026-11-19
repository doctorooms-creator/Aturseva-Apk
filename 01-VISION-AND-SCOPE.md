# 01 — VISION & SCOPE — Aturseva Patient App

> Status: DRAFT v1 (Round 27, 2026-12-07) — owner review pending. Planning doc, not code.
> Parent index: `00-MASTER-PLAN-POINTS.md` (A1, B6). Language: EN (tech doc); owner reports in Hinglish.

## 1. The one-line product sentence

**"Apni jeb me doctor, apni turn confirmed"** — the Aturseva web experience (find →
book → token → live queue) as a phone app, faster and closer than any browser.

Brand line carried from web: **"Find your doctor. Your turn, confirmed."**

## 2. Who this app is FOR (and NOT for)

| Is for | NOT for |
|---|---|
| Patients & families (demand side) — guests AND logged-in | Doctors/staff/reception/nurses (web dashboards are their tools — separate product surface, stays web) |
| Anyone who wants to: find a doctor by problem-word, see fee + wait BEFORE committing, book in ≤3 taps, track their live queue turn | Anyone expecting video-consult, online payments, AI chat, family-portal features in v1 (see §4) |

## 3. The core value loop (what the app optimizes above all)

```
FIND (problem-word → right doctor) → BOOK (≤3 taps, fee upfront) → TOKEN (big, shareable)
   → TRACK (live queue: people-ahead, leave-by) → REVISIT (book-again row, one-tap)
```

**Repeat visit is the business goal.** Every design decision in docs 03–07 is judged
against this loop. A feature that does not serve the loop is out (or P2).

## 4. Scope ladder — what is IN, phase by phase

| Phase | IN | OUT (explicit) |
|---|---|---|
| **P0 (MVP — APK-B1..B3)** | Splash/onboarding · Home (search + symptom chips + live rails) · Doctor listing + profile · Slot sheet · Guest booking · Token screen · Live queue tracker · My bookings (guest phone-lookup) · Bottom nav 3 tabs · EN+Hinglish copy · offline-graceful | Login/account (P1) · notifications (P1) · reports (P1) · everything below |
| **P1 (APK-B4)** | Email+password login/register · book-again row · in-app notification center · reports & records viewer · rating flow · profile/settings · dark mode · polish pass | Real push, OTP |
| **P2** | Phone-OTP login (Twilio-gated) · real push (Firebase) · labs hub + order · hospital profiles · location-aware "near me" | Payments (stay on web), video consult |
| **P3** | Apple App Store release · payments evaluation · EAS-OTA updates | AI agent (permanent OUT — ground rule G3) |

### Locked OUT-OF-SCOPE (owner directives / standing laws)
1. **AI agent / AI chat of any kind** — ground rule G3, owner directive 2026-12-07. Not P0/P1/P2/P3. Permanent.
2. Staff-side dashboards (web product; separate surface, separate repo).
3. Online payments in-app (web Razorpay flow remains the payments surface).
4. Video consultation (future separate GO only, never bundled).
5. Family portal, lab partner tools, OPD cockpit (web machinery).

## 5. User types (app-only view)

| Type | Can do | Sees differently |
|---|---|---|
| **Guest (default)** | Browse all, book with name+phone, track queue, phone-lookup bookings | No login wall ANYWHERE; login prompts only at conversion-relevant moments (never blocking) |
| **Logged-in patient** | Everything guest + history, book-again, reports, notifications | Home gets book-again row; profile populated |
| **(P2) Family member view** | Careful scope decision deferred to P2 doc | — |

**Progressive disclosure law:** the app NEVER asks for anything before the moment it
is actually needed (name+phone at booking; login only when history value exists).

## 6. Success metrics (what "world-class" means, measured)

| Metric | Target (P0 quality bar) |
|---|---|
| Install → first booking (guest, no login) | ≤ 3 minutes |
| Taps to book any doctor from Home | ≤ 3 (search-tap → slot → confirm) |
| Cold start → Home usable | ≤ 2.5s (budget doc 22/13) |
| Queue screen refresh | live-feel ≤ 60s staleness, adaptive |
| Booking success moment | shareable token (WhatsApp) in 1 tap |
| Post-visit rating completion | ≥ 25% of completed visits (P1) |
| Crash-free sessions | ≥ 99.5% |

## 7. Positioning (honest, one paragraph)

We do not out-feature Uber — we out-CARE Uber in a domain Uber does not touch:
healthcare trust. Uber's architecture laws (live state as protagonist, transparent
pre-commit state, 3-tap action, thin client) are adopted (docs 02, 04); our moat is
the **live token/queue transparency + verified doctors (Reg, NABL, ratings)** — a
combination no Indian booking app shows end-to-end. The app is the pocket version of
that moat.
