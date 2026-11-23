/**
 * ATURSEVA APP — DESIGN TOKENS (doc 03, the single source of truth in code).
 *
 * R49 MONOCHROME DIRECTIVE (owner-set 2026-11-22, Uber laws + website palette
 * via the awesome-design-md Uber DESIGN.md + impeccable craft-floor):
 * - Canvas: pure white + near-white soft (#F7F8F8 — the website's own body
 *   background, measured live ×2 CSS vars). NO cream: the site's #F4F2EC
 *   "ivory" is a 5–50% alpha TINT in the site's CSS, never a solid surface —
 *   H3's cream canvas was a misread, corrected here (R49).
 * - Ink is the CTA + text hierarchy; grey support below body/ink.
 * - Ocean teal (#00BAA7 site teal-500 family) = the website's secondary
 *   (the owner's "ocean jesa"): fills, washes, selection, live accents —
 *   NEVER small text and NEVER white text on ocean.
 * - Text accents use tealText (#0F766E, 5.47:1 AA on white); tealLive
 *   (#0D9488) is graphics/pulse/icons only (3.7:1 — passes the 3:1
 *   non-text floor).
 * - Glass trio (H2's shell): simulated-glass v1 (OTA — expo-blur rides
 *   the vc3 APK per doc 17 D4).
 * - Pill grammar (Uber signature): 999 radius on everything interactive;
 *   cards 24 (V3.1 radius refresh); sheets 24. One ink pill per viewport =
 *   the conversion story.
 * - Dark mode P1: values dual-defined from day 1.
 */

// §2 — Color tokens (Uber skeleton + website palette — R49 monochrome)
export const colors = {
  canvas: '#FFFFFF',
  // R49: #F4F2EC cream RETIRED — the website's ivory is a low-alpha tint
  // in its CSS, never a solid page fill; the site's real body background is
  // #F7F8F8 (measured: --background in every page's CSS). Monochrome
  // near-white soft surface, Uber's canvas-soft grammar. Gray-text AA on
  // #F7F8F8: mute #6E6E6E = 4.86:1 (AA holds), body #5E5E5E = 5.9:1.
  canvasSoft: '#F7F8F8',
  ink: '#0A0A0A',
  body: '#5E5E5E',
  // B10 contrast fix (VLM nitpicks: gray captions + zone labels read
  // too faint): was #AFAFAF (2.3:1 on white — under every WCAG floor).
  // First take #757575 hit 4.6:1 on white but only 4.19:1 on the
  // canvasSoft card (VLM fix-loop caught it); #6E6E6E = 5.1:1 on white
  // and 4.64:1 on canvasSoft — AA everywhere gray text lands. Hierarchy
  // stays scale+weight-led (doc 03); grey still sits BELOW body/ink.
  mute: '#6E6E6E',
  hairline: '#E7E7E7',

  /** OCEAN — the website's secondary (teal-500 family, the owner's
   *  "ocean jesa blue type", site-measured #00baa7 in R48 forensics):
   *  fills, washes, selection, live accents ONLY. ~2.6:1 on white —
   *  never small text, never white-on-ocean text. */
  aqua: '#00BAA7',
  /** Aqua wash — selected chips, lettermark circles, soft accents. */
  aquaSoft: '#F0FDFA',
  /** AA text accents (5.47:1 on white; 5.35:1 on #F7F8F8; 5.39:1 on aquaSoft). */
  tealText: '#0F766E',
  /** LIVE GRAPHICS ONLY — pulse, rings, icons, borders, timeline fills
   *  (3.75:1 on white — passes the 3:1 non-text floor, fails text AA). */
  tealLive: '#0D9488',
  /** v1 glass wash (soft fills) — same value family as aquaSoft; kept
   *  as the compat key existing soft-chip usages consume (B14 tonePair
   *  ledger: tealText on tealLiveSoft = 5.39:1 light / 8.1:1 dark). */
  tealLiveSoft: '#F0FDFA',

  /** H2 shell — simulated glass v1 (doc 16 PART 2): translucency trio
   *  measured from the live website nav-pill recipe. */
  glassFill: 'rgba(255,255,255,0.82)',
  glassEdge: 'rgba(255,255,255,0.20)',
  glassShine: 'rgba(255,255,255,0.25)',

  success: '#15803D',
  successSoft: '#F0FDF4',
  warn: '#B45309',
  warnSoft: '#FFFBEB',
  error: '#B91C1C',
  errorSoft: '#FEF2F2',

  /** V3.1 HOME REBUILD (P2 foundations): the V3 accessory palette —
   *  live badges, promo washes, chip/card neutrals, and second-tier
   *  hairline/mute steps the denser home surface grammar needs.
   *  (Lives here with the rest of the sets — theme.tsx's ColorSet
   *  picks the keys up automatically.) */
  /** Live/queue green — pulse dots, "live now" badges (graphics-led). */
  liveGreen: '#22A94E',
  liveGreenSoft: '#DCF5E3',
  /** Star/rating yellow — review scores (fills/icons only, never text). */
  starYellow: '#F5B301',
  /** Promo banner washes — lavender (consult promo) + mint (labs promo). */
  promoLavender: '#E7E6FA',
  promoMint: '#E3F4EC',
  /** Idle filter chips on the near-white canvas. */
  chipIdle: '#F0F0F1',
  /** Soft card fill — one step below canvasSoft on gray cards. */
  cardSoft: '#F7F7F8',
  /** Second-tier hairline — inner dividers inside r24 cards. */
  hairline2: '#ECECEE',
  /** Ambient blob fills behind 3D art. */
  blob: '#EDEDEF',
  /** Promo banner ink — near-black on the lavender wash. */
  bannerInk: '#161616',
  /** Second-tier mute — captions one step under mute. */
  mute2: '#8A8A8E',
}

export type ColorToken = keyof typeof colors

// Dark set (P1 / APK-B4) — dual-defined now per doc 03 §2 note.
export const darkColors: Record<ColorToken, string> = {
  canvas: '#0C0C0C',
  canvasSoft: '#1A1A1A',
  ink: '#F5F5F5',
  body: '#B8B8B8',
  // B10: was #7A7A7A (4.5:1 — technically passing but visually thin next
  // to the light-mode bump); #8C8C8C = 5.7:1 on the dark canvas.
  mute: '#8C8C8C',
  hairline: '#262626',
  // H1 dark set — aqua family mirrors the website's dark equivalents.
  aqua: '#2DD4BF',
  aquaSoft: '#0F3D38',
  tealText: '#5EEAD4',
  tealLive: '#2DD4BF',
  tealLiveSoft: '#0F3D38',
  // Simulated glass v1 on dark canvas. R49: edge 0.12 → 0.18 — the
  // floating pill was barely distinguishable from the #0C0C0C canvas
  // (VLM dark audit catch); the edge is the definition on dark.
  glassFill: 'rgba(20,20,20,0.85)',
  glassEdge: 'rgba(255,255,255,0.18)',
  glassShine: 'rgba(255,255,255,0.08)',
  success: '#4ADE80',
  successSoft: '#0B2A1B',
  warn: '#FBBF24',
  warnSoft: '#2A1D05',
  error: '#F87171',
  errorSoft: '#2B0D0D',
  // V3.1 accessory palette — dark counterparts (dual-defined day 1).
  liveGreen: '#2BD989',
  liveGreenSoft: '#12301D',
  starYellow: '#F5B301',
  promoLavender: '#232041',
  promoMint: '#12201A',
  chipIdle: '#1E1E22',
  cardSoft: '#161618',
  hairline2: '#232326',
  blob: '#1A1B1E',
  bannerInk: '#1E1E22',
  mute2: '#8A8A8E',
}

// §3 — Type scale (system stack; weights do hierarchy; tabular numbers
// for money/turn — applied at usage sites via fontVariant: ['tabular-nums'])
export const type = {
  displayHero: { fontSize: 32, lineHeight: 36, fontWeight: '700' as const },
  display: { fontSize: 24, lineHeight: 28, fontWeight: '700' as const },
  title: { fontSize: 18, lineHeight: 22, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
} as const

// §4 — Spacing (8-grid) · radius · elevation (2 levels only)
export const space = { s4: 4, s8: 8, s12: 12, s16: 16, s20: 20, s24: 24, s32: 32, s40: 40, s48: 48 } as const

// V3.1 radius refresh (approved design spec): cards breathe at 24; the
// nav pill trades 999 for a softer 36; the active tab's icon pod is 28.
export const radius = { pill: 999, card: 24, input: 12, sheetTop: 24, navPill: 36, activePod: 28 } as const

export const elevation = {
  card: {
    shadowColor: '#0A0A0A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sheet: {
    shadowColor: '#0A0A0A',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  /** H2 — the floating glass pill nav (L3 "pill float" in DESIGN-uber's
   *  elevation map): the website nav shadow recipe, RN-native form. */
  navPill: {
    shadowColor: '#0A0A0A',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const

// §6 — Motion (ms) · the ONLY ambient animation in P0 is the 2s teal pulse.
export const motion = {
  press: 80,
  push: 250,
  crossfade: 150,
  pulseLoop: 2000,
} as const

/** Minimum interactive touch — doc 04 law, enforced at every control. */
export const TOUCH = 44
