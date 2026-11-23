/**
 * V3 HOME · HEADER (Home V3.1 · P3): the wordmark row + location line that
 * open the rebuilt home. Utility circles (notifications with the unread
 * dot, account) sit right on the 44px touch floor; the city line under
 * the wordmark is the location-first law carried over from H3 (doc 16 B2)
 * in its new quieter V3 form — bare text, not a chip.
 *
 * Zone geometry: owns the 24px screen margins; the vertical gap to the
 * hero band below comes from the composition (marginTop 6 there).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Bell, ChevronDown, MapPin, UserRound } from 'lucide-react-native'
import { space, TOUCH } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { v3 } from '@/components/home3d/v3-type'

interface HomeHeaderProps {
  city: string
  onCityPress: () => void
}

export function HomeHeader({ city, onCityPress }: HomeHeaderProps) {
  const c = useColors()
  const router = useRouter()
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={[v3.wordmark, { color: c.ink }]}>AturSeva</Text>
        <View style={styles.circles}>
          <Pressable
            onPress={() => void router.push('/notifications')}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={({ pressed }) => [styles.circle, { backgroundColor: c.chipIdle }, pressed && styles.pressed]}
          >
            <Bell size={20} color={c.ink} strokeWidth={2} />
            {/* Unread dot — the spec's red (#FF3B30), fixed across modes
                like any badge carried on art. */}
            <View style={styles.dot} />
          </Pressable>
          <Pressable
            onPress={() => void router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel="Account"
            style={({ pressed }) => [styles.circle, { backgroundColor: c.chipIdle }, pressed && styles.pressed]}
          >
            <UserRound size={20} color={c.ink} strokeWidth={2} />
          </Pressable>
        </View>
      </View>
      <Pressable
        onPress={onCityPress}
        accessibilityRole="button"
        accessibilityLabel={city ? `City ${city}, change city` : 'Select your city'}
        style={({ pressed }) => [styles.cityRow, pressed && styles.pressed]}
      >
        <MapPin size={13} color={c.body} strokeWidth={2} />
        <Text style={[v3.location, { color: c.ink }]} numberOfLines={1}>
          {city}
        </Text>
        <ChevronDown size={12} color={c.body} strokeWidth={2} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: space.s24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  /** 44px utility circles — the touch floor is the visual size here. */
  circle: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: TOUCH / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  /** City line — padded to the 44 touch floor (doc 04 law). */
  cityRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
    paddingVertical: (TOUCH - 16) / 2,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
