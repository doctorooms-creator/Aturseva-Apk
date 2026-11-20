/**
 * City picker sheet (S2 city ask · Profile change): top-20 cities list,
 * 44px rows, "choose later" honest exit. NO location-permission prompt
 * (P2 near-me is a separate decision — doc 06 S2 law). Pure English
 * copy (owner directive).
 */

import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import { Check, MapPin } from 'lucide-react-native'
import { space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
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
  const c = useColors()
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="City picker">
      <GrabHandle />
      <Text style={[styles.title, { color: c.ink }]}>Your city</Text>
      <Text style={[styles.caption, { color: c.body }]}>Doctor lists and suggestions adapt to your city.</Text>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {TOP_CITIES.map((city) => (
          <Pressable
            key={city}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            onPress={() => onPick(city)}
            accessibilityRole="button"
            accessibilityLabel={city}
          >
            <MapPin size={18} color={current === city ? c.tealLive : c.body} strokeWidth={2} />
            <Text style={[styles.rowText, current === city && { color: c.ink, fontWeight: '600' }]}>{city}</Text>
            {current === city ? <Check size={18} color={c.tealLive} strokeWidth={2.5} /> : null}
          </Pressable>
        ))}
      </ScrollView>
      <Pressable style={({ pressed }) => [styles.laterRow, pressed && { opacity: 0.7 }]} onPress={() => onPick(null)} accessibilityRole="button">
        <Text style={[styles.laterText, { color: c.mute }]}>I will choose later</Text>
      </Pressable>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  title: {
    ...typo.title,
    paddingHorizontal: space.s4,
  },
  caption: {
    ...typo.caption,
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
  },
})
