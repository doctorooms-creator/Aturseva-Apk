/**
 * V3 HOME · SPECIALTY RAIL (Home V3.1 · P4 — the CATEGORIES band,
 * user-requested): "Explore by Specialty" — the live list's own top-5
 * specializations as 86px icon cards, each a doorway into /search?q=.
 * Items are DERIVED (screen-side) from the doctors payload by count, so
 * the rail always tells the truth about what is actually bookable; the
 * trailing More card is the escape hatch for the long tail.
 *
 * Icon map: specialty prefix → lucide icon. Verified against
 * lucide-react-native 0.545's export surface — Lungs is NOT exported
 * there, so Pulmon* maps to Wind (breath) per the fallback ruling.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  Baby,
  Bone,
  Brain,
  Eye,
  Hand,
  HeartPulse,
  LayoutGrid,
  Stethoscope,
  Wind,
  type LucideIcon,
} from 'lucide-react-native'
import { space } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { v3 } from '@/components/home3d/v3-type'
import { Section } from '@/components/home3d/section'
import { SkeletonBlock } from '@/components/skeleton'

/** Specialty string → icon (prefix match, case-insensitive). */
export function specialtyIcon(specialization: string): LucideIcon {
  const s = specialization.trim().toLowerCase()
  if (s.startsWith('cardio')) return HeartPulse
  if (s.startsWith('general')) return Stethoscope
  if (s.startsWith('pediatric')) return Baby
  if (s.startsWith('orthoped')) return Bone
  if (s.startsWith('ophthalm')) return Eye
  if (s.startsWith('dermat')) return Hand
  // lucide-react-native 0.545 does not export Lungs — Wind is the stand-in.
  if (s.startsWith('pulmon')) return Wind
  if (s.startsWith('neuro')) return Brain
  if (s.startsWith('gynec') || s.startsWith('obstetric')) return Baby
  return Stethoscope
}

export interface SpecialtyItem {
  label: string
  icon: LucideIcon
}

interface SpecialtyRailProps {
  items: SpecialtyItem[]
  loading: boolean
}

export function SpecialtyRail({ items, loading }: SpecialtyRailProps) {
  const c = useColors()
  const router = useRouter()
  return (
    <Section title="Explore by Specialty" onViewAll={() => void router.push('/search')}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {loading ? (
          [0, 1, 2, 3, 4].map((i) => (
            <View key={`spec-sk-${i}`} style={[styles.card, { backgroundColor: c.canvas, borderColor: c.hairline2 }]}>
              <SkeletonBlock width={44} height={44} radiusValue={22} />
              <SkeletonBlock width={56} height={10} />
            </View>
          ))
        ) : (
          <>
            {items.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => void router.push({ pathname: '/search', params: { q: item.label } })}
                accessibilityRole="button"
                accessibilityLabel={`Search ${item.label}`}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: c.canvas, borderColor: c.hairline2 },
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.iconCircle, { backgroundColor: c.cardSoft }]}>
                  <item.icon size={22} color={c.ink} strokeWidth={2} />
                </View>
                <Text style={[v3.specLabel, { color: c.ink }]} numberOfLines={2}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
            <MoreCard />
          </>
        )}
      </ScrollView>
    </Section>
  )
}

/** The long-tail escape hatch at the rail's end. */
export function MoreCard() {
  const c = useColors()
  const router = useRouter()
  return (
    <Pressable
      onPress={() => void router.push('/search')}
      accessibilityRole="button"
      accessibilityLabel="More specialties"
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.canvas, borderColor: c.hairline2 },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: c.cardSoft }]}>
        <LayoutGrid size={22} color={c.ink} strokeWidth={2} />
      </View>
      <Text style={[v3.specLabel, { color: c.ink }]} numberOfLines={2}>
        More
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  rail: {
    gap: 10,
    paddingRight: space.s24,
  },
  card: {
    width: 86,
    height: 100,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
