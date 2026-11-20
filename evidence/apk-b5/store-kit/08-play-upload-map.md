# APK-B5 — Store asset upload map (Play Console → which file → which slot)

> Companion to `../02-play-closed-testing-prep.md` (console steps + data-safety
> answers — wahan se continue karo). Ye doc batata hai ki store-kit ka kaunsa
> file Console ke kaunse slot me jata hai.

## Kit contents (this folder)

| File | Play Console slot | Spec | Status |
|---|---|---|---|
| `icon-512.png` | Store listing → App icon | 512×512, 32-bit PNG (alpha OK) | ✅ VLM PASS |
| `feature-graphic-1024x500.png` | Store listing → Feature graphic | 1024×500, PNG no alpha | ✅ VLM PASS |
| `01-token.png` | Graphics → Phone screenshot #1 | 1179×2556 PNG no alpha | ✅ VLM PASS |
| `02-queue.png` | Graphics → Phone screenshot #2 | 1179×2556 | ✅ VLM PASS |
| `03-home.png` | Graphics → Phone screenshot #3 | 1179×2556 | ✅ VLM PASS |
| `04-listing.png` | Graphics → Phone screenshot #4 | 1179×2556 | ✅ VLM PASS |
| `05-doctor-profile.png` | Graphics → Phone screenshot #5 | 1179×2556 | ✅ VLM PASS |
| `06-bookings.png` | Graphics → Phone screenshot #6 | 1179×2556 | ✅ VLM PASS |
| `07-store-listing-copy.md` | Store listing text fields | paste blocks EN + hi-IN | — |

Screenshot ORDER law (doc 12 §5 protagonist): **token shot FIRST** — buyer ko
pehle result dikhta hai (booked + token), phir queue, phir discovery journey.

## Screenshot provenance (honesty law)

All 6 captured from the REAL app (react-native-web static export, iPhone-16
viewport 3× = 1179×2556) through the REAL golden journey on PROD
aturseva.com: fever chip → GP listing → Rajesh profile → tomorrow 10:30 slot
→ REAL booking **#M7TBCG** created → token screen (honest "being assigned"
auto-poll state) → queue tracker (honest "Not in the line yet") → bookings
lookup → captured → booking cancelled with reason (state left clean).
No mockups, no fake states — Play policy + doc 04 honesty law.

## Asset generation (reproducible)

- `icon-512.png` — `sharp` lanczos3 downscale of `assets/images/icon.png` (1024).
- `feature-graphic-1024x500.png` — design-token HTML (canvas #FFFFFF, ink
  #0A0A0A wordmark, body #5E5E5E tagline, teal-live #0F766E ONLY on the live
  queue line — restraint law, diya mark from `assets/images/diya-master.png`)
  rendered at exactly 1024×500.
- Screenshots — agent-browser E2E session on `:8090` (app export with relative
  API base → same-origin proxy → prod API; doc 08 CORS law for web-E2E builds).

## VLM audits

8 audits (`vlm-*.json`, this folder) — all PASS. Notes worth keeping:
- `05-doctor-profile` — "Share on WhatsApp" partially clipped behind the
  sticky CTA bar (known sticky pattern, primary CTA uncompromised).
- `03-home` — chips rail edge-clipped = horizontal scroll affordance (by
  design), not a defect.

## Play upload sequence (owner, ~10 min after console setup)

1. Store listing → App icon → `icon-512.png`
2. Store listing → Feature graphic → `feature-graphic-1024x500.png`
3. Graphics → Phone screenshots → `01`..`06` in that order
4. Store listing → name + short + full description → paste from
   `07-store-listing-copy.md` (en-IN first)
5. (optional) Manage translations → Hindi → paste hi-IN blocks
6. Then continue with `../02-play-closed-testing-prep.md` §4-5 (closed track,
   APK upload, testers)
