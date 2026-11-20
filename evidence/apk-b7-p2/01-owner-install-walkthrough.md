# Aturseva APK — Owner Install + Smoke (B7-P2: Hospitals Browse + Doctor Trust Depth)

> Hinglish owner doc. App version 0.3.0 (runtime 0.3.0) · B7-P2 build
> `febe3a99-317a-4e43-b4d4-851e0fd4abe3` versionCode 2. Poora B7 set
> (Part 1 hospitals browse + Part 2 doctor depth) is round me APK
> tak pahuncha hai — OTA pehle se LIVE hai, naya APK link niche
> honestly marked hai.

## APK link — STATUS: PENDING (1 owner step)

- **Naya versionCode-2 APK ka direct link is write ke time block hai**:
  sandbox 4th bar reset hua to `EXPO_TOKEN` (expo.dev access token)
  sab ke saath wipe ho gaya, aur EAS se build status/artifact link
  bina token fetch nahi ho sakta. **Jhooth bol ke koi link nahi likha.**
- **Owner ek-baar action (2 min)**: expo.dev → Settings → Access
  Tokens → Create token → mujhe bhej do. Uske turant baad next
  followup link yahan + summary me commit kar dega (PK magic bytes +
  size verify karke).
- **Tab tak B7 test kaise karein — LINK PEHLE SE KAAM KARTA HAI**:
  B6 ka v0.3.0 APK already installed hai ya install kar lo
  `https://expo.dev/artifacts/eas/ky5ngpvVlDRv1wM3mjAqyLuS61qchwOu31xbuwzGCnI.apk`
  — app ko dobara kholo, OTA update (group `4d6aa392…`,
  checkAutomatically ON_LOAD) apne aap apply hoga aur hospitals
  browse + doctor depth features aa jayenge. Yaani **B7 smoke aaj hi
  ho sakta hai** — naya APK sirf versionCode-2 freshness ke liye hai.

## Upgrade note (jab versionCode-2 APK link aaye)

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

## Honest limits (ab ke liye)

- Ratings sub-score rows aaj kisi doctor pe render nahi hongi (prod
  pe koi sub-rated visit nahi) — yeh design hai, data aane pe
  dikhega.
- Health tips aaj sirf QA account ("Dr. QA ProdOnco") ke posts
  dikhati hai — web team prod QA data cleanup ka owner hai (B7-P1 me
  noted).
- Labs hub / push / OTP / maps / iOS — owner-blocked (Vercel token +
  Firebase/Twilio + Maps key + Apple account pending). Naya APK link
  bhi isi list me hai jab tak token nahi milta.

## Dev-side contact points

- B7-P2 evidence: `evidence/apk-b7-p2/00-summary.md` (E2E + VLM 3/3 +
  gates). B7-P1: `evidence/apk-b7/`. B6 walkthrough (v0.3.0 base APK +
  5-point smoke): `evidence/apk-b6/01-owner-install-walkthrough.md`.
