# tile-labtubes (asset 4/7) — P1 Asset Studio run record

## Route decision (bounded ladder per plan §2.3)
- 3D-code flat-vector: 5 iterations (v1-v5). Trail: 0.45 · 0.45 · 0.35 · 0.55 · 0.40.
  The VLM's asks moved past the flat-vector vocabulary (transmission shaders,
  'curved mid-height stands', subsurface glow) — unachievable in MeshBasic.
- AI-gen (2 takes): take1 **0.65** (silhouette 0.7, colors 0.85), take2 0.6
  (hard liquid edge returned). Take1 = best candidate.

## Pixel ground truth (crops/tile-labtubes.png, 112x119)
- 3 tubes, x centers ~38/62/87px (tube 3 slightly taller), red #CC0C0D core
- red fills ~62% of tube height; white glass above; flared rims (tops wider→narrow)
- white rack slab with leg gaps; soft shadow

## Key findings
- The v3 mid-tube 'toprail' created a hard white bar ACROSS the red (the
  'inner rod' complaint) — the mockup's rack lip sits at tube BOTTOMS. Removed.
- The v3 full-height gloss band read as a 'rod through the red' — mockup gloss
  lives on the upper glass only. Shortened/raised.
- SAFE palette quantization discovered: RGB-only ADAPTIVE 256-color + original
  alpha merged separately (max sampled channel diff 4/255 — imperceptible).
  The shield's FASTOCTREE lesson was RGBA->P; this path avoids it.
  imgen-take1 @3x 45.7KB → 37.4KB, under the 40KB budget. Bundler updated
  (only quantizes when RGBA exceeds budget).

## Verdict (honest)
- BEST AUDIT 0.65 (AI-gen take1). Below the 0.7 gate. Ladder exhausted
  (5x 3D-code + 2x AI-gen). Verdict to C1 per plan risk table, as with
  token-stack. AI route bundled: the clay/gloss style is image-gen's home
  turf (0.65 > 0.55 best 3D), and the size budget now holds with safe
  quantization.

## Delivered
- assets/images/home3d/tile-labtubes@2x.png (128x153, 25.5KB)
- assets/images/home3d/tile-labtubes@3x.png (192x230, 37.4KB — quantized 256)
- home3d-manifest.json updated
- render-host/src/tile-labtubes-factory.ts (deterministic 3D route preserved
  for reference/iteration)

## Evidence
- cmp-v1..v5.png + vlm-v*.json: 3D trail
- cmp-imgen1/2.png + vlm-imgen1/2.json: AI-gen trail
- imgen-take1.png / imgen-take1-quant128.png: candidates
