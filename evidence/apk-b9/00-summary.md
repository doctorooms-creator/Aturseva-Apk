# APK-B9 · IDENTITY PAYOFF + PROFILE EDIT — evidence pack summary

> Repo: doctorooms-creator/Aturseva-Apk · Batch: APK-B9 · Date: 2026-11-21
> Owner GO: "Go ahead further for development" (this session).
> Scope was the R38-documented next-batch candidates — both account-UNBLOCKED
> (no token needed): booking confirm-sheet account pre-fill (the B8
> identity-law payoff) + profile edit (the B5-era deferred).

## 1. WHAT SHIPPED (2 features, ZERO web-repo changes — additive law intact)

### Feature 1 — S7 confirm-sheet identity pre-fill (`src/app/doctor/[id]/book.tsx`)
- Signed-in patient's **name + account mobile arrive PRE-FILLED** (still
  editable — booking for a family member on their number stays possible).
  Pre-fill fills ONLY untouched fields (a fast-fingered user who already
  typed keeps their text — storage never clobbers a human).
- **The identity law, stated at the moment of decision** (the caption under
  the mobile field):
  - same-as-account → "From your account — this booking joins your history."
  - different number → "A different number — this booking stays separate
    from your account."
  - guest / account without mobile → the classic static caption, unchanged.
- Why it matters (B8's documented discovery): the monolith resolves patients
  **BY MOBILE** (`resolvePublicPatient`). Before B9, an account-holder
  booking on the app typed a mobile manually — the account-tie was an
  accident. B9 makes it the DEFAULT PATH, with honest copy when the user
  chooses otherwise.

### Feature 2 — Profile edit (new `src/components/edit-profile-sheet.tsx` + profile.tsx wiring)
- **The account card is now the edit door** (tap → EditProfileSheet) with an
  outlined-pill "Edit" control (pen icon + teal text) on the card.
- Sheet fields: Full name · Mobile · Gender (Male/Female/Other chips — the
  monolith's exact vocabulary). Email read-only (identity — anchor line).
- **Full-triple PUT law**: the app ALWAYS sends name+mobileNo+gender together.
  The monolith route defaults a missing gender to 'Male' and an omitted
  mobile to '' — a partial body would silently rewrite both. The adapter
  documents the trap; the sheet is the disciplined caller.
- Honest seams stated in copy: "Bookings find your account by this number.
  Empty removes it." / "Same profile as the web app — saved everywhere at
  once."
- After save: card + persisted snapshot refresh (`updateStoredUser` — token
  untouched; token+user pair is login's atomic write, this is the edit's).
- Version footer label → APK-B9.

## 2. CONTRACT (read from the monolith BEFORE building — doc 08 law)

`PUT /api/patient/profile` (patient Bearer) `{ name, mobileNo, gender }` →
`{ profile: { id, name, email, mobileNo, gender, profileImg } }` — route
existed in the monolith already (unused by the web frontend; app is its
first consumer — additive, zero web-repo changes). GET variant available
(not needed — the /me snapshot carries the same fields). Gender vocabulary
verified against the web's register + public-book flows: ['Male',
'Female', 'Other']. fetchJson method union extended with PUT (B6 added
PATCH the same way).

## 3. WEB-E2E — PROD via :8090 → aturseva.com (iPhone 16 viewport) — ALL PASS

Fresh prod patient `b9tester1795230576@aturseva.app` (mobile 9742927286):

1. **Register → verify-email message (honest, verbatim) → login** — session
   live, account card renders.
2. **Profile edit round-trip**: EditProfileSheet seeded correctly → name
   "B Nine Tester"→"B Nine Edited" → Save → sheet closes → card shows edited
   name + masked mobile → **RAW Bearer curl cross-check**:
   `/api/patient/profile` AND `/api/auth/me` both return "B Nine Edited" —
   the prod DB holds the edit exactly as the app rendered it. localStorage
   snapshot also refreshed (`updateStoredUser` verified).
3. **Signed-in booking pre-fill**: Rajesh ₹300 → slot 09:00 → confirm sheet
   → name + mobile PRE-FILLED ("B Nine Edited" — the just-edited name,
   proving the whole chain: edit → snapshot persist → pre-fill) + caption
   "From your account — this booking joins your history."
4. **Caption swap**: mobile changed to 9876543210 → caption flips to "A
   different number — this booking stays separate from your account."
   Restored → flips back. (Screenshot 03 + live-region on the caption.)
5. **IDENTITY PAYOFF VERIFIED**: booking submitted with the account mobile
   → token screen (honest "Token being assigned" pending state) → **Medical
   history shows "1 event · newest first" + APPOINTMENT card (Appointment
   with Rajesh · Pending · 21 Nov 2026)** — the booking landed on the
   account's timeline with ZERO code on the timeline side. The seam B8
   documented is now the default path.
6. **Booking cancelled cleanly** (keep/cancel confirmation sheet →
   cancelled state honest: "No token — cancelled").
7. **Guest regression**: signed out → booking confirm fields EMPTY + the
   classic static caption (guest behavior unchanged — progressive
   disclosure law intact).
8. **Post-fix-loop regression** (new bundle): pre-fill + caption intact.
9. pageErrors 0 · console = known-benign Animated warning only.

Screenshots: b9-e2e-01..10 (01 logged-in card · 02 edited card · 03
pre-filled confirm · 04 token · 05 timeline event · 06 guest empty ·
07 bottom-scrolled pre-fix · 08 fixed chip · 09 fixed bottom clearance ·
10 post-fix prefill regression).

## 4. VLM AUDIT — 3 PASS + 1 fix-loop (2 real fixes, 2 claims disproven)

- **vlm-02 (confirm pre-filled): PASS** — "complete, well-aligned, honest
  microcopy, clear fee transparency" (trivial advisories only).
- **vlm-03 (timeline event): PASS** — correct hierarchy, no clipping
  (nitpicks: zone-label contrast could be nudged — non-blocking).
- **vlm-01 (profile, first take): FAIL → 2 REAL FIXES**:
  1. Edit affordance under-designed (bare text+icon reads as a link) →
     fixed: outlined-pill container (canvas + hairline + pill radius, teal
     text + pen icon) — a real control now.
  2. **Sign out clipped 4px behind the tab bar at the scroll limit** —
     B8's scroll-fix padding was 4px short (tab bar measured 48px). Fixed:
     footerPad 24 → 72. Measured post-fix: Sign out bottom edge clears the
     tab bar by **113px** at the true scroll limit. (House lesson: window
     scroll ≠ the RN-web inner ScrollView — scroll the inner div to find
     the true limit.)
- **vlm-01b retake**: "Everything else, including the Edit pill fix,
  passes" — the only remaining complaint was Sign out at the fold at
  scrollTop=0 (content scrolling UNDER the overlaying tab bar mid-scroll —
  standard behavior on every tab screen of this app; at the scroll limit
  it clears).
- **vlm-04 (bottom retake): 1 PASS + 2 claims DISPROVEN by measurement**
  (documented honestly rather than blindly re-rolled):
  1. PASS: "Sign out fully visible with clear gap above the bottom tab bar."
  2. "Version mismatch v0.3.0" — MY PROMPT's error (I typed v0.1.0); the
     app correctly shows v0.3.0. Not a defect.
  3. "Home/Bookings labels cut in half" — DISPROVEN by pixel + DOM truth:
     label DOM bottom = 847 logical px (viewport 852); raw PNG pixel scan:
     glyph pixels end at row 2540 (of 2556), **zero dark pixels rows
     2545–2555** — labels render fully with ~5 logical px clearance. (The
     retake crops themselves clipped glyphs — the analysis, not the app.)

## 5. GATES

- tsc strict: **0 errors** · eslint: **0/0** · no new routes (the sheet is
  a component — typed-route set unchanged) · dist re-exported
  EXPO_PUBLIC_API_BASE="" (relative — CORS law) · :8090 serving the B9
  bundle (APK-B9 footer verified live).

## 6. EAS / OTA — NOT PUBLISHED THIS ROUND (standing owner action)

EXPO_TOKEN still lost since sandbox reset #4 — one fresh token from the
owner (expo.dev → Settings → Access Tokens) unblocks THREE things at once:
the febe3a99 artifact link fetch, a B9 OTA publish (B7+B8+B9 reaching
installed APKs), and the dev tunnel. No new APK build submitted this round.

## 7. HONEST LIMITS

- Real-device behaviour (keystore write, sheet gestures on native) is
  owner-verify — the E2E loop is the web-preview export (standing law).
- The pre-fill reads the local /me snapshot, not a fresh /me call — a
  just-changed profile on ANOTHER device reflects here after the profile
  tab's next focus refresh. Documented seam, not a bug.
- Mid-scroll, rows scroll under the overlaying tab bar on every tab screen
  (RN-web standard; the scroll-limit clearance is what we guarantee).
