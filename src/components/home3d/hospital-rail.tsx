/**
 * V3 HOME · HOSPITAL RAIL (Home V3.1 · P4): "Nearby Hospitals" — 230px
 * white cards: initials block on the idle-chip gray, then name / type ·
 * city / doctor+dept counts. Hide-if-empty is ABSOLUTE (B7 law): no
 * data and no pending fetch renders NOTHING, not even the header.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { space } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { v3 } from '@/components/home3d/v3-type'
import { Section } from '@/components/home3d/section'
import { SkeletonBlock } from '@/components/skeleton'
import type { HospitalCard } from '@/lib/api'

interface HospitalRailProps {
  hospitals: HospitalCard[]
  loading: boolean
}

export function HospitalRail({ hospitals, loading }: HospitalRailProps) {
  const c = useColors()
  const router = useRouter()
  if (!loading && hospitals.length === 0) return null
  return (
    <Section title="Nearby Hospitals" onViewAll={() => void router.push('/hospitals')}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {loading ? (
          [0, 1, 2].map((i) => <SkeletonBlock key={`hos-sk-${i}`} width={230} height={190} radiusValue={20} />)
        ) : (
          hospitals.map((h) => (
            <Pressable
              key={h.id}
              onPress={() => void router.push({ pathname: '/hospital/[id]', params: { id: h.id } })}
              accessibilityRole="button"
              accessibilityLabel={h.name}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: c.canvas, borderColor: c.hairline2 },
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.art, { backgroundColor: c.chipIdle }]}>
                <Text style={[styles.initials, { color: c.ink }]}>{initialsFor(h.name)}</Text>
              </View>
              <View style={styles.body}>
                <Text style={[v3.hosName, { color: c.ink }]} numberOfLines={1}>
                  {h.name}
                </Text>
                <Text style={[v3.hosSub, { color: c.mute2 }]} numberOfLines={1}>
                  {`${h.type} · ${h.city}`}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={[v3.hosSub, { color: c.mute2 }]} numberOfLines={1}>
                    {`${h.doctorCount} doctors · ${h.departmentCount} depts`}
                  </Text>
                  <View style={[styles.chev, { backgroundColor: c.cardSoft }]}>
                    <ChevronRight size={14} color={c.body} strokeWidth={2} />
                  </View>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </Section>
  )
}

/** First letters of the first two words, uppercased. */
function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => (w[0] ?? '').toUpperCase())
    .join('')
}

const styles = StyleSheet.create({
  rail: {
    gap: 10,
    paddingRight: space.s24,
  },
  card: {
    width: 230,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  art: {
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** 20/700 wordmark — no preset on the V3 ramp at this size. */
  initials: {
    fontFamily: 'Geist_700Bold',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  body: {
    padding: 12,
    gap: 4,
  },
  metaRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  chev: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
