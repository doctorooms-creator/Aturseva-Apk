/**
 * V3 HOME · FIND DOCTORS (Home V3.1 · P4): "Find Doctors Near You" — the
 * chip filter row + the first three live doctor rows. Each row carries
 * the next-slot mini card on the right: a fresh slot for today when one
 * is open, the fee + "View Slots" fallback when today is closed, and a
 * shimmer block while the slot lookups land (the screen owns the fetch;
 * this band is presentation).
 *
 * The chip selection is LIFTED to the screen (selected / onSelect) — the
 * screen's slot effect must follow the FIRST THREE FILTERED doctors, so
 * the filter state has to live beside it. 'More' is a navigation action
 * (→ /search), never a filter.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { SearchX, Star } from 'lucide-react-native'
import { space } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { v3 } from '@/components/home3d/v3-type'
import { Section } from '@/components/home3d/section'
import { Avatar } from '@/components/avatar'
import { SkeletonBlock } from '@/components/skeleton'
import type { DoctorCard } from '@/lib/api'

/** Today's next slot for a doctor (screen-fetched, doctorId-keyed). */
export interface NextSlot {
  day: string
  time: string
}

/** Chip filter predicate — shared with the screen's slot effect so the
 * first-3 slice and the rendered rows can never drift apart. */
export function matchesChip(d: { specialization: string }, chip: string): boolean {
  if (chip === 'All') return true
  return d.specialization.toLowerCase().includes(chip.toLowerCase())
}

const CHIPS = ['All', 'General Physician', 'Cardiology', 'Orthopedic', 'More'] as const

interface FindDoctorsProps {
  doctors: DoctorCard[]
  loading: boolean
  slots: Record<string, NextSlot | null>
  selected: string
  onSelect: (chip: string) => void
}

export function FindDoctors({ doctors, loading, slots, selected, onSelect }: FindDoctorsProps) {
  const c = useColors()
  const router = useRouter()
  const filtered = doctors.filter((d) => matchesChip(d, selected))
  return (
    <Section title="Find Doctors Near You" onViewAll={() => void router.push('/search')}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {CHIPS.map((chip) => {
          if (chip === 'More') {
            return (
              <Pressable
                key={chip}
                onPress={() => void router.push('/search')}
                hitSlop={CHIP_HIT}
                accessibilityRole="button"
                accessibilityLabel="More doctor filters"
                style={({ pressed }) => [styles.chip, { backgroundColor: c.chipIdle }, pressed && styles.chipPressed]}
              >
                <Text style={[v3.chipFilter, { color: c.ink }]}>More</Text>
              </Pressable>
            )
          }
          const active = selected === chip
          return (
            <Pressable
              key={chip}
              onPress={() => onSelect(chip)}
              hitSlop={CHIP_HIT}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${chip}`}
              style={({ pressed }) => [
                styles.chip,
                active ? { backgroundColor: c.ink } : { backgroundColor: c.chipIdle },
                pressed && styles.chipPressed,
              ]}
            >
              <Text style={[v3.chipFilter, active ? { color: '#FFFFFF' } : { color: c.ink }]}>{chip}</Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {loading ? (
        [0, 1, 2].map((i) => <DoctorRowSkeleton key={`doc-sk-${i}`} />)
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <SearchX size={20} color={c.mute2} strokeWidth={2} />
          <Text style={[styles.emptyText, { color: c.mute2 }]}>No {selected} doctors in the live list right now.</Text>
          <Pressable
            onPress={() => void router.push('/search')}
            hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
            accessibilityRole="button"
            accessibilityLabel="Search all doctors"
            style={({ pressed }) => [styles.emptyPill, { backgroundColor: c.chipIdle }, pressed && styles.pressed]}
          >
            <Text style={[v3.toolTitle, { color: c.ink }]}>Search all doctors</Text>
          </Pressable>
        </View>
      ) : (
        filtered.slice(0, 3).map((d) => {
          const slot = slots[d.id]
          return (
            <Pressable
              key={d.id}
              onPress={() => void router.push({ pathname: '/doctor/[id]', params: { id: d.id } })}
              accessibilityRole="button"
              accessibilityLabel={`${d.name}, ${d.specialization}`}
              style={({ pressed }) => [styles.row, { backgroundColor: c.cardSoft }, pressed && styles.pressed]}
            >
              <Avatar name={d.name} size={56} source={d.photo} representative={d.photoRepresentative} />
              <View style={styles.rowMain}>
                <Text style={[v3.docName, { color: c.ink }]} numberOfLines={1}>
                  {d.name}
                </Text>
                <Text style={[v3.docSub, { color: c.mute2 }]} numberOfLines={1}>
                  {`${d.specialization} · ${d.experience} yrs exp`}
                </Text>
                {d.rating > 0 ? (
                  <View style={styles.rating}>
                    <Star size={9} color={c.starYellow} fill={c.starYellow} strokeWidth={2} />
                    <Text style={[v3.docRating, { color: c.mute2 }]}>
                      {`${Number(d.rating).toFixed(1)} (${d.ratingCount})`}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={[styles.slotCard, { backgroundColor: c.canvas }]}>
                {slot ? (
                  <>
                    <Text style={[v3.nextLabel, { color: c.mute2 }]}>Next Slot</Text>
                    <Text style={[v3.nextDay, { color: c.ink }]}>{slot.day}</Text>
                    <Text style={[v3.nextTime, { color: c.ink }]}>{slot.time}</Text>
                  </>
                ) : slot === null ? (
                  <>
                    <Text style={[v3.labPrice, { color: c.ink }]}>{`₹${d.fees}`}</Text>
                    <Text style={[v3.metricLabel, { color: c.body }]}>View Slots</Text>
                  </>
                ) : (
                  <SkeletonBlock width={40} height={28} radiusValue={8} />
                )}
              </View>
            </Pressable>
          )
        })
      )}
    </Section>
  )
}

function DoctorRowSkeleton() {
  const c = useColors()
  return (
    <View style={[styles.row, { backgroundColor: c.cardSoft }]}>
      <SkeletonBlock width={56} height={56} radiusValue={28} />
      <View style={styles.rowMain}>
        <SkeletonBlock width="60%" height={10} />
        <SkeletonBlock width="40%" height={8} />
      </View>
    </View>
  )
}

/** 36px chips pad to the 44 touch floor via hitSlop (doc 04 law). */
const CHIP_HIT = { top: 4, bottom: 4, left: 0, right: 0 }

const styles = StyleSheet.create({
  chipRow: {
    gap: 8,
    paddingRight: space.s24,
  },
  chip: {
    height: 36,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipPressed: {
    opacity: 0.9,
  },
  row: {
    borderRadius: 24,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowMain: {
    flex: 1,
    gap: 2,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  slotCard: {
    width: 88,
    borderRadius: 18,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 1,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyText: {
    fontFamily: 'Geist_400Regular',
    fontSize: 9.5,
    fontWeight: '400',
    lineHeight: 13,
    textAlign: 'center',
  },
  emptyPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
