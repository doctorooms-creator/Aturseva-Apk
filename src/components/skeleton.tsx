/**
 * Skeletons (doc 03 §5/§6): skeleton-first, mirror the FINAL layout exactly
 * (crossfade 150ms — no layout jump). Blocks pulse quietly.
 */

import { useEffect, useState } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { radius, space } from '@/lib/tokens'
import { useColors } from '@/lib/theme'

function usePulse() {
  // Animated.Value lives in lazy state (NOT useRef-during-render, NOT
  // useAnimatedValue — react-native-web 0.21 exports neither pattern
  // legally; lazy useState is the web+native+lint-clean constant identity).
  const [opacity] = useState(() => new Animated.Value(0.5))
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 900, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])
  return opacity
}

export function SkeletonBlock({
  width,
  height,
  radiusValue = radius.input,
}: {
  width: number | `${number}%`
  height: number
  radiusValue?: number
}) {
  const opacity = usePulse()
  const c = useColors()
  return (
    <Animated.View
      style={{ width: width as never, height, borderRadius: radiusValue, backgroundColor: c.canvasSoft, opacity }}
    />
  )
}

/** One rail-card-shaped skeleton (avatar circle + text rails). */
export function DoctorRailSkeleton() {
  const c = useColors()
  return (
    <View style={[styles.railCard, { backgroundColor: c.canvas, borderColor: c.hairline }]}>
      <View style={styles.avatarCol}>
        <View style={[styles.avatar, { backgroundColor: c.canvasSoft }]} />
      </View>
      <View style={styles.rails}>
        <SkeletonBlock width="80%" height={14} />
        <SkeletonBlock width="60%" height={10} radiusValue={radius.pill} />
        <SkeletonBlock width="40%" height={12} radiusValue={radius.pill} />
      </View>
    </View>
  )
}

/** Trust-strip skeleton: one quiet line. */
export function TrustStripSkeleton() {
  return <SkeletonBlock width={220} height={12} radiusValue={radius.pill} />
}

// B11 UX fix (VLM-measured): 232 truncated the most common specialty
// ("General Physician" needs 97px, the col got 83 — ellipsis on the
// FIRST card patients see). 264 gives the text col ~102px: the common
// spec fits; longer specs ellipsize honestly (numberOfLines=1 stays).
const CARD_W = 264

const styles = StyleSheet.create({
  railCard: {
    width: CARD_W,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.s16,
    flexDirection: 'row',
    gap: space.s12,
  },
  avatarCol: {
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
  },
  rails: {
    flex: 1,
    gap: space.s8,
    justifyContent: 'center',
  },
})

export const RAIL_CARD_WIDTH = CARD_W
