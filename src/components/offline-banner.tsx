/**
 * Offline / degraded banner (doc 09): amber strip, tap = retry. Shows the
 * CACHED last-good underneath (fail-safe defaults law) and the retry one-tap.
 * Copy tone: warm Hinglish, never technical (doc 03 §6).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { WifiOff } from 'lucide-react-native'
import { colors, radius, space, TOUCH, type as typo } from '@/lib/tokens'

export function OfflineBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.wrap}>
      <WifiOff size={16} color={colors.warn} />
      <Text style={styles.text} numberOfLines={1}>
        Line me dikkt — cached dikhaya ja raha hai
      </Text>
      <Pressable onPress={onRetry} hitSlop={8} style={styles.retry} accessibilityRole="button" accessibilityLabel="Dobara try karein">
        <Text style={styles.retryText}>Dobara try</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
    backgroundColor: colors.warnSoft,
    borderRadius: radius.input,
    paddingHorizontal: space.s12,
    paddingVertical: space.s8,
    marginHorizontal: space.s16,
  },
  text: {
    ...typo.caption,
    color: colors.warn,
    flex: 1,
  },
  retry: {
    minHeight: TOUCH - 16,
    justifyContent: 'center',
    paddingHorizontal: space.s8,
  },
  retryText: {
    ...typo.caption,
    color: colors.warn,
    fontWeight: '600',
  },
})
