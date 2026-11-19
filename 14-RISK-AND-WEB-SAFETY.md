# 14 — RISK REGISTER & WEB-PRODUCT SAFETY LAWS

> Status: DRAFT v1 (Round 27) — owner review pending. Owner ask: "web product pe koi
> issue nahi ani chahiye, koi conflict nahi hona chahiye" — §2 is the direct answer.

## 1. Risk register (honest, owner-visible)

| # | Risk | L×I | Mitigation | Owner-visible sign |
|---|---|---|---|---|
| R1 | Two codebases = double feature cost | H×M | contract doc 08 (one source of truth); feature policy: web-first unless app-critical | every plan doc repeats it |
| R2 | API drift silently breaks app | M×H | additive-only law + contract-version bump protocol (B17-lesson made law) | contract CHANGE log |
| R3 | Device behaviors I can't verify (install/push/battery) | H×M | owner phone protocol per batch; I never claim device-verified without owner evidence | checklist photos |
| R4 | Expo SDK upgrade debt | M×M | SDK pinned per release; upgrade = explicit batch task with regression suite | worklog |
| R5 | Store review delays (healthcare scrutiny) | M×M | honest data forms (doc 10), no overclaims; closed-testing first | console status via owner |
| R6 | Queue polling load on prod | L×M | adaptive poll law (60s/30s/backoff); seam to socket exists if needed | monitoring note in reports |
| R7 | App flood/abuse of public API | L×H | existing rate-limits shared with web; kill-switch seam via stats meta (P1) | rate-limit 4xx evidence |
| R8 | Guest-booking spam | M×M | web's existing validation+limiter (same API = same armor) | admin leads sheet |
| R9 | Solo-owner console ops burden | M×L | Hinglish walkthrough docs per console step (B5 deliverable) | the walkthrough doc itself |
| R10 | Scope creep back into staff/AI features | M×H | out-of-scope list is LOCKED in doc 01 §4; every plan cites it | this register |

## 2. WEB-PRODUCT SAFETY LAWS (zero conflict — the direct promise)

1. **Separate repos, separate pipelines:** app repo (Aturseva-Apk) NEVER deploys anything.
   Web repo → Vercel remains the only production pipeline. App cannot touch it.
2. **Zero new backend for the app.** P0 needs ZERO new endpoints (doc 08 — all exist).
   If P1/P2 ever needs an additive endpoint (e.g. session-token): built in WEB repo via
   normal GO batch → push → Vercel deploy → **prod verify → Hinglish report** (owner
   discipline fully intact — web gets better, never worse).
3. **Additive-only API evolution** (contract law 2): web's existing endpoint behavior
   never changes for the app — web screens keep working byte-identically.
4. **No shared DB writes from app** — app writes ONLY through public/auth API (doc 02).
5. **No schema/DDL for P0** — booking/token flows are pure reuse (no owner-DDL events
   needed). Any future DDL stays on owner-Supabase-SQL discipline as always.
6. **Capacity respect:** app shares rate limits with web; adaptive polling; kill-switch
   seam (stats `app_min_version` + future app-block flag) if app ever misbehaves.
7. **Web repo commits during app work = docs-only** (worklog entries) — zero code
   churn, zero deploy risk (same pattern as this round).
8. **Conflict walkthrough (what-if):** web deploys mid-app-batch → contract doc diff
   read before next app build; app bug floods API → limiter + kill-switch; web feature
   needs breaking change → web batch must bump contract → app notified → app batch
   adapts. **Every conflict has a named lane — none ends in a fight.**

## 3. Honest-limit restatement (owner trust law)

I verify to browser-E2E + VLM; owner verifies device truths; store consoles are owner's
hands with my guided docs; and web product safety is §2 — written as law, not hope.
