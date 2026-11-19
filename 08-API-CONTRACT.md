# 08 — API CONTRACT — app↔brain bond (the load-bearing doc)

> Status: DRAFT v1 (Round 27) — owner review pending. The demo-agent's biggest miss
> was exactly this doc — we lock it BEFORE code so the app never silently breaks.

## 1. Contract laws

1. **Inventory below is the app's ONLY data surface.** App calls nothing outside it.
2. **Additive-only evolution:** existing endpoints' behavior NEVER changes for the app
   (new params = optional; new fields in response = additive). New needs → NEW endpoint
   (built in WEB repo via normal GO batch + prod verify — owner discipline intact).
3. **Change protocol:** any web-repo change touching a row below → bump this doc's
   version + date + CHANGE entry; app batch reads the diff before building.
4. **Contract version:** v1 (2026-12-07). Bump on any breaking-or-behavioral change.
5. Web repo remains the only place these endpoints live — app repo has ZERO backend code.

## 2. P0 endpoint inventory (all EXISTING in prod today — zero new backend)

| # | Endpoint | Method | Auth | Used by | Notes (shape highlights) |
|---|---|---|---|---|---|
| 1 | `/api/doctors?search=&city=&specialty=&page=` | GET | public | S3/S4 | 3-lane search (name+spec+symptom dictionary); returns list: id, name, spec, fee, rating, avatar, wait-hint, regNumber |
| 2 | `/api/doctors/[id]` | GET | public | S5 | profile + schedule table + rating summary |
| 3 | `/api/public/slots?doctorId=&date=` | GET | public | S6 | per-slot: time, capacity-left |
| 4 | `/api/public/book` | POST | public (rate-limited) | S7 | {doctorId, slot, name, phone, city} → {ok, bookingId, status}; validation 400s honest |
| 5 | `/api/public/booking/[id]/token` | GET | public | S8 | token number, position, queue meta |
| 6 | `/api/public/booking/[id]/leave-ping` | POST | public | S9 | "5 min me pahuncha" ping |
| 7 | `/api/queue/doctor/[doctorId]` | GET | public | S9 | live queue: position, people-ahead, wait-estimate, leave-by, state |
| 8 | `/api/public/stats` | GET | public | S3 | live counts (trust strip) + P1: `app_min_version` meta (additive idea, web GO batch when needed) |
| 9 | `/api/public/doctor/[id]/ratings` | GET | public | S5 | summary + last reviews (P1 use) |
| 10 | `/api/analytics/track` | POST | public | app-wide | same event taxonomy, `surface: "app"` tag (P1) |

## 3. P1 additions (auth + records)

| # | Endpoint | Method | Auth | Notes |
|---|---|---|---|---|
| 11 | `/api/auth/login` (+register/forgot/reset) | POST | — | web credentials flow — **B4 SPIKE: RN session persistence (cookie jar) vs additive `/api/auth/session-token` bearer endpoint (DDL-free, web GO batch). Decision locked in B4 with evidence.** |
| 12 | `/api/auth/me` | GET | session | account block |
| 13 | patient bookings list / `[id]` / cancel | GET/POST | session | My Bookings + Detail |
| 14 | patient notifications + read-marking | GET/POST | session | S16 |
| 15 | lab-reports patient list / `[id]` file | GET | session | S18 |
| 16 | rate submit (`/api/public/rate/[ref]` pattern reuse) | POST | public | S19 |

## 4. Envelope & error conventions (app-side expectations)

- Success envelope stays per-endpoint as web serves today (app never assumes —
  adapter functions in `lib/api` map response → typed model; adapters are the ONLY
  place raw JSON is touched → contract drift surfaces in one file, not 20 screens).
- Errors: HTTP status + `{error}` human message where web provides; app maps to
  retry/timeout/rate-limit/offline classes (doc 04 law 8).
- Timeouts: 8s default (doc 04 law 15); retry: 1 auto + manual.
- Rate limits: shared with web public surface (existing limiter) — app NEVER adds
  pressure beyond a human pace (adaptive polling law, doc 02 §4).

## 5. What the contract explicitly FORBIDS

- App reading/writing DB directly (never — doc 02 law).
- App inventing derived state that contradicts server (e.g., computing availability
  client-side — counts come from API only).
- Web-side breaking changes without doc bump (the demo-agent lesson made law).
