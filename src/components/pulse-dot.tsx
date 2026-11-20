/**
 * Teal pulse dot — the ONLY ambient animation in P0 (doc 03 §6):
 * live = breathing. 8px dot, 2s opacity loop. LIVE-ONLY token use.
 */

import { useEffect, useState } from 'react'
import { Animated } from 'react-native'
import { colors, motion } from '@/lib/tokens'

export function PulseDot({ size = 8 }: { size?: number }) {
  // Lazy-state Animated.Value — web+native+lint-clean constant identity.
  const [opacity] = useState(() => new Animated.Value(1))
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.25, duration: motion.pulseLoop / 2, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: motion.pulseLoop / 2, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])
  return <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.tealLive, opacity }} />
}
