# APK-B5 — Owner Android install walkthrough (Hinglish, owner-only doc)

> Ye doc sirf owner ke liye hai — app ke andar ki copy pure English hai (B2+ law).
> HISTORY NOTE (2026-11-20): ye B5/v0.2.0 walkthrough ab history hai —
> B6/v0.3.0 ke liye `../apk-b6/01-owner-install-walkthrough.md` use karo.

## Link

EAS Build `10fddb22-491a-4e6d-923f-15c97740245b` — dashboard:
`https://expo.dev/accounts/aturseva-team/projects/aturseva-app/builds/10fddb22-491a-4e6d-923f-15c97740245b`

**DIRECT APK DOWNLOAD LINK (build FINISHED — 2026-11-20, 94 MB, versionCode 1 / v0.2.0):**

`https://expo.dev/artifacts/eas/ZKuhbBezvYXQXX_cJLyYrlw4Z4epa6l8rRM_Kwu4jwg.apk`

Ye link permanent hai (jab tak build retained hai) — phone pe kholo ya QR scan
karo. Link ek signed CDN URL pe redirect hota hai — ye normal hai, download
apne aap start ho jata hai. Dashboard pe bhi **Download** button available hai.

## Install (Android phone pe)

1. Phone me link kholo (Chrome) → APK download hoga.
2. Install karte time Android bolega: "Install unknown apps allow karo?" —
   Chrome ko **Allow from this source** karo (one-time). Play Store se bahar ka
   build hai isliye ye step normal hai — closed testing ke dauran standard practice.
3. Install complete → **Aturseva** icon (diya wala) home screen pe aa jayega.

## 10-point smoke checklist (B5 acceptance — sab PASS hona chahiye)

| # | Test | Pass jab |
|---|---|---|
| 1 | App launch | Splash (diya) → pehli baar onboarding dikhe; dobara kholne pe seedha HOME |
| 2 | Onboarding + city | 3 slides, city picker, Delhi select, Get started |
| 3 | HOME live | "97 doctors · 13 hospitals…" trust strip + real doctor cards |
| 4 | Fever chip | GP listing khule, kisi doctor pe Book |
| 5 | Doctor profile + slot sheet | Fee dikhe, date strip, free slot chuno |
| 6 | REAL booking | Naam + phone + reason → Confirm → token screen (Token being assigned) |
| 7 | Queue tracker | "Not in the line yet" ya position — refresh auto |
| 8 | Bookings tab | Phone masked (98••••XXXX) + aapki booking dikhe |
| 9 | Cancel | Cancel → reason → booking cancelled state |
| 10 | Dark mode | Phone dark mode karo → app dark ho jaye (v0.2.0 automatic) |

**Crash-check protocol**: phone ke Recent apps me Aturseva ko band karo, dobara kholo —
wahi screen pe wapas aani chahiye (no crash, no blank). Agar kahin crash dikhe:
Settings → About phone → Build number se developer options on karo, bug report ka
screenshot bhejo — next build me fix hoga (EAS Update se OTA hi jayega, APK dobara
install nahi karna padega for JS fixes).

## OTA note (EAS Update)

App launch pe wo khud `preview` channel check karta hai — humne pehla update publish
kar diya hai (`0d6d2030`), isliye APK ke andar ka code latest hi chalega. Aage ke JS
fixes bhi yahin se push honge — APK link wahi rahega.

## Live dev testing (Expo Go — optional)

Expo Go app me "Enter URL manually" → `exp://eoj50me-anonymous-8081.exp.direct`
(mera dev server jab online ho). Ye sirf live development ke liye hai — APK ke
bajaye ye use karoge to live reload milta hai. Tunnel URL restart pe badal sakta hai;
APK + EAS Update link permanent hai.
