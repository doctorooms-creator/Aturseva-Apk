/**
 * Doctor rail card (S3 rail): avatar initials · name (body-strong) · spec
 * (caption) · ₹fee (tabular bold) · city. Fees and counts are NEVER
 * fabricated — only what the API returned (doc 08 §5 forbids client-side
 * invention).
 *
 * APK-B13 (VLM audit + measurement round): NO-TRUNCATION law enforced on
 * the home rail — measured ellipsized nodes ("Dr. QA ProdOnco",
 * "IVF & Fertility Specialist"…) because the 264px card gave the name/spec
 * column only ~112px beside the avatar + fee columns. Restructured: the
 * fee moves to a bottom row of its own, the name/spec/city column gets the
 * full width beside the avatar (≥200px at CARD_W 300), so names and the
 * longest real specialization render un-truncated. Card widened 264→300.
 * Fee keeps tabular bold 15 (rail is the teaser surface; the listing card
 * carries the 18px decision number — B12 law unchanged).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MapPin } from 'lucide-react-native'
import { elevation, radius, space, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { Avatar } from '@/components/avatar'
import { DOCTOR_RAIL_WIDTH } from '@/components/skeleton'
import type { DoctorCard } from '@/lib/api'

function formatFee(fees: number): string {
  return `₹${fees.toLocaleString('en-IN')}`
}

export function DoctorRailCard({ doctor, onPress }: { doctor: DoctorCard; onPress: () => void }) {
  const c = useColors()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${doctor.name}, ${doctor.specialization}, fee ${formatFee(doctor.fees)}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.canvas, borderColor: c.hairline },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.top}>
        <Avatar
          name={doctor.name}
          size={56}
          source={doctor.photo}
          representative={doctor.photoRepresentative}
        />
        <View style={styles.headCol}>
          <Text style={[styles.name, { color: c.ink }]} numberOfLines={1}>
            {doctor.name}
          </Text>
          <Text style={[styles.spec, { color: c.body }]} numberOfLines={1}>
            {doctor.specialization || 'Doctor'}
          </Text>
          {doctor.city ? (
            <View style={styles.cityRow}>
              <MapPin size={11} color={c.mute} strokeWidth={2} />
              <Text style={[styles.city, { color: c.mute }]} numberOfLines={1}>
                {doctor.city}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.feeRow}>
          <Text style={[styles.fee, { color: c.ink }]} numberOfLines={1}>
            {formatFee(doctor.fees)}
          </Text>
          <Text style={[styles.feeCaption, { color: c.mute }]}>visit</Text>
        </View>
        {doctor.rating > 0 && doctor.ratingCount > 0 ? (
          <Text style={[styles.rating, { color: c.body }]} numberOfLines={1}>
            ★ {doctor.rating.toFixed(1)} · {doctor.ratingCount}
          </Text>
        ) : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    width: DOCTOR_RAIL_WIDTH,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.s16,
    gap: space.s8,
    ...elevation.card,
  },
  top: {
    flexDirection: 'row',
    gap: space.s12,
    alignItems: 'flex-start',
  },
  headCol: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typo.bodyStrong,
    fontVariant: ['tabular-nums'],
  },
  spec: {
    ...typo.caption,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  city: {
    ...typo.caption,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s8,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.s4,
  },
  fee: {
    ...typo.bodyStrong,
    fontVariant: ['tabular-nums'],
    fontSize: 15,
  },
  feeCaption: {
    ...typo.caption,
  },
  rating: {
    ...typo.caption,
    fontVariant: ['tabular-nums'],
  },
})
