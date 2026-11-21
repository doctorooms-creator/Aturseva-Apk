# APK-B10 — P2 POLISH: pull-to-refresh + gray contrast + honest data completeness

**App repo:** Aturseva-Apk · **Base:** ddb1edb (B9) → this commit · **Date:** 21 Nov 2026
**Owner GO:** "Go ahead for further development" (chat) · all work pushed to GitHub for code safety.

## Scope (from R40's NEXT list — UNBLOCKED candidates)

The R40 candidates were: notifications deep-polish, reports viewer PDF-quality pass,
and the two VLM contrast nitpicks. Auditing the six B6-era data screens against the
actual contracts found the real gaps, which became B10:

1. **Pull-to-refresh on every screen where server data lives** — notifications,
   reports, bills, medical-history, rate, bookings(tab). House pattern
   (`tintColor={c.ink}`, refreshing state → load()). NOTIFICATIONS had a promised
   interaction that did not exist: the offline error copy said "Pull down and try
   again" but no RefreshControl was mounted. All six now have it.
2. **Gray contrast token fix** — the two standing VLM nitpicks (caption gray +
   zone-label contrast) traced to ONE token: light `mute` was #AFAFAF = 2.3:1 on
   white (under every WCAG floor). Final value **#6E6E6E** = 5.1:1 on white, 4.64:1
   on canvasSoft cards (first take #757575 passed white at 4.6:1 but measured
   4.19:1 on the tinted card — the VLM fix-loop caught it, one shade darker).
   Dark `mute` #7A7A7A → **#8C8C8C** = 5.7:1 on the dark canvas. One token,
   every screen heals.
3. **Reports prep-note seam** — the lab-order contract always carried `prepNote`
   (fasting / before-sample instructions) and the card never rendered it. Now
   shown as a soft amber box "Before the sample: …" ONLY while prep still
   matters (Placed/Confirmed — hidden once the sample is collected; hide-if-empty
   law intact).
4. **Notifications "Show older" pagination** — the server contract always carried
   page/totalPages at 25/page; page 1 alone rendered, so older notifications were
   unreachable forever. An honest "Show older" pill now appears at the list end
   when more pages exist and appends them (load failure leaves the list exactly
   as it was — retryable).
5. Version strings bumped: profile + home footers now read **APK-B10**.

## E2E (PROD via :8090 → aturseva.com proxy, iPhone 390×844)

Fresh patient **b10tester1795257186@aturseva.app / 98••••7200**:

- Register → honest duplicate-mobile answer (9742927286 already owned — identity
  law live) → fresh mobile → "Registration successful! You can log in now." → login.
- **Golden journey:** Rajesh ₹300 booking with the account's mobile — B9 PRE-FILL
  REGRESSION PASS (name + 98••••7200 pre-filled, "From your account — this booking
  joins your history." caption present) → POST /api/public/book **201** → token
  screen honest pending state (#1SNP39, "Token being assigned").
- **Notifications with REAL data:** the booking itself generated a server-side
  notification — "Booking Request Sent · 1 unread · Mark all as read" rendered;
  tap-to-mark-read → PATCH /api/patient/notifications/{id}/read **200**, row
  settled, mark-all pill hidden.
- **Medical history with REAL data:** "1 event · newest first" + APPOINTMENT card
  (Appointment with Rajesh · 21 Nov 2026 · Seasonal fever check · 16:15 · Rajesh
  Clinic · Pending) — B8/B9 identity payoff intact on the B10 bundle.
- Reports / Bills / Rate: signed-in honest-empty renders, no crash.
- Bookings tab: auto-lookup with remembered phone → Upcoming (1) Dr. Rajesh.
- Contrast verified IN THE DOM: 35 elements at the new mute (rgb(110,110,110) on
  the final bundle — first take rgb(117,117,117) also verified before the fix-loop),
  ZERO at the old #AFAFAF; dark mode 35 elements at rgb(140,140,140); the
  VLM-flagged "APPOINTMENT" zone label measured directly.
- pageErrors **0** throughout; console known-benign only.

## VLM audits (4 total)

- **vlm-01 notifications (data)** — PASS. Explicitly endorsed the contrast
  direction ("avoid going lighter than #6b7280" — the old #AFAFAF was exactly that).
- **vlm-02 medical-history (data)** — PASS with a REAL caught nit: zone label
  at 4.19:1 on the tinted card → fix-loop → #6E6E6E.
- **vlm-03 dark profile** — PASS (footer/version tier judged legible ~4.5:1+).
- **vlm-04 medical-history RETAKE after fix** — PASS, "comfortably above WCAG AA,
  no new issues", layout unchanged.

## Gates

tsc strict **0** · eslint **0/0** · dist re-exported 3× (EXPO_PUBLIC_API_BASE="")
· :8090 verified serving the final bundle (both footers "APK-B10") · no new routes.

## Honest limits (doc 12 §2 law)

- **Pull-to-refresh is a NATIVE-only interaction.** Verified in the RN-web source
  (node_modules/react-native-web/dist/exports/RefreshControl/index.js): it
  destructures `onRefresh`/`refreshing`/`tintColor` and returns an EMPTY View —
  a no-op stub on web. The home/hospitals/search screens have shipped the same
  pattern since B1/B2 — the APK gets the real pull gesture; the web E2E export
  proves the screens render and the refresh DATA path (the same load()/runLookup
  the onRefresh handler calls, exercised via lookup/try-again in this E2E).
  Synthetic touch-gesture attempts on web confirmed the stub absorbs them.
- **prepNote / Show-older data-side render** could not be screenshot-verified:
  no lab orders exist for the tester (only the owner/hospital side can create
  them) and pagination needs >25 notifications. Both are code+type-verified,
  render only with data (hide-if-empty law), and cannot fabricate.
- No OTA / no new APK this round: EXPO_TOKEN still lost since sandbox reset #4
  (standing owner-blocked: one fresh token unblocks febe3a99 link + B10 OTA +
  dev tunnel — three for one).

## Files

tokens.ts (mute light+dark) · notifications.tsx (refresh + pagination) ·
reports.tsx (refresh + prepNote) · bills.tsx (refresh) · medical-history.tsx
(refresh) · rate.tsx (refresh) · bookings.tsx (refresh) · profile.tsx + index.tsx
(footer labels) · this evidence pack (8 screenshots + 4 VLM audits).
