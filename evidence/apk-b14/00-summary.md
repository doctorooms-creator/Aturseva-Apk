# APK-B14 — REPORTS-VIEWER DEPTH PASS + the systemic AA chip fix (records-viewer family)

Round 46 · commit (see git log) · method: real-data E2E on :8090 → 5 strict VLM first-takes →
every claim DOM-measured → 7 real fixes → 4 retakes PASS → golden-path + 3-screen regression.

## The real-data setup (prod, honest E2E)

The tracker had never been audited with a POPULATED state — no lab order existed for any
test account. A REAL order was placed through the real flow this round: live /labs catalog
(server-rendered prod page) → `testcat-01-2 @ testlab01` = "Blood Sugar (Fasting)", Aarav
Path Laboratory, ₹80, policy self, prepNote "Overnight fasting of 8-12 hours required" →
POST /api/patient/lab-orders as the B10 tester patient (orderNo `cmwre9fcw0007jt08f14rzaax`,
collection Mon 23 Nov 07:00–09:00 Pune, PayOnCollection). Every audit below ran on this
REAL prod row (no mocks).

## REAL FIXES (each measured before coding, re-measured after)

1. **SYSTEMIC AA DEFECT — the `${tone}1A` alpha-tint status chip** (4 screens: reports ·
   bills · medical-history · rate). Measured on the canvasSoft card: the 10% tone blend
   lands at **3.99–4.33:1** — FAIL for every tone (warn 3.99 / teal 4.33 / success 3.99 /
   mute 4.09). Fix: tone text on its PROPER soft token from the design system —
   warn→warnSoft 4.84 · live→tealLiveSoft 4.86 · done→successSoft 4.79 · error→errorSoft
   5.91 (light); dark 6.47–9.86. Mute chips pair BODY text with the hairline fill
   (5.24 light / 7.63 dark). Grammar now identical across all four screens (tonePair).
2. **Reports fee hierarchy**: fee rendered 15px — SMALLER than the 16px test name,
   violating the B12 decision-number law. Now 18px/600 tabular (measured 18/600) with a
   new 11px "Pay on collection" caption — the paymentMode field the contract always
   served but the card never rendered (B14 seam).
3. **Empty-state HONESTY**: caption said "on aturseva.com **or here**" — the app has NO
   lab-booking flow (labs hub owner-blocked; grep-verified zero lab routes). VLM caught it
   too (r05 FAIL "promises in-app booking"). Now: "Lab tests are booked on aturseva.com —
   once placed, the status and report land here." + a quiet Chip action "Open
   aturseva.com labs" (Linking.openURL; 44px) — the honest next step, not a dead end.
4. **Auth-sheet dual primary**: the SELECTED mode tab rendered as a SOLID INK pill next
   to the ink submit pill (measured both bg rgb(10,10,10)) — two black primaries on one
   surface. Fix: Chip gets a `soft` selection tone — selected = tealLiveSoft +
   tealLive text (measured #CCFBF1/#0F766E, 4.86:1) — reads as state, not action.
   Ink-fill selection stays for decision chips (zero other call-site changes).
5. **Grab handle non-text 3:1**: hairline read ~1.36:1 vs the sheet (same defect class
   B13 fixed on onboarding dots). Now mute — measured #6E6E6E, 36×4, 5.1:1 both themes.
6. **Prep-box separation**: bg-only box read ~1.06:1 vs the card (VLM flagged the dark
   variant). Now a 1px warn border (measured present both themes) — crisp in light+dark.
7. **toneColor mute chips**: mute-tone text was c.mute (4.63 bare, 4.09 tinted FAIL) —
   now c.body in both bills/medical-history tonePair and reports.

## MEASUREMENT LEDGER (VLM claims vs DOM truth — the standing pattern holds)

- r05 "caption ~3.3–3.7:1" → measured #5E5E5E = **5.7:1** (overclaim, disproven)
- r02 "fields should be grey fills" → app-wide input law IS white+hairline (auth,
  edit-profile, booking confirm all borderColor: c.hairline) — VLM judged against a
  mis-stated shot context; the fields were never the defect
- r-r04 "back arrow under 44px" → measured exactly **44×44** (styles.backBtn = TOUCH)
- r03 first-take PASSed the chip that MEASURED 3.99:1 — measurement decides, the fix
  stood anyway (VLM softer than the ruler this round)

## VLM LEDGER

First-takes: r01 PASS · r02 FAIL (dual primary — REAL) · r03 PASS (chip as "watch item" —
measured REAL FAIL) · r04 PASS (prep separation note — REAL minor) · r05 FAIL (honesty —
REAL). Retakes: r-r02 PASS ("exactly one strong primary, teal reads as selected-state") ·
r-r03 PASS · r-r04 PASS · r-r05 PASS ("caption honest, chip a real 44px next step").

## GOLDEN PATH + REGRESSION (real prod, pageErrors 0 at every step)

Guest doorway → auth sheet (soft-teal toggle, one ink submit) → B10 sign-in → populated
tracker (fee 18/600 + pay caption + AA chip + bordered prep box) → dark re-shot (amber
9.86:1) → fresh-account empty state (honest caption + labs chip) → bills (honest empty)
→ medical-history (real "Pending" event chip now 4.84:1) → rate (honest empty).
Pull-to-refresh: native-only (RN-web RefreshControl no-op — the standing web-E2E limit).

## HONEST LIMITS

- Completed-with-report state NOT reachable in prod from the app side (no lab-partner
  credentials; statuses advance only lab-side) — the report-open flow (blob→objectURL /
  native share sheet) stays B6-era-verified, untestable this round.
- paymentMode is always 'PayOnCollection' in today's contract; the renderer maps future
  modes honestly (paymentLabel) instead of hardcoding.
- Sandbox reset #10 hit at round start (Aturseva-Apk wiped) — recovered zero-loss at
  48fe54a; the e2e proxy needed recreation + an Authorization-header forward fix
  (login 200'd but patient GETs 401'd — B8-era boot script had forwarded it; my .mjs
  recreation hadn't).

## EAS delivery (B14 OTA)

After commit: `eas update --branch preview --environment production` — group + ids in the
worklog; dist re-exported after (Round-34 gotcha law) and :8090 re-verified 200.
