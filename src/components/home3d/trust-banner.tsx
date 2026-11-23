/**
 * V3 HOME · TRUST BANNER (Home V3.1 · P4): the closing lavender card —
 * shield-3d art + "Your health, in one place." → /records (the records
 * hub tab route). The sub-line lists the four record kinds verbatim
 * (numberOfLines 2 is the guard, not a truncation — the line fits).
 *
 * Zone geometry: the LAST band of the home — marginHorizontal 24,
 * marginBottom 0.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { space } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { v3 } from '@/components/home3d/v3-type'
import { Asset3D } from '@/components/home3d/asset'

export function TrustBanner() {
  const c = useColors()
  const router = useRouter()
  return (
    <Pressable
      onPress={() => void router.push('/records')}
      accessibilityRole="button"
      accessibilityLabel="Your health records"
      style={({ pressed }) => [styles.card, { backgroundColor: c.promoLavender }, pressed && styles.pressed]}
    >
      <Asset3D name="shield-3d" height={50} />
      <View style={styles.main}>
        <Text style={[v3.trustTitle, { color: c.ink }]}>Your health, in one place.</Text>
        <Text style={[v3.trustSub, { color: c.body }]} numberOfLines={2}>
          Appointments · Reports · Prescriptions · History
        </Text>
      </View>
      <View style={[styles.chev, { backgroundColor: c.canvas }]}>
        <ChevronRight size={16} color={c.body} strokeWidth={2} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: space.s24,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
