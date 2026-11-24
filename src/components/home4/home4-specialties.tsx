/**
 * V4 HOME · ZONE 7 — SPECIALTIES (doc 21): six small white cards (60×55
 * r14) with the design's ink line icons and 8.4 Medium labels INSIDE the
 * card bottom — the design's fixed six (Cardiology · Pulmonology ·
 * Neurology · Gastro · Gynecology · More), each a doorway into
 * /search?q=; More is the escape hatch. Flex layout: 6 fixed-width cards
 * with 6.2 gaps land on the design's 21/14 margins exactly.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useV4, v4t, v4c, v4Shadow } from '@/components/home4/v4'
import { FigIcon, type FigIconName } from '@/components/home4/figma'

interface SpecCard {
  label: string
  icon: FigIconName
  /** Search q param (label by default). */
  q?: string
}

const CARDS: SpecCard[] = [
  { label: 'Cardiology', icon: 'cardiology' },
  { label: 'Pulmonology', icon: 'pulmonology' },
  { label: 'Neurology', icon: 'neurology' },
  { label: 'Gastro', icon: 'gastro', q: 'Gastroenterology' },
  { label: 'Gynecology', icon: 'gynecology' },
  { label: 'More', icon: 'more', q: '' },
]

export function Home4Specialties() {
  const s = useV4()
  const router = useRouter()
  return (
    <View style={{ marginTop: 14 * s }}>
      <View style={[styles.row, { marginHorizontal: 19 * s }]}>
        <Text
          style={[v4t('specTitle', s), { color: v4c.ink, flexShrink: 1, paddingRight: 8 * s }]}
          numberOfLines={2}
          maxFontSizeMultiplier={1.3}
        >
          Explore by Specialty
        </Text>
        <Pressable
          onPress={() => void router.push('/search')}
          accessibilityRole="button"
          accessibilityLabel="View all specialties"
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 4 }}
          style={({ pressed }) => [styles.viewAll, { gap: 3 * s }, pressed && styles.pressed]}
        >
          <Text style={[v4t('specViewAll', s), { color: v4c.gray3 }]} maxFontSizeMultiplier={1.25}>
            View all
          </Text>
          <FigIcon name="view-arrow" w={8.5} h={6.8} s={s} />
        </Pressable>
      </View>

      {/* Cards row — the design's own margins (21 left / 14 right),
          6 fixed 60-wide cards with 6.2 gaps: 21+360+31+14 = 426 exact. */}
      <View style={{ flexDirection: 'row', marginTop: 4.5 * s, paddingLeft: 21 * s, paddingRight: 14 * s, gap: 6.2 * s }}>
        {CARDS.map((card) => (
          <Pressable
            key={card.label}
            onPress={() => void router.push({ pathname: '/search', params: card.q === '' ? {} : { q: card.q ?? card.label } })}
            accessibilityRole="button"
            accessibilityLabel={card.q === '' ? 'Browse all specialties' : `Search ${card.label}`}
            style={({ pressed }) => [
              styles.card,
              {
                width: 60 * s,
                height: 55 * s,
                borderRadius: 14 * s,
                borderWidth: Math.max(0.5, 0.6 * s),
              },
              v4Shadow,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.iconWell}>
              <FigIcon name={card.icon} s={s} />
            </View>
            <Text
              style={[v4t('specLabel', s), { color: v4c.ink, marginBottom: 6.5 * s }]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.1}
            >
              {card.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 8,
  },
  card: {
    alignItems: 'center',
    backgroundColor: v4c.white,
    borderColor: v4c.strokeCard,
  },
  /** The icon's vertical center is the space above the label. */
  iconWell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
})
