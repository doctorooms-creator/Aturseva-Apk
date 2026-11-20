# APK-B7 — P2 PART 1: HOSPITALS BROWSE (evidence pack)

> Batch: APK-B7 (P2 ladder, first account-UNBLOCKED item). App repo
> `557b4d1 → <this commit>`. Public APIs already live on prod — ZERO
> web-repo changes needed (doc 14 additive law intact). Guest-safe:
> hospitals browse needs no account (doorways-never-walls law).

## What landed

| Surface | What | API (public, no auth) |
|---|---|---|
| HOME rail | "Hospitals" section + 6-card rail + "See all" doorway — hide-if-empty ABSOLUTE (guest/error/empty render NOTHING) | GET /api/hospitals?limit=6 |
| /hospitals (stack) | Browse list: back chip, search field (submit = fresh first page), city filter + CityPickerSheet, honest count line, pagination (10/page), skeletons, 0-result doorway, degraded = cached + amber strip | GET /api/hospitals?search=&city=&page= |
| /hospital/[id] (stack) | Profile: avatar hero, honest fact pills (non-zero only — never "0 beds"), about, facilities pills, departments rows → department-doctors BOTTOM SHEET (avatar rows, ₹fee, availability), contact card + Call chip (tel:) | GET /api/hospitals/[id] · GET /api/hospitals/[id]/departments/[deptId]/doctors |

New components: HospitalRailCard + HospitalListCard + skeleton
(src/components/hospital-card.tsx). Adapters: getHospitals /
getHospitalProfile / getDepartmentDoctors (src/lib/api.ts, contract
read from monolith verbatim).

## Contract gotchas (verified on prod, encoded in adapters)

- LIST envelope's data[].id is the OWNER user id — routing id is
  data[].hospital.id (adapter maps it; E2E proved detail loads).
- facilities/gallery arrive JSON-encoded ("[]") — parsed defensively.
- Departments can honestly have 0 doctors ("No doctors listed yet").
- City filter is case-sensitive server-side (CityPicker sends
  proper-case values — matches prod casing).

## Web-E2E results (PROD via :8090, session b7e2e, iPhone 16)

1. HOME: Hospitals rail with 6 REAL names (CIIMS Hospital · QA Browser
   Hospital · QA City Hospital · …), "See all" chip. Trust strip live:
   "97 doctors · 13 hospitals · 59 visits booked — live".
2. /hospitals: "12 hospitals found", pagination "Showing 10 of 12" +
   Show more; search field + city chip.
3. Search "CIIMS" → "1 hospital found" → CIIMS card; footer "That is
   every hospital for this search". 0-result doorway verified
   accidentally (typo query) → honest empty + Clear search chip.
4. Hospital profile (CIIMS): hero, facts "2 departments", contact
   address + Call 9106096746 chip (tel:).
5. Departments: "General Medicine — 2 doctors · Floor Ground · Room
   OPD-1" / "Cardiology — No doctors listed yet · Floor 2 · Room 101".
6. Dept sheet: "Dr. Varun Malik — Pediatrics · Senior Consultant —
   ₹1,000 visit · Available · ★ 4.0 · 1" + "Rajesh — General
   Physician · Senior Consultant — ₹1,000 visit · Available".
7. Doctor row → doctor profile loads (booking doorway regression OK:
   "Book appointment — ₹350" CTA intact).
8. pageErrors 0 · console: only the known-benign RN-web Animated
   warning.

## VLM audits — 5/5 PASS (vlm-01..05.json)

First pass: 4/5 (vlm-04 FAIL — department caption "No doctors listed
yet · 2 · 101" unlabeled values + weak call affordance). FIXED: Floor/
Room labels + Call as Chip with phone icon + departments pluralization
("1 department"). Re-audit vlm-04: PASS. Advisories judged acceptable
(non-blocking): "Floor Ground" phrasing, light-gray city line.

## Data-level observations for the web team (report-only, no app bug)

- Dept-doctors sheet fee (₹1,000) vs doctor profile fee (₹350) — the
  two endpoints return different fee fields (doctorLinks vs profile).
- A Pediatrics doctor is listed under a "General Medicine" department.
- Prod contains QA/test hospitals (QA Browser/City/Trial) — consider
  cleanup before Play screenshots.

## Gates

tsc strict 0 · eslint 0/0 · typed routes regenerated (/hospitals +
/hospital/[id]) · dist re-exported EXPO_PUBLIC_API_BASE="" (relative —
CORS law) · :8090 serving B7 bundle.

## Honest limits (standing law)

- Phone call action opens tel: only on a real device — owner-verify.
- Gallery images: prod hospital images are empty strings → Avatar
  initials hero is the honest default (no broken image chrome).

## What did NOT land this round (owner-blocked)

- Labs hub: needs 2 NEW additive monolith routes (/api/public/labs +
  [id]) — written only after a fresh VERCEL token arrives (lost in
  sandbox resets; deploy runbook in worklog) so the app can hit them
  on prod. App-side screens = next round after deploy.
- Push/OTP/Maps: blocked on Firebase / Twilio / Maps credentials.
- iOS: Apple developer account.

## Owner checklist (B7 acceptance — on the NEXT APK build)

1. HOME → Hospitals rail with real hospitals + "See all".
2. /hospitals → search + city filter + pagination.
3. Hospital profile → departments → doctor sheet → doctor profile.
4. Call chip → dialer on device.
5. Guest (logged out) sees everything above — no account needed.
