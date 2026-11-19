# 13 — PHASES & BATCHES (the multi-phase build plan)

> Status: DRAFT v1 (Round 27) — owner review pending. Parent: F28 + A1 phases.
> Law: no calendar promises — batch cadence, owner-GO-gated (same as 25 web rounds).

## Phases (scope ladder — from doc 01)

**P0 MVP** golden journey end-to-end (find→book→token→track, guest-first) ·
**P1** account+polish (login, book-again, reports, notifications, rate, dark) ·
**P2** reach (push, OTP, labs, hospitals, near-me) · **P3** iOS + payments-eval.

## Batch cards (APK-B1..B5)

### APK-B1 — FOUNDATION SHELL
- Expo + TS strict + expo-router scaffold; design-token module (doc 03); 3-tab nav;
  Splash + Onboarding + **HOME complete** (search field + chips + trust strip + rail,
  live via /api/public/stats + /api/doctors); skeletons/offline/cross-cutting states;
  react-native-web export + **my browser-E2E loop standing**; Expo Go QR for owner.
- **Acceptance:** E2E home golden-path PASS · VLM 390 PASS · lint 0/0 · owner-QR checklist PASS.

### APK-B2 — DISCOVERY
- Listing screen (search/symptom chips + honesty line + doorway empty-state) · doctor
  profile (fee-upfront, Reg badge, timings, ratings summary) · share card · recent-search chips.
- Symptom dictionary reuses the web's pure-TS lib verbatim (batch-19 gift).
- **Acceptance:** fever→GP journey E2E · 0-result doorway E2E · VLM PASS · owner checklist.

### APK-B3 — THE GOLDEN JOURNEY (the acceptance test of the whole app)
- Slot sheet (live counts) · confirm (guest minimality, fee+cash-upfront) · POST book ·
  **Token screen (protagonist)** · **queue tracker (adaptive poll, leave-by)** ·
  bookings guest phone-lookup + booking detail + cancel.
- **Acceptance:** FULL guest E2E end-to-end (zero login) · queue live-vs-API parity check ·
  share deep-link opens token screen · VLM protagonist audit PASS · owner phone checklist
  (book real doctor on real phone) — **this is the demo moment for owner's doctor network.**

### APK-B4 — ACCOUNT & POLISH (P1 set)
- Login/register/forgot + **B4 auth spike** (cookie vs bearer — decision + evidence) ·
  my-bookings authed + book-again row · notifications in-app · reports viewer · rate visit ·
  profile/settings (city, language) · dark mode tokens live · performance polish pass.
- **Acceptance:** authed E2E + guest parity regression · all-batch regression suite · VLM dark-mode PASS.

### APK-B5 — APK ARTIFACT (first installable)
- EAS project setup (Expo account — accounts item #10) · release build · **owner's
  Android install smoke** · crash-check protocol · store-asset kit (doc 12 §5) ·
  Play closed-testing prep guide (owner console steps — Hinglish walkthrough doc).
- **Acceptance:** owner installs APK on real phone from a link · install+launch+booking smoke PASS · evidence `apk-b5-*`.

## Post-B5 (separate GOs): closed testing → Play production → P2 features (push/OTP/labs/near-me) → P3 iOS.

## Standing per-batch protocol (identical to web law)
plan header → owner GO → build → browser E2E + VLM evidence (`apk-b{n}-*`) → worklog →
push THIS repo → owner Hinglish report. Web repo touched ONLY for additive API needs
via its own GO batch (doc 14 law).
