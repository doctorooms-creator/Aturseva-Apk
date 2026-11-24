---
name: mobile-persona-matrix
description: Persona-based mobile device testing for the Aturseva app — emulates Android font scales and device viewports on the RN-web simulation, captures zone screenshots, and audits each persona's experience with VLM. Use when asked to test the app on different phones, check text truncation, dead bands, layout fit, accessibility (large fonts), or before shipping a build. Adapted from the open-source mobile-agent-testers methodology (github.com/pierridotite/mobile-agent-testers, MIT).
license: MIT
---

# Mobile Persona Matrix Skill

One persona = one phone + one font scale + one goal. Each run emulates that
persona on the RN-web simulation (the same app code), then a VLM audits the
screenshots against the persona's goal. This is the bug class that killed the
owner's first V4 build: 20:9 phone + hidden zone left a dead band, and OS font
scale truncated bold labels — both invisible in plain desktop browsing.

**Skill Location**: `{project_path}/skills/mobile-persona-matrix`

## The personas

Defined in `scripts/personas.json` (6 personas, priority order):

| id | device dp | font scale | catches |
|---|---|---|---|
| owner | 411×914 (20:9) | 1.0 | the reference phone — dead bands, aspect gap |
| ravi | 411×731 (16:9) | 1.15 | primary Hindi-belt user, older small phone |
| anna | 360×640 | 1.3 | large-text label truncation |
| grace | 412×915 | 2.0 | extreme accessibility, clipped lines |
| malik | 412×915 | 1.0 | fast modern phone, dark surroundings |
| lucia | 768×1024 | 1.0 | tablet column cap (V4_MAX_W 512dp) |

## Quick start

```bash
cd skills/mobile-persona-matrix/scripts

# The reference phone, layout audit (the standing pre-ship check)
./run-persona.sh owner layout

# The truncation catcher
./run-persona.sh anna layout

# A new-user journey audit
./run-persona.sh ravi explore

# Reproduce a reported bug on a persona's phone
./run-persona.sh grace "reproduce:open home, read all section titles"

# Full matrix (all six, layout) — the pre-ship gate
for p in owner ravi anna grace malik lucia; do ./run-persona.sh "$p" layout; done
```

Requires: dev server running (`/app/` reachable), `agent-browser`, `z-ai` CLI.
Evidence lands in `evidence/persona-matrix/` (screenshots + verdict JSONs).

## How it works

1. **Viewport** — exact device dp as the browser viewport (RN-web maps dp≈css px).
2. **Font scale emulation** — `scale-text.js` multiplies every text node's
   fontSize and lineHeight by the persona's factor, boxes untouched. This is
   what Android's "Font size" setting does (sp grows, dp fixed) and it is the
   honest way to catch truncation in a browser. It re-applies after every
   scroll/settle because React re-renders.
3. **Zone capture** — top / mid / bottom screenshots so no zone of the home
   screen escapes the audit.
4. **VLM audit** — persona's profile + goal drive a strict checklist
   (dead band, truncation, overlap, nav visibility, height fill).

## Briefs

- `layout` — the fixed pre-ship checklist (default).
- `explore` — new-user journey; report every hesitation point.
- `improve` — UX friction list by area and impact.
- `reproduce:<steps>` — a reported bug, verified on this persona's phone.

## Phase 2 — real emulators (not yet active)

The full mobile-agent-testers system runs 20 Claude/GLM agents on 20 real
Android emulators + iOS simulators on GitHub Actions (free for public repos,
~$0.15–0.55 per phone per run). It found exactly our bug class on AnkiDroid
(buttons cut at 200% font) and LocalSend (46 bugs, 14 languages). Blocked for
Aturseva until two things exist:

1. **A staging API** — agents must never create real bookings on the live
   aturseva.com production system. Build the test APK against a staging or
   mock base URL (the app supports `EXPO_PUBLIC_API_BASE`).
2. **An LLM key** — an Anthropic-compatible key (GLM works per their docs);
   set as `LLM_API_KEY` + `LLM_BASE_URL` secrets.

Then (commands ready, source repo is private so `SOURCE_REPO_TOKEN` carries
our PAT):

```bash
gh repo create aturseva-testers --public --template pierridotite/mobile-agent-testers --clone
cd aturseva-testers && ./setup.sh
gh secret set SOURCE_REPO_TOKEN < /home/z/.github-token
gh workflow run agent-testers.yml \
  -f source_repo=doctorooms-creator/Aturseva-Apk \
  -f app_id=com.aturseva.app \
  -f android_personas=anna,ravi,grace \
  -f brief="$(cat brief.md)"
```

Do NOT run Phase 2 against production data. The Hindi persona (`ravi`) and RTL
personas are only meaningful there — the web simulation cannot render device
locales.

## Law

**Pre-ship gate**: `owner ravi anna grace malik lucia` × `layout` —
zero FAIL lines at fontScale 1.0 (owner, malik, lucia) is BLOCKING.
Font-scale FAILs (ravi 1.15, anna 1.3, grace 2.0) are TRIAGE: the emulator
scales every text uniformly and ignores the app's `maxFontSizeMultiplier`
caps (RN-web has no OS font scale, so caps are invisible in the DOM) — it is
an upper-bound STRESS test. A FAIL there names the at-risk labels; confirm
on a real device (Expo Go → Settings → Font size) before treating as a bug.

## Pipeline truths (learned the hard way)

- RN-web scrolls an INNER overflow div — `window.scrollTo` is a no-op.
  The script targets the real scroller (`run-persona.sh` shot()).
- The gap above the nav pill = `paddingBottom − pill footprint`. Stretch
  bands always fill their container completely, so a designed gap must live
  in the padding itself, not in a band's flexGrow weight.
- A "cut off at the fold" screenshot is NOT "hidden under the nav" — always
  verify overlap claims with DOM geometry before believing a VLM verdict.
- On personas whose content scrolls (short phones, big fonts), the TOP
  screenshot shows content passing under the floating nav — that is what a
  scrolling screen with an overlay nav DOES (Instagram, Uber alike). Teach
  the reader of the verdict: fold cuts on screen 1 are by design; only the
  bottom (full-scroll) screenshot judges the gap above the pill.
- Mid-word wraps on tiny chip labels at 1.15+ ("Pulmonolog / y") are
  graceful degradation, not bugs — the label stays fully readable across
  two lines. Ellipsis (hidden meaning) was the bug class; wraps are the
  cure. Placeholder ellipsis in the search field is standard everywhere.
