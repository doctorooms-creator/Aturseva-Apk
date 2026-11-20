/**
 * S10 · BOOKINGS (tab 2) — APK-B1 honest guest state.
 * The phone-lookup sheet + booking list arrive with APK-B3 (the booking
 * flow itself). B1 ships the doorway: never a dead tab, never a fake list.
 */

import { StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { CalendarCheck2 } from 'lucide-react-native'
import { colors, space, type as typo } from '@/lib/tokens'
import { EmptyState } from '@/components/empty-state'

export default function BookingsScreen() {
  const router = useRouter()
  return (
    <View style={styles.screen}>
      <View style={styles.safeTop} />
      <Text style={styles.title}>Bookings</Text>
      <Text style={styles.caption}>Aapke appointment — upcoming aur past.</Text>
      <View style={styles.emptyWrap}>
        <EmptyState
          icon={CalendarCheck2}
          title="Abhi koi booking nahi"
          caption="Booking flow agle build (APK-B3) me live hoga — tab tak Home se doctors dekhein."
          actions={[{ label: 'Home pe doctor dhoondein', onPress: () => void router.push('/') }]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  safeTop: {
    height: 24,
  },
  title: {
    ...typo.title,
    color: colors.ink,
    marginHorizontal: space.s16,
  },
  caption: {
    ...typo.caption,
    color: colors.body,
    marginHorizontal: space.s16,
    marginTop: 2,
    marginBottom: space.s24,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: space.s32,
  },
})
