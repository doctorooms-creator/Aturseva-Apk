# APK-B1 — OWNER QR CHECKLIST (Expo Go par phone pe test karein)

> Batch: APK-B1 FOUNDATION SHELL · evidence prefix `apk-b1-*` · date 2026-11-20
> QR sandbox se owner-phone tak reachable NAHI hai (sandbox ka LAN owner ke
> phone par nahi dikhta — honest note). Owner apne machine par ye hi start
> chalayega, wahan ka QR phone se scan hoga. Steps niche wahi hain.

## Owner ke machine par app chalana (2 minute)

1. Repo clone: `git clone https://github.com/doctorooms-creator/Aturseva-Apk.git && cd Aturseva-Apk`
2. Install: `bun install` (ya `npm install`)
3. Start: `bunx expo start`
4. Phone par **Expo Go** app kholo (Play Store se free) → terminal ke QR ko scan karein
5. App phone par khulega (dev mode — live prod API se data aata hai)

## Phone par ye 10 cheezein check karein (check ✔ karte jaayein)

| # | Kya check karna hai | Kya dikhna chahiye |
|---|---|---|
| 1 | App khulta hai | Safed diya logo (splash) ≤1s, phir seedha onboarding |
| 2 | Onboarding — 3 slides | "Doctor dhoondo" → "Book karo" → "Turn confirmed" |
| 3 | Skip (top-right) | Skip dabao → seedha Home aana chahiye |
| 4 | Shehar select (slide 3) | Delhi select karo → button par "Delhi" dikhe |
| 5 | "Shuru karein" | Home khulta hai; dobara app kholne par onboarding NAHI aata |
| 6 | Home — live strip | "97 doctors · 13 hospitals · 55 visits booked — live" (asli prod numbers, teal dot pulse) |
| 7 | Home — doctor rail | Card me asli doctors: naam, specialty, ₹fee, shehar — chhota scroll rail |
| 8 | Chips + search | "fever" chip tap → search me "fever" + sheet me "General Physician — Treats fever" |
| 9 | Tabs | Bookings (khaali doorway + Home chip) · Profile (Guest card, shehar change karo — Home footer turant update) |
| 10 | Network band karo (plane mode 10s) | Purana data + upar amber "Line me dikkt" strip + "Dobara try" |

## Kya B1 me NAHI hai (honest — agle batches me aata hai)

- Doctor profile + booking flow → **APK-B2/B3** (card tap par recap sheet aata hai, aage nahi)
- Token + live queue tracker → **APK-B3**
- Login/account → **APK-B4**
- Installable APK file → **APK-B5** (EAS build)

Problem mile to screenshot bhejein — fix hoga agle batch me.
