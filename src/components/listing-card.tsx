/**
 * S4 listing card (doc 06 S4): the full-width doctor card — avatar 56 ·
 * name · spec · city · ₹fee (tabular bold, visible BEFORE tap — Uber
 * upfront law) · rating chip (only when real ratings exist) · "Book"
 * pill. The whole card is tappable; Book goes to the same profile
 * (the booking flow itself is APK-B3 — the profile's sticky CTA is
 * the honest doorway).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Star } from 'lucide-react-native'
import { colors, radius, space, type as typo } from '@/lib/tokens'
import type { DoctorCard } from '@/lib/api'
import { Avatar } from '@/components/avatar'
import { Chip } from '@/components/press'

export function ListingCard({
  doctor,
  onOpen,
  onBook,
}: {
  doctor: DoctorCard
  onOpen: () => void
  onBook: () => void
}) {
  const hasRating = doctor.rating > 0 && doctor.ratingCount > 0
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${doctor.name}, ${doctor.specialization}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Avatar name={doctor.name} size={56} />
      <View style={styles.col}>
        <Text style={styles.name} numberOfLines={1}>
          {doctor.name}
        </Text>
        <Text style={styles.spec} numberOfLines={1}>
          {doctor.specialization || 'Doctor'}
        </Text>
        <Text style={styles.city} numberOfLines={1}>
          {[doctor.city, doctor.state].filter(Boolean).join(', ')}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.fee}>₹{doctor.fees.toLocaleString('en-IN')}</Text>
          <Text style={styles.feeCaption}>visit</Text>
          {hasRating ? (
            <View style={styles.ratingChip}>
              <Star size={11} color={colors.ink} strokeWidth={2.4} fill={colors.ink} />
              <Text style={styles.ratingText}>
                {doctor.rating.toFixed(1)} · {doctor.ratingCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <Chip label="Book" onPress={onBook} />
    </Pressable>
  )
}

/** One listing-card-shaped skeleton (mirrors the final layout). */
export function ListingCardSkeleton() {
  return (
    <View style={[styles.card, styles.skeletonCard]}>
      <View style={[styles.skeletonAvatar, { backgroundColor: colors.canvasSoft }]} />
      <View style={styles.skeletonCol}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '55%' }]} />
        <View style={[styles.skeletonLine, { width: '40%' }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    backgroundColor: colors.canvas,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    padding: space.s16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    marginHorizontal: space.s16,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.88,
  },
  col: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typo.bodyStrong,
    color: colors.ink,
  },
  spec: {
    ...typo.caption,
    color: colors.body,
  },
  city: {
    ...typo.caption,
    color: colors.mute,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.s8,
    marginTop: 4,
  },
  fee: {
    ...typo.bodyStrong,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
    fontSize: 16,
  },
  feeCaption: {
    ...typo.caption,
    color: colors.mute,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    ...typo.caption,
    color: colors.body,
    fontVariant: ['tabular-nums'],
  },
  skeletonCard: {
    opacity: 1,
  },
  skeletonAvatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
  },
  skeletonCol: {
    flex: 1,
    gap: space.s8,
  },
  skeletonLine: {
    height: 12,
    width: '75%',
    borderRadius: radius.pill,
    backgroundColor: colors.canvasSoft,
  },
})
