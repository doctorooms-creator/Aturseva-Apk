# token-stack (asset 2/7) — P1 Asset Studio run record

## Route decision
- 3D-code flat-vector route: 14 iterations (v1-v14, pre-reset). Pixel ground truth:
  - The '#' masses around the stack are the INK BANNER (#1F1F1F, app code — NOT asset).
  - Asset = card stack only: white front card + gray backs, light page bg.
  - Front card top edge: pixel-verified -8deg screen slope = rising right =
    three.js +8deg (clean trace x70-125: y33->y24; earlier reads contaminated
    by text glyphs + rear-card edges — the source of two sign flips).
  - Card proportions: mid-span 129px + bbox 150x95 -> landscape ~1.35-1.6.
  - Fan (4 VLM reads agree + left-gray edge trace +26deg): backs rotate
    progressively POSITIVE (clockwise), pivoting near the front card's
    bottom-left — reveals top-right, one card overhanging bottom-left.
  - Backs carry dark seam + bright rim band (mockup's gWg banding) so layers
    read as DISTINCT cards.
- AI-gen fallback (bounded 2 takes per plan §2.3): take1 0.45 (even fan, not
  pile), take2 0.5 (blue accent contamination).

## Verdict (honest)
- BEST AUDIT ~0.5-0.55. BELOW the 0.7 gate. Bounded ladder exhausted
  (14x 3D-code + 2x AI-gen).
- Per plan risk table: "verdict shown to you at C1" — the mockup's stack reads
  as a painterly hybrid (audit reads flip between 'loose fan' and 'tight pile');
  both routes plateau at ~0.5. The audits disagree on tilt direction between
  reads; pixel truth says +8deg front (verified twice).
- 3D route bundled (cleanliness + exactness: exact ink palette, no AI
  artifacts, tiny geometry) — same argument the shield used vs imgen.

## Delivered
- assets/images/home3d/token-stack@2x.png (240x214, 21.9KB)
- assets/images/home3d/token-stack@3x.png (360x321, 40.3KB — at the 40KB line)
- home3d-manifest.json updated
- Cards BLANK by design (live token number is app-rendered, plan §2.4).
- render-host/src/token-stack-factory.ts (deterministic, fully commented)

## Sandbox reset recovery
This asset was fully rebuilt post-reset from the final v14 configuration
(byte-identical bundles: 21952 / 40293 bytes pre- and post-reset). The 14-iteration
cmp/vlm trail was lost with the pre-reset workspace; this summary preserves the
measured conclusions.
