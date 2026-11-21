# APK-B11 — BOOKING-JOURNEY DEEP POLISH (UI/UX law round)

**App repo:** Aturseva-Apk · **Base:** 3c9d3ab (B10) → this commit · **Date:** 21 Nov 2026
**Owner GO:** "Go ahead for further development" + **UI/UX non-negotiable directive** — this round IS that directive made code.

## Method (the owner's bar, operationalized)

Full-journey E2E sweep (onboarding 3 slides → city → Home → Rajesh recap → slot sheet →
confirm → token → queue → cancel sheet → bookings tab — 15 screenshots), then a STRICT
VLM audit on every key screen (senior-reviewer rubric), every VLM claim re-measured in
the DOM (house law: VLM says, measurement decides), then a fix-loop with retakes until
PASS. 10 VLM audits total: 6 first-takes (2 PASS, 4 FAIL), 3 retakes + 1 second retake —
all FAILs healed to PASS.

## Audit findings → fixes (all VLM claims measured before coding)

1. **Home rail-card truncation** (FAIL → PASS). Measured: 13 truncated nodes; the most
   common specialty in India — "General Physician" (97px needed) — got 83px and
   ellipsized on the FIRST card patients see. Fix: rail cards 232 → **264px**
   (`skeleton.tsx` CARD_W, shared by doctor + hospital rail). After: 4 truncated nodes
   remain (rare long QA names — honest `numberOfLines={1}` ellipsis), "General
   Physician" truncation = **0**.
2. **Slot-grid touch law violation** (FAIL → PASS). Measured: slot pills **32px** —
   under the app's own 44px TOUCH law (doc 04) in the most-tapped grid of the whole
   app. Fix: `minHeight: TOUCH` + skeleton matched. DOM-verified 44px.
3. **Slot-state grammar** (FAIL → PASS after 2nd retake). Available slots were
   soft-grey filled (same family as closed) — weak open affordance; unselected confirm
   gave no hint. Fix: AVAILABLE = **white pill + hairline ring**; closed/past stay
   grey + faded + line-through; SELECTED = teal ring + teal soft fill (measured
   rgb(15,118,110) border / rgb(204,251,241) fill); footer hint "Pick a time to
   continue" replaces silence when unselected.
4. **Token-screen action hierarchy** (FAIL → PASS). Was a flat 3-button stack (no
   primary), inconsistent rhythm, red-iconed "quiet" cancel (louder than quiet).
   Fix: ONE primary when upcoming (**Track queue** filled ink 52px), **Share token**
   soft secondary (primary slot when the visit is done); "Book again" centered chip;
   **Cancel = QuietAction tone=error** — text-only muted red, no icon (house
   `press.tsx` QuietAction gained an additive optional `tone` prop). Timeline done
   steps now carry **white checkmarks inside teal dots**.
5. **Patient-facing footers de-internalized** (home + profile): "Aturseva v0.3.0 ·
   APK-B10" → **"Aturseva v0.3.0"** — internal batch labels stay in evidence/docs,
   never in patient UI.
6. **Doctor-profile sticky CTA clearance** (measured 12px) → bottom padding 12→20px.
7. **Confirm CTA echoes the fee**: "Confirm booking · ₹300" — the decision's price
   rides IN the button (same law as the recap CTA).

## E2E (PROD via :8090 → aturseva.com, iPhone 390×844)

- Full golden journey re-run on the fixed bundle: onboarding → Delhi → Home (64 visits
  live) → Rajesh recap → slot sheet (Tomorrow, 32 slots, 44px pills) → select 09:30
  (teal selected state) → confirm sheet (fee-echo CTA) → **guest booking #LYAABA POST
  201** → token screen honest pending state → **cancel via the new quiet door: sheet →
  "Yes, cancel it" → honest "No token — cancelled"** state captured.
- Identity law observed live (honest, documented not fixed): an earlier journey
  booking typed name "B Eleven Tester" with an EXISTING mobile (9876500011) → server
  resolved the patient to the record that owns that mobile ("Vikram Recent") and the
  token screen displayed the resolved name truthfully. Same-law demonstration as R38;
  the app never fabricates an identity.
- Bookings tab auto-lookup regression: Upcoming (1) → Dr. Rajesh Mon, 23 Nov 09:00.
- pageErrors **0** throughout.

## VLM ledger (10 audits)

First-takes: j05 home **FAIL** (truncation ×5 real) · j06 recap-profile FAIL
(overstated — scrim/handle exist; real: CTA clearance 12px, fixed) · j09 slots
**FAIL** (32px pills real; state grammar weak) · j10 confirm **PASS** (minor: CTA fee
echo — taken) · j11 token **FAIL** (flat stack, loud cancel, weak timeline) · j12
queue **PASS**. Retakes: j17 home **PASS** ("all four previously failed items
resolved") · j18 token **PASS** ("hierarchy, rhythm, cancel treatment, progress
indication now meet spec") · j19 slots FAIL (state grammar not visible in frame →
implemented + second retake) · j20 slots **PASS** ("no functional or accessibility
defects remain"). Non-blocking notes logged honestly (Tomorrow-closed chip reads
disabled — it is disabled [Sunday closed]; date-label mix cosmetic).

## Gates

tsc strict **0** · eslint full-repo **0/0** · dist re-exported ×2
(EXPO_PUBLIC_API_BASE="") · :8090 serving the final bundle · no new routes · zero web-repo changes.

## Honest limits

- No OTA / no new APK (EXPO_TOKEN standing loss since reset #4 — now FIVE-for-one with
  febe3a99 link + B9/B10/B11 OTA + tunnel when the owner supplies one).
- Sandbox reset #7 at round start — fully recovered (re-clone 3c9d3ab, 786 pkgs,
  dist re-export, :3000/:8090/:8081 up; tunnel auth-blocked as standing).
- The recap-profile VLM's "add sheet chrome" claim was DISPROVEN by code+DOM (scrim +
  grab handle exist); its real finding (CTA clearance) was measured and fixed.

## Files

skeleton.tsx (CARD_W 264) · slot-sheet.tsx (TOUCH pills + state grammar + footer
hint) · booking/[id]/index.tsx (action hierarchy + checkmark timeline + quiet
cancel) · press.tsx (QuietAction tone prop) · doctor/[id]/index.tsx (CTA padding) ·
doctor/[id]/book.tsx (fee-echo CTA) · (tabs)/index.tsx + profile.tsx (footer) ·
evidence pack: 20 screenshots + 10 VLM audits + this summary.
