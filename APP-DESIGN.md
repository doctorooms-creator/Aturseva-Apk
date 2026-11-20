# APP-DESIGN — Aturseva app design brief (machine-readable)

> Extracted at APK-B1 kickoff per doc 03 §9 deliverable chain:
> `03-DESIGN-SYSTEM.md` → this file → design-token TS module
> (`src/lib/tokens.ts` — the single source in code).
> Format family: DESIGN.md (Uber-class reference grammar), values = ours.

## Overview

Aturseva patient app — "Editorial Care": Uber discipline, healthcare soul.
Restraint is the brand. Hierarchy by scale, not decoration. One primary
action per screen. Live state is the visual protagonist (token/queue).

## Colors

### Brand & Accent
- `teal-live`: #0F766E — LIVE ONLY (pulse dot, selected-slot ring, live chips). Never decorative, never headings.
- Dark-mode variant (P1/APK-B4): #2DD4BF; soft tint #CCFBF1 / #0F3D38.

### Surface
- `canvas`: #FFFFFF (always background)
- `canvas-soft`: #F4F4F2 (quiet zones: input fills, section bands)
- Dark: #0C0C0C / #1A1A19

### Text
- `ink`: #0A0A0A — headings + primary CTA bg (black pill = Uber law)
- `body`: #5E5E5E — copy
- `mute`: #AFAFAF — captions, placeholders (NEVER for actions)
- Dark: #F5F5F5 / #B8B8B8 / #7A7A7A

### Semantic
- `success`: #15803D · `warn`: #B45309 (leave-by, offline strips) · `error`: #B91C1C — semantic only
- `hairline`: #E7E7E7 — 1px dividers only

### Forbidden
No blue/indigo/violet. No steel except ≤4% photo overlays.

## Typography

- Family: system stack (SF/Roboto) P0 — zero font payload; weight-scale does hierarchy.
- Scale (size/line, weight): display-hero 32/36 700 (TOKEN number) · display 24/28 700 · title 18/22 600 · body 15/22 400 · body-strong 15/22 600 · caption 12/16 400.
- Money/turn numbers: `fontVariant: tabular-nums`, NEVER body-weight.
- Never ALL-CAPS body.

## Layout

- Spacing (8-grid): 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48
- Min touch: 44×44 everywhere; chips hit-slop extended
- Home: NO top bar — search field is the crown (content at y=0, safe-area padded)
- Tab bar: exactly 3 tabs (Home/Bookings/Profile) P0; active = ink, inactive = mute; labels always

## Elevation & Depth

2 levels only: cards (2dp, 4% ink) · sheets (8dp + scrim). No deep shadow stacks.

## Shapes

- Pills: 999 radius on ALL interactives (buttons, chips, inputs)
- Cards: 16 · inputs: 12 · sheet-top: 24 · avatar: full

## Components

- Button (pill): default · pressed(scale .98 + darken) · disabled · loading(text kept)
- Input: empty · focused(teal 2px ring) · error(msg below) · disabled
- Doctor card: skeleton · loaded · unbookable(honest "slots closed")
- Chip: default · selected(ink bg/white) · disabled
- Bottom sheet: spring rise; task never leaves its screen
- Skeleton rails: mirror final layout EXACTLY; crossfade 150ms
- Empty state: doorway — line-art icon + one human sentence + 1-3 action chips
- Trust chips (Reg/⭐4.6 · 112) — quiet, never banners
- Offline strip: amber, tap = retry; cached-last-good stays visible
- Queue pulse dot: 2s opacity loop, teal — the ONLY ambient animation in P0

## Motion

- Press 80ms scale .98 · push 250ms · sheets spring (damping .8)
- Celebration (B3): single burst ≤1.5s then calm
- Haptics: success only; never decorative

## Copy tone

EN + Hinglish, warm-care: "Your turn is confirmed" / "Aapki turn confirm ho
gayi". Never technical ("API failed" ❌ → "Line me dikkt — ek tap me dobara
try karein" ✅).

## Do's & Don'ts

DO: one primary action/screen · fee/turn tabular bold · skeletons mirror
layout · pills everywhere interactive · teal only live · 44px+ · Hinglish
warmth · trust chips not banners.

DON'T: decorative color/shadows · >2 type weights/screen · spinners where
skeletons fit · ALL-CAPS body · fake data in ANY state · red for
non-destructive · 5+ bottom tabs · marketing banners · icons without labels
on nav.
