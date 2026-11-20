# APK-B5 — E2E SUMMARY (recovery + EAS artifact round)

> Batch: APK-B5 (start) · date 2026-11-20 · verdict: **web-E2E regression PASS (golden journey end-to-end on prod)**

## Round context

- Sandbox reset wiped the local clone + node_modules + dev servers (worklog Round 31).
- Recovery: repo re-cloned from GitHub (B4 HEAD `e7246a0`), deps reinstalled, web dev
  (:3000) + local DB + `apk-web-preview` (:8090) + expo tunnel dev server all restarted.
- Owner supplied the Expo account token (`EXPO_TOKEN`) — the missing piece B4 flagged.

## EAS setup (first cloud project + artifact)

- `eas.json` fixed (B4's draft had an invalid top-level `update` block — replaced with
  per-profile `channel`: preview/production).
- `eas init --force` → project **@aturseva-team/aturseva-app** created and linked
  (projectId `d4ba897b-7dfc-4881-80df-b3df2ce98bda`).
- `expo-updates` installed via `expo install`; app.json: `updates.url` (u.expo.dev),
  `runtimeVersion: appVersion`, `checkAutomatically: ON_LOAD`.
- **EAS Update published**: branch `preview`, runtime `0.2.0`, android+ios —
  update group `0d6d2030-c654-4d40-88ea-8b0e13e7a09a`
  (dashboard: expo.dev/accounts/aturseva-team/projects/aturseva-app/updates/0d6d2030…).
- **EAS Build submitted**: android, `preview` profile (internal distribution APK),
  build `10fddb22-491a-4e6d-923f-15c97740245b`, Expo-managed keystore created,
  versionCode 1, channel `preview` wired to the branch (OTA on load).
- tsc strict 0 · eslint 0/0 (repo law) · app.json validated.

## Browser E2E regression (web simulation, 390×844, fresh storage)

Same-origin proxy → **https://aturseva.com** (production monolith; the loop the owner
asked to keep running alongside development). Screenshots `b5-e2e-01..11`.

| Step | Result |
|---|---|
| Onboarding walk → city Delhi → HOME | PASS — once-only routing, live trust strip, real doctor rail |
| Fever chip → GP listing (Delhi) | PASS — search listing with Book rows |
| Doctor profile (Rajesh, ₹300) | PASS — fee-upfront, share, WhatsApp share |
| Slot sheet — TODAY default | PASS — all slots honestly struck `past` (post-hours), Sunday strip-disabled |
| Tomorrow → free slots → 10:30 pick → confirm | PASS — selection + live counts |
| Confirm screen (guest minimality) | PASS — name + 10-digit phone + one-line reason only; cash law line |
| **POST /api/public/book (REAL)** | PASS — booking **#B68I0L** created on prod (Sat 21 Nov, 10:30, ₹300) |
| Token screen | PASS — honest "Token being assigned" pending auto-poll + full facts |
| Queue tracker | PASS — honest "Not in the line yet" + refresh affordance |
| Bookings tab | PASS — masked phone lookup `98••••0005`, Upcoming (1)/Past (0) split |
| Cancel with reason | PASS — prod cancel 200, honest "No token — cancelled" state |
| Profile tab (guest) | PASS — honest guest card, city/appearance rows, v0.2.0 footer |

Empty-schedule honesty also verified: Dr. Wizard UI / Dr. Prod Final carry no schedules
on prod — the sheet shows the truthful "No schedule for this day" + Next-open-day doorway
instead of fake slots.

## Owner-side pending (honest)

- **Owner Android install smoke** from the EAS APK link (walkthrough:
  `01-owner-install-walkthrough.md`) — the B5 acceptance gate.
- Play closed-testing prep (guide drafted: `02-play-closed-testing-prep.md`).
- Store-asset kit (doc 12 §5) — next batch with the store listing screenshots.
