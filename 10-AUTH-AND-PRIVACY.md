# 10 — AUTH & PRIVACY ARCHITECTURE

> Status: DRAFT v1 (Round 27) — owner review pending. Parent: B7, B8.

## 1. Auth architecture (guest-first doctrine)

| Layer | Decision |
|---|---|
| Doctrine | Login NEVER blocks the golden path (find→book→token→queue = zero-login). Login = value-add (history, reports, book-again), offered at moments of felt value. |
| P0 | Pure guest flows + phone-lookup identity-lite (bookings by phone — matches web guest law) |
| P1 | Email+password login/register (SAME account as web — one identity system both surfaces; web parity for reset/verify flows) |
| Session | Token in expo-secure-store; **B4 SPIKE (doc 08 §3 row 11):** RN cookie-jar persistence vs additive `/api/auth/session-token` bearer endpoint — decided with evidence at B4 |
| P2 | Phone-OTP login (Zomato-style) — **Twilio-gated (accounts-last)**; UI seam designed (S15) |

## 2. Privacy architecture (health-data honesty)

**Laws:**
1. **No health data on device, ever** (doc 09 whitelist is the enforcement; reports in-memory only).
2. Session token = secure-store only (never AsyncStorage).
3. Everything over HTTPS; no PII in logs/analytics (event taxonomy carries actions, not identities — web law reuse).
4. Guest booking minimum data: name+phone — nothing more asked (minimality).
5. Delete-my-data path = owner-side existing flows (web privacy policy pages carry over; store "data deletion" handled by the same backend mechanisms — honest store-form answers below).

## 3. Store compliance sheets (draft answers — FILL HONESTLY at store time)

| Play Data-safety question | Our honest answer |
|---|---|
| Data collected | Name, phone, email (account), booking context (doctor visited) |
| Data encrypted in transit | YES (HTTPS only) |
| Data deleted on request | YES (existing owner-side deletion flow) |
| Health data declared | "App functionality" category only — no health-data SELLING/sharing, no ads-personalization |
| 3rd-party sharing | none (P0/P1); analytics = first-party taxonomy events only |

Apple (P3): healthcare-adjacent category — honest forms, no overclaiming; medical-advice disclaimers already in web legal pages (reuse).

## 4. In-app privacy surfaces (P1)

Profile → legal links (privacy · terms · data-protection — web pages) + first-booking
consent line ("booking karke aap terms accept karte ho" — web parity). No wall, ever.
