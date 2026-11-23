# hero-3d (asset 7/7) — P1 Asset Studio run record

## Route decision
AI-gen route (per plan prediction — organic cartoon = imgen turf). 3 takes:
- take1: **0.85** (silhouette 0.9) — but contained a 'HOSPITAL' text artifact
  (violates the no-text-in-artwork law; app renders text)
- take2: 0.72 (structure drifted: cone trees, blue cross, no-tie mismatch)
- take3 (targeted refinement of the PASSING take1 minus text): **0.93 —
  the best audit of the entire studio** (silhouette 0.9, details 0.9,
  colors 1.0, NO TEXT confirmed by audit)

## Pixel ground truth (crops/hero-3d.png, 452x291) — via VLM structural read
doctor center-right (peach skin, dark swoopy hair, white coat + light-blue
shirt + blue tie, charcoal stethoscope w/ silver chest piece, arms crossed) ·
mini white hospital center-left at waist-height (blue windows, black cross,
gray door) · green blob-bushes flanking (#7CB85C + darker accents) · light
cool-gray bg · app UI elements in the crop (text, search bar) are NOT asset

## Verdict (honest)
- GATE PASSED at 0.85/0.93 (take1/take3).
- SIZE DEVIATION recorded for C1: hero@3x = 73KB vs the 40KB guideline —
  the 480-wide rich illustration's quantize-cascade floor (64c + binarized
  alpha). Total studio bundle 369KB vs the 280KB planning number. OTA impact
  negligible (Expo update limits ~50MB; the 280KB was a conservative
  planning guard). The alternative — quantizing the hero to mush — was
  judged worse than the deviation. C1 owner decides.

## Delivered
- assets/images/home3d/hero-3d@2x.png (320x196, 38.5KB)
- assets/images/home3d/hero-3d@3x.png (480x294, 73.3KB — deviation noted)
- home3d-manifest.json updated — **STUDIO COMPLETE: 7/7**

## Evidence
- cmp-imgen1/2/3.png + vlm-imgen1/2/3.json + vlm-structure.json
