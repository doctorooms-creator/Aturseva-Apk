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
import { radius, space, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
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
  const c = useColors()
  const hasRating = doctor.rating > 0 && doctor.ratingCount > 0
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${doctor.name}, ${doctor.specialization}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.canvas, borderColor: c.hairline },
        pressed && styles.pressed,
      ]}
    >
      <Avatar name={doctor.name} size={56} />
      <View style={styles.col}>
        <Text style={[styles.name, { color: c.ink }]} numberOfLines={1}>
          {doctor.name}
        </Text>
        <Text style={[styles.spec, { color: c.body }]} numberOfLines={1}>
          {doctor.specialization || 'Doctor'}
        </Text>
        <Text style={[styles.city, { color: c.mute }]} numberOfLines={1}>
          {[doctor.city, doctor.state].filter(Boolean).join(', ')}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.fee, { color: c.ink }]}>₹{doctor.fees.toLocaleString('en-IN')}</Text>
          <Text style={[styles.feeCaption, { color: c.mute }]}>visit</Text>
          {hasRating ? (
            <View style={styles.ratingChip}>
              <Star size={11} color={c.ink} strokeWidth={2.4} fill={c.ink} />
              <Text style={[styles.ratingText, { color: c.body }]}>
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
  const c = useColors()
  return (
    <View style={[styles.card, styles.skeletonCard, { backgroundColor: c.canvas, borderColor: c.hairline }]}>
      <View style={[styles.skeletonAvatar, { backgroundColor: c.canvasSoft }]} />
      <View style={styles.skeletonCol}>
        <View style={[styles.skeletonLine, { backgroundColor: c.canvasSoft }]} />
        <View style={[styles.skeletonLine, { width: '55%', backgroundColor: c.canvasSoft }]} />
        <View style={[styles.skeletonLine, { width: '40%', backgroundColor: c.canvasSoft }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
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
  },
  spec: {
    ...typo.caption,
  },
  city: {
    ...typo.caption,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.s8,
    marginTop: 4,
  },
  fee: {
    ...typo.bodyStrong,
    fontVariant: ['tabular-nums'],
    // B12: the decision number reads strongest on the card (Uber-upfront:
    // fee visible BEFORE tap; hierarchy-by-scale) — 15→18px over the name.
    fontSize: 18,
    lineHeight: 24,
  },
  feeCaption: {
    ...typo.caption,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    ...typo.caption,
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
  },
})
