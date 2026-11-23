/**
 * V3 HOME · TRACK STRIP (Home V3.1 · P4): the guest / no-booking alternate
 * of the appointment band — one soft card inviting the lookup ("Have a
 * booking? Track your token."). Carries the same 24/44 band rhythm the
 * Section-wrapped appointment card would have contributed (the zone stays
 * visually stable whichever side of the branch renders).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { space } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { v3 } from '@/components/home3d/v3-type'

export function TrackStrip() {
  const c = useColors()
  const router = useRouter()
  return (
    <Pressable
      onPress={() => void router.push('/bookings')}
      accessibilityRole="button"
      accessibilityLabel="Track your booking token"
      style={({ pressed }) => [styles.card, { backgroundColor: c.cardSoft }, pressed && styles.pressed]}
    >
      <View style={styles.main}>
        <Text style={[v3.stripTitle, { color: c.ink }]}>Have a booking? Track your token.</Text>
        <Text style={[v3.stripSub, { color: c.mute2 }]} numberOfLines={1}>
          Look up with the booking mobile number
        </Text>
      </View>
      <View style={[styles.chev, { backgroundColor: c.canvas }]}>
        <ChevronRight size={16} color={c.body} strokeWidth={2} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  /** Same band footprint the Section-wrapped appointment variant leaves. */
  card: {
    marginHorizontal: space.s24,
    marginBottom: 44,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  main: {
    flex: 1,
    gap: 2,
  },
  chev: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
