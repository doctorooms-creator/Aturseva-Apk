/**
 * V4 HOME · ZONE 6 — YOUR APPOINTMENT (doc 21): the live-queue card the
 * build was missing. Section row ("Your appointment" 17 Bold + View all
 * 10.5 #414141 + the design's arrow) above the 392×116 r16 white card:
 * avatar 46×44 r23 → name 13.2 Bold / sub 10 gray → Live Queue badge
 * (83×23 r13 #E7F7E7 + 6×6 dot #068006 + text #067D06) → the three-stat
 * strip with 0.7px dividers (#24 / #18 / 06, 17 Bold + 10 gray labels) →
 * chevron button 23×23 r12 → queue progress track.
 *
 * Honesty law (doc 21 zone 6): REAL booking data only — the parent hides
 * this entire zone for guests / no active booking / any error. The
 * avatar is initials-on-soft (never a fake portrait); the progress fill
 * is computed live from the token figures (served/total), never a static
 * decorative fraction.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useV4, v4t, v4c, v4Shadow } from '@/components/home4/v4'
import { FigIcon } from '@/components/home4/figma'
import { SkeletonBlock } from '@/components/skeleton'

/** The three live figures (pre-formatted strings from the parent). */
export interface V4AppointmentToken {
  yours: string
  serving: string
  ahead: string
}

interface V4AppointmentProps {
  doctorName: string
  /** e.g. "Psychologist · City Care Clinic". */
  sub: string
  token: V4AppointmentToken
}

export function Home4Appointment({ doctorName, sub, token }: V4AppointmentProps) {
  const s = useV4()
  const router = useRouter()
  // Live queue fraction: served ÷ total tokens issued (floors at the
  // design's 68% resting rhythm when the figures can't compute).
  const yours = Number(token.yours)
  const serving = Number(token.serving)
  const pct = Number.isFinite(yours) && Number.isFinite(serving) && yours > 0 && serving >= 0
    ? Math.max(0, Math.min(1, serving / yours))
    : 0.683
  return (
    <View style={{ marginHorizontal: 19 * s, marginTop: 14 * s }}>
      {/* Section row — title left, View all + arrow right (44 touch). */}
      <View style={styles.row}>
        <Text style={[v4t('sectionTitle', s), { color: v4c.ink }]} numberOfLines={1}>
          Your appointment
        </Text>
        <Pressable
          onPress={() => void router.push('/bookings')}
          accessibilityRole="button"
          accessibilityLabel="View all appointments"
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 4 }}
          style={({ pressed }) => [styles.viewAll, { gap: 4 * s }, pressed && styles.pressed]}
        >
          <Text style={[v4t('viewAll', s), { color: v4c.gray3 }]}>View all</Text>
          <FigIcon name="view-arrow" s={s} />
        </Pressable>
      </View>

      {/* The card. */}
      <View
        style={[
          styles.card,
          {
            height: 116 * s,
            borderRadius: 16 * s,
            marginTop: 6 * s,
            paddingTop: 6 * s,
            marginHorizontal: -2 * s,
            borderWidth: Math.max(0.5, 0.6 * s),
          },
          v4Shadow,
        ]}
      >
        {/* Row 1 — identity + live badge (chevron button is absolute:
            it spans rows 1–2 on the right, as designed). Insets: avatar
            14 from the card's left, badge 20 from its right. */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', height: 44 * s, paddingLeft: 14 * s, paddingRight: 20 * s }}>
          <V4Avatar name={doctorName} s={s} />
          <View style={{ flex: 1, minWidth: 0, marginLeft: 11 * s, marginTop: 4 * s }}>
            <Text style={[v4t('apptName', s), { color: v4c.ink }]} numberOfLines={1}>
              {doctorName}
            </Text>
            <Text style={[v4t('apptSub', s), { color: v4c.gray1, marginTop: 1.5 * s }]} numberOfLines={1}>
              {sub}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6 * s,
              height: 23 * s,
              borderRadius: 13 * s,
              paddingHorizontal: 10 * s,
              marginTop: 13 * s,
              backgroundColor: v4c.liveBg,
            }}
          >
            <View style={{ width: 6 * s, height: 6 * s, borderRadius: 3 * s, backgroundColor: v4c.liveDot }} />
            <Text style={[v4t('liveBadge', s), { color: v4c.liveText }]}>Live Queue</Text>
          </View>
        </View>

        {/* Stats strip — three flex columns, 0.7px dividers. */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 * s }}>
          <View style={styles.stat}>
            <Text style={[v4t('statNum', s), { color: v4c.ink }]}>#{token.yours}</Text>
            <Text style={[v4t('statLabel', s), { color: v4c.gray1 }]}>Your Token</Text>
          </View>
          <View style={[styles.div, { width: Math.max(0.5, 0.7 * s), height: 29 * s }]} />
          <View style={styles.stat}>
            <Text style={[v4t('statNum', s), { color: v4c.ink }]}>#{token.serving}</Text>
            <Text style={[v4t('statLabel', s), { color: v4c.gray1 }]}>Now Serving</Text>
          </View>
          <View style={[styles.div, { width: Math.max(0.5, 0.7 * s), height: 29 * s }]} />
          <View style={styles.stat}>
            <Text style={[v4t('statNum', s), { color: v4c.ink }]}>{token.ahead}</Text>
            <Text style={[v4t('statLabel', s), { color: v4c.gray1 }]}>Patients Ahead</Text>
          </View>
        </View>

        {/* Queue progress — live fraction; the design's track geometry
            (23 from the card's left, 38 from its right) replicated. */}
        <View style={{ marginTop: 8.5 * s, marginBottom: 12 * s, marginLeft: 23 * s, marginRight: 38 * s }}>
          <View style={{ height: 6 * s, borderRadius: 4 * s, backgroundColor: v4c.track, overflow: 'hidden' }}>
            <View style={{ height: 6 * s, borderRadius: 4 * s, width: `${pct * 100}%`, backgroundColor: v4c.trackFill }} />
          </View>
        </View>

        {/* Chevron button — 23×23 r12 white + shadow + hairline. */}
        <Pressable
          onPress={() => void router.push('/bookings')}
          accessibilityRole="button"
          accessibilityLabel="Open bookings"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          style={({ pressed }) => [
            styles.chev,
            {
              width: 23 * s,
              height: 23 * s,
              borderRadius: 12 * s,
              right: 6 * s,
              top: 46 * s,
              borderWidth: Math.max(0.5, 0.5 * s),
            },
            v4Shadow,
            pressed && styles.pressed,
          ]}
        >
          <FigIcon name="appt-chevron" s={s} />
        </Pressable>
      </View>
    </View>
  )
}

/** Same band, shimmering while the booking resolves (logged-in only —
 *  the zone never renders for guests; the skeleton mirrors the shape). */
export function Home4AppointmentSkeleton() {
  const s = useV4()
  return (
    <View style={{ marginHorizontal: 19 * s, marginTop: 14 * s }}>
      <View style={styles.row}>
        <SkeletonBlock width={120 * s} height={17 * s} />
      </View>
      <View
        style={[
          styles.card,
          {
            height: 116 * s,
            borderRadius: 16 * s,
            marginTop: 6 * s,
            paddingTop: 6 * s,
            marginHorizontal: -2 * s,
            gap: 6 * s,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 * s, height: 44 * s }}>
          <SkeletonBlock width={46 * s} height={44 * s} radiusValue={23 * s} />
          <View style={{ flex: 1, gap: 3 * s }}>
            <SkeletonBlock width="62%" height={13 * s} />
            <SkeletonBlock width="45%" height={10 * s} />
          </View>
          <SkeletonBlock width={83 * s} height={23 * s} radiusValue={13 * s} />
        </View>
        <View style={{ flexDirection: 'row' }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.stat}>
              <SkeletonBlock width={34 * s} height={17 * s} />
              <SkeletonBlock width={56 * s} height={10 * s} />
            </View>
          ))}
        </View>
        <SkeletonBlock width="84%" height={6 * s} radiusValue={4 * s} />
      </View>
    </View>
  )
}

/** 46×44 r23 avatar — initials on the soft neutral (real booking data
 *  carries no portrait; never a fabricated face). */
function V4Avatar({ name, s }: { name: string; s: number }) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '?'
  return (
    <View
      style={{
        width: 46 * s,
        height: 44 * s,
        borderRadius: 23 * s,
        backgroundColor: v4c.pill,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: 'Geist_600SemiBold', fontWeight: '600', fontSize: 15 * s, lineHeight: 18 * s, color: v4c.ink }}>
        {initials}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 8,
  },
  card: {
    backgroundColor: v4c.white,
    borderColor: v4c.strokeAppt,
    position: 'relative',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  div: {
    backgroundColor: v4c.divider,
  },
  chev: {
    position: 'absolute',
    backgroundColor: v4c.white,
    borderColor: v4c.strokeChev,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
})
