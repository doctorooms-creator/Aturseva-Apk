# APK-B1 — E2E SUMMARY (browser loop — react-native-web static export)

> Batch: APK-B1 · date 2026-11-20 · verdict: **PASS (golden path + cross-cutting states)**

## Setup

- Build: `EXPO_PUBLIC_API_BASE= bunx expo export --platform web` (static export, 9 routes)
- Serve: sandbox mini-service `mini-services/apk-web-preview` (port 8090) —
  dist/ static + `/api/*` server-side proxy → **https://doctorooms-hms.vercel.app**
  (production monolith; server-side proxy = no browser CORS; app's relative
  API base stays same-origin exactly like native builds hit prod).
- QA loop: agent-browser @ 390×844, fresh storage per pass.

## Golden path (all PASS)

| Step | Evidence | Result |
|---|---|---|
| Boot → splash → first-run routing | (live session) | /onboarding auto-route (once-only ref-guarded redirect; no loop, no flash) |
| Onboarding slide 1-2-3 walk | apk-b1-18, apk-b1-06 | titles + captions + dots + Skip + Next/Shuru karein all render |
| City picker sheet (slide 3) | apk-b1-07 | 20-city list + "Baad me choose karunga"; Delhi pick round-trips to storage (`aturseva.city`) |
| Finish → HOME | apk-b1-17 | onboarding-done persists; second app open goes straight HOME (never repeats — S2 law) |
| Trust strip LIVE | apk-b1-17 | "97 doctors · 13 hospitals · 55 visits booked — live" (real prod /api/public/stats) |
| Doctor rail LIVE | apk-b1-17 | real prod /api/doctors cards: name, spec, ₹fee (tabular), city, initials avatar |
| Symptom chips + suggest sheet | apk-b1-12 | per-chip honest rows: GP→fever, Orthopedist→knee pain, Dermatologist→skin, Pediatrician→child, Gastro→acidity, Neurologist→sar dard (web repo's symptom dictionary verbatim) |
| Recent searches persist | (live session) | fever applied → localStorage `aturseva.recent-searches` → "Recent" row after reload |
| Sheet close (scrim tap) | (live session) | closes + STAYS closed (RN-web Modal focus-restore guard — web-only consume pattern) |
| Doctor card tap → recap sheet | apk-b1-13 | real card data recap + honest next-batch note + Theek hai close |
| Bookings tab doorway | apk-b1-19 | honest empty + chip → Home navigation works |
| Profile tab | apk-b1-20 | guest card (honest copy) + city row (storage round-trip) + web link |
| City change flow | (live session) | Profile → Pune → Home tab refocus → footer "Pune · change" (useFocusEffect) |

## Cross-cutting states

| State | Evidence | Result |
|---|---|---|
| Skeletons | (live session) | trust-strip + rail skeletons while loading (mirrored layout) |
| Offline/degraded | apk-b1-14 | API aborted + stale + visibility-revalidate → cached last-good KEPT ("97 doctors…" rail intact) + amber "Line me dikkt" strip + "Dobara try" one-tap |
| No page overflow | (live session) | scrollWidth/clientWidth = 390/390 (chips/rail right-edge crop = by-design horizontal scroll, not overflow) |

## VLM audits (390px) — apk-b1-02

Home 6/7 (one divergence: VLM expects tab-pill; doc 05 §1 explicitly defines
active-tab as ink icon+label, no pill — spec wins) · Onboarding 6/6 ·
Bookings 4/4 · Profile 5/5.

## Static analysis

- `bunx tsc --noEmit` — 0 errors (TS strict)
- `bunx eslint .` — **0 errors / 0 warnings**
- Root causes found & fixed during loop:
  1. `useAnimatedValue` not exported by react-native-web 0.21 → whole tree
     crashed silently → fixed with lazy-state `Animated.Value` pattern
  2. Redirect-in-render loop (Stack never mounted when booted===false) →
     once-only imperative redirect + state ALWAYS resolves
  3. RN-web Modal focus-restore instantly reopening the suggest sheet →
     web-only consume-on-focus guard (800ms fallback)
  4. Metro cache serving stale bundle after edit → cache clear + rebuild

## Owner-side pending (honest)

- Expo Go QR on OWNER's machine (sandbox LAN unreachable from owner phone —
  steps + 10-point checklist in `apk-b1-00-owner-qr-checklist.md`)
- Next batches: profile/booking (B2/B3), token/queue (B3), login (B4), APK artifact (B5)
