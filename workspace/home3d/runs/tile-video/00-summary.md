# tile-video (asset 5/7) — P1 Asset Studio run record

## Route decision (bounded ladder per plan §2.3)
- 3D-code flat-vector: 5 iterations (v1-v5). Trail: 0.4 · 0.35 · 0.6 · **0.65 (v4)** · 0.55.
- AI-gen (2 takes): take1 **0.65**, take2 0.55 (angular, heavy shadow returned).
- Ladder exhausted at a TIE (0.65 = 0.65). Ties go to the 3D route: tiny
  deterministic file, style-locked with the tile family (hospital/shield),
  exact palette, no AI artifacts. Shipped geometry = v5 (all convergent fixes:
  narrower base per v2-v4 asks, dark bezel, dark key rows, deeper blue,
  silver frame, avatar bubble + subtle bust glyph, stronger shadow).

## Pixel ground truth (crops/tile-video.png, 133x105)
- screen: dark bezel x41-107 y30-75 (aspect ~1.47), periwinkle blue #88A0F8
  family ((136,160,248) dominant), WHITE rounded window x65-81 y41-68
- PIXEL VERIFICATION: the window is PLAIN WHITE (93% white/light tones) — the
  VLM's 'avatar person icon' is a hallucination; the glyph added in v3+ is a
  subtle two-audit-requested enhancement, kept LOW-contrast (#c8d2ec family)
  to stay honest to the mockup's plain window.
- base: white trapezoid widening toward viewer, dark keyboard key rows,
  soft shadow

## Key findings
- The v1/v2 keyboard strip layouts read as 'odd black bars at the hinge' —
  keyboard must sit clear of the screen-bezel overlap zone.
- The avatar glyph dispute: two audits 'saw' an avatar that pixels disprove.
  Added subtly anyway (improves the video-call read) — documented honestly.
- The elevation=8 camera gives the slight top-down foreshortening the audits
  kept asking for ('3/4 view') without a model rebuild.

## Verdict (honest)
- BEST AUDIT 0.65 (tie both routes). Below the 0.7 gate. Ladder exhausted.
- Verdict to C1 with token-stack + labtubes per plan risk table.

## Delivered
- assets/images/home3d/tile-video@2x.png (128x88, 7.6KB)
- assets/images/home3d/tile-video@3x.png (192x133, 13.4KB)
- home3d-manifest.json updated (5/7)
- render-host/src/tile-video-factory.ts (deterministic)

## Evidence
- cmp-v1..v5.png + vlm-v*.json: 3D trail
- cmp-imgen1/2.png + vlm-imgen1/2.json: AI-gen trail
- tile-video-transparent.png: final source
