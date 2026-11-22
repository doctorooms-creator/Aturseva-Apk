# 18 — HOME v3 MASTER BUILD PLAN (P0–P8 · the owner-gated execution bible)

> **Directive** (2026-11-23): *"You act as my system Architect and let's first
> make a detailed plan so we can go in depth — phase by phase, which phase
> builds which assets — because I don't know how exact-same will be done.
> I'm a non-technical person, please don't break my trust. First plan, then
> assets, then development."*
>
> **Status: PLAN ONLY. Zero app code touched.** This doc consolidates
> `design/19` (the 14-zone decoded spec) + `design/20` (the skills ruling)
> into ONE execution ladder, in the exact order the owner asked for:
> **plan (this doc) → assets (P1) → development (P2–P7) → acceptance (P8)**.
> On GO it becomes the build contract; every phase is gated and every gate
> produces evidence pushed to GitHub the same round.

---

## PART 0 — THE PLAN IN PLAIN ENGLISH (owner's guide, no jargon)

### 0.1 One paragraph
We rebuild the app's Home screen to look exactly like your FULL mockup
(`design/owner-home-v3-FULL-reference.png` — 14 sections, top to bottom).
The work is cut into 9 small phases. **Phase P1 builds all the 3D artwork
FIRST — before any screen code — and you personally approve the artwork
side-by-side against your mockup before I'm allowed to touch the UI.**
After that, sections get built top-to-bottom, and at 5 fixed checkpoints you
see screenshots and say pass/fix. Nothing ships to your phone until the
final side-by-side passes at every phone width, light AND dark.

### 0.2 The order you asked for — mapped to phases
| Your words | My phases |
|---|---|
| "pehle plan build karenge" | this doc (P0 = this round, done) |
| "then assets" | **P1 Asset Studio** — all 3D artwork, your checkpoint #1 |
| "then development" | P2 foundations → P3 zones 1–8 → P4 zones 9–14 → P5 polish → P6 full audit → P7 release |
| (implied) "don't break my trust" | P8 your acceptance + the 5-checkpoint protocol below |

### 0.3 How "exact same" is actually enforced (the honest method)
1. Your mockup file is archived in the repo — the single source of truth.
2. Every section was AI-vision-decoded to a build spec: exact text, colors,
   sizes, spacing (already done — `design/19` PART 1; nothing is guessed).
3. **Every 3D asset is audited side-by-side**: your mockup's crop next to my
   render; an AI vision auditor scores style/colors/shape match. FAIL = it
   gets rebuilt (each path gets 2 attempts) before anything moves on.
4. **Every finished section is screenshotted and re-audited** against the
   mockup the same way — plus tap-through tests so nothing is broken.
5. Final gate: the full screen vs your mockup at 4 phone widths + dark
   mode, all 14 sections judged, then it goes to your phone and YOU do the
   last acceptance with your own eyes.

### 0.4 The 5 places we deliberately differ from the mockup (honesty, not mistakes)
| # | Mockup shows | We build | Why |
|---|---|---|---|
| 1 | Lab tests ₹299/₹699/₹899 | **Real prices ₹170/₹60/₹100** (measured from live site, dated) | fake numbers on a medical app = broken trust; real data wins |
| 2 | Token card "#24" baked into artwork | **blank 3D cards + YOUR live token number** rendered by code | every patient sees their own number, not artwork's #24 forever |
| 3 | "2.1 km" under doctors | omitted | our API has no distance field — we never invent data |
| 4 | hospital building photos | initials fallback today (decision F can add licensed photos) | prod hospital images are empty; your real photos welcome anytime |
| 5 | "Dr. Adam Max" etc. | **real doctors from the live API** with real photos | the mockup's names are artwork; the app shows truth |

### 0.5 Your 5 approval checkpoints (nothing advances without you)
| C# | After phase | You see | You say |
|---|---|---|---|
| C1 | P1 | **the artwork comparison sheet**: mockup crop \| my render \| verdict, all 7 assets | "assets pass" or fix list |
| C2 | P3 | screenshots zones 1–8 (top half of the screen) | pass / fix |
| C3 | P4 | full-screen draft, zones 9–14 + live data | pass / fix |
| C4 | P6 | side-by-side full screen vs mockup, 360/390/412/768 + dark | pass / fix |
| C5 | P7 | the real app on your phone (APK update / Expo Go link on request) | final acceptance |

Between checkpoints I don't need you — every phase is small, reversible,
and evidence gets pushed to GitHub the same day.

---

## PART 1 — MASTER PHASE TABLE (konse phase, kya banta hai, kon assets)

| Phase | Builds | Assets in play | Est. rounds | Gate / checkpoint |
|---|---|---|---|---|
| **P0 Preflight** (this round, done) | plan doc, repo safety-push, dev-server restore, skills verified (R52 ✓) | none | done | this doc = the plan you review |
| **P1 Asset Studio** | all 7 clay assets → audited transparent PNGs + manifest | **hero-3d · tile-doctor · tile-hospital · tile-labtubes · tile-video · token-stack · shield-3d** | 2–3 | per-asset side-by-side audit → **C1** |
| **P2 Foundations** | Geist + Geist Mono fonts, new color tokens, radius map, `home3d` Asset component | consumes P1 PNGs (no new assets) | 1 | tsc/eslint 0 + typography regression check |
| **P3 Zones 1–8** | header · location · hero · search · quick-actions · token-banner · appointment card (skeletons→live data) | hero-3d, 4 tile props, token-stack placed | 1–2 | per-zone E2E + VLM audit → **C2** |
| **P4 Zones 9–14** | find-doctors · hospitals rail · lab pills · health tools · trust banner · 4th nav tab | shield-3d placed (rest = photos/icons/data) | 1–2 | per-zone E2E on real API → **C3** |
| **P5 Interactions** | city picker · search focus/suggest · press states · rail scroll laws · doorway laws | none | 1 | full E2E golden paths |
| **P6 Full gates** | the audit wall | none | 1 | tsc · eslint · E2E matrix 360/390/412/768 + dark · VLM 14-zone side-by-side · taste-skill web-export check · OTA size check → **C4** |
| **P7 Release** | `eas update` OTA + web re-export + dual-repo push + worklog | bundles everything | 1 | channel serves the new home → **C5** |
| **P8 Acceptance** | owner's own device review + next-steps planning | — | — | your formal pass |

Total estimate: **8–10 working rounds** after GO (honest variance: P1 is the
least predictable — AI-generation retries are padded for; everything else is
deterministic code work).

---

## PART 2 — P1 · THE ASSET STUDIO, DEEP-DIVE (the owner's core question)

### 2.1 Inventory — 7 clay assets (doc 19 said "8"; recount = 7, budget noted)
| Asset | What it is | Placed | Render @2x/@3x |
|---|---|---|---|
| `hero-3d` | cartoon doctor, arms crossed, white coat + blue shirt/tie, stethoscope, beside mini hospital + green blob-trees | hero right, ~160dp | 320/480 |
| `tile-doctor` | mini of the same doctor, bust | quick-action tile 1 | 128/192 |
| `tile-hospital` | white hospital, blue windows, black cross, green shrubs | tile 2 | 128/192 |
| `tile-labtubes` | 3–4 glossy test tubes, red liquid, white rack | tile 3 | 128/192 |
| `tile-video` | silver laptop, blue video-call screen w/ avatar frame | tile 4 | 128/192 |
| `token-stack` | fanned white rounded token cards, tilted ~25°, **BLANK** | ink banner right ~120dp | 240/360 |
| `shield-3d` | glossy blue-violet shield, embossed white cross | trust banner ~55dp | 110/165 |
Total budget ≤ 280KB (7 × ≤40KB) — OTA limit 2000 assets: safe by construction.

### 2.2 Pipeline per asset (gated, per `design/20`'s ruling)
1. **Crop** the asset from your mockup (exact box + 20% pad) → this crop
   is ALSO the audit target — one file, two jobs.
2. **img2threejs build** — the reference crop becomes a procedural 3D model
   in code (staged sculpt with its own gates: turntable capture at 4 angles,
   comparison sheet vs reference, fidelity score; my VLM is its "eye", my
   Chromium is its "browser" — all sandbox-verified in R52).
   - **Style-lock by construction**: all 7 assets share one material/lighting
     definition in code (matte white/blue, pillow-soft volumes, upper-front
     studio light, contact shadow) — the mockup's claymorphic look is in the
     shaders, not in prompt luck.
3. **Render to PNG** — headless Chromium captures at the exact dp sizes
   above, transparent background, contact shadow preserved. **The 3D lives at
   BUILD time only; the app ships lightweight static PNGs** (runtime
   Three.js was measured and REJECTED: +600KB bundle, GPU/battery cost —
   nothing in the mockup animates in 3D).
4. **Trim + compress** to ≤40KB each → `assets/images/home3d/` + generated
   `home3d-manifest.json` (name, aspect, focal) for faithful layout.
5. **Audit** — VLM side-by-side: mockup crop vs our PNG; verdicts on
   style/colors/subject; FAIL → ladder (below). PASS → archived to
   `evidence/apk-v3-assets/` (this folder IS checkpoint C1's sheet).

### 2.3 Fallback ladder per asset (bounded, honest)
img2threejs fidelity-gate fails twice → **Image-Generation skill** with the
style-locked prompt from `design/19` §2.1 (2 takes, VLM-audited) → both
paths end in the same PNG bundle + same audit. Expected split: hard-surface
props (hospital/tubes/laptop/token-stack/shield) via the 3D-code factory;
the organic cartoon doctor (hero, maybe tile bust) may need the AI-gen
path — **decided per-asset by gates, not by preference**, and you see every
verdict at C1.

### 2.4 The token-stack insight (why it's generated BLANK)
The mockup's banner shows "Token #24" painted into the 3D card. Baked =
every patient sees #24 forever. We generate the card stack **blank** and
code-render the live number (Geist Mono, tabular) from the user's actual
booking API — the 3D is the container, the number is data. Same law the
queue screen already follows.

### 2.5 NOT in this studio (photographic assets stay honest)
- **Doctor avatars** (appointment card + rows): the existing real-photo
  pipeline (curated-or-real with representative labels) — real data flows.
- **Hospital photos**: prod is empty today → initials fallback (decision F
  offers licensed stand-ins w/ credit; your real photos beat both).
- **Lab icons**: flat line icons — the mockup itself uses a line flask.

---

## PART 3 — P2 · FOUNDATIONS (fonts, tokens, the Asset component)

1. **Geist + Geist Mono** (`@expo-google-fonts/geist`, else bundled OFL
   TTFs) — the website's own fonts, `useFonts` splash gate. Numerals
   (metrics/prices/token) = Geist Mono tabular. Note: this changes
   typography app-wide → regression check on listing/token screens included.
2. **Token layer** (light | dark pairs): `liveGreen #22A94E` (+soft
   `#DCF5E3`) · `starYellow #F5B301` · `promoLavender #E7E6FA` · `chipIdle
   #F0F0F1` · card soft `#F7F7F8` (map to current canvasSoft) · red
   `#FF3B30` semantic-only. Radius: cards r24, nav pill r36 / active-pod r28.
3. **`home3d` `<Asset/>` component** — manifest-driven, aspect-faithful
   sizing, dark-mode safe.
4. Gates: tsc 0 · eslint 0 · E2E existing golden path still green · VLM
   typography spot-check on :8090.

## PART 4 — P3 + P4 · THE 14 ZONES (component + data + honesty map)

| # | Zone | Component (N=new / A=adapted) | Data source | Honesty ruling |
|---|---|---|---|---|
| 2 | Header | N `home-header` | — | bell red-dot = semantic only |
| 3 | Location | A city-picker sheet | saved city | tap = city change (reuse) |
| 4 | Hero | N `home-hero` | verbatim copy | hero-3d placed |
| 5 | Search | A SearchField | — | decision D (flat vs glass) |
| 6 | Quick actions ×4 | N `quick-actions` | routes | Lab tile → aturseva.com handoff (existing law) |
| 7 | Token banner | N `token-banner` | static copy | **blank stack + live number** |
| 8 | Your appointment | N `appointment-card` | booking + queue APIs | guest=doorway · no-booking=**section hides** |
| 9 | Find doctors | N `doctor-rows` | `/api/public/doctors` | no distance · stars only real |
| 9b | chips | A search-chip pattern | same endpoint | All/GP/Cardio/Ortho/More |
| 9c | Next-slot mini | N mini-card | `/api/public/slots` | decision B (fees fallback) |
| 10 | Hospitals rail | A `hospital-rail-card` | `/api/hospitals` | photos = decision F |
| 11 | Lab pills | A `lab-pills` (from labs-strip) | D3 real table | **real ₹170/₹60/₹100 + dated caption** |
| 12 | Health tools | N `health-tools` | routes | Family = decision C |
| 13 | Trust banner | N `trust-banner` | verbatim | shield-3d placed |
| 14 | Nav | A `nav-pill` 4 tabs | — | Health Records host + routes |

Build order inside P3: skeletons first → then live data per zone → per-zone
E2E tap-through + VLM audit on :8090. Old R49 zones retire as their
replacements land (hero→hero restyle · trust-billboard→token-banner ·
consultation-tiles→quick-actions · labs-strip→lab-pills). P5 then wires all
interactions (city picker, search suggest, press states, rail scroll-end
clearance, doorway laws) + full golden paths.

## PART 5 — P6 · THE AUDIT WALL (what "done" means)
tsc 0 · eslint 0 · E2E matrix 360/390/412/768 light+dark (incl. guest
3-tap booking golden path) · **VLM 14-zone side-by-side vs mockup** ·
taste-skill browser checker on the :8090 web export (390 viewport) ·
OTA size audit. Every verdict archived in `evidence/apk-v3-*/`.

## PART 6 — P7 · RELEASE (known gotchas pre-loaded)
`eas update --environment preview --non-interactive` → **re-export web
immediately** (eas update wipes ./dist — the :8090 restore step) →
dual-repo push → worklog. Expo Go link restart on owner request (script
workaround, already proven). Rollback = git revert + OTA (R49 pattern).

---

## PART 7 — DECISIONS A–F (plain English · default = what the mockup shows)

| ID | Question | Default | Alternative |
|---|---|---|---|
| A | "Live Queue" pill color | **mockup green** `#22A94E` | brand teal |
| B | doctor rows' "Next Slot" card | **live slot times** (3 cached calls) | simpler fees card |
| C | Family Profiles tile | **doorway** (feature-on-web note) | hide tile |
| D | search bar look | **flat gray pill** like mockup | keep glass crown |
| E | old home's stats strip | **dropped** | keep as micro-row |
| F | hospital rail photos | **initials fallback** (honest today) | licensed photos + credit line |

One line from you — "all defaults" or e.g. "A teal, C hide" — settles all six.

## PART 8 — RISK REGISTER (with the pre-decided response)
| Risk | Response |
|---|---|
| an asset fails its look-alike gate | bounded ladder: 2 tries 3D-code → 2 takes AI-gen → same audit; verdict shown to you at C1 |
| VLM/vision quota throttling (429s) | backoff + resume next round (R44 pattern) |
| sandbox reset | everything pushed same round; token rewrite + re-clone procedure known |
| eas update wipes web export | immediate re-export step baked into P7 |
| font package unavailable | bundled OFL TTFs (identical result) |
| slots calls too heavy (decision B) | measured at build; fees mini-card fallback one-line flip |
| owner-side externals (Firebase/Twilio/Maps/Vercel/Play/iOS) | none touch this build |

## PART 9 — SAVED THIS ROUND (zero app code touched)
- `18-HOME-V3-MASTER-BUILD-PLAN.md` — this document
- 3 unpushed analysis commits (R50/R51/R52) pushed; local=origin=`8b6da36`
- sandbox dev-server restored (Next.js :3000 healthy)
- plan awaits: **owner GO + decisions A–F**

*Round R53 · plan-only, per owner directive · architect: Z.ai*
