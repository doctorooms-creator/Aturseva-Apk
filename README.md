# Aturseva-Apk — User-Side Mobile App (React Native)

Private planning + build repo for the Aturseva patient app.
The web product lives in a SEPARATE repo (doctorooms-hms); this repo never mixes with it.

## Contents

- `00-MASTER-PLAN-POINTS.md` — THE planning index. 30 points / 6 parts (Foundations,
  User, Screens, Features, Services/Release, Process). Each point becomes a numbered
  planning doc, locked point-by-point with the owner before any build batch.
- `DESIGN-uber.md` — design-system reference (Google Stitch DESIGN.md format,
  from voltagent/awesome-design-md). Base for `APP-DESIGN.md` (adapted, never copied).

## Ground rules (locked by owner)

1. Planning first; GO-gated batches (APK-B1…B5). No unauthorized builds.
2. Zero new backend — app consumes the existing production API.
3. AI agent is OUT of scope for this app (owner directive 2026-12-07).
4. QA: browser E2E (react-native-web) + VLM audits + owner phone protocol.
5. Accounts last (Expo → Firebase → Play → Apple). Evidence files: `apk-b{n}-*`.
6. Owner reports: Hinglish only.

Status: **PLANNING — no app code exists yet (by design).**
