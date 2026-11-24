/**
 * V4 FIGMA HOME (doc 21 · doc 22) — the scale system, design constants,
 * and type ramp for the authoritative single-screen rebuild.
 *
 * SCALE: the design frame is 426×923 (Figma "AturSeva · Home"). Every dp
 * in this module is expressed in DESIGN px and multiplied by
 * s = windowWidth / 426 — the composition reproduces proportionally on
 * any device (never a fixed-dp port that overflows 360dp handsets).
 *
 * COLORS: the home is a designed composition — its surfaces are the
 * design's own literals (like any art overlay: the current TokenBanner
 * already renders its near-black card identically in both themes). The
 * page behind stays the adaptive app canvas; every designed element
 * inside carries these constants in BOTH modes.
 *
 * TYPE: the design's Roboto maps to the app's loaded Geist (Roboto-class,
 * doc 21 ruling); the ONLY script face is Dancing Script for the wordmark.
 * Presets store UNSCALED design px — v4t(preset, s) scales
 * fontSize/lineHeight/letterSpacing together.
 */

import { useWindowDimensions } from 'react-native'
import type { TextStyle } from 'react-native'

/** The design frame width (Figma). */
export const V4_FRAME_W = 426

/**
 * The scale ceiling (window-size-class law): phones ≤ 426dp reproduce the
 * design 1:1 proportionally; wider devices (foldables open, small tablets)
 * cap at 1.2 so the composition stays a phone screen — centered with side
 * margins, never a balloon. Content max width = 426 × 1.2 = 511dp.
 */
export const V4_MAX_S = 1.2

/** The content column ceiling that pairs with V4_MAX_S (dp). */
export const V4_MAX_W = Math.round(V4_FRAME_W * V4_MAX_S) + 1 // 512

/** Design-px → device-dp scale for the current window (capped). */
export function useV4(): number {
  const { width } = useWindowDimensions()
  return Math.min(width / V4_FRAME_W, V4_MAX_S)
}

/** v4 shadow + hairline family (doc 21 "shadow law"): white cards, soft
 *  drop (0,6,9, 7.5%) + hairline borders on the white page. */
export const v4Shadow = {
  shadowColor: '#080909',
  shadowOpacity: 0.075,
  shadowRadius: 9,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
} as const

/** The design's fixed palette (doc 21 type/color system). */
export const v4c = {
  ink: '#080909',
  gray1: '#4E4F52',
  gray2: '#606063',
  gray3: '#414141',
  white: '#FFFFFF',
  banner: '#252525',
  liveBg: '#E7F7E7',
  liveDot: '#068006',
  liveText: '#067D06',
  redDot: '#FF1932',
  pill: '#F3F3F3',
  strokeSearch: '#EDEDED',
  strokeCard: '#F2F2F2',
  strokeAppt: '#F3F3F3',
  strokeChev: '#EFEFEF',
  strokeNav: '#EBEBEB',
  divider: '#DDDDDD',
  track: '#E8E8E8',
  trackFill: '#050505',
} as const

/** Unscaled type presets (design px). Scale with v4t(preset, s). */
export const v4type = {
  /** Header wordmark — the only script face (Dancing Script Bold 29). */
  wordmark: { fontFamily: 'DancingScript_700Bold', fontWeight: '700' as const, fontSize: 29, lineHeight: 36 },
  /** Location line (2 lines, 10.5 SemiBold). */
  location: { fontFamily: 'Geist_600SemiBold', fontWeight: '600' as const, fontSize: 10.5, lineHeight: 12.6, letterSpacing: 0.1 },
  heroTitle: { fontFamily: 'Geist_700Bold', fontWeight: '700' as const, fontSize: 26, lineHeight: 29.12, letterSpacing: -0.3 },
  heroSub: { fontFamily: 'Geist_400Regular', fontWeight: '400' as const, fontSize: 11.3, lineHeight: 12.66 },
  searchPlaceholder: { fontFamily: 'Geist_400Regular', fontWeight: '400' as const, fontSize: 12.6, lineHeight: 15 },
  tileTitle: { fontFamily: 'Geist_700Bold', fontWeight: '700' as const, fontSize: 11.7, lineHeight: 14.6 },
  tileSub: { fontFamily: 'Geist_400Regular', fontWeight: '400' as const, fontSize: 9, lineHeight: 11.3 },
  bannerTitle: { fontFamily: 'Geist_700Bold', fontWeight: '700' as const, fontSize: 16.5, lineHeight: 18.48 },
  chip: { fontFamily: 'Geist_500Medium', fontWeight: '500' as const, fontSize: 10, lineHeight: 12 },
  sectionTitle: { fontFamily: 'Geist_700Bold', fontWeight: '700' as const, fontSize: 17, lineHeight: 20.4 },
  viewAll: { fontFamily: 'Geist_500Medium', fontWeight: '500' as const, fontSize: 10.5, lineHeight: 13 },
  apptName: { fontFamily: 'Geist_700Bold', fontWeight: '700' as const, fontSize: 13.2, lineHeight: 16 },
  apptSub: { fontFamily: 'Geist_400Regular', fontWeight: '400' as const, fontSize: 10, lineHeight: 12.5 },
  liveBadge: { fontFamily: 'Geist_500Medium', fontWeight: '500' as const, fontSize: 10, lineHeight: 12.5 },
  statNum: { fontFamily: 'Geist_700Bold', fontWeight: '700' as const, fontSize: 17, lineHeight: 20.4 },
  statLabel: { fontFamily: 'Geist_400Regular', fontWeight: '400' as const, fontSize: 10, lineHeight: 12.5 },
  specTitle: { fontFamily: 'Geist_700Bold', fontWeight: '700' as const, fontSize: 15.5, lineHeight: 18.6 },
  specViewAll: { fontFamily: 'Geist_500Medium', fontWeight: '500' as const, fontSize: 8.5, lineHeight: 11 },
  specLabel: { fontFamily: 'Geist_500Medium', fontWeight: '500' as const, fontSize: 8.4, lineHeight: 10.6 },
  navLabel: { fontFamily: 'Geist_600SemiBold', fontWeight: '600' as const, fontSize: 10, lineHeight: 12.6 },
  navLabelOff: { fontFamily: 'Geist_400Regular', fontWeight: '400' as const, fontSize: 10, lineHeight: 12.6 },
} as const

export type V4Preset = keyof typeof v4type

/** Scale a type preset to the current device (font/line/letter together). */
export function v4t(preset: V4Preset, s: number): TextStyle {
  const p = v4type[preset] as TextStyle & {
    fontSize: number
    lineHeight?: number
    letterSpacing?: number
  }
  return {
    ...p,
    fontSize: p.fontSize * s,
    ...(p.lineHeight !== undefined ? { lineHeight: p.lineHeight * s } : {}),
    ...(typeof p.letterSpacing === 'number' && p.letterSpacing !== 0
      ? { letterSpacing: p.letterSpacing * s }
      : {}),
  }
}
