# 11 — SERVICES & ACCOUNTS LADDER

> Status: DRAFT v1 (Round 27) — owner review pending. Parent: E22/E23. Owner ask:
> "kon kon si services" — this is the full answer. Accounts-last law (G7) governs.

## 1. Services inventory (what the app is built from)

| Service | Role | Needed from | Account | Cost | What lights up |
|---|---|---|---|---|---|
| **Our production API (doctorooms-hms)** | the ONLY backend — all data | day 1 (exists) | existing | $0 | everything |
| **Expo SDK + expo-router** | app framework | B1 | none | $0 | the app itself |
| **TypeScript (strict)** | language | B1 | none | $0 | same skill as web repo |
| **react-native-web export** | browser preview = MY E2E loop | B1 | none | $0 | quality guarantee without phone |
| **lucide-react-native + react-native-svg** | icons (web-identical) | B1 | none | $0 | visual continuity |
| **expo-secure-store / AsyncStorage** | storage | B1 | none | $0 | session + prefs |
| **Expo Go (owner's phone)** | live QR preview | B1 | none (free app) | $0 | owner sees app instantly |
| **agent-browser + VLM** | E2E + visual audits | B1 | existing sandbox tools | $0 | evidence gates |
| **EAS Build** | APK artifact | B5 | **Expo account (free tier)** | $0 | installable APK |
| **Firebase Cloud Messaging** | real push | P2 | Google account | $0 | lock-screen notifications |
| **Google Play Console** | Play listing | post-B5 | Google account | **$25 one-time** | public distribution |
| **Apple Developer** | App Store | P3 | Apple account | **$99/yr** | iOS |
| Analytics | reuse web taxonomy (`surface:"app"`) | P1 | existing | $0 | funnel numbers |
| **NOT in P0/P1:** payments SDK (web Razorpay) · Maps (P2 near-me only) · Twilio (P2 OTP) | | | | | |

## 2. Accounts ladder (strict order — accounts-last)

Existing 9-item ledger (web repo docs/launch/ACCOUNTS-AND-CONNECTIONS.md) gains:
**10. Expo (B5) → 11. Firebase (P2) → 12. Play Console (post-B5) → 13. Apple (P3).**
No account ever blocks planning/preview/E2E work — the ladder guarantees zero
account-waiting until the exact moment an artifact needs it.

## 3. Cost truth table

P0–B1..B4 = **$0 everything** (browser preview + Expo Go). B5 = $0 (Expo free tier).
Play = $25 once. Apple = $99/yr. Everything else $0. **Total to first Android
installable: $0. Total to public Play listing: $25.**
