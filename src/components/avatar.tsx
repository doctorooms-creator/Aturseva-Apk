/**
 * Avatar — photo→initials fallback (doc 03 §5). APK-B1 ships the honest
 * initials fallback only (photos arrive with profile polish in B2).
 */

import { StyleSheet, Text, View } from 'react-native'
import { colors, type as typo } from '@/lib/tokens'

export function Avatar({ name, size = 56 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <View style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[typo.bodyStrong, styles.initials]}>{initials || '?'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.canvasSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.ink,
  },
})
