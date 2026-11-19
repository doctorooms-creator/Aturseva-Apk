# Aturseva-Apk — User-Side Mobile App (React Native)

Private planning + build repo for the Aturseva patient app.
The web product lives in a SEPARATE repo (doctorooms-hms); this repo never mixes with it.

## THE PLAN (14 docs — DRAFT v1, Round 27, 2026-12-07 — owner review pending)

| Doc | What it decides |
|---|---|
| `00-MASTER-PLAN-POINTS.md` | The index: 30 points / 6 parts + locked ground rules G1–G8 |
| `01-VISION-AND-SCOPE.md` | Product sentence, users, value loop, phase ladder, locked out-of-scope |
| `02-SYSTEM-ARCHITECTURE.md` | **Monolith-vs-microservices decision, system diagram, 8 Uber-class laws, request lifecycle, tech ledger, scaling path** |
| `03-DESIGN-SYSTEM.md` | Visual language: tokens, type, space, motion, component kit, do's/don'ts |
| `04-UX-LAWS-AND-SMOOTHNESS.md` | **The 16 smoothness laws** (3-tap booking, 44px, skeleton-first…) |
| `05-NAVIGATION.md` | **Bottom nav (3 tabs + what's in each), stacks, sheets, deep links** |
| `06-SCREEN-SPECS-01-CORE.md` | **Screens S1–S11 (golden path): layout, data, all states, interactions, laws** |
| `07-SCREEN-SPECS-02-ACCOUNT-AND-LATER.md` | Screens S12–S20 + cross-cutting states (offline/error/empty) |
| `08-API-CONTRACT.md` | Endpoint inventory + additive-only contract laws (the app-survival doc) |
| `09-DATA-CACHE-OFFLINE.md` | Storage whitelist, cache rules, offline matrix |
| `10-AUTH-AND-PRIVACY.md` | Guest-first auth ladder, health-data laws, store-form drafts |
| `11-SERVICES-AND-ACCOUNTS.md` | **Full services table, accounts ladder 10–13, cost truth ($0 → $25 → $99)** |
| `12-RELEASE-LADDER-AND-QA.md` | Browser-preview → Expo Go → EAS APK → Play; QA loop, budgets, store assets |
| `13-PHASES-AND-BATCHES.md` | P0–P3 phases + APK-B1..B5 batch cards with acceptance criteria |
| `14-RISK-AND-WEB-SAFETY.md` | Risk register + **web-product zero-conflict laws (8 laws + what-if lanes)** |

## Ground rules (locked by owner)

1. Planning first; GO-gated batches (APK-B1…B5). No unauthorized builds.
2. Zero new backend — app consumes the existing production API.
3. AI agent is OUT of scope for this app (owner directive 2026-12-07).
4. QA: browser E2E (react-native-web) + VLM audits + owner phone protocol.
5. Accounts last (Expo → Firebase → Play → Apple). Evidence files: `apk-b{n}-*`.
6. Owner reports: Hinglish only.

Status: **PLANNING — plan docs written (Round 27); zero app code exists (by design).**
