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

/** One rail-card-shaped skeleton (avatar + text rails + fee row — mirrors
 * the B13 DoctorRailCard layout: top row avatar/name rails, bottom fee row). */
export function DoctorRailSkeleton() {
  const c = useColors()
  return (
    <View style={[styles.railCard, { backgroundColor: c.canvas, borderColor: c.hairline }]}>
      <View style={styles.top}>
        <View style={styles.avatarCol}>
          <View style={[styles.avatar, { backgroundColor: c.canvasSoft }]} />
        </View>
        <View style={styles.rails}>
          <SkeletonBlock width="80%" height={14} />
          <SkeletonBlock width="60%" height={10} radiusValue={radius.pill} />
          <SkeletonBlock width="40%" height={12} radiusValue={radius.pill} />
        </View>
      </View>
      <View style={styles.feeRow}>
        <SkeletonBlock width={44} height={14} />
        <SkeletonBlock width={64} height={10} radiusValue={radius.pill} />
      </View>
    </View>
  )
}

/** Trust-strip skeleton: one quiet line. */
export function TrustStripSkeleton() {
  return <SkeletonBlock width={220} height={12} radiusValue={radius.pill} />
}

// B11 UX fix (VLM-measured): 232 truncated the most common spec text
// ("General Physician" needs 97px, the col got 83 — ellipsis on the
// FIRST card patients see). 264 gave the spec col ~102px. (Now consumed
// by the HOSPITAL rail card only — the doctor rail moved to its own
// wider constant in B13; hospital names measure un-truncated at 264.)
const CARD_W = 264

// B13 no-truncation fix: the DOCTOR rail card restructured (fee → bottom
// row) and widened to 300 so the name/spec column gets ≥200px — measured
// ellipsized nodes on home ("Dr. QA ProdOnco", "IVF & Fertility
// Specialist") at 264 are gone; longest real specialization (169px) fits.
const DOCTOR_CARD_W = 300

const styles = StyleSheet.create({
  railCard: {
    width: DOCTOR_CARD_W,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.s16,
    gap: space.s8,
  },
  top: {
    flexDirection: 'row',
    gap: space.s12,
    alignItems: 'flex-start',
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
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
  },
})

export const RAIL_CARD_WIDTH = CARD_W
export const DOCTOR_RAIL_WIDTH = DOCTOR_CARD_W
