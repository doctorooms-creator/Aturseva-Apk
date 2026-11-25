/**
 * REDESIGN SKIN (doc 24 §9 owner fidelity directive) — the 3 redesigned
 * screens (Find Care / Find Doctor / Doctors Profile) render EXACTLY the
 * owner's Figma frames (file koY1wZRoJtIP72D0YpbEZm, nodes 25:2/25:3/25:4).
 * Colors are Figma-verbatim, cross-checked against the reference showcase.
 * Font is Geist per the owner's explicit website-consistency decision (the
 * ONLY sanctioned deviation from the Figma file, which defaults to Roboto).
 * All other screens keep tokens.ts — this skin is redesign-screens-only.
 */
export const rd = {
  /** Figma ink #2C2928 — warm charcoal: text, CTAs, dark cards, selected pills. */
  ink: '#2C2928',
  /** Light card fill (Find Doctor cards, stats glass base). */
  card: '#F0F0F0',
  /** Hairline borders / input pill borders. */
  border: '#E8E8E8',
  /** Gold rating stars (fills only, never text). Figma #E7BF40. */
  gold: '#E7BF40',
  /** Fee pill green (the owner's sage). Figma #80AD69. */
  sage: '#80AD69',
  /** Find Doctor page background (one step deeper than cards). */
  pageFind: '#EFEFED',
  /** Search pill fill + border. */
  searchFill: '#F7F7F5',
  searchBorder: '#E5E5E3',
  /** Input placeholder gray. */
  placeholder: '#8A8A8A',
  /** Secondary text on light surfaces. */
  secondary: '#9A9A97',
  /** Secondary text on the profile screen. */
  secondary2: '#8E8E93',
  /** Leading icon gray in input pills. */
  iconGray: '#4A4A4A',
  /** Specialty icon tile circle fill. */
  iconTile: '#F2F2F2',
  /** Frosted stats card (Doctors Profile). */
  glass: 'rgba(255,255,255,0.65)',
  /** Profile background vertical gradient. */
  profileBgTop: '#F4F4F5',
  profileBgBottom: '#EDEDEE',
  /** Half-star empty track. */
  halfStarTrack: '#D9D9D9',
  /** Secondary text on dark cards. */
  onDarkSecondary: '#6E6E6C',
  white: '#FFFFFF',
} as const

/** Dark counterparts (the Figma file is light-only; dark mirrors the app's darkColors grammar). */
export const rdDark = {
  ...rd,
  ink: '#F5F5F5',
  card: '#1E1E1C',
  border: '#2A2A28',
  pageFind: '#0F0F0E',
  searchFill: '#1C1C1A',
  searchBorder: '#2A2A28',
  placeholder: '#7A7A78',
  secondary: '#8E8E8C',
  secondary2: '#8E8E93',
  iconGray: '#B0B0AE',
  iconTile: '#232322',
  glass: 'rgba(20,20,20,0.65)',
  profileBgTop: '#111112',
  profileBgBottom: '#0C0C0D',
  halfStarTrack: '#3A3A38',
  onDarkSecondary: '#8E8E8C',
  white: '#0C0C0C',
} as const

/**
 * The redesign frames are 390 design-px wide (390×844). The app renders on
 * the 426-frame scale law (s = width/426): a 390-frame value converts via
 * ×(426/390) = ×1.0923. Screens should read the frame scale from their
 * existing width hook and apply rdScale() to every measured design-px.
 */
export const RD_FRAME = 390
export const rdScale = (framePx: number) => framePx * (426 / RD_FRAME)

/** Geometry laws (Figma frames + measured crops):
 * — input pills are full stadiums (r = h/2, h ≈ 48-50 at 390-frame scale)
 * — CTA pills are stadiums, h ≈ 52-56
 * — cards r ≈ 24-28; day-strip band r ≈ 20 with 6 stadium pills ≈ 52×64, gap 8
 * — back / map / filter buttons are 44-48 circles
 * — stats card r ≈ 24, 3 equal columns; specialty icon tiles are circles
 * — text roles map to the Geist ramp (tokens.ts type scale), never raw Figma sizes. */
