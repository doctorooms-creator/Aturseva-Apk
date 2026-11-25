# DOC 24 — ARCHITECT DECISION RECORD: REDESIGN TOKEN BRIDGE + DOC-23 §5 RESOLUTIONS

**Date:** 2026-11-25
**Type:** ANALYSIS-ONLY · zero app code touched · this doc + Doc 23 edit + commit only
**Purpose:** Owner answered the two open design questions and delegated all remaining decisions ("im non technical so you need to take all the decision by your self … act as system architect"). This doc is the locked decision record: (A) the two headline design decisions, (B) the full Figma-redesign → app token bridge, (C) resolutions for all 6 items pending in Doc 23 §5.

**Owner directives (quoted, translated where needed):**
1. Font: *"font to jo hamari website wala hai vhi rahega, consistency matter krega"* → website font = **Geist**, locked.
2. Accent: *"95% monochrome hi use kiya hai, 5% hi vo color hai, vo tum decide karo"* → architect's call within the monochrome+accent law.
3. Assets: *"sare asset and sab kuch tum Figma se utha lena"* → all visual assets sourced from Figma.
4. Full delegation: *"jo jo tumhe sahi lage … take all the decisions by yourself, act as system architect."*

**Sources:**
- Figma redesign file `koY1wZRoJtIP72D0YpbEZm` — frames 25:2 (Find Care), 25:3 (Find Doctor), 25:4 (Doctors Profile); structure extracted via Figma nodes JSON API (render API was rate-limited; JSON is authoritative for geometry/fills/text anyway).
- `Aturseva-Apk/src/lib/tokens.ts` (R49 monochrome law, read at HEAD `90733ff`).
- `Aturseva-Apk/src/app/_layout.tsx` + `package.json` (font loading verified).
- `Doctorooms2` read-only clone `/home/z/analysis/web-ref` (accent forensics, §2 below).

---

## 1. THE TWO HEADLINE DECISIONS (LOCKED)

### D1 — FONT: Geist (owner-locked). Figma's Roboto is remapped, not adopted.
- The redesign frames use Roboto with non-integer sizes (37.59 / 21.93 / 15.66 / 13.16 … — a 0.94 scale-residue) and Regular-weight CTAs.
- The app already loads the full Geist ramp (`@expo-google-fonts/geist` 400/500/600/700/800 + GeistMono 400/600/700 + Dancing Script wordmark — `_layout.tsx` FONT GATE) and the website ships Geist.
- **Decision:** every text style in the 3 redesign screens re-maps to the app's Geist type ramp (§4 table). Roboto is never installed. Non-integer sizes snap to the ramp. CTAs go Regular → 600 SemiBold (fixes redesign P2 "CTA weight" finding).
- **Cost of decision: zero** (no font churn — the app's existing system is already the target).

### D2 — ACCENT: the existing ocean-teal family IS the accent (architect call, evidence below). Gold/sage from the redesign do NOT become brand accents.
- The owner described the website's secondary as *"blue jesa dikh rha hai"* — forensics (§2) prove it is the **ocean teal family**, already in the app as `aqua #00BAA7` / `tealLive #0D9488` / `tealText #0F766E` with a measured AA ledger.
- **Decision:** the app's teal system stays THE one brand accent (fills/washes/selection = aqua family; graphics = tealLive; AA text = tealText). The redesign's two new colors are re-scoped:
  - **Gold `#E7BF40` (star ratings)** → maps to the existing semantic token **`starYellow #F5B301`** (graphics-only, never text; light+dark already dual-defined). Stars are a *semantic* color like the website's amber-500 "Fair" password bar — not a brand accent. We keep ONE gold in the system; `#E7BF40` is recorded as the Figma source value, normalized to `starYellow`.
  - **Sage `#80AD69` (fee pill)** → **RETIRED.** Fees are informational data → render in `ink`/`body` with `tabular-nums` (website monochrome-data law). If a fee ever needs live emphasis, the tool is `tealText` — never a second green.
- **The 95/5 rule holds and is actually stricter:** website law is ~1–3% colored pixels, teal reserved for live data + current selection + ONE primary action. The redesign screens will honor the same budget.

---

## 2. WEBSITE ACCENT FORENSICS (what the "bluish" secondary actually is)

Code-verified from the read-only `Doctorooms2` clone (files + lines):
- `docs/website-v2/01-DESIGN-SYSTEM.md`: `--teal #0D9488` — "LIVE DATA ONLY (<1% of any page): queue numbers, token #14, wait-time, availability dot, focus rings."
- `docs/opd-cockpit/02-DESIGN-SYSTEM.md`: `--accent: #0d9488; /* data + ONE primary action + current-selection */`, primary action button = near-black `#1d1f20`.
- `PLAN-OPD-COCKPIT.md`: "existing Doctorooms teal (#0d9488 family) stays as THE single accent → on the main data element + the one primary action. Everything else: neutral greys."
- `worklog.md` (dashboard law): "color budget ~3% colored pixels; ONE accent (teal #0d9488) reserved for data + active selection only; flat surfaces, 1px borders #e7e8e8; 3 text tiers #141515/#5a5f5f."
- PWA theme-color, offline page, prescription letterhead all anchor `#0d9488`.
- App-side AA nuance (already in `tokens.ts`): `#0D9488` is graphics-only (3.7:1); teal TEXT uses `tealText #0F766E` (5.47:1 AA). Dark mode mirrors (`aqua #2DD4BF`, `tealText #5EEAD4`).

**Conclusion:** teal-600 `#0D9488` (graphics) / teal-700 `#0F766E` (text) is the website's secondary. It reads bluish because teal sits between blue and green. Nothing new needs to be introduced — the app token system already encodes this law.

---

## 3. REDESIGN 3-SCREEN ANALYSIS (condensed findings from Figma JSON extraction)

**Frame geometry:** 390×844, r38 device frame — maps onto the app's 426×923 scale system (`s = width/426`) without conflict; all redesign dimensions are design-px × s.

### 3.1 Screen structures
- **Find Care (25:2):** large hero title → 3 stacked pill inputs (location / specialty / date) → dark ink Continue pill → 2×3 specialty icon grid (sharp custom vectors).
- **Find Doctor (25:3):** search pill → result count ("287 Doctors found") + Sort/Filter chips → doctor cards in light/dark card alternation, each with floating rating (gold star) + fee pill, frosted-glass day-strip (Wed 14 selected).
- **Doctors Profile (25:4):** gradient hero → large avatar + info pills → stats bar (12 yrs / 3700+ patients / 52 reviews) → tabs (About, ink underline) → bio → big 4.5 rating with correct half-star crop → dark ink Book Now pill.

### 3.2 What the redesign does well (keep all of this)
- Pill-everything geometry = already the app's law ("999 radius on everything interactive").
- Single-ink hierarchy; flat zero-shadow system inside cards.
- Frosted glass strip = aligns with the H2 glass trio.
- Half-star crop math is correct.
- Light/dark card rhythm (alternation) — preserved via existing tokens (§4).
- Sharp custom icon language — new asset family, sourced from Figma per owner directive (§5).

### 3.3 Issues found → resolutions (all P1 mandatory at build time)
| # | Severity | Issue (node evidence) | Resolution (locked) |
|---|---|---|---|
| F1 | P1 | Bio text AI-corrupted (node 25:38) | Rewrite copy; when live, bind to API `about` field with clamp |
| F2 | P1 | Photo `scaleMode: STRETCH` distorts avatars | `cover` (aspect-fill) everywhere |
| F3 | P1 | Same photo imageRef (`0ec0df…`) on 3 doctors | List cards → deterministic initials-avatar fallback (existing monogram grammar); real photo only on profile hero |
| F4 | P1 | Dark selected chip on dark card (contrast fail) | Selected state = `aquaSoft` fill + `tealText` text + `aqua` border — also aligns accent (D2) |
| F5 | P2 | Roboto + non-integer sizes + Regular CTAs | D1: Geist ramp + snap + 600-weight CTAs |
| F6 | P2 | Teal absent; gold/sage proposed | D2: teal system stays; gold→`starYellow`; sage retired |
| F7 | P2 | Specialty lists differ between 25:2 and 25:3 | Single source of truth: app's existing specialty constants (home-rail 6) drive both screens |
| F8 | P2 | Bottom nav only on Home frame | Correct as-is: these are pushed stack screens; no tab bar (existing app pattern) |
| F9 | P3 | `$90/hr` (US currency) | `₹` + `en-IN` + `tabular-nums`, fee from API — never hardcoded |
| F10 | P3 | "287 Doctors found" hardcoded | Live count from API |
| F11 | P3 | Pickers lack chevrons; Message button lacks icon | Add chevron-down + message icon (from Figma export, §5) |

---

## 4. TOKEN BRIDGE (Figma redesign → app tokens — the contract for implementation)

| Figma (redesign) | Value | App token (locked) | Notes |
|---|---|---|---|
| Ink (warm charcoal) | `#2C2928` | `ink #0A0A0A` | One ink across web+APK; warm variant rejected for parity |
| Card fill (dark cards) | `#F0F0F0` | `cardSoft #F7F7F8` / `chipIdle #F0F0F1` | Alternation rhythm preserved with existing steps |
| Card fill (light cards) | white | `canvas #FFFFFF` | White-card law holds (V4) |
| Borders | `#E8E8E8` | `hairline #E7E7E7` | Direct map |
| Pill inputs/chips r23.5–25 | full pill | `radius.pill 999` | Already the law |
| Cards | large radius | `radius.card 24` | V3.1 refresh value |
| Gold stars | `#E7BF40` | `starYellow #F5B301` | Semantic only; never text |
| Sage fee | `#80AD69` | — (retired) | Fee = `ink`/`body` + `tabular-nums` |
| Selected/active states | dark fill (25:3 chip) | `aquaSoft #F0FDFA` + `tealText #0F766E` + `aqua` border | Fixes F4, aligns D2 |
| Live/graphics accents | — | `tealLive #0D9488` | Website parity |
| Frosted glass strip | blur wash | `glassFill/glassEdge/glassShine` trio | H2 shell recipe |
| Gradient hero (25:4) | baked art | asset from Figma (§5) or token-built wash | Hero-art exception precedent: home3d lab card |
| Hero title 37.59 Roboto | — | `displayHero 32/36 700` | snap up ramp |
| Section/doctor name ~21.93 | — | `title 18/22 600` (hero contexts: `display 24/28 700`) | role-based snap |
| Body ~15.66 | — | `body 15/22 400` / `bodyStrong 600` | |
| Captions/labels ~13 | — | `caption 12/16 400` | |
| Big rating "4.5" | — | `display 24/28 700` + `tabular-nums` | |
| CTA (Continue / Book Now) | Regular | Geist `600` on `ink` pill, white label | F5 fix |
| Dark mode | — | existing `darkColors` dual set | nothing new to define |

**Typography law for these screens:** every Figma text node maps by ROLE to the ramp above; raw Figma sizes are never ported. This mirrors the V4 `s = width/426` design-px law for geometry.

---

## 5. ASSET EXTRACTION PLAN (owner directive: assets from Figma)

Export at build time from file `koY1wZRoJtIP72D0YpbEZm` (node enumeration via Figma nodes API on 25:2/25:3/25:4; provenance law per Doc 22 — record source node IDs):

| Asset family | Source frame | Format | Notes |
|---|---|---|---|
| 6 specialty sharp icons (2×3 grid) | 25:2 | SVG preferred, PNG@3x fallback | new icon language; keep ink monochrome |
| search / sort / filter / chevron-down / message icons | 25:3, 25:4 | SVG / PNG@3x | |
| star + half-star vectors | 25:3, 25:4 | SVG | recolor to `starYellow` at usage |
| Doctor photo (imageRef `0ec0df…`) | 25:4 hero | PNG@3x | profile hero only (F3) |
| Profile gradient background | 25:4 | PNG@3x or token wash | decide at export by complexity |

Render-API rate limits (429) blocked image export during analysis; JSON structure is already captured. Export happens in the Batch-1 build PR, not before (analysis-only now).

---

## 6. DOC 23 §5 RESOLUTIONS (architect calls, owner-delegated)

| # | Question | Decision (locked) | Rationale |
|---|---|---|---|
| R1 | Family booking ("Kiske liye?") | **OUT for v1.** Follow the web ban (STITCH §8, audit §7). Guest phone-lookup already covers multi-patient via separate bookings. Reopen only on explicit owner request. | Product law parity; zero API exists for it |
| R2 | AI placement (center tab vs FAB vs 4-tab) | **4-tab stays.** AI enters via a prominent Home hero entry in v1. Center-tab (STITCH's idea) is a Phase-2 shell decision, only after AI ships and engagement proves it deserves the middle seat. | Shell is shipped + persona-audited (bf38ba7); AI ships faster without nav churn; incremental > big-bang |
| R3 | Consents (read-only vs sign/revoke) | **Read-only list v1.** Sign/revoke deferred pending legal review. | Lowest-risk default; endpoints exist but patient-side legal posture unconfirmed |
| R4 | Login (email+password vs OTP) | **Keep email+password AuthSheet.** OTP is blocked on the web auth API exposing OTP login — never build client auth the backend doesn't support. Revisit when web ships it. | Parity rule + security |
| R5 | Video call (Jitsi now vs authed later) | **Defer join.** Appointment-detail (4.1) ships a video-consult status banner; the join button is feature-flagged OFF until the authed stack passes the security audit. | Security audit law |
| R6 | Diet plan 3.7 (broken web API) | **Blocked.** Ship 3.3–3.6 (reminders, add-reminder, check-in, adherence) on working APIs; 3.7 waits for the upstream web fix. Flag filed to owner separately. | Don't design against a broken endpoint |

---

## 7. BATCH PLAN INTEGRATION (Doc 23 §4 update)

The 3 redesign frames slot into Batch 1 as the Figma-authoritative art, re-tokenized through this bridge:
- **25:2 Find Care** → Batch 1.3a (search entry state)
- **25:3 Find Doctor** → Batch 1.3b (results state)
- **25:4 Doctors Profile** → Batch 1.4 (doctor profile)

Build order unchanged (0 → 1 → 2.1–2.4, 2.6–2.8 → 4.1–4.4 → 3 → rest). Before any of these frames are declared "Figma-authoritative," the D1/D2 re-tokenization (§4) is applied — the Figma file remains the layout/asset source; tokens.ts remains the color/type source of truth. No conflict: geometry and assets from Figma, skin from tokens.

---

## 8. WHAT WAS NOT DONE
- No app code changes in `Aturseva-Apk` (tokens.ts untouched — the bridge is a mapping contract, not an edit).
- No `Doctorooms2` changes (read-only clone).
- No Figma file edits (plugin is read-only; render exports deferred to build time due to rate limits).
- This doc + Doc 23 §5 status edit + commit/push only. Development still not started (owner's standing rule: analysis first).

---

## 9. ADDENDUM (2026-11-25, later): OWNER FIDELITY DIRECTIVE + INFRA RECOVERY

**Owner directive (locked, supersedes §1-D2 re-scoping where in conflict):** *"exact same hi screen redesign chahiye"* — the 3 redesigned screens must render EXACTLY as the owner's Figma frames. Operational law:
- Geometry/layout/pill rhythm: 1:1 from Figma frames 25:2 / 25:3 / 25:4 (V4 s=width/426 design-px law applied).
- Colors: Figma-verbatim values ON these screens — ink #2C2928, card #F0F0F0, border #E8E8E8, gold stars #E7BF40 (overrides D2's normalization to starYellow #F5B301), sage fee #80AD69 (D2's "sage retired" OVERRIDDEN on these 3 screens — the owner designed it, it stays), hero gradient as designed.
- Font: Geist (owner's explicit website-consistency decision — the ONLY sanctioned deviation from the Figma file, whose Roboto is Figma-default residue, not a design choice).
- Sanctioned data-level fixes (invisible to design fidelity): photo STRETCH→cover, repeated-photo→initials fallback, AI-corrupted bio (node 25:38) rewrite, $→₹ (en-IN, tabular-nums), "287 Doctors found"→live API count, chevrons/message icon per Figma art.
- §4 token bridge remains law for ALL OTHER screens; these 3 are Figma-authoritative visually, tokens-authoritative structurally (text roles still map to the Geist ramp).

**Infra recovery (same day):** machine restart wiped Aturseva-Apk node_modules (tunnel 502, expo binary missing). Fixed: bun install (615 pkgs, exit 0); package.json `start:tunnel` --tunnel ngrok → --tunnel expo (ngrok provider refuses robot tokens; expo provider verified HTTP 200, same c-atursevateam-f5cka7-* prefix; suffix rotates per session — the preview page /api/tunnel self-heal spawn now carries the expo provider arg too). Figma nodes+render APIs 429 rate-limited this session; image-fills endpoint worked — 6/7 assets in design/redesign-assets/src (0ec0df2b = doctor photo 1080×2400 JPEG · 7e8a9806 1488×2268 · ae872258 1488×2266 · a41a9493 852×1846 · 98e78f2f 336×512 · ad317768 186×284 · 0799563c 403-failed). Asset identification + full geometry extraction queued behind the rate limit; build starts on unlock.
