# 16 — WORLD-CLASS HOME PLAN (H-series) — one screen at a time, per owner strategy

Owner directive (2026-11-22, trace 1a2027548bc1c5e9): **"one by one screen pe focus krte hai —
UI/UX me no compromise. Ye startup ka heart hai. First: world-class HOME."**
Question asked: what principles do big companies (Uber class) use on their app
home pages for maximum retention + easy usability? Answer below, then the
home-only project plan. **GO-gated; zero code shipped with this doc.**

Supersedes doc 15's ordering (B16–B20) for the HOME portion only: the home
build now goes FIRST and gets its own ladder (H1–H4). Doc 15 remains the
reference for the other screens later.

---

## PART 1 — THE PRINCIPLES (what makes a big-company home work)

Three layers, every point grounded in something we own or measured —
DESIGN-uber.md (our own Uber design-language study), the R48 Practo extract
(41 owner screenshots → 10 patterns), live-website forensics (2026-11-22),
and our 16 UX laws (doc 04). Nothing invented.

### Layer A — RETENTION principles (why users come back)

| # | Principle | What it means on a home screen | Our grounding |
|---|---|---|---|
| A1 | **Habit loop** trigger→action→reward | Home opens the loop every launch: visible trigger (symptom need), frictionless action (2-tap path), felt reward (live token/queue) | UX law 1 (3-tap booking) |
| A2 | **Time-to-value < 3 s** | The screen must prove "I can get care here" in the first viewport, zero scroll | R48 C-audit: today's home passes bones but fails delight; billboard + search fix it |
| A3 | **Trust = conversion** | Real numbers, verified marks, faces. People return where they feel safe | Practo pattern 6; honesty law 9 |
| A4 | **Next-best-action** | The home guesses the likeliest want: "Book again" for returners | App already ships Book-again rail (B6) — promote it |
| A5 | **Personalization that's real** | Name + city only — never fake "for you" | Guest-first law 10 |
| A6 | **Speed is UX** | Perceived speed ≥ visual polish | UX laws 5/15 (skeleton ≤300ms, ack ≤100ms) |
| A7 | **Reward moment at the end of the loop** | Booking success should feel like receiving something (token/boarding-pass) | Website ships BoardingPassDemo ("Meri Baari Kab Hai?"); app B19 later |
| A8 | **Forgiveness** | Empty/error states as doorways, not dead ends | UX laws 7/8 |

### Layer B — USABILITY principles (why the home feels easy)

| # | Principle | Rule | Our grounding |
|---|---|---|---|
| B1 | **One dominant action** | Uber's home = "Where to?" — one input owns the screen; everything else is secondary | DESIGN-uber ride-request form grammar |
| B2 | **Location-first context** | City/area sits IN the header control — never buried in settings | Practo pattern 10 |
| B3 | **Glanceability** | A user can state what this app does after 3 seconds of looking | A2 + billboard |
| B4 | **Progressive disclosure** | 3 visible doors (chips/tiles/rails); detail lives one level down | Practo editorial chunking (pattern 7) |
| B5 | **Thumb zone** | Primary controls bottom-2/3; 44px floor | UX laws 2/4 |
| B6 | **Familiar shell, signature detail** | Standard 3-tab bottom nav (labels always) BUT our glass floating pill is the brand signature | Practo pattern 3; website w-nav |
| B7 | **Consistent card grammar** | One card shape/rhythm repeated = learnable | Website w-dcard grammar (measured ×18 live) |
| B8 | **Sentence-case, weight discipline** | 700 = headlines, 500 = buttons; no all-caps shouting | DESIGN-uber principles |
| B9 | **Whitespace rhythm** | 32px between sections, tight stacks inside cards | DESIGN-uber whitespace philosophy |

### Layer C — CRAFT language (the Aturseva home's actual look)

From our own measured sources — the website IS the standard:

1. **Canvas**: white + warm cream `#F4F2EC` bands (website cream ×50 measured).
2. **Aqua** `#14B8A6` — fills, washes, selection, live accents ONLY (never
   small text; `#00BAA7` on white = 2.45:1 fails AA — measured). Text accents
   use `#0F766E` (5.47:1 AA).
3. **CTA**: ink pill `#161616`, white text, radius 100, press-scale 0.98,
   hover shadow `0 4px 18px rgba(21,21,21,.16)` — the website's own
   `.w-bookbtn` (measured live).
4. **Glass** — see PART 2.
5. **Photos** (B17 pipeline) — 48×48 r12 square rounded portraits in cards;
   "Representative photo" honesty caption.
6. **Pill geometry** — 999 radius on every interactive (DESIGN-uber law).
7. **Elevation ladder** — L0 flat cards on cream; L2 card drop
   `rgba(0,0,0,.16) 0 4px 16px`; **L3 pill float = the glass nav**
   (DESIGN-uber's exact level map, glass takes the L3 slot).
8. **Polarity flip** — one ink billboard band mid-screen as depth cue
   (DESIGN-uber "black bands as polarity-flip depth").

---

## PART 2 — GLASS SYSTEM (owner: "web pe glass hai, app me bhi karenge")

### 2.1 What the website actually does — measured this round, 3 tiers

| Tier | Element | Recipe (live CSS) |
|---|---|---|
| G1 **full glass** | floating nav pill `.w-nav` | fill `rgba(168,168,168,.2)` + 1px edge `rgba(255,255,255,.2)` + inset shine `rgba(255,255,255,.25)` top hairline + `backdrop-filter: blur(12px) saturate(1.4)` + shadow `0 2px 16px rgba(21,21,21,.06)` · radius 100 · 64px tall |
| G2 **white-glass chip** | live chip on hero photo `.w-ps-live` | fill `rgba(255,255,255,.82)` + blur(10) sat(1.3) + glass edge + `0 2px 12px` shadow · radius 100 |
| G3 **glass-shine** | search pill `.w-searchpill` | solid surface + inset shine hairline + `0 2px 16px` shadow (glass as micro-depth, not blur) |

### 2.2 The RN port — with the measured constraint

**`expo-blur` is NOT in the APK binary today** (package.json + bun.lock
checked — build febe3a99 ships without it). OTA cannot add native modules.
Therefore glass lands in two versions, honestly:

- **Glass v1 (OTA, every installed device now)** — simulated glass, zero
  native cost, zero perf risk: G1/G2 become translucent white fills
  (`rgba(255,255,255,.82)`-style) + 1px glass edge + inset shine line +
  soft shadow. On cream/photo backgrounds this reads as frosted glass
  (it is exactly how `.w-ps-live` reads at 82% white). G3 works as-is today
  (pure borders/shadow — no blur needed).
- **Glass v2 (new APK, versionCode 3)** — real `expo-blur` BlurView with
  blur+saturation matching the web recipe. **Bundled in the SAME new APK
  build that carries the official icon/splash (doc 15 §2.3) — one build,
  three native upgrades.** Android perf guard: real blur only on the nav
  pill + max 2 floating chips — never full cards (Android blur cost is
  real; the website also uses blur only on 2 element types).

### 2.3 Where glass lands in HOME (and where it does NOT)

- **YES**: floating bottom nav pill (G1, the signature), live chip over
  hero/billboard (G2), search pill shine (G3).
- **NO**: rails, cards, tiles, sections — glass on content = readability
  loss + perf cost. The website itself never glasses a content card
  (measured). Restraint law holds.

---

## PART 3 — THE HOME SPEC (S3 world-class), zone by zone

Top→bottom, with today→tomorrow deltas:

### Z1 · Hero band (cream) — "good morning, kaafi aasaan hai"
- Greeting (real name if logged in, else "Namaste") + **city chip in the
  header** (B2 — the existing city sheet, promoted from footer to header).
- **Search crown** — G3 glass-shine pill, THE one dominant action (B1).
  Aquа focus ring. Keep the suggest sheet under it (recents + symptom rows —
  already built, already honest).
- **Symptom quick-chips** row (keep; selected state = aquaSoft + tealText).
- Offline banner stays (law: cached last-good beneath).

### Z2 · Trust billboard (ink polarity band) — "ye app jaanta hai"
- The REAL stats contract (doctors · hospitals · bookings) as big ink-band
  numbers with aqua pulse dots — replacing the current 1-line gray strip.
  Real numbers only (law 9). Ink band = the polarity-flip depth cue (C7).

### Z3 · Two consultation tiles (cream cards, photo-topped)
- "Talk to a doctor" → S4 listing (photo tile).
- "Lab tests at home" → website `/labs` handoff chip (honest "on
  aturseva.com" label — B14 law, owner-confirmed labs ruling).
- Practo pattern 10 mirrored. (Optional hospital tile → owner D2.)

### Z4 · Book again (returners) — retention A4
- Existing B6 rail, promoted above Doctors when present, photo avatars.

### Z5 · Doctors rail (live) — trust A3
- Photo cards (B17 pipeline): 48×48 r12 portrait + name + verified mark +
  spec + experience + ₹ fee. Ink-pill Book = website `.w-bookbtn` grammar.
- Live chip (G2 white-glass) with pulse dot — keep honest "live" meaning.

### Z6 · Hospitals rail — hide-if-empty (already true)
- Lettermark-in-aquaSoft OR real image when `logoUrl/image` exists
  (website HospitalsBand grammar measured). See all → /hospitals.

### Z7 · Labs strip (small, honest) — "Labs with public rates"
- 3 cards (test · ₹ · TAT) + handoff chip → website. Data source = owner
  decision D1 below. Hide-if-empty absolute.

### Z8 · Quiet footer
- City · version · Privacy·Terms (keep, ≤1 line each — S3 law).

### SHELL · Floating glass pill bottom nav — the signature
- 3 tabs (Home · Bookings · Profile), labels always, active = filled
  circle/aquaSoft pill inside the G1 glass pill; 44px+ targets; floats
  16px above safe-area with soft shadow (L3 pill float). Replaces the
  current bordered bar. Scroll behavior: subtle hide-on-scroll-down,
  show-on-up (Uber/Practo standard), optional in v1.

---

## PART 4 — HOME-ONLY BUILD LADDER (re-sequenced: home first)

| Batch | Content | Delivery |
|---|---|---|
| **H1 foundation-for-home** | aqua/aquaSoft/cream/tealText + glass tokens in `tokens.ts` (values above, AA ledger re-measured) · Avatar `source` prop + face pipeline (home surfaces only) · CTA press-scale/shadow law | OTA |
| **H2 home shell** | floating glass pill nav (G1 v1 simulated) + hide-on-scroll | OTA |
| **H3 home content** | Z1–Z8 zones per spec (hero band, billboard, tiles, rails, labs strip, footer) | OTA |
| **H4 home matrix + audit** | 360/390/412/768 + font 1.3× + dark mode + perf budget (glass v1 = zero blur cost) + VLM re-judgment vs R48 C-audit | OTA |
| **(parallel, owner GO)** | new APK versionCode 3: official icon/splash (doc 15 §2.3) + `expo-blur` → glass v2 flip-on | EAS build |

Each batch = 1 round, existing gates (tsc/eslint/E2E/VLM), pushed dual-repo.

## PART 5 — ACCEPTANCE (how we'll know it's world-class, measured)

1. **R48 C-audit re-run**: "colorless, image-less, lifeless" verdicts must
   flip to PASS on the same criteria (brand color presence, photography,
   joy moment) — same VLM loop, same prompts, comparable.
2. **UX laws 1–16 all green on home** (existing E2E golden path unchanged —
   redesign must NOT regress the 3-tap booking).
3. **Device matrix H4**: no clipped lines, no horizontal scroll, billboard
   + search in first viewport at 360px width.
4. **Perf**: skeletons ≤300ms (law 5), glass v1 zero native cost, list
   scroll 60fps target on :8090 E2E widths.
5. **AA**: every new color pair in the measured ledger (aqua fills only,
   text accents #0F766E, ink CTA white-on-ink 16.1:1).

## PART 6 — Owner decision points (the GO form for HOME)

- **D1 — GO**: H1→H4 ladder as-is?
- **D2 — Third tile**: hospital tile in Z3 (yes/no)?
- **D3 — Labs strip data** (carried from doc 15 D2): static top-3 / read-only
  public catalog API / hide for now.
- **D4 — new APK versionCode 3**: bundle icon + splash + expo-blur (glass v2)
  in ONE EAS build? (Icon cannot OTA — doc 15 §2.3 honesty ruling.)
- **D5 — hide-on-scroll nav**: v1 or defer?

## Explicitly NOT changing

Honesty laws (real photos with caption, real stats) · the 16 UX laws ·
guest-first golden path · suggest sheet behavior · footer quietness law ·
doc 15's plans for OTHER screens (S4/S5/records — untouched until home lands
and owner re-GOes). Zero code shipped with this doc.
