# APK-B6 — Owner Android install walkthrough (Hinglish, owner-only doc)

> Ye doc sirf owner ke liye hai — app ke andar ki copy pure English hai
> (B2+ law). B5 ka walkthrough (`../apk-b5/01-owner-install-walkthrough.md`)
> ab sirf history hai — **B6 testing ke liye ye naya link use karo.**

## Link

EAS Build `ae1cfbcb-9683-486a-9a96-e94baaa9a066` — dashboard:
`https://expo.dev/accounts/aturseva-team/projects/aturseva-app/builds/ae1cfbcb-9683-486a-9a96-e94baaa9a066`

**DIRECT APK DOWNLOAD LINK (build FINISHED — 2026-11-20, ~94 MB, v0.3.0,
versionCode auto-incremented):**

`https://expo.dev/artifacts/eas/ky5ngpvVlDRv1wM3mjAqyLuS61qchwOu31xbuwzGCnI.apk`

Ye link permanent hai — phone pe kholo ya QR scan karo. Link ek signed CDN
URL pe redirect hota hai (normal hai, download apne aap start ho jata hai).
Dashboard pe bhi **Download** button hai. APK verified: 94 MB, `PK` magic
bytes OK, sha256 `378750e4…`.

## IMPORTANT — v0.3.0 naya RUNTIME hai (fresh install zaroori)

B6 me do naye native modules aaye hain (file-system + sharing — reports
kholne ke liye). Isliye runtime version `0.2.0 → 0.3.0` badla:

1. **Purana APK (v0.2.0) OTA se B6 nahi milega** — 0.3.0 ka JS purane
   runtime pe nahi chalega. Naya link se **fresh APK install karo hi**.
2. Seedha upar wale link se install karo — same package
   (`app.aturseva.patient`) hai, versionCode higher hai, to Android isko
   **upgrade** samajh ke purane ke upar install karega (login session
   preserve rahega). Koi uninstall ki zaroorat nahi.
3. Agar kisi wajah se upgrade na chale: purana uninstall karke naya
   install karo — login dobara karna padega (1 minute).

## Install (Android phone pe)

1. Phone me link kholo (Chrome) → APK download (~94 MB).
2. "Install unknown apps allow karo?" — Chrome ko **Allow from this
   source** (one-time, standard for closed-testing builds).
3. Install complete → **Aturseva** icon (diya wala) home screen pe.
4. App kholo → HOME live data aana chahiye (doctors/hospitals/visits
   counters — prod API se). Nahi aaye to internet check + app band karke
   dobara kholo.

## B6 smoke checklist (5 points — ~5 minutes)

B4 tak sab kuch pehle se verified hai. B6 ke naye hisse:

1. **Profile account rows** — Sign in (ya register) karo → Profile me
   "Your account" section + 3 rows (Notifications / Reports / Rate your
   visits) dikhe, aur notifications wali row pe **teal unread badge**
   (0 pe "All caught up" — honest state).
2. **Notifications** — Row pe badge (agar koi unread event ho — nahi
   hoga to "All caught up" hi milega, prod me reception event chahiye).
   Screen kholo → rows tap karke **mark read** hone de; "Mark all as
   read" pill dabao.
3. **Reports** — Screen kholo → abhi koi lab order nahi hoga (honest
   empty state). Aage jab lab order generate hoga: status ladder +
   **View report** → PDF khulna chahiye (Android pe **share sheet** se
   open hoga — device behaviour, owner-verify).
4. **Rate your visits** — Screen kholo → empty state (completed visit
   chahiye rate karne ke liye). Jab visit complete ho: star row + 3
   score rows + review + **anonymous toggle** → submit.
5. **Book again rail** — HOME pe jab tak koi completed visit nahi, rail
   **bilkul nahi dikhega** (guest ke liye zero change — ye hi expected).
   Jab visit history banegi: "Book again" me aapke purane doctors.

**Kya verify NAHI ho sakta mere side se (honest limit):** real
notifications/reports/rate flows ko chalane ke liye completed visit +
reception-side event chahiye — maine honest empty states + guest
doorways + real API wiring (200s) verify kiye hain, data fabricate nahi
kiya. Report ka share-sheet behaviour Android device pe hi khulta hai —
owner-verify. Web branch (browser) me PDF khulna E2E-verified hai.

## Kuch toot gaya to?

Screenshot bhejo — EAS Update se JS fixes push honge (0.3.0 runtime
pe) — dobara APK build ki zaroorat sirf native changes pe hi padegi.

## Dev tunnel (live testing ke liye — optional)

Jab mera dev server online ho: `exp://h0kebso-anonymous-8081.exp.direct`
(8081, naya tunnel post-reset). Ye sirf development ke liye — APK + EAS Update link permanent.
