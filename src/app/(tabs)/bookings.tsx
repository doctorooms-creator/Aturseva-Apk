/**
 * S10 · BOOKINGS (tab 2) — honest guest state.
 * The phone-lookup sheet + booking list arrive with the booking batch
 * (APK-B3). Until then this ships the doorway: never a dead tab, never
 * a fake list. Pure English copy (owner directive).
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
      <Text style={styles.caption}>Your appointments — upcoming and past.</Text>
      <View style={styles.emptyWrap}>
        <EmptyState
          icon={CalendarCheck2}
          title="No bookings yet"
          caption="The booking flow goes live in the next update (APK-B3) — until then, browse doctors from Home."
          actions={[{ label: 'Find a doctor on Home', onPress: () => void router.push('/') }]}
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
