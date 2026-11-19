# 03 — DESIGN SYSTEM & VISUAL LANGUAGE — "Editorial Care" (Uber discipline, Aturseva soul)

> Status: DRAFT v1 (Round 27) — owner review pending. Planning doc, not code.
> Parent index: A2. Base: `DESIGN-uber.md` (owner-selected reference) — adapted, never copied.
> Owner ask: "visual representation bahut zyada matlab rakhta hai" — this doc owns that.

## 1. Philosophy (inherited from the Uber reference, translated to healthcare)

1. **Restraint is the brand.** White canvas, ink text, grey support — color is SPENT
   only on meaning (live state, selection, success/error). Decorative color = noise = out.
2. **Hierarchy by scale, not by decoration.** Size + weight do all hierarchy work —
   never color-only, never shadow-only.
3. **One primary action per screen.** Black pill CTA; everything else is deliberately quieter.
4. **Pill grammar.** Every interactive element = 999px radius pill (buttons, chips, inputs).
   Cards = 16px. Sheets = 24px top. (Direct from reference doc.)
5. **4:3 editorial photography** of real warm humans (faces, hands, waiting rooms) —
   never cold stock, never clip-art.
6. **Live state is the visual protagonist** — the biggest, boldest surface in the whole
   app is the TOKEN/QUEUE moment, not a marketing banner.

## 2. Color tokens (healthcare skin over Uber skeleton)

| Token | Value | Use | Law |
|---|---|---|---|
| `canvas` | #FFFFFF | background | always |
| `canvas-soft` | #F4F4F2 | section bands, input fills | quiet zones only |
| `ink` | #0A0A0A | headings, primary CTA bg | black button = Uber law kept |
| `body` | #5E5E5E | body copy | — |
| `mute` | #AFAFAF | captions, placeholders | never for actions |
| `hairline` | #E7E7E7 | dividers | 1px only |
| `teal-live` | #0F766E | **LIVE ONLY**: queue pulse dot, selected-slot ring, live chips, progress | never decorative; never headings |
| `success` | #15803D | confirmed states | semantic only |
| `warn` | #B45309 | advisories (leave-by) | semantic only |
| `error` | #B91C1C | destructive/errors | semantic only |
| `steel` (gloss) | ≤4% surfaces | photo overlays | from web palette v1.1 law |

Dark mode: **P1 planned** — all tokens dual-defined from B1 (build cost ≈ zero if
tokens are clean from day 1; that's why this table exists BEFORE code).

## 3. Type scale (system font stack P0; weights do hierarchy)

| Style | size/line (px) | weight | Use |
|---|---|---|---|
| display-hero | 32/36 | 700 | TOKEN number, celebration |
| display | 24/28 | 700 | screen titles (booking success) |
| title | 18/22 | 600 | card headers, section titles |
| body | 15/22 | 400 | default copy |
| body-strong | 15/22 | 600 | names, prices |
| caption | 12/16 | 400 | meta, timestamps, honesty lines |

Rules: 1 rem-like step sizes; NEVER ALL-CAPS body; numbers in tabular figures
(₹fee, token, people-ahead) — money/turn numbers NEVER in body-weight.

## 4. Space, radius, elevation

- **Spacing scale:** 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 (8-grid).
- **Radius:** pill 999 (interactive) · card 16 · input 12 · sheet-top 24 · avatar full.
- **Elevation:** 2 levels only — cards (2dp shadow, 4% ink) and sheets (8dp + scrim).
  No deep stacks of shadows (Uber restraint).
- **Minimum touch:** 44×44 everywhere (law in doc 04); chips hit-slop extended.

## 5. Component inventory + states (the kit APK-B1 builds)

| Component | States required |
|---|---|
| Button (pill) | default · pressed(scale .98 + darken 4%) · disabled · loading(spinner-in-place, text kept) |
| Input | empty · focused(teal ring 2px) · error(msg below, error ring) · disabled |
| Doctor card | loading skeleton · loaded · unbookable (fee hidden? NO — honest "slots closed") |
| Chip (symptom/filter/date/slot) | default · selected(ink bg/white text) · disabled(full slot) |
| Bottom sheet | dragging · settled (spring) |
| List row (booking) · badge (status) · toast · avatar (photo→initials fallback) · skeleton rails · empty-state art + doorway chips · trust strip · queue meter · progress steps |
| Pull-to-refresh (system) + offline banner (amber strip, tap = retry) |

## 6. Motion & feel laws (visual representation is motion too)

| Case | Duration/Easing | Law |
|---|---|---|
| Button press | 80ms scale .98 | instant acknowledgment |
| Sheet rise | spring (damping .8) | task stays in place — never navigate mid-task |
| Screen push | 250ms standard | consistent stack motion |
| Skeleton → content | crossfade 150ms | no layout jump (skeletons must match final layout EXACTLY) |
| Queue pulse dot | 2s opacity loop, teal | the ONLY ambient animation in P0 (live = breathing) |
| Celebration (booking success) | 300ms scale-in + confetti-restraint (single burst ≤ 1.5s) then calm | joy, then restraint |
| Haptics | success/confirm only (light) · errors none | never decorative |

Copy tone (EN + Hinglish, warm-care): "Your turn is confirmed" · "Aapki turn
confirm ho gayi" — short, human, never technical ("API failed" ❌ → "Line me
dikkt — ek tap me dobara try karein" ✅ pattern).

## 7. Visual representation strategy (per surface type)

- **Empty states** = doorway, never dead-end: icon (line-art, 2-color max) + one
  human sentence + 1-3 action chips ("Try 'fever'", "Nearby doctors", "Call support").
- **Loading** = skeleton-first (matching layout), never spinners >300ms.
- **Trust** = quiet chips (Reg no., NABL, ⭐4.6 · 112) — never banners.
- **Live data** = biggest numbers on screen, tabular figures, teal pulse only there.
- **Photography** = 4:3 editorial, warm humans (web's proven photo pipeline reuse).
- **Illustration** = line-art only, 2 colors, only for empty/onboarding — never in content.

## 8. Do's & Don'ts (the reference doc's strongest section — ours)

**DO** — one primary action per screen · fee/turn numbers in tabular bold ·
skeletons mirror final layout · pills on everything interactive · 4:3 photos of warm
humans · teal ONLY for live/selection · 44px+ touch · Hinglish warmth in microcopy ·
trust chips not banners.

**DON'T** — decorative color/shadows · more than 2 type weights per screen ·
spinners where skeletons fit · ALL-CAPS body · fake data in any state ·
red for anything non-destructive · bottom nav with 5+ items · banners for marketing
in app · icons without labels on nav.

## 9. Deliverable chain

This doc → `APP-DESIGN.md` (machine-readable DESIGN.md-format, extracted at APK-B1
kickoff) → design-token TS module (single source in code). Web repo's tailwind
palette stays the visual sibling (same family, same discipline).
