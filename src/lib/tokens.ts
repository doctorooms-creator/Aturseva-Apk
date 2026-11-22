/**
 * ATURSEVA APP — DESIGN TOKENS (doc 03, the single source of truth in code).
 *
 * Laws this module enforces (doc 03, H1 re-alignment to the website system —
 * docs 16/17):
 * - Canvas: white + warm CREAM soft (#F4F2EC — the website's surface-2).
 * - Ink is the CTA + text hierarchy; grey support below body/ink.
 * - AQUA (#14B8A6) = the website's bright accent family: fills, washes,
 *   selection, live data accents — NEVER small text (2.45:1 on white —
 *   measured) and NEVER white text on aqua.
 * - Text accents use tealText (#0F766E, 5.4:1 AA); tealLive (#0D9488) is
 *   graphics/pulse/icons only (3.7:1 — passes the 3:1 non-text floor).
 * - Glass trio (H2's shell): simulated-glass v1 (OTA — expo-blur rides
 *   the vc3 APK per doc 17 D4).
 * - Pill grammar: 999 radius on everything interactive; cards 16; sheets 24.
 * - Dark mode P1: values dual-defined from day 1.
 */

// §2 — Color tokens (website system over Uber skeleton — docs 16/17)
export const colors = {
  canvas: '#FFFFFF',
  // H1: #F4F4F2 → #F4F2EC warm cream (the website's --w-surface-2,
  // measured ×50 on live pages). Gray-text AA re-measured on cream:
  // mute #6E6E6E = 4.55:1 (AA holds), body #5E5E5E = 5.79:1.
  canvasSoft: '#F4F2EC',
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

  /** AQUA — the website's bright accent (teal-500 family, the owner's
   *  "blue jesa"): fills, washes, selection, live accents ONLY. 2.45:1 on
   *  white — never small text, never white-on-aqua text. */
  aqua: '#14B8A6',
  /** Aqua wash — selected chips, lettermark circles, soft accents. */
  aquaSoft: '#F0FDFA',
  /** AA text accents (5.4:1 on white/cream; 5.39:1 on aquaSoft). */
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
}

export type ColorToken = keyof typeof colors

// Dark set (P1 / APK-B4) — dual-defined now per doc 03 §2 note.
export const darkColors: Record<ColorToken, string> = {
  canvas: '#0C0C0C',
  canvasSoft: '#1A1A19',
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
  // Simulated glass v1 on dark canvas.
  glassFill: 'rgba(20,20,20,0.85)',
  glassEdge: 'rgba(255,255,255,0.12)',
  glassShine: 'rgba(255,255,255,0.08)',
  success: '#4ADE80',
  successSoft: '#0B2A1B',
  warn: '#FBBF24',
  warnSoft: '#2A1D05',
  error: '#F87171',
  errorSoft: '#2B0D0D',
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

export const radius = { pill: 999, card: 16, input: 12, sheetTop: 24 } as const

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
