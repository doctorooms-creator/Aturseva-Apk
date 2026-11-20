/**
 * Offline / degraded banner (doc 09): amber strip, tap = retry. Shows the
 * CACHED last-good underneath (fail-safe defaults law) and the retry one-tap.
 * Copy tone: plain English, never technical (owner directive).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { WifiOff } from 'lucide-react-native'
import { radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'

export function OfflineBanner({ onRetry }: { onRetry: () => void }) {
  const c = useColors()
  return (
    <View style={[styles.wrap, { backgroundColor: c.warnSoft }]}>
      <WifiOff size={16} color={c.warn} />
      <Text style={[styles.text, { color: c.warn }]} numberOfLines={1}>
        Connection problem — showing saved info
      </Text>
      <Pressable onPress={onRetry} hitSlop={8} style={styles.retry} accessibilityRole="button" accessibilityLabel="Try again">
        <Text style={[styles.retryText, { color: c.warn }]}>Try again</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
    borderRadius: radius.input,
    paddingHorizontal: space.s12,
    paddingVertical: space.s8,
    marginHorizontal: space.s16,
  },
  text: {
    ...typo.caption,
    flex: 1,
  },
  retry: {
    minHeight: TOUCH - 16,
    justifyContent: 'center',
    paddingHorizontal: space.s8,
  },
  retryText: {
    ...typo.caption,
    fontWeight: '600',
  },
})
