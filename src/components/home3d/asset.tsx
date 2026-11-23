/**
 * V3 3D ASSETS (Home V3.1 · P2 foundations): the manifest-driven art
 * component. Every pre-rendered render-host piece (assets/images/home3d,
 * declared by home3d-manifest.json) is consumed through here so the
 * variant math lives in ONE place:
 *
 * - Static require map (@2x + @3x per asset) — Metro bundles both, the
 *   runtime picks by PixelRatio (≥2.5 → 3x, else 2x; web always 2x —
 *   DPR on desktop/laptop web inflates without sharpening).
 * - Aspect = HEIGHT PER UNIT WIDTH, straight from the manifest's own
 *   "aspect" field (verified against the real PNG dims: e.g. hero-3d
 *   320×196 → 0.6116). height = width × aspect.
 * - resizeMode contain — the art never crops, only fits.
 */

import {
  Image,
  PixelRatio,
  Platform,
  type ImageRequireSource,
  type ImageStyle,
  type StyleProp,
} from 'react-native'

/** The seven pre-rendered V3 pieces (manifest keys). */
export type AssetName =
  | 'hero-3d'
  | 'shield-3d'
  | 'tile-doctor'
  | 'tile-hospital'
  | 'tile-labtubes'
  | 'tile-video'
  | 'token-stack'

/** Both density variants per asset — the static require map Metro walks. */
const SOURCES: Record<AssetName, { x2: ImageRequireSource; x3: ImageRequireSource }> = {
  'hero-3d': {
    x2: require('@/assets/images/home3d/hero-3d@2x.png'),
    x3: require('@/assets/images/home3d/hero-3d@3x.png'),
  },
  'shield-3d': {
    x2: require('@/assets/images/home3d/shield-3d@2x.png'),
    x3: require('@/assets/images/home3d/shield-3d@3x.png'),
  },
  'tile-doctor': {
    x2: require('@/assets/images/home3d/tile-doctor@2x.png'),
    x3: require('@/assets/images/home3d/tile-doctor@3x.png'),
  },
  'tile-hospital': {
    x2: require('@/assets/images/home3d/tile-hospital@2x.png'),
    x3: require('@/assets/images/home3d/tile-hospital@3x.png'),
  },
  'tile-labtubes': {
    x2: require('@/assets/images/home3d/tile-labtubes@2x.png'),
    x3: require('@/assets/images/home3d/tile-labtubes@3x.png'),
  },
  'tile-video': {
    x2: require('@/assets/images/home3d/tile-video@2x.png'),
    x3: require('@/assets/images/home3d/tile-video@3x.png'),
  },
  'token-stack': {
    x2: require('@/assets/images/home3d/token-stack@2x.png'),
    x3: require('@/assets/images/home3d/token-stack@3x.png'),
  },
}

/** Aspect (height per unit width) — home3d-manifest.json, verbatim. */
const ASPECT: Record<AssetName, number> = {
  'hero-3d': 0.6116,
  'shield-3d': 1.1285,
  'tile-doctor': 1.3481,
  'tile-hospital': 0.6596,
  'tile-labtubes': 1.1969,
  'tile-video': 0.691,
  'token-stack': 0.8929,
}

interface Asset3DProps {
  /** Which manifest piece to render. */
  name: AssetName
  /** Layout width (dp). With only one side given, the manifest aspect
   *  derives the other. */
  width?: number
  /** Layout height (dp). */
  height?: number
  style?: StyleProp<ImageStyle>
}

/** The V3 3D art piece — density-picked, aspect-safe, contain-fit. */
export function Asset3D({ name, width, height, style }: Asset3DProps) {
  // Web pins to @2x (DPR there is not a density hint, just zoom).
  const variant = Platform.OS === 'web' ? 'x2' : PixelRatio.get() >= 2.5 ? 'x3' : 'x2'
  const aspect = ASPECT[name]
  const resolvedWidth = width ?? (height !== undefined ? height / aspect : undefined)
  const resolvedHeight = height ?? (width !== undefined ? width * aspect : undefined)
  return (
    <Image
      source={SOURCES[name][variant]}
      style={[{ width: resolvedWidth, height: resolvedHeight }, style]}
      resizeMode="contain"
    />
  )
}
