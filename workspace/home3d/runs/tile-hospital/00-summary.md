# tile-hospital (asset 3/7) — P1 Asset Studio run record

## Route
3D-code flat-vector route (proven shield route): MeshBasic + authored gradient
CanvasTextures + remapuv. 8 iterations this session (v1-v8).

## Pixel ground truth (crops/tile-hospital.png, 126x112)
- white rounded-facade 2-story building, FLAT roofline, body 85x49px = 1.73:1 WIDE
- vivid blue windows #4096E4 + lighter #74a8dd variants, ~5 columns upper row,
  4 + centered dark entrance door lower row
- dark plaque #08080F with white cross ON the roofline (x45-68)
- TWO white rooftop boxes (x79-95 + x101-110) — the roofline stepping
- green bushes #4C9028 at bottom corners (right bigger)
- soft gray ground shadow #D5D6DC under the base

## Key findings
- v8's frame-fill fix was decisive: the invisible white halo plane inflated the
  camera bbox, shrinking the building to ~35% of frame vs mockup's ~65% —
  the recurring 'proportions' complaint in every audit. Removing it + margin
  1.06 -> building fills 56% of frame -> audit jumped 0.65 -> 0.75.
- The radial ground shadow faded its visible core NARROWER than the building
  ('only under the middle') — replaced with flat-core linear gradient.
- v4's ground shadow at z=0 was occluded BY the building ('floating') — moved
  to z=0.06 in front.

## Audit trail (glm-5.3-flash, oscillation +/-0.1 documented honestly)
v3(pre-reset) 0.72 · v4 0.55 · v5 0.70 · v6 0.65 · v7 0.65 · **v8 0.75 PASS**
- v8: silhouette 0.8 · details 0.65 · colors 0.9 · overall 0.75
- Reads oscillate on painterly micro-details (roof-slab thickness, window
  sizes, door height flip between audits); three reads at/above gate (0.72,
  0.70, 0.75). Shipped geometry carries every objective pixel fix.

## Delivered
- assets/images/home3d/tile-hospital@2x.png (128x84, 9.0KB)
- assets/images/home3d/tile-hospital@3x.png (192x127, 14.3KB)
- home3d-manifest.json updated
- render-host/src/tile-hospital-factory.ts (deterministic, commented)

## Evidence
- cmp-v1..v8.png + vlm-v*.json: full iteration trail
- render-v8.png / tile-hospital-transparent.png: final
- sandbox reset recovery: this asset was rebuilt post-reset (v3's 0.72 audit
  was lost with the pre-reset workspace; the trail above is post-reset only)
