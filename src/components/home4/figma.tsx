/**
 * V4 FIGMA ASSETS (doc 21 · doc 22): every original Figma artwork and
 * vector icon the home consumes, require-mapped @2x/@3x (Metro bundles
 * both; the runtime picks by PixelRatio — web pins to 2x).
 *
 * Provenance (doc 22 build record):
 * - Artworks (hero, 4 service tiles, token stack, whole lab card) are
 *   exact crops of the owner's Figma file rendered at 2x; image-fill
 *   artworks decode 1:1 from the source image bank, so a 2x render IS
 *   the @2x variant (@3x = 1.5x LANCZOS).
 * - Icons are glyph-detected crops of the FINAL reference render
 *   (vector icons in the original mockup are an earlier iteration —
 *   doc 22 §"node lies"; glyph bounds hug the real ink, so each icon's
 *   DESIGN SIZE below is its measured ink box, not its frame box).
 *
 * Sizes: FigArt renders at the design box (width/height in design px × s).
 * FigIcon renders at its measured ink size by default; pass w/h to
 * override (the nav uses its own geometry).
 */

import {
  Image,
  PixelRatio,
  Platform,
  type ImageRequireSource,
  type ImageStyle,
  type StyleProp,
} from 'react-native'

// ————————————————— art (assets/images/figma) —————————————————

export type FigArtName =
  | 'hero'
  | 'tile-doctor'
  | 'tile-hospital'
  | 'tile-lab'
  | 'tile-video'
  | 'token-stack'
  | 'lab-card'

const ART_SRC: Record<FigArtName, { x2: ImageRequireSource; x3: ImageRequireSource }> = {
  hero: {
    x2: require('../../../assets/images/figma/hero-2x.png'),
    x3: require('../../../assets/images/figma/hero-3x.png'),
  },
  'tile-doctor': {
    x2: require('../../../assets/images/figma/tile-doctor-2x.png'),
    x3: require('../../../assets/images/figma/tile-doctor-3x.png'),
  },
  'tile-hospital': {
    x2: require('../../../assets/images/figma/tile-hospital-2x.png'),
    x3: require('../../../assets/images/figma/tile-hospital-3x.png'),
  },
  'tile-lab': {
    x2: require('../../../assets/images/figma/tile-lab-2x.png'),
    x3: require('../../../assets/images/figma/tile-lab-3x.png'),
  },
  'tile-video': {
    x2: require('../../../assets/images/figma/tile-video-2x.png'),
    x3: require('../../../assets/images/figma/tile-video-3x.png'),
  },
  'token-stack': {
    x2: require('../../../assets/images/figma/token-stack-2x.png'),
    x3: require('../../../assets/images/figma/token-stack-3x.png'),
  },
  'lab-card': {
    x2: require('../../../assets/images/figma/lab-card-2x.png'),
    x3: require('../../../assets/images/figma/lab-card-3x.png'),
  },
}

/** Aspect = height per unit width, from the real PNG dims. */
const ART_ASPECT: Record<FigArtName, number> = {
  hero: 266 / 398,
  'tile-doctor': 106 / 144,
  'tile-hospital': 106 / 138,
  'tile-lab': 106 / 140,
  'tile-video': 106 / 136,
  'token-stack': 162 / 290,
  'lab-card': 208 / 784,
}

interface FigArtProps {
  name: FigArtName
  /** Layout width in DESIGN px (the aspect derives height), or both. */
  width?: number
  height?: number
  style?: StyleProp<ImageStyle>
}

/** An original Figma artwork, density-picked and aspect-safe. */
export function FigArt({ name, width, height, style }: FigArtProps) {
  const variant = Platform.OS === 'web' ? 'x2' : PixelRatio.get() >= 2.5 ? 'x3' : 'x2'
  const aspect = ART_ASPECT[name]
  const w = width ?? (height !== undefined ? height / aspect : undefined)
  const h = height ?? (width !== undefined ? width * aspect : undefined)
  return <Image source={ART_SRC[name][variant]} style={[{ width: w, height: h }, style]} resizeMode="contain" />
}

// ————————————————— icons (assets/images/figma/icons) —————————————————

export type FigIconName =
  | 'pin'
  | 'chevron-down'
  | 'bell'
  | 'search'
  | 'mic'
  | 'view-arrow'
  | 'appt-chevron'
  | 'lightning'
  | 'calendar'
  | 'cardiology'
  | 'pulmonology'
  | 'neurology'
  | 'gastro'
  | 'gynecology'
  | 'more'
  | 'nav-home'
  | 'nav-bookings'
  | 'nav-records'
  | 'nav-account'

const ICON_SRC: Record<FigIconName, ImageRequireSource> = {
  pin: require('../../../assets/images/figma/icons/pin-2x.png'),
  'chevron-down': require('../../../assets/images/figma/icons/chevron-down-2x.png'),
  bell: require('../../../assets/images/figma/icons/bell-2x.png'),
  search: require('../../../assets/images/figma/icons/search-2x.png'),
  mic: require('../../../assets/images/figma/icons/mic-2x.png'),
  'view-arrow': require('../../../assets/images/figma/icons/view-arrow-2x.png'),
  'appt-chevron': require('../../../assets/images/figma/icons/appt-chevron-2x.png'),
  lightning: require('../../../assets/images/figma/icons/lightning-2x.png'),
  calendar: require('../../../assets/images/figma/icons/calendar-2x.png'),
  cardiology: require('../../../assets/images/figma/icons/cardiology-2x.png'),
  pulmonology: require('../../../assets/images/figma/icons/pulmonology-2x.png'),
  neurology: require('../../../assets/images/figma/icons/neurology-2x.png'),
  gastro: require('../../../assets/images/figma/icons/gastro-2x.png'),
  gynecology: require('../../../assets/images/figma/icons/gynecology-2x.png'),
  more: require('../../../assets/images/figma/icons/more-2x.png'),
  'nav-home': require('../../../assets/images/figma/icons/nav-home-2x.png'),
  'nav-bookings': require('../../../assets/images/figma/icons/nav-bookings-2x.png'),
  'nav-records': require('../../../assets/images/figma/icons/nav-records-2x.png'),
  'nav-account': require('../../../assets/images/figma/icons/nav-account-2x.png'),
}

const ICON_SRC_3: Record<FigIconName, ImageRequireSource> = {
  pin: require('../../../assets/images/figma/icons/pin-3x.png'),
  'chevron-down': require('../../../assets/images/figma/icons/chevron-down-3x.png'),
  bell: require('../../../assets/images/figma/icons/bell-3x.png'),
  search: require('../../../assets/images/figma/icons/search-3x.png'),
  mic: require('../../../assets/images/figma/icons/mic-3x.png'),
  'view-arrow': require('../../../assets/images/figma/icons/view-arrow-3x.png'),
  'appt-chevron': require('../../../assets/images/figma/icons/appt-chevron-3x.png'),
  lightning: require('../../../assets/images/figma/icons/lightning-3x.png'),
  calendar: require('../../../assets/images/figma/icons/calendar-3x.png'),
  cardiology: require('../../../assets/images/figma/icons/cardiology-3x.png'),
  pulmonology: require('../../../assets/images/figma/icons/pulmonology-3x.png'),
  neurology: require('../../../assets/images/figma/icons/neurology-3x.png'),
  gastro: require('../../../assets/images/figma/icons/gastro-3x.png'),
  gynecology: require('../../../assets/images/figma/icons/gynecology-3x.png'),
  more: require('../../../assets/images/figma/icons/more-3x.png'),
  'nav-home': require('../../../assets/images/figma/icons/nav-home-3x.png'),
  'nav-bookings': require('../../../assets/images/figma/icons/nav-bookings-3x.png'),
  'nav-records': require('../../../assets/images/figma/icons/nav-records-3x.png'),
  'nav-account': require('../../../assets/images/figma/icons/nav-account-3x.png'),
}

/** Measured ink box per icon, in DESIGN px (glyph-detected on the final
 *  reference render — doc 22). [w, h]. */
const ICON_SIZE: Record<FigIconName, [number, number]> = {
  pin: [9, 11.5],
  'chevron-down': [7, 5],
  bell: [15, 20],
  search: [15, 15],
  mic: [12, 16],
  'view-arrow': [10, 8],
  'appt-chevron': [5, 10],
  lightning: [8, 12],
  calendar: [10, 11],
  cardiology: [23, 20.5],
  pulmonology: [22, 20.5],
  neurology: [25, 20],
  gastro: [22.5, 23.5],
  gynecology: [19, 21],
  more: [19, 20],
  'nav-home': [17, 17.5],
  'nav-bookings': [17, 18],
  'nav-records': [18, 18],
  'nav-account': [17, 18],
}

interface FigIconProps {
  name: FigIconName
  /** Device scale (useV4) — icon renders at its design ink size × s. */
  s: number
  /** Override the design size (rare — e.g. scaled-down view-all arrow). */
  w?: number
  h?: number
  style?: StyleProp<ImageStyle>
}

/** An original Figma vector icon at its measured ink size. */
export function FigIcon({ name, s, w, h, style }: FigIconProps) {
  const variant = Platform.OS === 'web' ? 'x2' : PixelRatio.get() >= 2.5 ? 'x3' : 'x2'
  const [dw, dh] = ICON_SIZE[name]
  const width = (w ?? dw) * s
  const height = (h ?? dh) * s
  const src = variant === 'x3' ? ICON_SRC_3[name] : ICON_SRC[name]
  return <Image source={src} style={[{ width, height }, style]} resizeMode="contain" />
}
