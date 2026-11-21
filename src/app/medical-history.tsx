/**
 * S-HISTORY · MEDICAL HISTORY (doc 06 records story) — APK-B8.
 *
 * Stack route (full-screen, back to Profile). One timeline of the
 * patient's medical events, exactly as the monolith normalizes them
 * (GET /api/patient/medical-history, Bearer): appointments,
 * prescriptions, lab reports and hospital stays — date-desc, server
 * capped at 100. READ-ONLY (a viewer; nothing here writes).
 *
 * Type icon + title + description bits + status chip per event; summary
 * line above the list ONLY when there is data ("N events" — the
 * server's own counts, never a guess). Empty = one honest doorway
 * ("your history builds here as you visit"). Guest sees a sign-in
 * doorway (never a wall).
 */

import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  ArrowLeft,
  BedDouble,
  CalendarCheck,
  FlaskConical,
  History,
  Pill,
  Stethoscope,
} from 'lucide-react-native'
import { radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import {
  getMedicalHistory,
  type MedicalEventRow,
  type MedicalEventType,
  type MedicalHistory,
} from '@/lib/api'
import { getStoredUser } from '@/lib/auth'
import { EmptyState } from '@/components/empty-state'
import { AuthSheet } from '@/components/auth-sheet'

/** Event-type presentation (icon + zone label). */
const EVENT_META: Record<MedicalEventType, { icon: typeof Stethoscope; zone: string }> = {
  appointment: { icon: Stethoscope, zone: 'Appointment' },
  prescription: { icon: Pill, zone: 'Prescription' },
  lab_report: { icon: FlaskConical, zone: 'Lab report' },
  ipd_admission: { icon: BedDouble, zone: 'Hospital stay' },
}

/** Status tone ladder — patient language, calm defaults. */
type Tone = 'live' | 'done' | 'warn' | 'mute'
const STATUS: Record<string, { label: string; tone: Tone }> = {
  // Booking statuses (app + web share this ladder)
  Pending: { label: 'Pending', tone: 'warn' },
  Confirmed: { label: 'Confirmed', tone: 'live' },
  Completed: { label: 'Completed', tone: 'done' },
  Cancelled: { label: 'Cancelled', tone: 'mute' },
  NoShow: { label: 'Missed', tone: 'mute' },
  // Prescription
  Draft: { label: 'Draft', tone: 'warn' },
  Active: { label: 'Active', tone: 'live' },
  Fulfilled: { label: 'Fulfilled', tone: 'done' },
  PartiallyFulfilled: { label: 'Partially filled', tone: 'warn' },
  // Lab reports
  Ordered: { label: 'Ordered', tone: 'warn' },
  Processing: { label: 'Processing', tone: 'live' },
  // Admissions
  Admitted: { label: 'Admitted', tone: 'live' },
  Discharged: { label: 'Discharged', tone: 'done' },
}

function statusChip(s: string) {
  return STATUS[s] ?? { label: s, tone: 'mute' as const }
}

function dateLabel(iso: string): string {
  const dt = new Date(iso)
  if (isNaN(dt.getTime())) return iso
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MedicalHistoryScreen() {
  const c = useColors()
  const router = useRouter()

  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [data, setData] = useState<MedicalHistory | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [authSheetOpen, setAuthSheetOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      setData(await getMedicalHistory())
    } catch {
      setData(null)
      setError('Could not reach the server. Try again.')
    }
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await load()
    } finally {
      setRefreshing(false)
    }
  }, [load])

  useEffect(() => {
    void (async () => {
      await null
      const user = await getStoredUser()
      setSignedIn(Boolean(user))
      if (user) await load()
    })()
  }, [load])

  const toneColor = (tone: Tone) =>
    tone === 'live' ? c.tealLive : tone === 'done' ? c.success : tone === 'warn' ? c.warn : c.mute

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <ArrowLeft size={22} color={c.ink} strokeWidth={2} />
        </Pressable>
        <Text style={[styles.title, { color: c.ink }]}>Medical history</Text>
        <View style={styles.titleRight} />
      </View>

      {signedIn === null ? null : !signedIn ? (
        <EmptyState
          icon={History}
          title="Sign in to see your history"
          caption="Visits, prescriptions, lab reports and hospital stays — one timeline, tied to your account."
          actions={[{ label: 'Sign in', onPress: () => setAuthSheetOpen(true) }]}
        />
      ) : data === null && !error ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={c.mute} />
        </View>
      ) : error && !data ? (
        <EmptyState
          icon={History}
          title="Could not load your history"
          caption={error}
          actions={[{ label: 'Try again', onPress: () => void load() }]}
        />
      ) : !data || data.events.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Nothing here yet"
          caption="Your history builds itself as you visit — appointments, prescriptions, lab reports and hospital stays appear in one timeline. No events recorded for this account yet."
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.ink} />
          }
        >
          <Text style={[styles.summaryLine, { color: c.body }]}>
            {data.summary.total} event{data.summary.total === 1 ? '' : 's'} · newest first
          </Text>
          {data.events.map((e) => (
            <EventCard key={e.id} e={e} toneColor={toneColor} />
          ))}
          <View style={styles.footerPad} />
        </ScrollView>
      )}

      <AuthSheet
        visible={authSheetOpen}
        onClose={() => setAuthSheetOpen(false)}
        onSignedIn={() => {
          setAuthSheetOpen(false)
          setSignedIn(true)
          void load()
        }}
      />
    </View>
  )
}

function EventCard({ e, toneColor }: { e: MedicalEventRow; toneColor: (t: Tone) => string }) {
  const c = useColors()
  const meta = EVENT_META[e.type] ?? EVENT_META.appointment
  const Icon = meta.icon
  const chip = statusChip(e.status)
  const bits = e.description ? e.description.split(' · ').filter(Boolean) : []
  return (
    <View
      style={[styles.card, { backgroundColor: c.canvasSoft }]}
      accessibilityLabel={`${meta.zone}: ${e.title}, ${chip.label}, ${dateLabel(e.date)}`}
    >
      <View style={styles.cardHead}>
        <View style={[styles.iconWrap, { backgroundColor: c.canvas }]}>
          <Icon size={18} color={c.body} strokeWidth={2} />
        </View>
        <View style={styles.cardHeadCol}>
          <Text style={[styles.zoneLabel, { color: c.mute }]} numberOfLines={1}>
            {meta.zone}
          </Text>
          <Text style={[styles.cardTitle, { color: c.ink }]} numberOfLines={2}>
            {e.title}
          </Text>
        </View>
      </View>
      <Text style={[styles.dateLine, { color: c.body }]} numberOfLines={1}>
        {dateLabel(e.date)}
      </Text>
      {bits.length > 0 ? (
        <Text style={[styles.subLine, { color: c.body }]} numberOfLines={3}>
          {bits.join(' · ')}
        </Text>
      ) : null}
      <View style={[styles.statusChip, { backgroundColor: `${toneColor(chip.tone)}1A` }]}>
        <Text style={[styles.statusChipText, { color: toneColor(chip.tone) }]} numberOfLines={1}>
          {chip.label}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.s12,
    paddingTop: space.s16,
    paddingBottom: space.s8,
    gap: space.s8,
  },
  backBtn: {
    width: TOUCH,
    height: TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typo.title,
    flex: 1,
  },
  titleRight: {
    width: TOUCH,
  },
  loadingRow: {
    padding: space.s24,
  },
  list: {
    paddingHorizontal: space.s16,
    gap: space.s12,
  },
  summaryLine: {
    ...typo.caption,
    paddingHorizontal: space.s4,
  },
  card: {
    borderRadius: radius.card,
    padding: space.s16,
    gap: space.s8,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.s12,
  },
  cardHeadCol: {
    flex: 1,
    gap: 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneLabel: {
    ...typo.caption,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  cardTitle: {
    ...typo.bodyStrong,
    fontSize: 15,
  },
  dateLine: {
    ...typo.caption,
    fontVariant: ['tabular-nums'],
  },
  subLine: {
    ...typo.caption,
  },
  statusChip: {
    borderRadius: radius.pill,
    paddingHorizontal: space.s8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    ...typo.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  footerPad: {
    height: space.s32,
  },
})
