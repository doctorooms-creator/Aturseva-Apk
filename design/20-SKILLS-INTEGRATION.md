# 20 — SKILLS INTEGRATION: img2threejs + taste-skill (round R52, ANALYSIS ONLY)

> **Directive**: owner added 2 skills to help build the exact-same Home v3
> (`img2threejs` + `taste-skill`), asking whether the assets can be built
> by me using these skills. **NO DEVELOPMENT STARTED.** This doc is the
> verified assessment + the revised pipeline (supersedes doc 19 PART 2's
> asset pipeline; all other doc 19 architecture stands).

---

## PART 1 — BOTH SKILLS: VERIFIED INSTALLED & COMPATIBLE

| | img2threejs v2.0.1 (Apache-2.0) | taste-skill 2.5.1 (MIT) |
|---|---|---|
| Where | `/home/z/skills/img2threejs` (cloned ✓) | `/home/z/skills/taste-skill` (cloned ✓) |
| What it is | Reference image → **code-only procedural Three.js model** (THREE.Group factory, staged sculpt pipeline, AI-vision self-correction loop, detail-inventory gates, per-region material comparison) | Anti-slop frontend skill — builds/reviews at figma/x.ai level: one design system, plain copy, real photographs, equal edges, quiet micro-interactions, **browser-run checker + finish gate** |
| Host needs | agent vision (my VLM ✓) + agent browser (my Chromium ✓) — "agent-agnostic" by design | Node 22+ (v24 ✓) · Chrome/Chromium (✓ playwright chromium-1200) · ffmpeg (✓) |
| Its own quality gates | staged passes w/ screenshot verification, turntable gate (4-angle capture), comparison sheets vs reference, fidelity scoring | real-browser checker + finish gate (runs on builds via `.taste-skill/build.json`) |

**Sandbox verification done this round**: both repos cloned clean, SKILL.md
entrypoints read, environment checks all pass. Zero external dependencies
remain for the Home v3 build.

---

## PART 2 — THE ARCHITECT'S CORE DECISION: 3D AT BUILD-TIME, PNG AT RUNTIME

img2threejs produces Three.js **code**. The question was where that 3D lives
in the app. Verdict:

| Option | Verdict |
|---|---|
| Runtime Three.js in RN (three + expo-gl + GLView) | **REJECTED** — +600KB bundle, GPU/battery cost, expo-gl complexity, OTA budget pressure; the mockup's props are STATIC illustrations, nothing animates in 3D |
| **img2threejs as BUILD-TIME asset FACTORY → browser render → transparent PNG @2x/@3x → bundle in app** | **CHOSEN** — the 3D lives at build time; the app ships lightweight static PNGs (≤40KB each, OTA-safe); models remain code → parametric edits, deterministic re-renders, no AI-image lottery |
| Pure AI image-generation (doc 19's original plan) | **DEMOTEDED to per-asset fallback** (see ladder) |

### Why this is the right call for "exact same"

- **Style-lock by construction**: all 8 assets share the same procedural
  material/lighting definitions in code — the mockup's consistent
  claymorphic look (VLM-extracted style params: matte white/blue palette,
  pillow-soft volumes, upper-front studio light, contact shadows) becomes
  the model shaders, not prompt luck.
- **Its gates do my auditing**: turntable screenshots + comparison sheets vs
  the reference crop + fidelity scores — replacing my manual VLM reject loop
  with a gated pipeline (my VLM is the "agent vision" it calls).
- **The token-card insight gets stronger**: the fanned token cards = a
  procedural model built **BLANK** → render → PNG → the live number is
  code-rendered in RN (Geist, tabular) from the booking API. 3D container +
  real data, exactly as doc 19 §2.3 ruled.

### Revised asset pipeline (supersedes doc 19 PART 2.2)

1. **Crop** the 8 assets from `owner-home-v3-FULL-reference.png` (PIL, exact
   bboxes + a 20% pad).
2. **img2threejs run per asset** — profile: `generic` (hospital/tubes/laptop/
   token-stack/shield — hard-surface) / `character` (hero doctor, tile-doctor
   bust); pipeline stages: intake validation → detail inventory → sculpt
   spec → staged build w/ screenshot verify (its turntable/comparison gates,
   driven through my Chromium + VLM).
3. **Final render** — its review viewpoint → headless Chromium capture at
   exact dp sizes (tile 128/192, hero 320/480, shield 110/165, stack 240/360),
   transparent background (scene alpha), contact shadow preserved.
4. **Trim/quantize/bundle** — same as doc 19 steps 4–6 (≤40KB/asset target,
   `assets/images/home3d/`).
5. **Gate** — VLM side-by-side vs the mockup crop + E2E pageErrors + full-zone
   audit (unchanged).

### Per-asset fallback ladder (honest)

Asset fails img2threejs's own fidelity gate twice (most likely: the organic
cartoon doctor) → that asset falls back to the Image-Generation skill
(style-locked prompt from doc 19 §2.1, VLM-audited) → both paths end in the
same PNG bundle + audit step. Expected split: hard-surface props (5) via
img2threejs, character (hero doctor, maybe tile-doctor) possibly AI-gen —
decided per-asset by gates, not by preference.

---

## PART 3 — taste-skill's ROLE IN THE APP BUILD (scoped honestly)

taste-skill is web-first (its house rules reference 1440/1024/768/390 checks,
hover states, one-section-per-screen). Our app is RN — so its role is
**governance + web-export gate**, not the build system:

1. **Design-rule mapping** (its rules → app equivalents): one design system =
  our token layer; equal left/right edges = our 20px gutter law; plain copy
  in a voice of its own = the mockup's verbatim copy; real photographs =
  our real-photo pipeline; quiet micro-interactions = our press/pressable
  laws; NO caption-under-image → minimal labels, credits in one line.
2. **Checker/finish gate on the :8090 web export** — the RN app exports as a
  react-native-web page; taste-skill's browser gate runs against it as an
  additional audit layer alongside VLM + E2E (mobile-390 viewport = its
  narrow check).
3. **Licensed stand-in photographs** — its Wikimedia Commons pipeline is the
  honest candidate for the hospital-rail photos (prod images empty today,
  initials-fallback is current honesty): licensed building photos + our own
  representative-label law (doc 08 §5). Owner decision F (new): initials
  fallback (current, default) vs licensed stand-ins w/ credit line.

---

## PART 4 — ANSWER TO THE OWNER'S QUESTION (verbatim topics)

**"Can the assets be built by you using these skills?" — YES.** Both skills
are installed and verified in the sandbox; img2threejs drives my own VLM +
Chromium for its gates; taste-skill's gate runs my Chromium too. Nothing
needs building by anyone else — the full stack for the exact-same Home v3:
my RN code (14 zones) + img2threejs asset factory (8 clay assets → PNGs) +
Image-Gen fallback + taste-skill/Uber/impeccable/VLM governance. Owner-side
blockers unchanged (Firebase push, Twilio OTP, Maps key, Vercel, Play
Console, iOS) — none touch the home build.

**Waiting on**: owner GO + decisions **A** (green live accent — default) ·
**B** (next-slot live — default) · **C** (Family Profiles doorway — default) ·
**D** (search flat #F5F5F6 — default) · **E** (stats strip dropped — default) ·
**NEW F** (hospital rail: initials fallback — default — vs licensed stand-ins).

---

## PART 5 — SAVED THIS ROUND (zero app code touched)

- `/home/z/skills/img2threejs` + `/home/z/skills/taste-skill` — installed
- `design/20-SKILLS-INTEGRATION.md` — this document
- Skills repos NOT committed into Aturseva-Apk (they're tooling, not app
  assets; the doc records their role)

*Round R52 · analysis only, per owner directive · architect: Z.ai*
