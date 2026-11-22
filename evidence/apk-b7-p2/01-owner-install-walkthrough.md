# Aturseva APK — Owner Install + Smoke (B7-P2 base + B13 OTA latest)

> Hinglish owner doc. App version 0.3.0 (runtime 0.3.0) · B7-P2 build
> `febe3a99-317a-4e43-b4d4-851e0fd4abe3` versionCode 2. **UPDATE
> (Round 45, 2026-11-22)**: owner ka EXPO_TOKEN aa gaya — febe3a99
> ka artifact link niche VERIFIED hai, aur preview branch pe ab **B13
> ka OTA LIVE hai** (group `16564890…`) — installed APK kholte hi
> B7→B13 saare features apne aap aa jayenge.

## APK link — STATUS: LIVE (verified, Round 45)

- **versionCode-2 APK direct link (PK magic + size 94 MB verified)**:
  `https://expo.dev/artifacts/eas/kKDu5YDabmIPSeWc_IX9FcplcvXLL3ytVIrVidyV_O8.apk`
  — B7-era native shell (runtime 0.3.0, channel preview) jo pehli
  launch pe B13 OTA apne aap khinch lega.
- **Sabse aasan path (koi install bhi nahi karna ho toh)**: jo B6
  v0.3.0 APK pehle se installed hai use bas dobara kholo — preview
  branch ka LATEST OTA (group `16564890-2676-4289-b6be-1a1e2232fdc7`,
  commit `fda04bb`, checkAutomatically ON_LOAD) apply hoga aur
  **poora B7→B13 feature set** aa jayega: hospitals + doctor depth,
  records viewers (bills + medical history), identity payoff
  (booking se auto notification + history event), profile edit,
  pull-to-refresh (native app me), booking-journey polish (44px slot
  pills, teal selected state), discovery polish, city-sheet
  auto-scroll, home rail no-truncation.
- Purana B6-v0.3.0 fresh-install link (agar device pe kuch nahi hai):
  `https://expo.dev/artifacts/eas/ky5ngpvVlDRv1wM3mjAqyLuS61qchwOu31xbuwzGCnI.apk`
  — isko bhi kholte hi wahi B13 OTA milega.
- (History, honesty note: 5 rounds tak link yahan PENDING pada tha
  kyunki sandbox reset #4 ne EXPO_TOKEN wipe kar diya tha — jab tak
  token nahi aata, jhooth bol ke link nahi likha gaya.)

## Upgrade note (versionCode-2 APK)

- Direct install v0.3.0 / versionCode-1 APK ke **UPAR** — koi
  uninstall nahi karna. Login session, cached data sab preserved.
- versionCode 2 auto-increment law: aage har preview build apne aap
  badhega (pehli submission vc1 me atki thi — canceled, fix logged).

## 6-point smoke checklist (B7-P2 kya test karna)

1. **Hospitals rail (HOME)** — login ke baad HOME pe "Hospitals"
   rail dikhe (6 real cards) + "See all" chip. Rail ke cards pe tap
   → hospital profile khulna chahiye.
2. **Hospitals list** — "See all" se list page: search box me
   "CIIMS" type karke submit → "1 hospital found"; city filter chip
   se city picker sheet khule; pagination ("Show more") chalne chahiye.
3. **Hospital profile** — CIIMS profile: hero, fact pills (sirf
   non-zero), facilities pills, departments rows → Pediatrics dept pe
   tap → doctors bottom sheet → "Dr. Varun Malik — ₹1,000 · ★4.0" →
   doctor profile khule. Header ke Call chip dabao — dialer khule
   (real number).
4. **Health tips (doctor depth)** — "Dr. QA ProdOnco" profile pe
   "Health tips" zone + 2 real post rows ("Chemotherapy: five things
   patients get wrong"…) → tap → PostSheet me POORA article clean
   text me dikhe (koi HTML tags nahi), Close chip kaam kare. Note:
   aaj sirf QA doctor ke posts hain — real doctors ke posts aane pe
   yahi zone unke liye dikhega.
5. **Ratings honest-empty** — Dr. Varun Malik profile: Ratings card
   "4.0 · 1 review" dikhaye par **koi sub-score rows nahi**
   (Consultation/Wait time/Staff aaj kisi doctor ke liye nahi — prod
   pe abhi kisi ne sub-scores nahi diye; jaise hi real visits rate
   hongi, rows apne aap aa jayengi. Yeh honest seam hai, bug NAHI).
6. **Booking doorway regression** — Rajesh Sharma profile pe "Book
   appointment — ₹300" CTA → slot sheet khule ("32 slots open · 0
   booked today · limit 50") → slot pick karne tak Confirm disabled
   rahe. Yaani B6 booking flow B7 changes se toota nahi.

## B13 OTA ke saath naya kya test karein (Round 45 ke baad)

Upar wala B7 checklist aaj bhi valid hai — uske UPAR ye naye surface
test karo (OTA ke saath apne aap aate hain):

1. **Pull-to-refresh (native app me)** — notifications / bills /
   medical history / bookings screens ko neeche kheencho (swipe down)
   → spinner + fresh data.
2. **Booking journey polish** — doctor profile → slot sheet: time
   pills ab 44px (aalas se tap honge), available = white pill,
   selected = teal ring + fill, closed = grey + line-through.
   Confirm button fee echo karta hai ("Confirm booking · ₹300").
   Token screen pe ek hi primary action + quiet cancel.
3. **Identity payoff** — booking karo → Notifications me auto entry
   ("Request sent") + Medical History me event. Naam-mismatch ho to
   app server-side resolved naam honestly dikhata hai.
4. **City sheet auto-scroll** — profile → City row → sheet khulti
   hai to current city apne aap scroll ho ke check-mark ke saath
   dikhta hai (Guwahati/Kochi jaisi last rows ke liye).
5. **Discovery polish** — search me "fever" → doctor list (fee ab
   bold 18px); zero-result pe "Browse all doctors" primary button;
   hospitals list city-filter se shuru.
6. **Dark mode** — system dark karke dekho: city field, sheet
   rows, inactive dots sab readable.

## Honest limits (ab ke liye)

- Ratings sub-score rows aaj kisi doctor pe render nahi hongi (prod
  pe koi sub-rated visit nahi) — yeh design hai, data aane pe
  dikhega.
- Health tips aaj sirf QA account ("Dr. QA ProdOnco") ke posts
  dikhati hai — web team prod QA data cleanup ka owner hai (B7-P1 me
  noted).
- Labs hub / push / OTP / maps / iOS / Play console — owner-blocked
  (Vercel token + Firebase/Twilio + Maps key + Apple account +
  Play console pending). EXPO_TOKEN ab aa chuka hai (Round 45) — uska
  unlock poora ho gaya (febe3a99 link + B13 OTA + dev tunnel teeno
  live).

## Dev-side contact points

- B7-P2 evidence: `evidence/apk-b7-p2/00-summary.md` (E2E + VLM 3/3 +
  gates). B7-P1: `evidence/apk-b7/`. B6 walkthrough (v0.3.0 base APK +
  5-point smoke): `evidence/apk-b6/01-owner-install-walkthrough.md`.
