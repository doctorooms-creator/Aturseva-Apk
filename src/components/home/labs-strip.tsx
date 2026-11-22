/**
 * Z7 · LABS STRIP (doc 17 PART 4, D3 ruling): three REAL top tests with
 * REAL network-minimum prices extracted from live aturseva.com/labs on
 * 2026-11-22 — the date is shown in the caption (stale data stays honest).
 * Booking = LINKING HANDOFF to the website (the labs-booking ruling:
 * app = entry + handoff, website = booking; never an in-app lab cart).
 *
 * Copy laws: "from ₹X" = network minimum (the website's own wording law,
 * mirrored) · "Same day" = the labs' own TAT (the D3 table) · "on
 * aturseva.com" = REQUIRED handoff disclosure (leaving-the-app honesty —
 * the domain stays visible by law, not by oversight) · every number
 * measured, zero fabrication (doc 08 §5). Reversal trigger (D3): owner
 * grants web GO → strip flips to a live read-only catalog API.
 *
 * APK-H3.x (VLM fix loop): the strip renders as a horizontal RAIL (the
 * home's own rail grammar — doctors/hospitals rails) instead of 3-across
 * cramped cards: full test names never truncate at 390px, the peeking
 * next card doubles as the scroll affordance, and "Same day" TAT replaces
 * the wrapping "Same day result" (the D3 table's own wording).
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import * as Linking from 'expo-linking'
import { ArrowUpRight, Clock3, Droplet, FlaskConical, TestTubes } from 'lucide-react-native'
import { elevation, radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'

const LABS_WEB_URL = 'https://aturseva.com/labs'
/** Data extraction date — displayed in the caption (honesty law). */
const RATES_AS_ON = '22 Nov'

/** D3's measured table (2026-11-22, live aturseva.com/labs). */
const TESTS = [
  { icon: FlaskConical, name: 'CBC — Complete Blood Count', price: 170, tat: 'Same day' },
  { icon: Droplet, name: 'Blood Sugar (Fasting)', price: 60, tat: 'Same day' },
  { icon: TestTubes, name: 'Urine Routine Examination', price: 100, tat: 'Same day' },
] as const

export function LabsStrip() {
  const c = useColors()
  const openLabs = () => {
    void Linking.openURL(LABS_WEB_URL).catch(() => {})
  }
  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.ink }]} numberOfLines={1}>
          Lab tests at home
        </Text>
        <Pressable
          onPress={openLabs}
          accessibilityRole="button"
          accessibilityLabel="Book lab tests on aturseva.com (opens the website)"
          style={({ pressed }) => [styles.handoff, pressed && styles.pressed]}
        >
          <Text style={[styles.handoffText, { color: c.tealText }]} numberOfLines={1}>
            Book on aturseva.com
          </Text>
          <ArrowUpRight size={14} color={c.tealText} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railRow}
      >
        {TESTS.map((t) => (
          <View
            key={t.name}
            accessibilityLabel={`${t.name}, from ₹${t.price}, ${t.tat} result`}
            style={[styles.card, { backgroundColor: c.canvas, borderColor: c.hairline }, elevation.card]}
          >
            <View style={[styles.iconCircle, { backgroundColor: c.aquaSoft }]}>
              <t.icon size={18} color={c.tealText} strokeWidth={2} />
            </View>
            <Text style={[styles.name, { color: c.ink }]} numberOfLines={2}>
              {t.name}
            </Text>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: c.tealText }]} numberOfLines={1}>
                from ₹{t.price}
              </Text>
              <View style={styles.tatRow}>
                <Clock3 size={11} color={c.mute} strokeWidth={2} />
                <Text style={[styles.tat, { color: c.mute }]} numberOfLines={1}>
                  {t.tat}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Text style={[styles.dated, { color: c.mute }]}>Rates as on {RATES_AS_ON} · sample collection at home</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s8,
    marginHorizontal: space.s16,
    marginBottom: space.s12,
    minHeight: TOUCH,
  },
  title: {
    ...typo.title,
    flex: 1,
  },
  handoff: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: TOUCH,
    paddingHorizontal: space.s8,
  },
  handoffText: {
    ...typo.caption,
    fontWeight: '600',
  },
  railRow: {
    paddingHorizontal: space.s16,
    gap: space.s12,
  },
  card: {
    width: 190,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.s12,
    gap: space.s8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...typo.caption,
    fontWeight: '600',
    minHeight: 32,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s8,
  },
  price: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  tatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tat: {
    ...typo.caption,
  },
  dated: {
    ...typo.caption,
    marginTop: space.s8,
    marginHorizontal: space.s16,
  },
  pressed: {
    opacity: 0.8,
  },
})
