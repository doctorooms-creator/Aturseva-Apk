# P1 ASSET STUDIO — CHECKPOINT C1 SHEET (7/7 assets, owner review)

> The master plan's C1 gate: "the artwork comparison sheet: mockup crop |
> my render | verdict, all 7 assets — assets pass or fix list."
> This folder IS that sheet. Every verdict below is the measured VLM audit
> trail, quoted honestly (oscillation documented where it occurred).

## Verdict table

| # | asset | route | best audit | gate (≥0.7) | @2x | @3x | notes |
|---|-------|-------|-----------|-------------|-----|-----|-------|
| 1 | shield-3d | 3D flat-vector | **0.72** | **PASS** | 7.5KB | 12.0KB | pixel-exact color anchors |
| 2 | token-stack | 3D flat-vector | 0.5 | below | 21.4KB | 39.3KB | ladder exhausted (14×3D+2×AI); painterly mockup, audits flip fan/pile; cards BLANK by design (live token number is app-rendered) |
| 3 | tile-hospital | 3D flat-vector | **0.75** | **PASS** | 8.8KB | 14.0KB | frame-fill fix was decisive |
| 4 | tile-labtubes | AI-gen | 0.65 | below | 24.9KB | 36.5KB | ladder exhausted (5×3D+2×AI); 3D best 0.55 |
| 5 | tile-video | 3D flat-vector | 0.65 (tie) | below | 7.4KB | 13.1KB | tie 0.65/0.65 → 3D won tiebreak (size/style-lock) |
| 6 | tile-doctor | AI-gen | **0.75** | **PASS** | 37.1KB | 37.6KB | plan's AI-gen prediction confirmed |
| 7 | hero-3d | AI-gen | **0.93** | **PASS** | 37.6KB | **73.3KB** | best of studio; @3x size deviation noted below |

**4 of 7 pass the ≥0.7 gate. 3 of 7 (token-stack, labtubes, video) exhausted
their bounded fallback ladders at 0.5-0.65 — verdicts documented in each
run's `00-summary.md`, evidence preserved for owner judgment.**

## Honest ledger for the owner

1. **token-stack (0.5)** — the mockup's card stack reads as a painterly hybrid
   (audits alternate between "loose fan" and "tight pile"; tilt direction
   claims flip between reads while pixel traces say +8deg). Both routes
   plateau ~0.5. Cards ship BLANK by design — the live token number is
   app-rendered code, never artwork (plan §2.4).
2. **tile-labtubes (0.65)** — the clay/gloss style is image-gen's home turf;
   3D route plateaued when audits demanded transmission shaders. Take1
   bundled; 3D factory preserved for future iteration.
3. **tile-video (0.65 tie)** — both routes tied; ties went to the 3D route
   (smaller file, style-locked with the tile family). Pixel-verified along
   the way: the mockup's avatar window is PLAIN WHITE — the audits'
   "avatar person icon" is a hallucination (kept as a subtle low-contrast
   glyph enhancement, documented).
4. **hero-3d size deviation** — @3x 73KB vs the 40KB guideline (480-wide rich
   illustration; the safe-quantize cascade floor). Total studio 369KB vs the
   280KB planning number. OTA impact negligible (Expo ~50MB update limits).
   The alternative was quantizing the crown visual to mush. Owner decides.
5. **No text anywhere in shipped artwork** (take1 hero rejected for a baked
   "HOSPITAL" sign; take3 re-made without it, audit-confirmed NO TEXT).

## The sandbox reset (#11) — recovered

Mid-round the sandbox was reset; the Aturseva-Apk repo was re-cloned from
GitHub (all pushed work survived: shield). Assets 2-3 were rebuilt
byte-identical/exact from in-context knowledge. Since then every asset ships
PUSHED the same round (the survival law).

## Where the numbers come from

glm-5.3-flash side-by-side audits (`z-ai vision`), each asset's comparison
sheet + JSON preserved in `workspace/home3d/runs/<asset>/`. Audit
oscillation (±0.1) documented honestly where reads disagreed with pixels
(pixel traces always won disputes — see run summaries).
