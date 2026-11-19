# 02 — SYSTEM ARCHITECTURE — the Uber-competition blueprint

> Status: DRAFT v1 (Round 27) — owner review pending. Planning doc, not code.
> Parent index: `00-MASTER-PLAN-POINTS.md` (A3, E22 part). Answers owner asks:
> "monolithic ya microservices — tum decide karo", "Uber ko architecture level me compete karna hai".

## 1. THE headline decision: Monolith ya Microservices?

**DECISION [LOCKED-PROPOSAL]: "One brain, many hands" — MODULAR MONOLITH + thin client.**

Owner-friendly explanation (kyun — simple bhasha me):

- **Monolith = ek hi bada system jo sab kaam karta hai** (humara existing Next.js + Supabase). **Microservices = 20 chhote-chhote alag systems** jo aapas me baat karte hai.
- **Microservices sirf tab sasta padta hai jab Uber-jaisa scale ho** (hazaaron engineers, crores rides/hour). Uber khud shuruat me monolith tha (Rails) — split KARNA PADA tha scale ki wajah se. Hum us stage pe nahi hai — hum pehle user ke liye banate hai.
- Humare stage pe microservices = **3× cost, 5× moving parts, 10× failure points, zero customer value.** Na paisa hai na need. Non-technical owner ko 20 servers ke alerts handle karna padta. Honest answer: nahi.
- **LEKIN hum "microservices-ready" banate hai** (ye cheez microservices ki asli seeking hai): brain ke andar clean **service seams** rakhte hai — booking engine, queue engine, notification engine apne module-lines pe hai — taaki agar kabhi scale bole "queue alag karo", to ek seam ke saath split ho, app rewrite NAHI.

**App is a CLIENT, not a new server.** Phone me sirf UI hai — zero business logic,
zero database, zero secrets. Sab kuch existing production API se (ground rule G2:
ZERO new backend). Naye paisa/khana: zero.

## 2. System diagram (as-is + app added)

```
      [PATIENT]                    [PATIENT]                 [OWNER/ADMIN]
          │                            │                          │
   ┌──────▼───────┐            ┌──────▼───────┐            ┌──────▼──────┐
   │  WEB (PWA)   │            │  RN APP      │            │  WEB ADMIN  │
   │  Next.js     │            │  Expo RN     │            │  Next.js    │
   │  browser     │            │  thin client │            │  browser    │
   └──────┬───────┘            └──────┬───────┘            └──────┬──────┘
          │        PUBLIC API CONTRACT │ (doc 08 — additive-only) │
          └────────────┬───────────────┴──────────────────┬──────┘
                 ┌────▼─────────────────────────────────┐ │
                 │   MODULAR MONOLITH (Vercel, live)     │ │
                 │   Next.js API routes (modules:        │ │
                 │   doctors · booking · queue/token ·   │ │
                 │   leads · notifications · analytics) │ │
                 │   rate-limited public surface        │ │
                 └────┬───────────────┬──────────────────┘ │
                      │               │                    │
              ┌───────▼──────┐   ┌────▼─────────┐   ┌──────▼───────┐
              │ Supabase     │   │ Realtime svc │   │ Vercel deploys│
              │ Postgres (   │   │ (queue/live  │   │ (GitHub push │
              │ single DB,   │   │  updates; P0 │   │  = web repo) │
              │ owner-DDL    │   │  app = poll; │   └──────────────┘
              │ discipline)  │   │  P1 socket)  │
              └──────────────┘   └──────────────┘
```

Key topology facts (all already true today):
- Web repo → GitHub push → Vercel auto-deploy → prod (doctorooms-hms.vercel.app). App repo NEVER touches this pipeline (doc 14 safety law).
- Realtime service already exists separately (seam #1 proven). App P0 uses **adaptive polling** of queue API; socket attach is P1 seam.
- Supabase DB is the single source of truth. App NEVER writes to DB directly — only through API routes (security + contract law).

## 3. The 8 architectural laws that make it Uber-class

(Uber compete karne ka raasta unka INFRA copy nahi — unke LAWS apna karke, apne domain me better karna.)

| # | Law | In Uber | In Aturseva app |
|---|---|---|---|
| 1 | **One brain** | one backend of record | single prod API is the ONLY source of truth; app holds no state that matters |
| 2 | **Thin client** | app = dumb UI, server smart | app = pure UI; every rule (slot availability, queue math, fee) comes from API → updates reach users WITHOUT store updates |
| 3 | **Contract-first** | internal versioned APIs | doc 08 locked table; additive-only evolution; app checks contract before every batch |
| 4 | **Live state is the protagonist** | the map | the LIVE QUEUE screen (big token, people-ahead, leave-by) — our strongest visual surface |
| 5 | **Fail-safe defaults** | graceful offline | every screen has cached-last-good + banner + one-tap retry (doc 09) |
| 6 | **Realtime seam** | driver location stream | P0 adaptive poll (60s→30s foreground) — battery-friendly; P1 socket attach at existing seam |
| 7 | **Additive-only evolution** | API never breaks clients | no existing endpoint behavior ever changes for the app; new needs = NEW endpoints (web code, web GO batch, owner discipline intact) |
| 8 | **Horizontal client scaling** | web+app+iOS on same brain | web + RN app (same API, same DB, same deploy) — user growth bina server-change ke |

## 4. Request lifecycle — a booking, end-to-end (P0 golden path)

```
1. Home: "fever" chip tap
   → GET /api/doctors?search=fever (symptom dictionary server-side, live)
   → cards list (skeletons ≤300ms, cached fallback if second visit)
2. Doctor card tap → Profile screen
   → GET /api/doctors/[id] (+ schedule)
3. "Book" → Slot sheet
   → GET /api/public/slots?doctorId=&date= (live counts)
4. Confirm screen (guest: name+phone; fee shown BEFORE confirm)
   → POST /api/public/book  (rate-limited; validation; double-tap guard app-side)
   → booking id (APT-…)
5. Token screen
   → GET /api/public/booking/[id]/token → token number BIG + share row
6. Queue tracker
   → GET /api/queue/doctor/[doctorId] adaptive poll (60s; 30s active foreground)
   → leave-by advisory, people-ahead, done state
   (no login anywhere in this path — conversion law)
```

Total new backend work for P0: **ZERO endpoints.** All six calls exist in prod today.

## 5. Technology ledger (app side) — decisions

| Layer | Decision | Why (honest) |
|---|---|---|
| Framework | **Expo (React Native) + TypeScript strict** | industry-standard RN path; TS = same skill as web repo; demo experiment validated it |
| Navigation | **expo-router** (file routes) | mirrors Next.js App Router mental model; deep links free |
| Styling | **P0: design-token TS module + StyleSheet** (deterministic, zero build risk) — NativeWind evaluated as B1 spike only with pinned lockfile | demo experiment hit reanimated/NativeWind plugin conflicts — P0 stability first |
| Server state | **custom `useQuery`-lite hook** (cache + retry + SWR semantics) in lib/; TanStack Query deferred to B4 if complexity demands | lean P0; no premature libs |
| Icons | **lucide-react-native** (react-native-svg) | EXACT same icon set as web → visual continuity across surfaces |
| Fonts | **system stack (SF/Roboto)** P0 — brand font deferred P1 | zero font payload = fastest cold start; weight-scale does hierarchy |
| Realtime | P0 polling (adaptive); P1 socket | battery-safe, zero infra risk |
| Storage | expo-secure-store (session) + AsyncStorage whitelist (doc 09) | secure + minimal |

## 6. State architecture (app)

- **Server state** (doctors, slots, queue, bookings): cache-layer hook only — never copied into global stores.
- **Local UI state**: component-level (selected slot, open sheet).
- **Persisted local**: session token, city, recent searches, onboarding-done (whitelist in doc 09).
- **NO global store P0** (no Redux/Zustand): navigation params + cache hook covers P0; revisit at B4 with evidence of need. (Deliberate restraint = fewer bugs.)

## 7. Offline & failure topology (summary — details doc 09)

Every screen class has a defined degradation:
listing (cached cards + stale banner) · profile (last-good + retry) · booking (offline-blocked, honest message — money-action never optimistic) · queue (cached position + timestamp + retry; poll auto-resumes) · token (locally held until share).

## 8. Security architecture

- HTTPS-only; no secrets in app bundle (ever); no API keys in JS.
- Public surface = existing rate-limited routes (abuse guard already live in prod).
- Authed surface = session token in secure-store; every authed request re-validated server-side (guard exists).
- App traffic = same capacity pool as web → app bugs can't take prod down silently (rate limits + monitoring, doc 14).

## 9. Scaling path (honest, no premature building)

| Stage | What changes | What does NOT |
|---|---|---|
| 0 → 10k users | nothing | same monolith, same DB — booking volume trivial |
| 10k → 100k | DB indexes review, list caching, image CDN discipline (already in place) | no service split |
| 100k+ / heavy queue | ONE seam split candidate: queue/realtime service (seam already exists) | app untouched (contract unchanged) — that's the payoff of law #3 |

## 10. What could force a change (the honest list)

- If phone-OTP auth (P2) needs a session format the current auth doesn't give → additive `/api/auth/session-token` endpoint (web GO batch, DDL-free) — planned in doc 08/10.
- If store review demands account deletion in-app → additive endpoint + settings action (P1 seam noted).
- If queue polling load ever registers on prod monitoring → move to socket (seam ready).
