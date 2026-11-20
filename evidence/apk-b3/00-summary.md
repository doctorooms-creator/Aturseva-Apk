# APK-B3 — THE GOLDEN JOURNEY — evidence pack

**Date:** 2026-11-20 · **App commit:** this push · **API:** PRODUCTION monolith
(doctorooms-hms.vercel.app) — real doctors, real booking engine, real
guest flow. E2E on the static web export (mini-service :8090 → prod
proxy, EXPO_PUBLIC_API_BASE="" same-origin law).

## Browser E2E (390×844) — full guest journey, zero login

1. `b3-e2e-01` fever chip → listing "12 doctors found" (honesty line
   "fever → General Physician") — CORS base bug caught (export built
   without empty EXPO_PUBLIC_API_BASE) and fixed; reload passes.
2. Rajesh card → profile (B2 screens regress clean) →
   `b3-e2e-02-profile.png`.
3. "Book appointment — ₹300" CTA → S6 slot sheet
   (`b3-e2e-03-slotsheet.png`): date strip Today..11/26 (Sunday 11/22
   DISABLED — schedule-truth), TODAY slots all honest-struck "past",
   Tomorrow 09:00–16:45 free; 09:15 selected (teal ring); counts line
   "33 slots open · 0 booked today · limit 50" (real API numbers only).
4. Confirm slot → S7 `b3-e2e-04-confirm.png`: summary card (Tomorrow ·
   09:15 · In person · ₹300), fields name/mobile/reason, fee law
   "pay at the clinic", sticky "Confirm booking".
5. POST /api/public/book (PROD) → **201 real booking created**
   (cmworpvbj…RW86AC, guest 9999988888) → S8 token screen
   (`b3-e2e-05b-token-full.png`): "Booked" + Booking #RW86AC + honest
   pending token state ("Token being assigned… updates automatically")
   + timeline booked/confirmed/completed + facts (doctor, clinic, date,
   TIME 09:15, FEE ₹300 · pay at clinic, city, patient, reason) +
   Track queue / Share token / Book again / Cancel.
6. Track queue → S9 `b3-e2e-06-queue.png`: "Waiting for confirmation ·
   Not in the line yet" honest state + doctor card + "Updated 9:24 am ·
   refreshes automatically" + Refresh now chip.
7. Bookings tab → S10 `b3-e2e-07-lookup.png`: auto phone-lookup with
   masked "99••••8888", Upcoming (1) card (Dr. Rajesh · Sat, 21 Nov ·
   09:15 · Awaiting confirmation), Past (0).
8. Cancel flow → `b3-e2e-08-cancelsheet.png`: confirm sheet (reason
   optional, "Keep my booking" + "Yes, cancel it") → cancelled →
   `b3-e2e-09-cancelled-state.png`: "No token — cancelled" card +
   "This booking was cancelled" banner + timeline truth + booking moved
   to Past (1) with Cancelled badge.
9. Lookup empty-path: 9123456789 → "No bookings for 91••••6789 —
   booked with another number? Switch it above." (doorway, never
   dead-end).
10. Lookup sheet ("Find my bookings"): honest copy, no login, 10-digit
    input.

## VLM audits (390px) — all PASS

- Token screen (`b3-vlm-token.json`): pure English ✓, token block
  protagonist ✓, facts aligned ✓; one scroll-position artifact
  (below-fold Cancel chip clipped in static screenshot — scrolls fully
  into view; re-verified).
- Queue pending (`b3-vlm-queue2.json`): pure English ✓, status block
  protagonist ✓.
- Queue cancelled (`b3-vlm-queue.json`): pure English ✓, layout ✓
  (cancelled card dominant = the honest state).
- Slot sheet (`b3-vlm-sheet.json`): pure English ✓, Morning/Afternoon/
  Evening grouping ✓, fee + Confirm footer ✓.

## Gates

- `tsc --noEmit` 0 errors (strict) ✓
- `eslint .` 0/0 ✓

## PROD API surface used (all verified live)

- GET /api/doctors, /api/doctors/[id], /api/doctors/[id]/schedule
- GET /api/public/slots?doctorId&date
- POST /api/public/book
- GET /api/public/booking/[id]/token (additive: +timeSlot, +fees,
  +doctor.userId deployed in 4aa10fe)
- GET /api/public/booking/lookup?mobile (NEW, a6cc1ac)
- POST /api/public/booking/[id]/cancel (NEW, a6cc1ac)

## Honest deferrals

- Live queue states not-started/paused/next need a confirmed booking
  with a running queue — owner phone test covers (reception confirms,
  then position appears).
- exp:// deep links (share opens app) = native-only; owner phone test.
- EAS Update permanent link — next batch (B4/P1).
