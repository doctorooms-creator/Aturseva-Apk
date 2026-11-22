# APK-R49 — MONOCHROME HOME (owner directive, Uber design laws)

> Owner round 49: "monochrome — black and white primary, ocean-jesa
> secondary (the website's own palette); the cream canvas made no sense
> for doctors; clone the Practo home STRUCTURE (already built in H2/H3)
> in OUR colors. Install + actually use the design skills
> (awesome-design-md → Uber; impeccable)."

## Skills installed + USED this round

- `skills/awesome-design-md/` — 84-brand DESIGN.md library (VoltAgent).
  **Uber's DESIGN.md = the governing spec** (owner directive): B&W duet,
  pill 999px signature, ink conversion anchor, alternating bands,
  Level-0-flat default, sentence-case, one black pill per viewport.
- `skills/impeccable/` — craft-floor loaded BEFORE edits (contrast,
  states, copy, no-decoration-glass law), design-law workflow applied.

## The correction (measured, not opinion)

| Token | Was (H1-H4) | Now (R49) | Why |
|---|---|---|---|
| canvasSoft | #F4F2EC CREAM | **#F7F8F8** | The website's REAL body background (measured: `--background` in every page's CSS). The site's "ivory" #F4F2EC is a 5–50% alpha TINT in site CSS, used 0 times as a solid page fill — H3's cream canvas was a misread (R48 forensics re-measured this round). |
| aqua | #14B8A6 | **#00BAA7** | Site-measured teal-500 (the owner's "ocean jesa"); documentation-grade — the app consumes tealLive #0D9488 (site sidebar-primary) + tealText #0F766E (site AA accent), both unchanged. |
| dark glassEdge | 0.12 | **0.18** | VLM dark audit: floating pill "barely distinguishable" from #0C0C0C — the edge is the definition on dark. |
| dark canvasSoft | #1A1A19 | #1A1A1A | Monochrome purity. |

**One-token leverage:** every cream surface (home canvas, chips, skeletons,
lettermarks, soft fills) flipped to near-white via `canvasSoft` — the app
is monochrome chrome + ocean secondary (live/selected/icons) by construction.

**Chip ring fix (press.tsx):** white chips on #F7F8F8 are a 1.5% luminance
step — invisible. Custom-surface chips now get the theme-aware hairline ring
(the cityChip's own grammar). Dark-mode ring = c.hairline (#262626).

**Photo continuity fix (VLM catch):** the S6 slot-sheet mini-header and the
confirm-booking summary showed initials while the rails/profile showed the
face — `SlotSheetDoctor.photo` + route params `photo`/`rep` now carry the
face through the whole booking journey.

## E2E-harness engineering (tools/ — new, untracked-in-git-history)

- `tools/serve-e2e.mjs` — :8090 static server + `/api` AND `/website` proxy
  (photoUrl resolves same-origin under the empty-API_BASE law).
  **Two binary bugs caught + fixed:** (1) `/website` wasn't proxied —
  curated faces 404'd; (2) `res.text()` passthrough CORRUPTED JPEG bytes
  via UTF-8 roundtrip (42231 B garbage vs 23502 B real JPEG) → every
  RN-web Image went ERRORED → "gray placeholder squares". ArrayBuffer
  passthrough fixes both. The app's photo pipeline was correct all along.
- `tools/e2e-r49.py` — golden path + device matrix (visibility-filtered
  locators: expo-router keeps the home tab mounted under pushed routes).
- `tools/measure-r49.py` — DOM-verified canvas: `rgb(247,248,248)` = #F7F8F8.

## Gates

- tsc 0 · eslint 0 · web export OK · E2E pageErrors **0**
- Golden path (390): fever chip → listing (12 doctors, 6 face photos render)
  → Rajesh profile → book sheet (photo + teal-selected slot 09:00)
  → Confirm slot → token screen.
- Matrix: 360 / 390 / 412 / 768 light + 390 dark — all shots captured.
- VLM verdicts (evidence `vlm-*.json`):
  - Home: canvas "neutral near-white #F5F5F4, NOT cream"; monochrome +
    teal secondary; black stats band; floating pill + black active
    circle; chips ringed; "clean monochrome medical app (Uber-like)".
  - Listing: "real face photos — all six doctors", white/neutral canvas.
  - Book sheet: real face in mini-header; teal selected-slot state.
  - Dark: near-black canvas, faces render, light stats band, pill edge
    now "clearly visible" after the 0.18 bump.
- DOM measurement: homeScrollBg rgb(247,248,248) — the site's exact bg.

## Honest limits

- **EXPO_TOKEN + GitHub credentials were wiped by the sandbox reset** (the
  standing loss pattern). Code is committed locally; `git push` and
  `eas update` (OTA publish) are BLOCKED until the owner re-provides the
  EXPO_TOKEN (and a GitHub PAT if the push can't go through the owner's
  machine). The preview channel still serves the H1–H4 (cream) build —
  the monochrome build is NOT on the channel yet.
- The E2E harness artifacts (gray-square avatars in early shots) were
  harness bugs, not app bugs — root-caused + fixed above; final shots
  show photos everywhere.
- VLM nitpicks left as-is (by design): rail peek crops (scroll affordance),
  pill overlapping content mid-scroll (floating-nav law + bottom clearance
  verified in H4), listing has no teal (teal = live/selected/icons only —
  the listing has no live state), "Book" pill is light gray (secondary —
  one ink primary per screen is the law).
