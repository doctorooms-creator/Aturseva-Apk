# APK-B7 PART 2 — DOCTOR TRUST DEPTH (evidence pack)

> Batch: APK-B7 Part 2. App repo `e360382 → <this commit>`. Owner GO
> "further development" after B7 Part 1. ZERO web-repo changes (all
> three endpoints are existing public read-only wrappers — doc 14
> additive law intact, G2 intact).

## What landed (S5 doctor profile depth — 2 new zones + reader)

| Zone | What | API (public, no auth) |
|---|---|---|
| Ratings texture | Consultation / Wait time / Staff score rows inside the Ratings card — each row ONLY when that dimension has real rated data (> 0); caption "Rated by N patients after their visits". **The OUTPUT side of the B6 rate flow** (patients rate these three after a visit) — the loop is now closed app-side. On prod today NO doctor has sub-scores → rows render for none (honest seam; appears when real visits are rated). | GET /api/public/doctor/[id]/ratings |
| Health tips | The doctor's published posts — hide-if-empty ABSOLUTE (0 posts = not even a heading). Row: cover thumb (http-gated) + title + labeled meta "Blog · 1 min read · 15 Nov" + chevron. | GET /api/public/doctor/[id]/posts |
| PostSheet reader | Bottom sheet: title + meta (author · type · min read) + full body as CLEAN PLAIN TEXT (adapter strips the server's sanitized HTML → paragraphs, entities decoded) + Close chip. Skeleton while loading, honest error + Try again. | GET /api/blog/[permalink] |

New file: src/components/doctor-depth.tsx (RatingTextureRows +
DoctorPostsZone + PostSheet). Adapters: getDoctorRatings /
getDoctorPosts / getBlogPost + htmlToText (src/lib/api.ts, contracts
read from the monolith verbatim — blogImg http-gate mirrors the
doctor-photo honesty law).

## Web-E2E results (PROD via :8090, iPhone 16, session b7p2)

1. Dr. QA ProdOnco profile (has 2 REAL published posts): "Health tips"
   section + 2 rows — "Chemotherapy: five things patients get wrong"
   and "Cancer care: what the first oncology consultation covers",
   both "Blog · 1 min read · 15 Nov" with cover images rendering.
   Booking CTA "Book appointment — ₹300" intact below.
2. PostSheet: opens with the FULL real article as clean text —
   paragraphs preserved, quotes decoded ("It is always painful"),
   zero HTML-tag residue; meta "Dr. QA ProdOnco · Blog · 1 min read";
   Close chip works.
3. Dr. Varun Malik profile (1 star-only rating, NO sub-scores): Ratings
   card shows "4.0 · 1 review" — sub-score rows honest-ABSENT (no
   fabricated texture). Health tips zone absent (0 posts) —
   hide-if-empty ABSOLUTE verified twice.
4. Rajesh golden-journey regression: profile loads, "Book appointment
   — ₹300" CTA → slot sheet opens ("32 slots open · 0 booked today ·
   limit 50", Confirm disabled until slot picked) — the booking
   doorway is intact.
5. pageErrors 0 · console: only the known-benign RN-web Animated
   warning.

## VLM audits — 3/3 PASS (vlm-01..03.json)

- vlm-01 posts zone: PASS — consistent card language, rows fully
  labeled, thumbnails aligned, no truncation/overlap. (First attempt
  FAILed because the screenshot frame clipped the rows behind the
  sticky CTA — retake with rows in frame, PASS.)
- vlm-02 reader sheet: PASS — clean text conversion, no markup
  residue, calm tone. Advisory (non-blocking): no explicit ✕ icon —
  but Close chip + scrim tap + grab handle is the house sheet grammar
  (city picker, dept sheet) — consistent by design.
- vlm-03 ratings card: PASS — honest single-review state, no dangling
  divider, "no fabricated sub-scores" called out as correct.

## EAS delivery (this round ships BOTH B7 parts to the APK)

- **OTA update published FIRST**: branch preview, runtime 0.3.0,
  android+ios, group `4d6aa392-dcbc-4a70-b7e7-9bebca9aa449` — any
  installed v0.3.0 APK pulls hospitals browse + doctor depth on next
  load (checkAutomatically ON_LOAD).
- dist re-exported AGAIN after the update (the Round-34 gotcha —
  `eas update` bundles into ./dist and clobbers the web export;
  :8090 verified 200 serving the web HTML bundle after re-export).
- **APK build SUBMITTED**: android preview, build
  `febe3a99-317a-4e43-b4d4-851e0fd4abe3` — **versionCode 2**
  (upgrade-installable over the B6 v0.3.0/vc1 APK), appVersion 0.3.0
  (runtime 0.3.0 — same OTA channel). First submission attempt was
  canceled: `cli.appVersionSource: remote` IGNORES local app.json
  versionCode → vc 1 would have blocked upgrade installs. Fix:
  `autoIncrement: true` added to the preview profile (eas.json) →
  this and all future preview builds auto-increment.
- **ARTIFACT LINK PENDING (honest status, followup fired 2026-11-20
  21:20 UTC)**: the sandbox was reset for a FOURTH time right before
  the followup — `/home/z/.deploy-tokens` (EXPO_TOKEN + VERCEL) was
  wiped, and `eas-cli build:view febe3a99` requires an authenticated
  token, so the build status and the permanent
  `https://expo.dev/artifacts/eas/….apk` link could NOT be verified
  or fetched this round. GITHUB token survived (embedded in the
  my-project git remote) → repo re-cloned at `9e7f556`, zero lost
  commits. Owner action (one time): create a fresh access token at
  expo.dev → Settings → Access Tokens; the next followup then fetches
  + verifies (PK magic bytes + size) + commits the link here and in
  the walkthrough. NOTHING about the build itself was changed by the
  reset — febe3a99 kept building on EAS infra.
- **Meanwhile the owner CAN already test B7**: the OTA update (group
  `4d6aa392…`) is LIVE on the preview branch — the already-installed
  B6 v0.3.0 APK (link in evidence/apk-b6/01-owner-install-walkthrough.md)
  pulls hospitals browse + doctor depth on its next load. The
  walkthrough doc below is written around that path.

## Gates

tsc strict 0 · eslint 0/0 · no new routes (PostSheet is a component —
typed-route set unchanged; web dist export regenerated it) · dist
re-exported EXPO_PUBLIC_API_BASE="" · :8090 serving the B7-P2 bundle.

## Honest limits

- Ratings texture rows are a SEAM: no doctor on prod has sub-scores
  yet, so the rows render for no one today (verified honestly via
  Varun's star-only profile). They appear the moment real visits are
  rated with sub-scores — zero further code needed.
- Post body renders as plain text by design (no HTML/markup in-app);
  post cover images load only when the doctor set a real image URL.
- Prod content caveat: the only doctor with posts today is a QA
  account ("Dr. QA ProdOnco") — the web team already owns prod QA
  data cleanup before store screenshots (noted in B7 Part 1).

## What did NOT land this round (standing owner-blocked items)

- Labs hub (needs 2 new monolith routes + deploy → FRESH VERCEL TOKEN,
  lost in sandbox resets) · push/OTP (Firebase/Twilio) · near-me maps
  (Maps SDK key) · iOS (Apple account) — all accounts-last.
- Patient bills / medical-history screens — deferred to the next
  GO-gated batch (P2 ladder candidates, both APIs already live).
