# APK-B15 · DOCTOR-PROFILE CONTENT DEPTH (S5 full contract)

**Batch**: B15 · Round 47 · commit (see git log) · app repo Aturseva-Apk
**Scope**: the doctor profile is the app's trust centerpiece — this batch closed the gap between what the monolith's `/api/doctors/[id]` actually SERVES and what the app RENDERED. The contract diff (route read, monolith read-only): six served-but-dropped fields — `reviews` (latest-5 text reviews), `starDistribution` (1–5 histogram), `services` (curated), `procedures` (surgeries, name/note/at), `awardAndRecognition` (awards), `relatedDoctors` (same-specialization). All six now adapted + rendered, every zone hide-if-empty ABSOLUTE.

## Real data landscape (measured first — honesty law)

All 90 prod doctor profiles were probed through the live API before any code was written:
- **reviews / ratings**: exactly 1 of 90 profiles has any (Dr. Varun Malik, Pediatrician, Ahmedabad — 1 review "QA updated" 4★, real prod row).
- **services / procedures / awards**: 0 of 90 profiles carry any — those zones render NOTHING today (contract-complete for when doctors curate; the website already renders them).
- **relatedDoctors**: server always computes top-3 same-spec → renders on most profiles (Varun: Pooja/Rajiv/Neha; Rajesh: 6 other GPs).
- The E2E subjects were chosen from THIS landscape: Varun = the only rich profile; Rajesh = zero-optional-data profile (honest-empty proof).

## Real fixes (each measured before coding, re-measured after)

1. **CONTRACT DEPTH** — adapter `getDoctor` extended (reviews honor anonymity, 'Patient' fallback for unnamed non-anonymous; starDistribution normalized to nonzero rows; awards parsed with the website's parseAwards semantics — JSON array or newline/;/comma text; procedures re-defended; related photo honesty-gated http(s)); screen renders Reviews inside the ratings card (star glyph row 4-of-5 filled ink + text + meta), Similar doctors zone (60px rows, avatar/initials, spec·city meta, fee right-aligned tabular, chevron, tap → profile push), Services tags / Surgeries & procedures / Awards zones (hide-if-empty — 0/90 data today, so invisible in prod; code verified by tsc + structure).
2. **EXPERIENCE NORMALIZATION (measured on prod)** — 71 of 90 rows store experience as "7 years" → the profile line rendered **"7 years yrs"**; adapter now normalizes to the bare number. Measured after: "7 yrs · MBBS, DCH, MD (Pediatrics) · Ahmedabad, Gujarat".
3. **HONORIFIC PARITY (audit catch)** — prod names are mixed bare/prefixed ("Rajesh" vs "Dr. Pooja Iyer") → inconsistent identity + monograms ("R" vs "DR"/"DP"); the website renders "Dr. X" on the profile page, the app now mirrors displayName() at the adapter (profile + related only — the website's exact scope). Measured after: "Dr. Rajesh" / "Dr. Varun Malik".
4. **QUIET-STATS GRAMMAR (audit catch)** — "1 visits" → singular/plural honored. Measured after: "1 visit · 0 patients on Aturseva" (Varun), "17 visits · 4 patients" (Rajesh).

## E2E (real prod, :8090 → aturseva.com proxy, 390×844, pageErrors 0)

Varun (rich): review row renders (stars + "QA updated" + "QA Mobile Patient · 18 Oct 2026"), Ratings card "4.0 · 1 review", Similar doctors 3 rows (a11y "View Dr. Pooja Iyer, Pediatrics"), Practices at Shalby/CIIMS, Clinic hours Thu/Fri/Sat, NO services/procedures/awards headings (honest-empty for this doctor). Rajesh (zero-data): no Ratings card, no optional headings, "2 yrs · MD · Gandhinagar, Gujarat", Similar doctors (real GPs), fee ₹300 everywhere. Dark mode both. **Booking regression**: profile CTA → slot sheet (Next open day · 11/23 → 09:00, teal selected state) → confirm screen (fee-echo "Confirm booking · ₹300") → POST 201 → token screen "Booking #DRHSNR · Request sent" honest pending. Pull-to-refresh native-only (standing RN-web limit).

## VLM ledger (strict senior-reviewer rubric; VLM says, measurement decides)

- **First-takes 3 PASS / 3 FAIL** — every FAIL claim measured-closed:
  - p01 "₹350/₹400 fee mismatch" → DOM: fee block ₹350 36px = CTA ₹350 (CONSISTENT; the ₹400 the VLM saw was a similar-doctor's own fee peeking at the fold edge — different doctor, correct data).
  - p01/p03/p04 "missing/clipped sections" → capture artifact: an RN-web nested ScrollView cannot extend document.body, so --full shots are mid-scroll frames. Measured: all sections present in DOM; at max scroll the last row clears the sticky CTA by **48px** (711 vs 759).
  - p05/p06 non-blocking "sub-44px back" / "borderline grey" → measured back exactly **89×44**; greys **#5E5E5E 5.7:1** and **#6E6E6E 5.1:1** (AA).
- **Retakes 4/4 PASS** (multi-frame unions: scrolled top/mid/bottom triptychs — the honest fix for the capture artifact): r-p01 "disciplined, honest long-scroll profile... fee echo consistent, empty sections correctly hidden, no truncation or contrast failures"; r-p02 dark PASS; r-p03 dark zero-data PASS; r-p04 light zero-data PASS.
- **Final-bundle retakes (post fixes)**: f-p02 PASS ("clean page-ending rhythm... no blocking defects"); f-p01 FAIL-closed-by-measurement — the flagged review text is a REAL prod database row the API serves (app renders real server data faithfully; prod QA-named records = owner data-side, standing B12 ruling), and the quiet-stats fix was measured fixed in the DOM ("1 visit · 0 patients").

## Honest limits

- Services/Surgeries/Awards zones ship invisible in prod today (0/90 doctors carry that data) — code + types verified, render awaits real curation; zero fabrication.
- Star histogram renders only with ≥2 distinct nonzero stars (a 1-star histogram would echo the summary line) — 0 profiles qualify today.
- The Varun review IS QA-created test data in the prod DB — flagged every round since B12 as the owner's data-side cleanup domain; the app must not filter real server data.
- Pull-to-refresh is a no-op stub on RN-web (native-only, standing limit).
- No new routes; ZERO web-repo changes (monolith read-only — route studied for the contract only).

## Gates

tsc 0 · eslint full-repo 0/0 · dist re-exported ×3 (post-fix, post-audit-fixes, post-OTA) · :8090 verified · VLM loop closed (retakes + finals PASS / measured-closed) · OTA published to `preview` (runtime 0.3.0) — see worklog Round 47.
