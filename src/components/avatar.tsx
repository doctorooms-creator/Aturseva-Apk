/**
 * Avatar — photo→initials fallback (doc 03 §5). H1: the photo layer
 * finally ships (the B1 stub's promise, fulfilled per docs 16/17): a
 * `source` renders the image (RN Image, website w-avatar grammar —
 * square-rounded r16, object-cover); curated sources carry the
 * "Representative photo" honesty label (website law, doc 16 C5).
 * Initials fallback unchanged: near-white bg (R49 monochrome), ink
 * monogram.
 */

import { StyleSheet, Text, View, Image } from 'react-native'
import { type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'

export function Avatar({
  name,
  size = 56,
  source,
  representative = false,
}: {
  name: string
  size?: number
  /** Absolute photo URL — null/undefined falls back to initials. */
  source?: string | null
  /** True when `source` is a curated face (honesty label). */
  representative?: boolean
}) {
  const c = useColors()
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <View
      style={[styles.base, { width: size, height: size, backgroundColor: c.canvasSoft }]}
      accessibilityLabel={source ? (representative ? `${name} — representative photo` : `${name} photo`) : undefined}
    >
      {source ? (
        <Image
          source={{ uri: source }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityLabel={representative ? `${name} — representative photo` : `${name} photo`}
        />
      ) : (
        <Text style={[typo.bodyStrong, { color: c.ink }]}>{initials || '?'}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    // Website w-avatar grammar: square-rounded (border-radius 16 at 48px,
    // measured from live CSS) — not a circle.
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
})
