# APK-B12 · DISCOVERY-SURFACES AUDIT + POLISH — Round 43

## Scope (the UI/UX law's first full pass over the discovery surfaces)

The surfaces patients use to FIND care had never been VLM-audited (B11's
journey sweep covered booking; B10 covered the data screens). B12 audits
the whole discovery family: doctor search (S4: symptom query, browse-all
doorway, zero-result doorway) · hospitals browse (list + honest-empty) ·
hospital profile + department-doctors sheet · dark trio · home regression.

## Method

Full-journey E2E (:8090 → aturseva.com prod, 390×844, real data only) →
strict VLM audit per screen (10 first-takes) → every claim DOM-measured
(house law: VLM says, measurement decides — it caught VLM overclaims
AGAIN this round) → fix-loop with retakes until PASS or measured-closure.
Sandbox note (reset #8): this instance reaps ALL background processes
between tool calls, so services boot per-call (e2e-boot.sh pattern); the
full E2E loop still runs — proven end-to-end this round.

## Findings → REAL fixes (all DOM-verified after fix)

1. **"0 doctors/hospitals found" count line rendered above the EmptyState**
   (both search + hospitals): redundant noise — the empty state carries the
   zero message. FIXED: count line renders only when total > 0.
2. **Empty-state recovery hierarchy**: the strongest recovery action had the
   same weight as alternates. FIXED: EmptyState gains optional `primary`
   action — "Browse all doctors" (search zero-result) and "All cities"
   (hospitals empty) render as the ONE primary: ink PillButton 44px (house
   grammar: ink = primary actions; teal stays live/selected-only).
3. **Listing-card fee hierarchy**: fee was 16px vs name 15px — imperceptible;
   two VLM takes assumed 18-20px ("the intended design"). FIXED: fee 18px
   bold tabular — the decision number now reads strongest on the card
   (Uber-upfront law: fee visible BEFORE tap). DOM-verified 18px/600.

## Measurement ledger (claims DISPROVEN by DOM measurement)

- Touch targets: Back/city/doorway/Book/EmptyState chips all **exactly
  44px** (VLM estimated 32-40px on 4 screens — false).
- Contrast: EmptyState caption #5E5E5E = **6.48:1**; honesty line = 6.48:1;
  hospital card greys 6.49/5.1:1; **Book chip ink-on-canvasSoft = 17.98:1**
  (VLM estimated "grey-on-grey < 4.5:1", "~2.2:1" — all false).
- Pagination: footer EXISTS below the fold ("Showing 10 of 90"); the
  infinite scroll was exercised to exhaustion — **all 90 doctors loaded
  across 9 pages** (86 mounted, virtualized), honest end line "That is
  every doctor for this search" in view; hospitals: all 12 → same end line.
  (VLM's "missing pagination / dead-end" claims were viewport artifacts.)
- "0-doctor hospitals are a dead end": disproven — their detail pages render
  honest-empty departments + contact.
- Date-chip "Tomorrow disabled" honesty: non-consult days disable honestly
  (schedule source); a consult day (11/24) carried 32 open slots.

## VLM ledger (14 audits: 10 first-takes + 4 retakes + 4 final-bundle re-audits)

First-takes: d01 PASS · d02 FAIL (footer/QA-data claims — measured false /
data-side) · d03 FAIL (0-count line real; chips/contrast false) · d04 FAIL
(0-count line real) · d05 FAIL (QA data; chips false) · d06 PASS · d07 PASS
· d08 PASS · d09 PASS · d10 PASS. Retakes: r01 PASS ("hierarchy now clear")
· r02 PASS · r03 PASS (end-of-list grammar honest) · r04 FAIL-closed
(duplicate "QA City Hospital" = two real prod records — data-side; grey
contrast claims measured 6.49/5.1:1 = AA-pass). Final-bundle re-audits:
d08 PASS; d01/d02/d05 FAILs = re-raised measured-false claims (Book chip
17.98:1 @44px etc.) — closed by measurement, zero new real defects.

## Golden-path regression on the final bundle (real prod data)

Guest booking: search "fever" → Rajesh profile → slot sheet (consult day +
09:00 selected, teal state grammar) → confirm screen (full form incl.
required reason — validation honestly blocks incomplete submissions)
→ POST 201 → token screen: **Booking #8WEFYG · "Request sent · Token being
assigned"** honest pending state, auto-update caption. pageErrors 0.
(E2E mechanics learned: RN-web inputs need native setter + input event;
find-text clicks must be ref-based.)

## Gates

tsc strict 0 · eslint full-repo 0/0 · dist re-exported ×2 · :8090 final
bundle · no new routes · zero web-repo changes.

## Honest limits + data-side owner notes

- EXPO_TOKEN still pending (now unlocks SIX: febe3a99 link + B9/B10/B11
  OTA + tunnel + B12 OTA when built) — no APK/OTA this round.
- **Prod data quality (owner/web-repo domain, honestly logged):** QA-named
  test records visible in patient-facing lists (Dr. QA Onco etc.; QA
  Browser/City/Trial hospitals) + duplicate "QA City Hospital" records.
  The app renders what prod serves — honestly. Cleanup belongs to the
  monolith's data side, not the APK.
- Sandbox reset #8 at round start: full recovery (re-clone 011fd87, 786
  pkgs, dist re-export, per-call service pattern established).

## Files

search.tsx + hospitals.tsx (count-line-at-zero law) · empty-state.tsx
(optional primary action) · listing-card.tsx (fee 18px) · evidence pack:
34 files (22 screenshots + 12 VLM JSONs + this summary).
