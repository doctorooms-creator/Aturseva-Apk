# 12 — RELEASE LADDER & QA STRATEGY (evidence discipline)

> Status: DRAFT v1 (Round 27) — owner review pending. Parent: E24/E25/E26.

## 1. Release ladder (each step = gate + verification method)

| Step | Artifact | Verified by | Who touches it |
|---|---|---|---|
| 1 | **Browser preview** (react-native-web export) — every batch | MY agent-browser E2E + VLM audits (the guarantee loop) | me |
| 2 | **Expo Go on owner's phone** (QR) — B1 onward, each batch | owner eyeball protocol (guided checklist) | owner + me |
| 3 | **Internal APK** (EAS build) — B5 | owner install smoke on real Android | owner |
| 4 | **Play closed testing** — post-B5 | up to 20 trusted testers (owner's doctors/leads) | owner console + my guide |
| 5 | **Play production** — after closed-testing signal | store listing + crash console | owner console + my guide |

Every step is GO-gated; regression at any step = fix before climbing.

## 2. My QA loop (per batch — the web-repo pattern carried over)

1. **Browser E2E (agent-browser):** golden-path script per batch scope (B1: nav+home; B2: search→profile; B3: book→token→queue END-TO-END; B4: login+bookings+rate). Measures: tap→ack ≤100ms, skeleton ≤300ms, pageErrors 0, console noise 0.
2. **VLM visual audit (390px mobile viewport + 768):** law checks (44px, one-CTA, skeleton-match, empty-doorway, fee-upfront, protagonist-token) → verdict PASS/FAIL per screen.
3. **tsc strict + eslint:** 0/0 gate.
4. **Owner phone protocol:** 10-item checklist per batch (e.g. B3: "scan QR → book with your test doctor → token screen photo → queue counts live? → share works?") — evidence photo/json back into repo.
5. **Honest-limit law:** device-only behaviors (install, background poll, haptics) = claimed ONLY from owner evidence, never from me.

## 3. Evidence naming (law G6)

`docs/evidence/apk-b{n}-<what>.{png,json}` in THIS repo — batch prefix always
(the b17-lesson is standing law). Worklog entry per round in `worklog.md` (this repo).

## 4. Performance budgets & gates (doc 04 metrics wired)

| Budget | P0 gate |
|---|---|
| cold start → Home usable | ≤ 2.5s (browser-measured + owner-confirmed) |
| list scroll | 60fps feel (no jank in E2E scroll test) |
| initial JS bundle | ≤ 2.5MB (Expo-lean: no font payload, minimal libs) |
| API timeout UX | 8s + retry (law 15) |
| queue staleness | ≤ 60s foreground (adaptive poll law) |
| crash-free sessions | ≥ 99.5% (P1+ via Play console — owner sees numbers) |

## 5. Store listing asset plan (visual representation — B5)

Icon set (diya mark, light/dark/adaptive) · 4–6 screenshots (Home · Listing · Token ·
Queue — protagonist law: token shot FIRST) · feature graphic 4:3 · listing copy EN +
Hinglish (warm-care tone). All from design tokens (doc 03) — no new art language.
