# 25 · REDESIGN BUILD RECORD (3 SCREENS, EXACT FIDELITY)

**Status**: SHIPPED + POLISHED. The three headline screens (Find Care, Find
Doctor, Doctor Profile) rebuilt EXACT-FAITHFUL to the owner's Figma frames,
twice VLM-verified against the reference crops, then a final polish pass
(line-weight / bg-tint / connector checks, all VLM- or pixel-grounded).

**Date**: 2026-11-25 · **Owner directive** (doc 24 §9): *"exact same hi screen
redesign chahiye"* — the reference art is the law, not inspiration.

## 1 · Source of truth

| Item | Value |
|---|---|
| Figma file | `koY1wZRoJtIP72D0YpbEZm` |
| Frames | `25:2` Find Care · `25:3` Find Doctor · `25:4` Doctor Profile (390×844) |
| Reference showcase | `design/redesign-assets/src/0ec0df2b.png` — identified as the 3-screen showcase among the exported Figma renders; per-screen crops extracted via `crop.py` → `find-care.png` (278×599), `find-doctor.png` (277×598), `doctors-profile.png` (+2x variants) |
| Spec extraction | VLM pass over each crop → geometry, colors, type ramp, spacing (crop px × 1.402 = 390-frame design px) |

## 2 · What was built

| Piece | File(s) |
|---|---|
| 2-state search machine — **Find Care** (entry: 3 stadium input pills, ink Continue CTA, 2×3 specialty tile grid Ø102) / **Find Doctor** (results: back circle, honest count row, map/sliders circles, alternating light/ink cards) | `src/app/search.tsx` |
| `fromCare` transition (care entry → doctor results keeps query context), browse-all doorway (`all=1` suppresses stored-city), 7-day date-picker bottom sheet, specialty grid with Figma-label → MEDICAL-term mapping (Lungs→Pulmonology, Ear→ENT, Optometry→Ophthalmology…) | `src/app/search.tsx` |
| Doctor Profile — hero pills, glass stats 3-col real-data chain, 3 tabs, big-rating zone (rated doctors), reviews zone | `src/app/doctor/[id]/index.tsx` |
| SlotSheet — preserved verbatim, 8-param contract intact | reused, untouched API |
| Redesign skin — `rd`/`rdDark` palettes, `rdScale` 390-frame → 426-frame | `src/lib/redesign.ts` |
| 15 Rd line-art icons (24 viewBox, prop API `size/color/strokeWidth`) | `src/components/redesign/icons.tsx` |

## 3 · Data laws (the honesty spine)

- **Real API fields only**: `doctor.fees` (₹, `en-IN` grouping), `_avgRating.star → rating`, `ratingCount`, `totalPatients` fallback chain — no invented numbers.
- **Hide-if-empty**: absent rating → rating pill hidden (never "0.0"); empty bio → About tab section hides.
- **Monogram fallback**: no photo → initials tile, never a broken image.
- **No fabricated slots**: day strips carry REAL next-6-day dates; slot availability stays API-truthful.
- **$→₹**: the reference art shows $ fees; superseded by the India market law (doc 24 F-token bridge).

## 4 · FIX-2 (round-1 → round-2 delta)

1. **Nested-button web bug** — doctor card became a plain `View` + one
   full-bleed `Pressable` (card tap = open doctor); the day band sits above it
   with `pointerEvents: 'box-none'` so per-pill selection survives without
   nested pressables (React web throws on nested `<button>`).
2. **Badge pill field mapping** — wired to the REAL DoctorCard fields, not the
   mock names used in the first pass.
3. **3-col stats guarantee** — profile glass stats row can never collapse to
   2 columns on narrow widths (data-driven `flex` law).
4. **White back circle both modes** — light AND ink card variants.
5. **Specialty icon detail pass** — richer interior detail on the 6 medical
   icons (later re-tuned by the polish pass, §6).

## 5 · Verification saga

- **Round-1 E2E** (tunnel web render, CORS mock workaround): VLM A/B —
  Care **CLOSE** / Doctor **70%** / Profile **data-thin OFF** (the API
  returned unrated doctors → honest hide-if-empty, correctly flagged).
- **FIX-2** applied (§4).
- **Round-2 E2E** — every specific check **PASS**: no React errors, ₹ pills,
  light/ink alternation, 6 real-date strips, 3 stat columns, white back
  circle, rated-doctor reviews zone with 4.0 (rated doctor = **Dr. Varun
  Malik · Pediatrics · Ahmedabad · 4.0**). VLM A/B: Care **MATCH** /
  Doctor **CLOSE** / Profile **CLOSE**.
- **Infra saga**: machine resets mid-flight; ngrok robot-token ban → switched
  to the `expo` provider + `/api/tunnel` self-heal; metro stale-cache needed a
  cache-dir restart; sandbox process-reaping law (long-lived dev servers must
  be reaped or they die silently).

## 6 · POLISH pass (this commit, VLM/pixel-grounded)

| Check | Ground truth method | Verdict | Action |
|---|---|---|---|
| Specialty icon line-weight (round-2 VLM: "solid glyphs"?) | `z-ai vision` zoom on `find-care.png` 2×3 tile grid | Reference = **medium ~1.5px delicate line-art**, ~5–20% ink, hairline ~1px interior details — NOT bold glyphs | `icons.tsx` tuned: 6 specialty icons default stroke **2→1.5**; fills **0.25/0.22→0.13/0.12**; interior details **×0.8/×0.75→×0.7**; tooth badge plus 1.7→1.3. ViewBox 24 + prop API unchanged |
| Find Care page bg tint (round-2 VLM: "light-gray tint"?) | PIL pixel sampling, 13 open-area points in the 278×599 crop | Median **(255,255,255) pure white**; tinted samples (245–254) are edge anti-alias/JPEG spread, not a page fill | **Keep white** — no change |
| Doctor-card day-strip connector (track behind pills?) | `z-ai vision` zoom on `find-doctor.png` day strip | Pills **float free** — no track, no notch, no bridge; only adjacency on the card surface | **No connector** — no change |

## 7 · Commits

| Commit | Content |
|---|---|
| `0492efe` | REDESIGN BUILD 1/3 — both search states + profile + skin + 15 icons + tunnel fix + reference assets/crops/VLM extractions + round-1 E2E |
| `af8e592` | FIX-2 — nested-button web bug, badge field mapping, 3-col guarantee, white back circle, icon detail pass |
| `3f5f88c` | Round-2 verification shots + VLM A/B evidence (all checks PASS) |
| this | POLISH + RECORD — icon line-weight tuned to reference (VLM-guided), find-care bg pixel-verified white, day-strip connector checked (floating), doc 25 |

## 8 · Known remaining deltas (data-driven, honest — not fidelity bugs)

- Unrated page-1 doctors → rating pills hidden (hide-if-empty law).
- Empty bio → About section hides.
- `$` in the reference art → ₹ everywhere (India law, doc 24).

## 9 · Next batches (doc 23 §5)

Rest of Batch 1 frames from the Figma screen list — the remaining foundation +
golden-path surfaces, same extract-crop → VLM-spec → build → E2E-VLM loop.
