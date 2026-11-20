/**
 * Doctor rail card (S3 rail): avatar initials · name (body-strong) · spec
 * (caption) · ₹fee (tabular bold) · city. Fees and counts are NEVER
 * fabricated — only what the API returned (doc 08 §5 forbids client-side
 * invention).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MapPin } from 'lucide-react-native'
import { elevation, radius, space, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { Avatar } from '@/components/avatar'
import { RAIL_CARD_WIDTH } from '@/components/skeleton'
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
        <Avatar name={doctor.name} size={56} />
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
        <View style={styles.feeCol}>
          <Text style={[styles.fee, { color: c.ink }]} numberOfLines={1}>
            {formatFee(doctor.fees)}
          </Text>
          <Text style={[styles.feeCaption, { color: c.mute }]}>visit</Text>
        </View>
      </View>
      {doctor.rating > 0 && doctor.ratingCount > 0 ? (
        <View style={styles.ratingRow}>
          <Text style={[styles.rating, { color: c.body }]}>
            ★ {doctor.rating.toFixed(1)} · {doctor.ratingCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    width: RAIL_CARD_WIDTH,
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
  feeCol: {
    alignItems: 'flex-end',
  },
  fee: {
    ...typo.bodyStrong,
    fontVariant: ['tabular-nums'],
    fontSize: 15,
  },
  feeCaption: {
    ...typo.caption,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
  },
  rating: {
    ...typo.caption,
    fontVariant: ['tabular-nums'],
  },
})
