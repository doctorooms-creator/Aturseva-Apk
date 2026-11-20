# APK-B5 — Play closed-testing prep (owner console steps, Hinglish)

> Status: DRAFT v1 — jab owner install smoke PASS ho jaye, tab isko follow karo.
> Play production alag GO hai (plan doc 13 — post-B5 ladder).

## Kyun closed testing pehle

Play Store production me direct jana risky hai (public reviews, rating, data-safety
forms). Closed testing me apne hi log (family, doctor network, 20-100 testers) pehle
test karte hain — feedback fix karke phir production. Isliye: APK smoke → closed
testing → production.

## Owner console steps (Play Console, ~30 min one-time)

1. **Google Play Console** account kholo — developer account (one-time $25) —
   `play.google.com/console`. (Owner pehle se rakha hai to skip.)
2. **Create app** → name "Aturseva Patient", language English (India), App/Free.
3. **App content** forms (left menu) — har form me "Start…" hai:
   - **App access**: "All functionality available" (koi restricted feature nahi).
   - **Ads**: No ads (humein koi ad nahi hai).
   - **Content ratings**: questionnaire — health/medical app, "no user-generated
     content shared" honestly bharo → rating milega (3+ aata hai aise apps me).
   - **Target audience**: 18+ (token/booking app; 13-17 avoid karo).
   - **Data safety** (important — honest bharo):
     - Collect: Name, Phone number, Email (account), App interactions.
     - Purpose: App functionality; no sharing with third parties; data encrypted
       in transit (HTTPS) — production monolith ka wahi status.
     - **Delete request URL**: `https://aturseva.com/contact` (page me email hai).
   - **News app?** No. **Finance?** No. **Government app?** No. **Health apps**:
     "not a medical device / no health records claims" — hum appointment + queue
     dikhate hain, prescriptions nahi store karte is app me.
4. **Closed testing** → "Create a track" → naam "Team alpha" → email list ke testers
   (Gmail IDs — doctor network ke 20 log) → **Add**.
5. **Release** → Upload `app-release.apk` (EAS download link se) → notes
   "v0.2.0 — find doctor, book token, track queue" → Rollout.
   - Console APK ko review karta hai (1-7 din closed track me).
6. Testers ko **opt-in link** mail/WhatsApp karo → wo Play Store se app install
   karenge (closed track dikhta hai unke account me) — official build.
7. Jab feedback aaye → hum fix + `eas submit` (ya manual APK) se update —
   same keystore (Expo-managed, safe).

## Hum kya prepare kar denge (next batch — store-asset kit, doc 12 §5)

- Feature graphic (1024x500) + phone screenshots (home/listing/token/queue) —
  in-app se hi capture (E2E loop me same screens hain).
- Short description (80 chars) + full description (English, patient-first).
- Privacy policy URL: `https://aturseva.com/(llp)/privacy` (live hai).

## Honest notes

- Play ke review me "health app" forms galat bharna policy-strike la sakta hai —
  data-safety wala section upar honest bhara hai, wahi rakhna.
- Payments in-app nahi hai (pay at clinic) — isliye Play billing ka sawal hi nahi.
- APK closed testing me kabhi retain hota hai kabhi internal testing better hota —
  dono me same upload; track ka naam matter nahi karta.
