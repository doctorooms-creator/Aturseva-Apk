# APK-B13 evidence — first-five-minutes audit + polish (onboarding + city picker + first home arrival)

Scope: the "first five minutes" family — the last never-VLM-audited interactive (the
city-picker sheet, used on 5 surfaces: onboarding / home / hospitals / search / profile),
the onboarding 3-slide first run, the onboarding→city→home handoff, and a home-rail
regression that the sweep caught along the way.

Method (standing): full-journey E2E on real prod data (:8090 per-call boot, 390×844,
agent-browser) → 16 strict VLM first-takes → EVERY claim DOM-measured (house law: VLM
says, measurement decides) → real fixes → retakes until PASS. 26 verdicts total.

## REAL fixes shipped (each measured before coding, re-measured after)

1. **Sheet auto-scroll-to-current on open** (the headline fix).
   Measured defect: 880px list in a 320px window opened at scrollTop 0 — a patient whose
   current city sat below the fold (Kochi #17, Guwahati #20…) reopened the sheet with
   ZERO confirmation of their current choice (check row 560px deep).
   Fix: the sheet scrolls the current row into view the moment it opens.
   Re-measured: Guwahati current → row top 724, visible, list at 560 (clamped bottom);
   Kochi current → row top 636, visible. Works from every entry surface (onboarding, home,
   profile).

2. **City-field affordance** (onboarding slide 3): bare quiet pill → chevron-down +
   hairline ring. The dark pair was near-invisible (#1A1A19 fill on #0C0C0C canvas);
   the control now reads as tappable in both themes. Measured: field 48×342, fill
   #F4F4F2, border 1px #E7E7E7, radius 999, chevron 18px #6E6E6E.

3. **Committed-city state**: chosen city renders ink/600 (was grey — read like a
   placeholder). Measured: rgb(10,10,10)/600/15px vs grey placeholder.

4. **Sheet caption honesty**: "Doctor lists and suggestions adapt to your city"
   over-promised (the home rail is global by design — VLM flagged the mismatch as a
   "honesty failure"). Now: "Search and hospitals start with your city filter." —
   states exactly what adapts (search + hospitals default filters, measured on prod).

5. **Inactive progress dots**: hairline → mute (non-text 3:1 law; hairline measured
   1.24:1 on both canvases). Measured: inactive #6E6E6E (5.1:1), active ink.

6. **Home doctor-rail cards restructured — NO-TRUNCATION law enforced** (the sweep's
   regression catch): 264px cards gave the name/spec column ~112px beside avatar + fee
   columns → MEASURED ellipsized nodes on home ("Dr. QA ProdOnco", "IVF & Fertility
   Specialist", "Dr. QA ProdNephro", "Dr. QA ProdPsych"). Restructured: fee (₹ + "visit")
   moved to a bottom row of its own, card 264→300px, name/spec column ≥200px (longest
   real specialization = 169px). Re-measured: 0 ellipsized nodes, card 300×122,
   fee 15px/600 tabular. Skeleton mirrored.

## Measurement ledger (VLM overclaims disproven AGAIN — the B10-B12 pattern)

- "undersized Skip" (×4 screens): measured exactly 44×44 → closed.
- "caption ~3.3:1": measured #5E5E5E on white = 7.0:1 → closed.
- "later link ~2.9:1": measured #6E6E6E on white = 5.1:1 → closed.
- "dark row text fails contrast": measured #B8B8B8 on #0C0C0C = 9.7:1 → closed.
- "dark later link fails": measured #8C8C8C = 5.7:1 → closed.
- "Mumbai missing from list": the sheet auto-scrolled to the current row — expected
  behavior, my audit-context error, not an app defect → closed.
- "active dot is black not teal": design-law conformant (teal = live/selected only,
  doc 03) → closed as intended behavior.

## Verdict ledger

First-takes (16): o1 PASS · o3 FAIL (field affordance + dots — real) · c1 PASS ·
c2 PASS · c3 FAIL (current-selection invisible — real, the headline defect) ·
o4 PASS-with-notes (placeholder-voice — real polish) · o5 PASS · o6 PASS-with-notes ·
h1 FAIL (home-rail truncation — real, 4 measured nodes; "Ahmedabad vs Delhi" part
closed by caption-honesty fix) · c4 PASS · h2 FAIL (same caption-honesty theme) ·
c5 FAIL (test artifact — click-missed sheet) · o7d PASS-with-notes (dots — real) ·
o8d FAIL (dark field invisibility — real) · c6d FAIL (contrast overclaims — measured
false) · h1b FAIL (repeat of h1 claims).

Retakes (8): r-o3 PASS · r-o4 PASS · r-c1 PASS · r-c3 PASS ("auto-scrolls so Guwahati
is on-screen with its teal pin and check — no regressions") · r-c5 FAIL (my stale audit
context + artifact) · r-h1 FAIL (sheet left open — harness artifact, re-shot) ·
r-o8d PASS · r-c6d PASS.

Retakes-2 (clean re-shots): r2-h1 PASS ("no truncation, fee row clear, calm hierarchy,
correct Kochi footer") · r2-c5 PASS ("Kochi visibly checked, sheet over scrimmed
profile").

## Golden path (first-five-minutes chain, real prod data, pageErrors 0)

True first run → onboarding 3 slides → city sheet → pick Guwahati → committed field →
Get started → home first arrival (footer reflects city) → footer change → sheet →
city change same-visit (footer updates live, no reload) → profile → City row → sheet
(auto-scrolled to current) → pick → all steps `$AB errors` clean.

Gates: tsc 0 · eslint 0/0 · dist re-exported · no new routes · zero web-repo changes.

Honest limits: EXPO_TOKEN still pending (6-for-one: febe3a99 link + B9/B10/B11/B12 OTA
+ tunnel). Prod QA-named test data still visible in patient lists (owner data-side).
Home rail remains global-by-design (honest caption now says what adapts).

## EAS delivery (Round 45, 2026-11-22 — owner-supplied EXPO_TOKEN unlocked)

The B13 bundle (this round's code, commit `fda04bb`) is now OTA-delivered to every
installed v0.3.0 APK:

- **OTA update PUBLISHED**: branch `preview`, runtime 0.3.0, android+ios, group
  `16564890-2676-4289-b6be-1a1e2232fdc7` (android update `01a2018a-8b1f-7dbe-9577-89330d83c277`).
  checkAutomatically ON_LOAD — installed v0.3.0 APKs pull B7→B13 (all batches in
  one update) on next app open. Dashboard:
  https://expo.dev/accounts/aturseva-team/projects/aturseva-app/updates/16564890-2676-4289-b6be-1a1e2232fdc7
- **febe3a99 (B7-P2 versionCode-2 APK) link VERIFIED** in evidence/apk-b7-p2 (the
  5-round-pending artifact): finished 2026-11-20 23:20 UTC · PK magic `50 4b 03 04` ·
  98,985,715 bytes —
  https://expo.dev/artifacts/eas/kKDu5YDabmIPSeWc_IX9FcplcvXLL3ytVIrVidyV_O8.apk
- **Dev tunnel RESTORED** (was auth-blocked since reset #4): Metro :8081 + signed
  tunnel live and verified (public URL 200 · `/status` packager-running · full
  entry bundle served 200 / 6 MB through the tunnel). Sandbox-reaper risk honestly
  noted — the durable owner path is the OTA (cloud-delivered, sandbox-independent).
- dist re-exported after the update (the Round-34 gotcha law: `eas update` clobbers
  ./dist; :8090 re-verified 200 web-HTML after re-export).
