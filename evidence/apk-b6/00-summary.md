# APK-B6 — P1 POLISH: notifications · reports · rate · book-again (evidence pack)

> Batch: APK-B6 (plan doc 13 "P1 set" remainder · doc 06 #15/#17/#18 · doc 18
> book-again). App repo `c559b0b → <this commit>`. Web-E2E on PROD
> aturseva.com (the owner's side-by-side testing loop). v0.2.0 → v0.3.0
> (two new native modules → new runtime; old APK stays on its last
> compatible update — runtimeVersion law).

## What landed

| Feature | Screen / surface | API (all Bearer-gated, contract-verified) |
|---|---|---|
| Notifications center | `/notifications` (stack) | GET /api/patient/notifications · PATCH read · PATCH read-all |
| Reports & records | `/reports` (stack) | GET /api/patient/lab-orders · GET /api/patient/lab-orders/[id]/report (auth'd proxy) |
| Rate your visits | `/rate` (stack) + RateSheet | GET/POST /api/patient/feedback |
| Book-again rail | HOME (hide-if-empty) | GET /api/patient/book-again |
| Profile account rows | 3 rows (logged-in only) + unread badge | — |

Report opening per platform: web = fetch-via-Bearer → blob → window.open
(E2E-verified); native = expo-file-system (SDK 58 File/Paths API) cache
write + expo-sharing sheet (owner-verified — honest-limit law).

## Design-law compliance

- Hide-if-empty ABSOLUTE: book-again rail renders NOTHING for guest /
  error / empty (zero chrome change for the guest home).
- Doorways never walls: all three auth-gated screens show the sign-in
  doorway to guests (booking never needs an account — unchanged).
- One primary action per screen; 44px touch law on star pills + score
  pills; skeletons/error/empty states per doc 03/04.
- Unread badge: teal-live only (live-state law); "All caught up" at 0.

## Web-E2E results (PROD, fresh patient `b6tester1795197927@aturseva.app`)

1. Guest doorways: /notifications, /reports, /rate all show honest
   sign-in doorways (never blocking).
2. Profile guest: "Your account" section hidden (progressive
   disclosure). After register+login: card + 3 rows appear.
3. Register → honest "log in now" message → login → session persists
   across deep-link reloads (B4 law regression-checked).
4. Badge truth: GET notifications 200 → unreadCount 0 → "All caught up"
   (real prod answer, no fabrication).
5. Notifications screen: honest empty doorway (screenshot 01).
6. Reports screen: honest empty doorway (02).
7. Rate screen: honest empty doorway (03).
8. HOME (logged-in, no completed visits): "Book again" ABSENT —
   hide-if-empty PASS (05).
9. Golden-journey regression: fever chip → listing "12 doctors found"
   with real cards — B3 journey intact (post-B6 smoke).
10. pageErrors 0 · console noise 0 (only the known RN-web Animated
    warning).

## VLM audits — 5/5 PASS (vlm-01..05.json)

Notes (non-blocking): empty blocks sit slightly high (generous lower
whitespace acceptable); reports empty state could later grow a
"Book a lab test" action chip (P2 labs batch will add it).

## Gates

tsc strict 0 · eslint 0/0 · typed routes regenerated (3 new stack
routes) · app.json v0.3.0.

## Owner checklist (B6 acceptance — on the v0.3.0 APK when built)

1. Sign in → Profile: three account rows + live unread badge.
2. Notifications: tap row = mark read; "Mark all as read" pill.
3. Reports: order tracker; View report opens PDF (share sheet on
   Android — device behaviour, owner-verified only).
4. Rate: star row + detail scores + anonymous toggle → submit.
5. Home with history: "Book again" rail with your last doctors.

## Honest limits (standing law)

- Native report-open + share-sheet behaviour = owner device evidence
  only (I verified the web branch E2E).
- Rate/notifications REAL-data flows need completed visits / reception
  events — E2E verified the honest empty states + guest doorways +
  real API wiring (200s) instead of fabricating data.
