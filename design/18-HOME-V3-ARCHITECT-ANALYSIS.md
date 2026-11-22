# 18 — HOME v3 OWNER-MOCKUP: ARCHITECT ANALYSIS (round R50, ANALYSIS-ONLY)

> **Directive**: owner uploaded a home-page design they made
> (`design/owner-home-v3-reference.png`, 852×1846) — "exact same" rebuild is
> wanted, fonts must come from the H-project **website** for uniformity.
> **NO DEVELOPMENT was started** (owner's explicit instruction). This document
> is the analysis + rebuild architecture, ready for a GO.
> Analysis method: VLM two-pass (structure pass + verbatim text pass) +
> website font forensics + current-app (R49) gap analysis.

---

## PART 1 — THE MOCKUP, DECODED (11 zones, top→bottom)

| # | Zone (Y %) | Exact content (verbatim) |
|---|---|---|
| 1 | Status bar (0–4%) | 9:41, dark Dynamic-Island pill |
| 2 | **Header (4–10%)** | Wordmark `AturSeva` (700, ~34sp) · location row `Gandhinagar, Gujarat` (pin icon) · right: 2× 44px circle buttons `#F2F3F5` — bell (line icon, red dot badge `#F4442E`) + person avatar (line icon) |
| 3 | **Hero (11–23%)** | `Healthcare,` / `made simpler.` (700–800, ~30sp, near-black, line-height ~1.2) · subcopy `Find doctors, book appointments and track your turn in real time.` (400, ~14sp, `#6B7075`) · 3D clay illustration: doctor + hospital + bushes, right-aligned over light-gray halo |
| 4 | **Search (24–27%)** | Full-width pill (r999, white, shadow 0 4 12 rgba(0,0,0,.06)) · placeholder `Search doctors, hospitals, tests, symptoms...` · magnifier left (line) + **mic right** (line) |
| 5 | **Quick actions (29–40%)** | 4-up grid, tiles r~20, white, hairline `#ECECEC`, 72px light-gray disc with 3D prop + stacked centered text: `Doctors` / `Clinic & Video` · `Hospitals` / `OPD & Departments` · `Lab Tests` / `Diagnostics` · `Video Consult` / `Consult from home` (title 600–700 ~14sp black, sub 400 ~11.5sp gray) |
| 6 | **Dark token banner (42–51%)** | r~24, `#151515` · 2-line headline `Skip the wait.` / `Book your token online.` (700, ~22sp, white) · feature row: `Real-time queue` (⚡ line icon) + `Confirmed slot` (📅 line icon, 500 ~12.5sp) · right: stacked 3D token cards, top card white with rotated italic bold `Token #24` |
| 7 | **Appointment section (52–55%)** | Section header `Your appointment` (700, ~20sp, sentence case) + `View all →` (500, black) |
| 8 | **Live queue card (55–67%)** | White card r~24, p16 · row 1: 64px real doctor photo (circle), `Dr. Adam Max` (700 ~18sp) + `Psychologist • City Care Clinic` (400 ~13sp gray), right pill `Live Queue` (bg `#DCF5E4`, text+dot green `#1F9D4D`, r999) · row 2: 3 metrics split by 1px `#E5E5E5` dividers — `#24` / `Your Token` · `#18` / `Now Serving` · `06` / `Patients Ahead` (numbers 800 ~26sp black centered, captions 400 ~12sp gray) · row 3: progress track `#E8E8E8` h8 r999, black fill ~60%, floating circular `›` chevron button (white, shadow) overlapping right edge |
| 9 | **Specialty rail (68–77%)** | Section header `Explore by Specialty` + `View all →` · horizontal rail of ~90px white pills r~20 hairline `#ECECEC`, 32px black OUTLINE icon + label beneath (600 ~13sp): `Cardiology` (heart+pulse) · `Pulmonology` (lungs) · `Neurology` (brain) · `Gastro` (stomach) · `Gynecology` (female figure) · `More` (2×2 grid) |
| 10 | **Lab promo card (79–90%)** | r~24, mint `#EAF6EF` + radial mint blob `#D8EEDD` · left: `Book Lab Tests` / `from trusted labs` (bold 2-line) + `Home collection available` (gray) + black pill CTA `Book Tests →` (r999, white text) · right: 3D microscope + red-liquid tubes + plant, bleeding to edge |
| 11 | **Bottom nav (91–100%)** | White dock r~28, soft top shadow, 4 tabs line icons + labels (500–600 ~12sp): `Home` (active: FILLED icon in `#F2F3F5` pill, black bold label) · `Bookings` (calendar) · `Health Records` (medical kit + plus) · `Account` (person) · home indicator |

### The mockup's color system

| Role | Value | Note |
|---|---|---|
| Canvas | `#FFFFFF` pure white | matches R49 already |
| CTA / ink | `#111111`–`#151515` | dark banner, Book Tests pill, progress fill, wordmark — matches R49 ink language |
| **Live/success green** | `#22A94E` dot `#1F9D4D`, pill bg `#DCF5E4` | **≠ current app's ocean teal `#00BAA7`** — decision point (§PART 4-A) |
| Mint lab tint | `#EAF6EF` + blob `#D8EEDD` | new tinted-surface role |
| Red | `#F4442E` (badge), `#E03A2F` (tube liquid) | semantic-only, never decorative |
| Text | primary `#111111` · secondary `#6B7075` · tertiary `#9AA0A6` | gray family slightly bluer than app's neutral grays |
| Hairline | `#ECECEC` chips · `#E5E5E5` dividers · `#E8E8E8` track | fine-step neutrals |

No hard gradients — only soft ambient radial washes. **Vertical cadence is the
design's signature: white → BLACK banner → white → mint card** (light/dark/tint
rhythm), plus monochrome-black CTA language = the Uber-style R49 direction the
owner already chose. The mockup is *R49-compatible in structure* — its accent
grammar (green live pill, mint promo) is the main delta.

### The mockup's type scale (mockup units @852w ≈ 2× mobile sp)

hero 30sp/700–800 · section headers 20sp/700 · banner headline 22sp/700 ·
metric numbers 26sp/800 · doctor name 18sp/700 · body/subcopy 13–15sp/400 ·
tile titles 14sp/600–700 · tile subs 11.5sp/400 · nav labels 12sp/500–600 ·
`View all →` 14sp/500. Spacing: **20px screen gutters**, 24–28px section
rhythm, card padding 16–20, 4/8/12 grid gaps.

---

## PART 2 — THE H-PROJECT WEBSITE FONT TRUTH (forensics, 2026-11-22)

The website repo (`/home/z/my-project`, the aturseva.com codebase) has **three
font systems**, only one of which is the website home:

| Where | Fonts | Verdict for the app |
|---|---|---|
| **Website home** (`src/app/page.tsx` → `components/website/home.css`) + root layout (`app/layout.tsx`) | **Geist Sans** (`--font-geist-sans`) + **Geist Mono** (`--font-geist-mono` for tabular/mono numerals) | ✅ **THE uniformity font** — "H project me website pe use kiya" points here |
| Dark landing v2 (`(llp)` route group) | Fraunces + Plus Jakarta Sans + IBM Plex Mono | separate campaign system — NOT the app's reference |
| `.aturseva` class (`globals.css:497`) | references `--font-manrope` — **dangling var, never loaded** (vestigial; falls through to ui-sans-serif) | ignore |

Website home usage grammar worth mirroring: base 16px, hero `w-h1` 48px
(→30px mobile) at weight **500**, body 14–15px at **500/600**, and
`font-variant-numeric: tabular-nums` on the money/turn numerals; Geist Mono
for token/queue-style numbers.

**Conclusion**: Home v3 must adopt **Geist** (sans) + **Geist Mono** (numeric
roles). The current app uses the RN system stack (SF/Roboto) — the uniformity
directive changes this. Load plan: Geist is on Google Fonts → try
`@expo-google-fonts/geist` + `expo-font`; fallback = bundle Vercel's
`geist-font` TTFs (static weights 400/500/600/700/800 + Geist Mono 500/600)
as assets with `expo-font` `useFonts` gate in `_layout.tsx` (splash law: block
on fonts ≤400ms budget, skeleton never spins). Type-token plan: swap
`tokens.ts §3 type scale` font values to Geist weight ladder (hero 500-700
per website grammar, metrics 800 Geist Mono tabular) — scale stays ours.

---

## PART 3 — GAP ANALYSIS: MOCKUP vs CURRENT APP (R49, `bb263aa`)

What SURVIVES (R49 assets already align):
- White canvas + ink CTA language (identical philosophy)
- Glass search crown (mockup search is a plain white pill — restyle, keep glass recipe or simplify per mockup: white + soft shadow)
- Real-doctor-photo pipeline (mockup uses one real photo in the queue card — same pipeline)
- Ink billboard (Z2) → becomes the dark token banner (same component family, new content + token graphic)
- Labs data with real prices (Z7) → becomes the mint promo card content
- City-picker sheet (location row reuses it), notifications route (bell), profile (avatar)
- Queue API already serves exactly `your token / now serving / patients ahead` + progress (the queue screen) — the home card is a condensed view of live endpoints

What's NEW (build ledger):

| # | Delta | Scope |
|---|---|---|
| 1 | Header zone (wordmark + location + bell + avatar) replaces Z1 Namaste greeting | new component; wire: bell→/notifications, avatar→/profile tab, location→city sheet |
| 2 | Hero `Healthcare, made simpler.` + 3D illustration | new copy + **illustration asset** |
| 3 | Search mic icon | decorative; NO voice feature exists → hide it or noop-with-honest-`coming soon` chip (decide) |
| 4 | Quick actions 2 tiles → **4-up grid** | routes: Doctors→/search, Hospitals→/hospitals, Lab Tests→labs flow, Video Consult→search video-filter (verify API capability flag; else doorway) |
| 5 | Token banner feature row + `Token #24` 3D stack | **illustration asset** |
| 6 | **"Your appointment" live-queue card** | data = next upcoming booking + queue API; guest = doorway; no booking = hide section entirely (broken-trust law) |
| 7 | **Specialty rail 6 pills** | specialties registry exists (12 entries); icons via lucide-react-native (HeartPulse/Lungs/Brain/Stomach/Gynecology→PersonStanding?/LayoutGrid — verify exact set); route → /search?specialty= |
| 8 | Mint lab promo card + `Book Tests →` ink pill | restyle Z7 |
| 9 | **Nav 3 tabs → 4 tabs** (`Home / Bookings / Health Records / Account`) | NEW tab route for Health Records (medical-history content exists as a stack route — promote to tab host); Profile renamed Account; floating pill adapts to 4 slots (64px height, labels always — 4×44px targets hold at 360w) |
| 10 | Green live accent + mint tint tokens | palette decision (below) |
| 11 | **Geist fonts** | see PART 2 |
| 12 | **~8 3D clay illustration assets** (hero, 4 tile props, microscope set, token stack) | image-generation pass, transparent PNGs, muted pastel palette, consistent clay style |

---

## PART 4 — ARCHITECT DECISIONS TO SETTLE AT GO (defaults proposed)

**A. Live-accent color — green (mockup) vs ocean teal (R49/site).**
"Exact same" directive → default = mockup's green family (`#22A94E` /
dot `#1F9D4D` / pill bg `#DCF5E4`) with AA-checked dark text-green variant;
mint `#EAF6EF` joins tokens as `promoTint`. Alternative (if owner prefers
brand-wide ocean-teal uniformity): keep tealLive/tealText, mint→aquaSoft —
one-line token swap, structure identical. **Needs owner's word.**

**B. Mic on search.** No voice feature in the app/contract → default: omit
the mic (honest UI beats decorative affordance); re-add with the ASR skill
when voice search is actually built.

**C. Video Consult tile.** Default: routes to search with a
video-consultation filter IF the API carries the capability flag; otherwise
tile becomes a doorway to onboarding of that flow (no fabrication).

**D. Illustration style risk.** 3D claymorphism is the mockup's biggest
visual signature but also the highest-fidelity risk (generated 3D can look
off-brand). Mitigation: generate with tight prompts + VLM check each against
the mockup props; website-grammar alternative = keep photographic/duotone
props. Default: generate to match mockup.

**E. Execution order when GO comes** (respecting gates + OTA reality):
1. Tokens + Geist font gate (tsc/eslint green) →
2. Zone restructure (header/hero/search/tiles/banner/specialties/lab) →
3. Nav 4th tab + routes →
4. Appointment live-queue card + data binding (guest doorway + empty-hide) →
5. Illustration assets + VLM audit loop →
6. Full gates (tsc · eslint · E2E :8090 golden path + matrix 360/390/412/768
   + dark · VLM zone audit) → eas update (re-export web after) → dual-repo
   push → worklog.

**F. Nav pill vs dock.** Mockup shows a docked bar; the app's floating glass
pill is its R49 signature and H2/H3/B9 scroll-clearance laws are built
around it. Default: keep the floating pill, restyled to the mockup's
4-tab content + active-pill treatment (filled icon in gray pill) — the
signature survives, the mockup's information model is what we replicate.

---

## PART 5 — WHAT WAS SAVED THIS ROUND

- `design/owner-home-v3-reference.png` — the owner's mockup, archived in-repo
- `design/18-HOME-V3-ARCHITECT-ANALYSIS.md` — this document
- VLM raw passes: `/tmp/design-analysis.json` (structure) + `/tmp/design-text.json` (verbatim text)
- Zero app code touched, no commit to src/, no OTA, no tunnel (sandbox reset
  killed the Expo Go link; restart on request)

*Round R50 · analysis-only per owner directive · architect: Z.ai*
