/**
 * Onboarding illustrations — line-art ONLY, 2 colors max (ink stroke +
 * teal accent — doc 03 §7: illustration only for empty/onboarding, never
 * in content). Drawn with react-native-svg: no photos, no clip-art.
 */

import Svg, { Circle, Line, Path, Rect } from 'react-native-svg'
import { colors } from '@/lib/tokens'

const INK = colors.ink
const TEAL = colors.tealLive

const W = 220
const H = 150

/** Slide 1 — "Find a doctor": magnifier over problem words. */
export function ArtSearch() {
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Circle cx={95} cy={62} r={38} fill="none" stroke={INK} strokeWidth={3} />
      <Line x1={124} y1={90} x2={150} y2={116} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <Path d="M 72 62 h 46" stroke={TEAL} strokeWidth={3} strokeLinecap="round" />
      <Path d="M 78 74 q 17 8 34 0" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <Circle cx={95} cy={46} r={3.5} fill={TEAL} />
      <Path d="M 40 132 h 150" stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.25} />
      <Circle cx={178} cy={34} r={4} fill="none" stroke={INK} strokeWidth={2} opacity={0.4} />
    </Svg>
  )
}

/** Slide 2 — "Book in 3 taps": calendar pill + fee coin (fee-upfront law). */
export function ArtBook() {
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Rect x={60} y={34} width={88} height={84} rx={14} fill="none" stroke={INK} strokeWidth={3} />
      <Path d="M 60 60 h 88" stroke={INK} strokeWidth={3} />
      <Line x1={80} y1={26} x2={80} y2={42} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <Line x1={128} y1={26} x2={128} y2={42} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <Rect x={72} y={72} width={16} height={14} rx={4} fill="none" stroke={TEAL} strokeWidth={2.5} />
      <Rect x={98} y={72} width={16} height={14} rx={4} fill="none" stroke={INK} strokeWidth={2} opacity={0.3} />
      <Rect x={72} y={94} width={16} height={14} rx={4} fill="none" stroke={INK} strokeWidth={2} opacity={0.3} />
      <Circle cx={158} cy={94} r={14} fill="none" stroke={INK} strokeWidth={3} />
      <Path d="M 154 94 h 8 M 158 90 v 8" stroke={TEAL} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  )
}

/** Slide 3 — "Turn confirmed": token card + the teal pulse. */
export function ArtToken() {
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Rect x={62} y={30} width={96} height={92} rx={14} fill="none" stroke={INK} strokeWidth={3} />
      <Path d="M 78 50 h 64" stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.3} />
      <Path d="M 86 84 h 30" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <Path d="M 86 98 h 44" stroke={INK} strokeWidth={2.5} strokeLinecap="round" opacity={0.3} />
      <Circle cx={140} cy={48} r={6} fill={TEAL} />
      <Circle cx={140} cy={48} r={11} fill="none" stroke={TEAL} strokeWidth={2} opacity={0.4} />
      <Path d="M 176 118 q 8 -6 16 0 t 16 0" fill="none" stroke={TEAL} strokeWidth={2.5} strokeLinecap="round" opacity={0.5} />
    </Svg>
  )
}
