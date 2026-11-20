/**
 * ATURSEVA APP — DESIGN TOKENS (doc 03, the single source of truth in code).
 *
 * Laws this module enforces (doc 03):
 * - Restraint: white canvas, ink text, grey support — teal is LIVE-ONLY.
 * - Hierarchy by scale + weight, never color.
 * - Pill grammar: 999 radius on everything interactive; cards 16; sheets 24.
 * - Dark mode P1: values dual-defined from day 1 (build cost ≈ 0 — that
 *   is why this table exists BEFORE screens), consumed in APK-B4.
 */

// §2 — Color tokens (healthcare skin over Uber skeleton)
export const colors = {
  canvas: '#FFFFFF',
  canvasSoft: '#F4F4F2',
  ink: '#0A0A0A',
  body: '#5E5E5E',
  mute: '#AFAFAF',
  hairline: '#E7E7E7',

  /** LIVE ONLY — queue pulse, selection rings, live chips. Never decorative. */
  tealLive: '#0F766E',
  tealLiveSoft: '#CCFBF1',

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
  mute: '#7A7A7A',
  hairline: '#262626',
  tealLive: '#2DD4BF',
  tealLiveSoft: '#0F3D38',
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
