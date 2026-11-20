/**
 * Hospital cards (APK-B7 · hospitals browse): rail variant (Home) and
 * list variant (hospitals screen, S4 listing grammar). Names and counts
 * come from the API only — nothing fabricated (doc 08 §5). Hospital
 * images on prod are mostly empty → the Avatar initials fallback is the
 * honest hero (photo polish arrives with real assets).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ChevronRight, MapPin } from 'lucide-react-native'
import { elevation, radius, space, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { Avatar } from '@/components/avatar'
import { RAIL_CARD_WIDTH } from '@/components/skeleton'
import type { HospitalCard } from '@/lib/api'

function doctorWord(count: number): string {
  return `${count} ${count === 1 ? 'doctor' : 'doctors'}`
}

function departmentWord(count: number): string {
  return `${count} ${count === 1 ? 'department' : 'departments'}`
}

export function HospitalRailCard({
  hospital,
  onPress,
}: {
  hospital: HospitalCard
  onPress: () => void
}) {
  const c = useColors()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${hospital.name}, ${hospital.type}, ${hospital.city}`}
      style={({ pressed }) => [
        styles.railCard,
        { backgroundColor: c.canvas, borderColor: c.hairline },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.railTop}>
        <Avatar name={hospital.name} size={56} />
        <View style={styles.railCol}>
          <Text style={[styles.railName, { color: c.ink }]} numberOfLines={1}>
            {hospital.name}
          </Text>
          <Text style={[styles.railType, { color: c.body }]} numberOfLines={1}>
            {hospital.type}
          </Text>
          {hospital.city ? (
            <View style={styles.cityRow}>
              <MapPin size={11} color={c.mute} strokeWidth={2} />
              <Text style={[styles.cityText, { color: c.mute }]} numberOfLines={1}>
                {hospital.city}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <Text style={[styles.railCount, { color: c.body }]} numberOfLines={1}>
        {doctorWord(hospital.doctorCount)}
        {hospital.departmentCount > 0 ? ` · ${departmentWord(hospital.departmentCount)}` : ''}
      </Text>
    </Pressable>
  )
}

export function HospitalListCard({
  hospital,
  onOpen,
}: {
  hospital: HospitalCard
  onOpen: () => void
}) {
  const c = useColors()
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${hospital.name}, ${hospital.type}, ${hospital.city}`}
      style={({ pressed }) => [
        styles.listCard,
        { backgroundColor: c.canvas, borderColor: c.hairline },
        pressed && styles.pressed,
      ]}
    >
      <Avatar name={hospital.name} size={56} />
      <View style={styles.listCol}>
        <Text style={[styles.listName, { color: c.ink }]} numberOfLines={1}>
          {hospital.name}
        </Text>
        <Text style={[styles.listType, { color: c.body }]} numberOfLines={1}>
          {hospital.type}
        </Text>
        <Text style={[styles.listCity, { color: c.mute }]} numberOfLines={1}>
          {[hospital.city, hospital.state].filter(Boolean).join(', ')}
        </Text>
        <Text style={[styles.listCount, { color: c.body }]}>
          {doctorWord(hospital.doctorCount)}
          {hospital.departmentCount > 0 ? ` · ${departmentWord(hospital.departmentCount)}` : ''}
        </Text>
      </View>
      <ChevronRight size={20} color={c.mute} strokeWidth={2} />
    </Pressable>
  )
}

/** One list-card-shaped skeleton (mirrors the final layout). */
export function HospitalListCardSkeleton() {
  const c = useColors()
  return (
    <View style={[styles.listCard, { backgroundColor: c.canvas, borderColor: c.hairline }]}>
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
  railCard: {
    width: RAIL_CARD_WIDTH,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.s16,
    gap: space.s8,
    ...elevation.card,
  },
  railTop: {
    flexDirection: 'row',
    gap: space.s12,
    alignItems: 'flex-start',
  },
  railCol: {
    flex: 1,
    gap: 2,
  },
  railName: {
    ...typo.bodyStrong,
  },
  railType: {
    ...typo.caption,
  },
  railCount: {
    ...typo.caption,
    fontVariant: ['tabular-nums'],
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cityText: {
    ...typo.caption,
  },
  listCard: {
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
  listCol: {
    flex: 1,
    gap: 2,
  },
  listName: {
    ...typo.bodyStrong,
  },
  listType: {
    ...typo.caption,
  },
  listCity: {
    ...typo.caption,
  },
  listCount: {
    ...typo.caption,
    fontVariant: ['tabular-nums'],
    marginTop: 4,
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
