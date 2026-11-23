/**
 * V3 HOME · LAB PILLS (Home V3.1 · P4): "Popular Lab Tests" — three REAL
 * tests with REAL network-minimum prices extracted from live
 * aturseva.com/labs on 2026-11-22 (do not change the prices — the dated
 * caption is the honesty contract). Booking is a LINKING HANDOFF to the
 * website (the D3 ruling: app = entry, website = lab cart).
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import * as Linking from 'expo-linking'
import { space } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { v3 } from '@/components/home3d/v3-type'
import { Section } from '@/components/home3d/section'
import { Asset3D } from '@/components/home3d/asset'

const LABS_WEB_URL = 'https://aturseva.com/labs'

/** D3's measured table (2026-11-22, live aturseva.com/labs) — real data. */
const TESTS = [
  { key: 'cbc', name: 'CBC', sub: 'Complete Blood Count', price: 170 },
  { key: 'sugar', name: 'Blood Sugar', sub: 'Fasting', price: 60 },
  { key: 'urine', name: 'Urine Routine', sub: 'Examination', price: 100 },
] as const

export function LabPills() {
  const c = useColors()
  const openLabs = () => {
    void Linking.openURL(LABS_WEB_URL).catch(() => {})
  }
  return (
    <Section title="Popular Lab Tests" onViewAll={openLabs}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {TESTS.map((t) => (
          <Pressable
            key={t.key}
            onPress={openLabs}
            accessibilityRole="button"
            accessibilityLabel={`${t.name} ${t.sub}, ₹${t.price} — book on aturseva.com`}
            style={({ pressed }) => [styles.card, { backgroundColor: c.cardSoft }, pressed && styles.pressed]}
          >
            <View style={[styles.vial, { backgroundColor: c.canvas }]}>
              <Asset3D name="tile-labtubes" height={46} />
            </View>
            <View style={styles.meta}>
              <Text style={[v3.labName, { color: c.ink }]} numberOfLines={1}>
                {t.name}
              </Text>
              <Text style={[v3.labSub, { color: c.mute2 }]} numberOfLines={1}>
                {t.sub}
              </Text>
              <Text style={[v3.labPrice, { color: c.ink }]}>{`₹${t.price}`}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={[v3.caption, { color: c.mute2 }, styles.dated]}>
        Rates as on 22 Nov · booked on aturseva.com
      </Text>
    </Section>
  )
}

const styles = StyleSheet.create({
  rail: {
    gap: 10,
    paddingRight: space.s24,
  },
  card: {
    width: 158,
    height: 96,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vial: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    gap: 1,
  },
  dated: {
    marginTop: 8,
    marginLeft: 2,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
