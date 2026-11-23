/**
 * V3 · HEALTH RECORDS HUB (tab 4) — Home V3.1 P2 foundations (B1).
 *
 * One calm doorway screen into the three records surfaces that already
 * exist as stack routes (reports · medical history · bills — APK-B6,
 * auth-gated at the destination, guest = doorway law). No new data:
 * the hub is navigation dressed in the V3 surface grammar (r24 cardSoft
 * cards, hairline rings, white icon wells).
 *
 * Shell law: the pill floats OVER content — the scroll end pads with
 * insets.bottom + NAV_PILL_FOOTPRINT (B9 scroll-limit law).
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { FileText, History, Receipt, type LucideIcon } from 'lucide-react-native'
import { radius, space, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { NAV_PILL_FOOTPRINT } from '@/components/nav-pill'

interface RecordsDoor {
  title: string
  sub: string
  icon: LucideIcon
  href: '/reports' | '/medical-history' | '/bills'
}

const DOORS: RecordsDoor[] = [
  { title: 'Reports', sub: 'Lab reports and prescriptions', icon: FileText, href: '/reports' },
  {
    title: 'Medical History',
    sub: 'Appointments, prescriptions, admissions',
    icon: History,
    href: '/medical-history',
  },
  { title: 'Bills & Payments', sub: 'OPD, IPD and payment receipts', icon: Receipt, href: '/bills' },
]

export default function RecordsScreen() {
  const c = useColors()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: c.canvas }]}
      contentContainerStyle={[
        styles.content,
        {
          // Safe-area top (24 floor keeps web from kissing the edge);
          // pill clearance at the bottom (B9 law).
          paddingTop: Math.max(insets.top, 24),
          paddingBottom: insets.bottom + NAV_PILL_FOOTPRINT,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: c.ink }]}>Health Records</Text>
      <Text style={[styles.subtitle, { color: c.body }]}>
        All your medical documents in one place.
      </Text>

      <View style={styles.cards}>
        {DOORS.map((door) => (
          <Pressable
            key={door.title}
            onPress={() => void router.push(door.href)}
            accessibilityRole="button"
            accessibilityLabel={door.title}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: c.cardSoft, borderColor: c.hairline },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.iconWell, { backgroundColor: c.canvas }]}>
              <door.icon size={22} color={c.ink} strokeWidth={2} />
            </View>
            <View style={styles.cardCol}>
              <Text style={[styles.cardTitle, { color: c.ink }]} numberOfLines={1}>
                {door.title}
              </Text>
              <Text style={[styles.cardSub, { color: c.body }]} numberOfLines={2}>
                {door.sub}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: space.s16,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700' as const,
  },
  subtitle: {
    ...typo.caption,
    marginTop: 2,
    marginBottom: space.s20,
  },
  cards: {
    gap: space.s12,
  },
  /** V3 surface: r24 cardSoft fill + hairline ring (16 inside). */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.s16,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  /** White 40px icon well — the card's anchor on the soft fill. */
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCol: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    ...typo.bodyStrong,
  },
  cardSub: {
    ...typo.caption,
  },
})
