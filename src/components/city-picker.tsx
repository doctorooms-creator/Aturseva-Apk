/**
 * City picker sheet (S2 city ask · Profile change): top-20 cities list,
 * 44px rows, "choose later" honest exit. NO location-permission prompt
 * (P2 near-me is a separate decision — doc 06 S2 law). Pure English
 * copy (owner directive).
 *
 * APK-B13 (VLM audit + measurement round):
 * - AUTO-SCROLL-TO-CURRENT on open: the list is 880px in a 320px window;
 *   a patient whose current city sits below the fold (Kochi, Guwahati…)
 *   used to reopen the sheet with ZERO confirmation of their choice
 *   (measured: scrollTop 0, check-marked row 560px deep). The sheet now
 *   scrolls the current row into view the moment it opens.
 * - Caption honesty: "Doctor lists and suggestions adapt to your city"
 *   over-promised (the home rail is global by design; city gates SEARCH
 *   and HOSPITALS default filters — measured on prod). The caption now
 *   states exactly what adapts.
 */

import { useEffect, useRef } from 'react'
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import type { ScrollViewInstance } from 'react-native'
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

/** List window is maxHeight 320 at 44px rows → first ~7 rows visible. */
const LIST_WINDOW = 320
const ROW_H = 44

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
  const listRef = useRef<ScrollViewInstance | null>(null)

  // B13: when the sheet opens with a current city below the fold,
  // scroll it into view (current lands 3rd-from-top where possible;
  // deep selections clamp to the list end — RN clamps for us).
  useEffect(() => {
    if (!visible) return
    const idx = current ? (TOP_CITIES as readonly string[]).indexOf(current) : -1
    if (idx < 0) return
    const firstHidden = Math.floor(LIST_WINDOW / ROW_H) - 1 // rows 0-6 visible
    if (idx > firstHidden) {
      listRef.current?.scrollTo({ y: Math.max(0, (idx - 2) * ROW_H), animated: false })
    }
  }, [visible, current])

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="City picker">
      <GrabHandle />
      <Text style={[styles.title, { color: c.ink }]}>Your city</Text>
      <Text style={[styles.caption, { color: c.body }]}>Search and hospitals start with your city filter.</Text>
      <ScrollView ref={listRef} style={styles.list} showsVerticalScrollIndicator={false}>
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
      <Pressable style={({ pressed }) => [styles.laterRow, pressed && { opacity: 0.7 }]} onPress={() => onPick(null)} accessibilityRole="button" accessibilityLabel="Choose city later">
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
    maxHeight: LIST_WINDOW,
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
