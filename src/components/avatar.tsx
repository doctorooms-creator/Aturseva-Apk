/**
 * Avatar — photo→initials fallback (doc 03 §5). APK-B1 ships the honest
 * initials fallback only (photos arrive with profile polish in B2).
 */

import { StyleSheet, Text, View } from 'react-native'
import { type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'

export function Avatar({ name, size = 56 }: { name: string; size?: number }) {
  const c = useColors()
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <View style={[styles.base, { width: size, height: size, borderRadius: size / 2, backgroundColor: c.canvasSoft }]}>
      <Text style={[typo.bodyStrong, { color: c.ink }]}>{initials || '?'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
