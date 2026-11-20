/**
 * City picker sheet (S2 city ask · Profile change): top-20 cities list,
 * 44px rows, "baad me" honest exit. NO location-permission prompt (P2
 * near-me is a separate decision — doc 06 S2 law).
 */

import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import { Check, MapPin } from 'lucide-react-native'
import { colors, space, TOUCH, type as typo } from '@/lib/tokens'
import { BottomSheet, GrabHandle } from '@/components/sheets'

export const TOP_CITIES = [
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Hyderabad',
  'Ahmedabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Jaipur',
  'Lucknow',
  'Gandhinagar',
  'Chandigarh',
  'Indore',
  'Bhopal',
  'Nagpur',
  'Surat',
  'Patna',
  'Kochi',
  'Coimbatore',
  'Guwahati',
] as const

export function CityPickerSheet({
  visible,
  current,
  onClose,
  onPick,
}: {
  visible: boolean
  current: string | null
  onClose: () => void
  onPick: (city: string | null) => void
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Shehar chunkne ki sheet">
      <GrabHandle />
      <Text style={styles.title}>Aapka shehar</Text>
      <Text style={styles.caption}>Doctor list aur suggestions isi hisaab se honge.</Text>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {TOP_CITIES.map((city) => (
          <Pressable
            key={city}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            onPress={() => onPick(city)}
            accessibilityRole="button"
            accessibilityLabel={city}
          >
            <MapPin size={18} color={current === city ? colors.tealLive : colors.body} strokeWidth={2} />
            <Text style={[styles.rowText, current === city && { color: colors.ink, fontWeight: '600' }]}>{city}</Text>
            {current === city ? <Check size={18} color={colors.tealLive} strokeWidth={2.5} /> : null}
          </Pressable>
        ))}
      </ScrollView>
      <Pressable style={({ pressed }) => [styles.laterRow, pressed && { opacity: 0.7 }]} onPress={() => onPick(null)} accessibilityRole="button">
        <Text style={styles.laterText}>Baad me choose karunga</Text>
      </Pressable>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  title: {
    ...typo.title,
    color: colors.ink,
    paddingHorizontal: space.s4,
  },
  caption: {
    ...typo.caption,
    color: colors.body,
    marginTop: 2,
    paddingHorizontal: space.s4,
    marginBottom: space.s12,
  },
  list: {
    maxHeight: 320,
  },
  row: {
    minHeight: TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    paddingHorizontal: space.s4,
  },
  rowText: {
    ...typo.body,
    color: colors.body,
    flex: 1,
  },
  laterRow: {
    minHeight: TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.s8,
  },
  laterText: {
    ...typo.caption,
    color: colors.mute,
  },
})
