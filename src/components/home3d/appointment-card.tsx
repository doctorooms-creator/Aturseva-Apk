/**
 * V3 HOME · APPOINTMENT CARD (Home V3.1 · P4): the live-queue band for a
 * patient with an upcoming booking — doctor identity, the Live Queue pill,
 * the three-figure metric strip (your token · now serving · ahead) and the
 * queue progress bar. The Section shell ("Your appointment" + View all →
 * /bookings) is part of the zone: the skeleton mirrors it so the band
 * never jumps when auth resolves.
 *
 * Derivations (screen-side): yours = tokenNumber · ahead = queuePosition
 * (zero-padded) · serving = tokenNumber − queuePosition, floored at 0.
 * The 72% fill is the V3 spec's static rhythm marker (the live fraction
 * would need polling the home doesn't do).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { useColors } from '@/lib/theme'
import { v3 } from '@/components/home3d/v3-type'
import { Section } from '@/components/home3d/section'
import { Avatar } from '@/components/avatar'
import { SkeletonBlock } from '@/components/skeleton'

/** The three live figures the metric strip renders (pre-formatted strings). */
export interface AppointmentToken {
  yours: string
  serving: string
  ahead: string
}

interface AppointmentCardProps {
  doctorName: string
  /** e.g. "Psychologist · City Care Clinic". */
  sub: string
  photo: string | null
  photoRepresentative: boolean
  token: AppointmentToken
}

export function AppointmentCard({ doctorName, sub, photo, photoRepresentative, token }: AppointmentCardProps) {
  const c = useColors()
  const router = useRouter()
  return (
    <Section title="Your appointment" onViewAll={() => void router.push('/bookings')}>
      <View style={[styles.card, { backgroundColor: c.cardSoft }]}>
        <View style={styles.head}>
          <Avatar name={doctorName} size={48} source={photo} representative={photoRepresentative} />
          <View style={styles.headMain}>
            <Text style={[v3.apptName, { color: c.ink }]} numberOfLines={1}>
              {doctorName}
            </Text>
            <Text style={[v3.apptSub, { color: c.mute2 }]} numberOfLines={1}>
              {sub}
            </Text>
            <View style={[styles.livePill, { backgroundColor: c.liveGreenSoft }]}>
              <View style={[styles.liveDot, { backgroundColor: c.liveGreen }]} />
              <Text style={[v3.liveQueue, { color: c.liveGreen }]}>Live Queue</Text>
            </View>
          </View>
          <Pressable
            onPress={() => void router.push('/bookings')}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Open bookings"
            style={({ pressed }) => [styles.chev, { backgroundColor: c.canvas }, pressed && styles.pressed]}
          >
            <ChevronRight size={16} color={c.body} strokeWidth={2} />
          </Pressable>
        </View>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={[v3.metricNum, { color: c.ink }]}>{token.yours}</Text>
            <Text style={[v3.metricLabel, { color: c.mute }]}>Your Token</Text>
          </View>
          <View style={[styles.metric, styles.metricDiv, { borderColor: c.hairline }]}>
            <Text style={[v3.metricNum, { color: c.ink }]}>{token.serving}</Text>
            <Text style={[v3.metricLabel, { color: c.mute }]}>Now Serving</Text>
          </View>
          <View style={[styles.metric, styles.metricDiv, { borderColor: c.hairline }]}>
            <Text style={[v3.metricNum, { color: c.ink }]}>{token.ahead}</Text>
            <Text style={[v3.metricLabel, { color: c.mute }]}>Patients Ahead</Text>
          </View>
        </View>
        <View style={[styles.track, { backgroundColor: c.hairline }]}>
          <View style={[styles.fill, { backgroundColor: c.ink }]} />
        </View>
      </View>
    </Section>
  )
}

/** Same band, shimmering — mirrors the card shape row for row. */
export function AppointmentSkeleton() {
  const c = useColors()
  return (
    <Section title="Your appointment">
      <View style={[styles.card, { backgroundColor: c.cardSoft }]}>
        <View style={styles.head}>
          <SkeletonBlock width={48} height={48} radiusValue={24} />
          <View style={styles.headMain}>
            <SkeletonBlock width="60%" height={10} />
            <SkeletonBlock width="40%" height={8} />
            <SkeletonBlock width={88} height={13} radiusValue={999} />
          </View>
          <View style={[styles.chev, { backgroundColor: c.canvas }]} />
        </View>
        <View style={styles.metrics}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.metric, i > 0 && styles.metricDiv, i > 0 && { borderColor: c.hairline }]}>
              <SkeletonBlock width={36} height={16} />
              <SkeletonBlock width={52} height={8} />
            </View>
          ))}
        </View>
        <SkeletonBlock width="72%" height={6} radiusValue={999} />
      </View>
    </Section>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headMain: {
    flex: 1,
    gap: 2,
  },
  livePill: {
    marginTop: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  /** 36px visual circle — hitSlop pads it past the 44 touch floor. */
  chev: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metrics: {
    flexDirection: 'row',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricDiv: {
    borderLeftWidth: 1,
  },
  track: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 999,
    width: '72%',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
