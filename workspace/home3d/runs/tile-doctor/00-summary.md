# tile-doctor (asset 6/7) — P1 Asset Studio run record

## Route decision
The plan predicted this: organic cartoon doctor = AI-gen home turf. Confirmed:
- AI-gen take1: **0.75 PASS** (silhouette 0.85, details 0.75, colors 0.8)
- AI-gen take2 (fixes: tighter framing, flatter hair, closed smile, matte):
  **0.75-0.80 PASS** (silhouette 0.8, details 0.8, colors 0.9)
- Take2 bundled (stronger sub-scores; navy tie + dark hair landed).

## Pixel ground truth (crops/tile-doctor.png, 91x112) — via VLM structural read
peach skin #F5C9A6 · dark brown hair #2B2320 swept side part · white coat
+ light-blue shirt #A8CBE8 + medium blue tie #3D6FB4 · charcoal stethoscope
#4A4A4A with silver chest piece · arms crossed · white bg

## Key findings
- The soft-shaded character's PNG entropy needed the full quantize cascade:
  256c (64.5KB) -> 128 (57.4) -> 96 (53.7 with binarized alpha 44.4) ->
  64 colors + BINARIZED ALPHA (soft AA edges carry entropy) = 38.5KB under
  budget. Banding measured: mean 4.3/255, p95 13.7 — fine at the ~64dp app size.
- Bundler upgraded: cascade 256->128->96->64 with per-level original-alpha and
  binarized-alpha retries, only when plain RGBA exceeds budget.

## Verdict (honest)
- GATE PASSED (0.75 documented twice — the first organic asset to pass).
- Residual nitpicks from the take2 audit: chibi head slightly large, gloss
  still above mockup's matte — recorded for C1, not blocking.

## Delivered
- assets/images/home3d/tile-doctor@2x.png (128x173, 38.0KB)
- assets/images/home3d/tile-doctor@3x.png (192x259, 38.5KB — 64c quantized)
- home3d-manifest.json updated (6/7)

## Evidence
- cmp-imgen1/2.png + vlm-imgen1/2.json + vlm-structure.json
