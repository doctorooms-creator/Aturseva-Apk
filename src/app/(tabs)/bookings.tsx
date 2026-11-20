/**
 * S10 · MY BOOKINGS (tab 2) — guest phone-lookup (doc 06 S10) — APK-B3.
 *
 * Tabs Upcoming / Past (segmented) · booking cards (date+time, doctor
 * mini, status badge, token) → tap opens S11 (the token/detail screen).
 * Guest entry: "Find my bookings" — a 10-digit phone lookup (phone is
 * identity-lite; NO forced login — guest parity law). The phone this
 * device last booked with is remembered and re-used (auto-lookup).
 *
 * Empty states are doorways (never dead-ends); lookup empty is honest
 * ("no bookings for this number") + try-another chip.
 * Data: GET /api/public/booking/lookup?mobile= (facts only).
 */

import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { CalendarCheck2, Search } from 'lucide-react-native'
import { colors, radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { lookupBookings, type GuestBookingRow } from '@/lib/api'
import { getBookingPhone, setBookingPhone } from '@/lib/storage'
import { Chip, PillButton } from '@/components/press'
import { EmptyState } from '@/components/empty-state'
import { BottomSheet, GrabHandle } from '@/components/sheets'

const PHONE_RE = /^[6-9]\d{9}$/

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Honest split: upcoming = actionable (Pending/Approve) and not in the past. */
function isUpcoming(b: GuestBookingRow): boolean {
  const actionable = b.status === 'Pending' || b.status === 'Approve'
  const today = ymd(new Date())
  return actionable && b.date.slice(0, 10) >= today
}

function dateLabel(iso: string): string {
  const dt = new Date(iso)
  if (isNaN(dt.getTime())) return iso
  return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

const STATUS_LABELS: Record<string, { label: string; tone: 'live' | 'done' | 'warn' | 'mute' | 'error' }> = {
  Pending: { label: 'Awaiting confirmation', tone: 'warn' },
  Approve: { label: 'Confirmed', tone: 'live' },
  Visited: { label: 'Visited', tone: 'done' },
  Finish: { label: 'Completed', tone: 'done' },
  Canceled: { label: 'Cancelled', tone: 'error' },
}

export default function BookingsScreen() {
  const router = useRouter()

  const [phone, setPhone] = useState('')
  const [rows, setRows] = useState<GuestBookingRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [emptyForPhone, setEmptyForPhone] = useState('')
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetPhone, setSheetPhone] = useState('')

  const runLookup = useCallback(async (mobile: string) => {
    if (!PHONE_RE.test(mobile)) return
    setLoading(true)
    setError(false)
    setEmptyForPhone('')
    try {
      const found = await lookupBookings(mobile)
      setRows(found)
      if (found.length === 0) setEmptyForPhone(mobile)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-lookup with this device's booking phone (guest parity — the
  // phone remembers, the patient never re-types).
  useEffect(() => {
    void getBookingPhone().then((p) => {
      setPhone(p)
      setSheetPhone(p)
      if (p) void runLookup(p)
    })
  }, [runLookup])

  const upcoming = (rows ?? []).filter(isUpcoming)
  const past = (rows ?? []).filter((b) => !isUpcoming(b))
  const shown = tab === 'upcoming' ? upcoming : past

  const openSheet = () => {
    setSheetPhone(phone)
    setSheetOpen(true)
  }

  const submitSheet = () => {
    const mobile = sheetPhone.replace(/\D/g, '').slice(0, 10)
    if (!PHONE_RE.test(mobile)) return
    setSheetOpen(false)
    setPhone(mobile)
    void setBookingPhone(mobile)
    void runLookup(mobile)
  }

  return (
    <View style={styles.screen}>
      <View style={styles.safeTop} />
      <Text style={styles.title}>Bookings</Text>
      <Text style={styles.caption}>Your appointments — upcoming and past.</Text>

      {/* Lookup identity line — whose bookings, one-tap change */}
      <View style={styles.whoRow}>
        <Text style={styles.whoText} numberOfLines={1}>
          {phone ? `Showing bookings for ${phone.slice(0, 2)}••••${phone.slice(-4)}` : 'Find your bookings with your mobile number'}
        </Text>
        <Chip label={phone ? 'Change' : 'Find my bookings'} onPress={openSheet} />
      </View>

      {/* Segmented tabs */}
      <View style={styles.tabsRow}>
        <Chip label={`Upcoming (${upcoming.length})`} selected={tab === 'upcoming'} onPress={() => setTab('upcoming')} />
        <Chip label={`Past (${past.length})`} selected={tab === 'past'} onPress={() => setTab('past')} />
      </View>

      {/* States — honest at every step */}
      {error && rows === null ? (
        <View style={styles.listWrap}>
          <EmptyState
            icon={CalendarCheck2}
            title="Could not load bookings"
            caption="Check your connection and try again."
            actions={[{ label: 'Try again', onPress: () => phone ? void runLookup(phone) : openSheet() }]}
          />
        </View>
      ) : rows === null ? (
        <View style={styles.listWrap}>
          <EmptyState
            icon={CalendarCheck2}
            title="Find your bookings"
            caption="Enter the 10-digit mobile number you booked with — no login needed."
            actions={[{ label: 'Find my bookings', onPress: openSheet }]}
          />
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.listWrap}>
          <EmptyState
            icon={CalendarCheck2}
            title="No bookings found"
            caption={emptyForPhone ? `No bookings for ${emptyForPhone.slice(0, 2)}••••${emptyForPhone.slice(-4)} — booked with another number? Switch it above.` : 'No bookings for this number yet.'}
            actions={[{ label: 'Find a doctor on Home', onPress: () => void router.push('/') }]}
          />
        </View>
      ) : shown.length === 0 ? (
        <View style={styles.listWrap}>
          <EmptyState
            icon={CalendarCheck2}
            title={tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            caption={
              tab === 'upcoming'
                ? 'Book a doctor from Home — it takes 3 taps, no login.'
                : 'Past visits will appear here after they happen.'
            }
            actions={tab === 'upcoming' ? [{ label: 'Find a doctor on Home', onPress: () => void router.push('/') }] : undefined}
          />
        </View>
      ) : loading && rows.length === 0 ? (
        <View style={styles.centerCol}>
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {shown.map((b) => (
            <BookingCard key={b.id} row={b} onPress={() => void router.push(`/booking/${b.id}`)} />
          ))}
          <View style={styles.scrollBottomPad} />
        </ScrollView>
      )}

      {/* Lookup sheet — the guest door (identity-lite, never a login wall) */}
      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} accessibilityLabel="Find my bookings">
        <GrabHandle />
        <Text style={styles.sheetTitle}>Find my bookings</Text>
        <Text style={styles.sheetBody}>
          Enter the 10-digit mobile number you booked with. Your appointments and tokens appear instantly — no login,
          no password.
        </Text>
        <View style={styles.sheetFieldWrap}>
          <Search size={18} color={colors.mute} strokeWidth={2} />
          <TextInput
            value={sheetPhone}
            onChangeText={(v) => setSheetPhone(v.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit mobile number"
            placeholderTextColor={colors.mute}
            keyboardType="phone-pad"
            maxLength={10}
            autoCorrect={false}
            underlineColorAndroid="transparent"
            accessibilityLabel="Mobile number"
            style={styles.sheetInput}
          />
        </View>
        <PillButton
          label="Show my bookings"
          height={52}
          disabled={sheetPhone.replace(/\D/g, '').length !== 10}
          onPress={submitSheet}
        />
      </BottomSheet>
    </View>
  )
}

function BookingCard({ row, onPress }: { row: GuestBookingRow; onPress: () => void }) {
  const status = STATUS_LABELS[row.status] ?? { label: row.status, tone: 'mute' as const }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Booking with ${row.doctorName || 'doctor'} on ${dateLabel(row.date)} ${row.timeSlot}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardHeadRow}>
        <View style={styles.cardDoctorCol}>
          <Text style={styles.cardDoctor} numberOfLines={1}>
            {row.doctorName ? `Dr. ${row.doctorName.replace(/^Dr\.?\s*/, '')}` : 'Doctor'}
          </Text>
          <Text style={styles.cardSpec} numberOfLines={1}>
            {row.specialization || 'Appointment'}
          </Text>
        </View>
        {row.tokenNumber ? (
          <View style={styles.cardToken}>
            <Text style={styles.cardTokenNum} adjustsFontSizeToFit minimumFontScale={0.6}>
              {row.tokenNumber}
            </Text>
            <Text style={styles.cardTokenLabel}>token</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.cardMetaRow}>
        <Text style={styles.cardWhen} numberOfLines={1}>
          {dateLabel(row.date)}
          {row.timeSlot ? ` · ${row.timeSlot}` : ''}
          {row.bookingMode === 'VideoCall' ? ' · video call' : ''}
        </Text>
        <StatusBadge label={status.label} tone={status.tone} />
      </View>
    </Pressable>
  )
}

function StatusBadge({ label, tone }: { label: string; tone: 'live' | 'done' | 'warn' | 'mute' | 'error' }) {
  const toneStyle =
    tone === 'live'
      ? { bg: colors.tealLiveSoft, fg: colors.tealLive }
      : tone === 'done'
        ? { bg: colors.successSoft, fg: colors.success }
        : tone === 'warn'
          ? { bg: colors.warnSoft, fg: colors.warn }
          : tone === 'error'
            ? { bg: colors.errorSoft, fg: colors.error }
            : { bg: colors.canvasSoft, fg: colors.body }
  return (
    <View style={[styles.badge, { backgroundColor: toneStyle.bg }]}>
      <Text style={[styles.badgeText, { color: toneStyle.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  safeTop: {
    height: 24,
  },
  title: {
    ...typo.title,
    color: colors.ink,
    marginHorizontal: space.s16,
  },
  caption: {
    ...typo.caption,
    color: colors.body,
    marginHorizontal: space.s16,
    marginTop: 2,
  },
  whoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s8,
    marginHorizontal: space.s16,
    marginTop: space.s12,
    minHeight: TOUCH,
  },
  whoText: {
    ...typo.caption,
    color: colors.body,
    flex: 1,
    fontVariant: ['tabular-nums'],
  },
  tabsRow: {
    flexDirection: 'row',
    gap: space.s8,
    marginHorizontal: space.s16,
    marginTop: space.s4,
    marginBottom: space.s12,
  },
  listWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: space.s32,
  },
  listContent: {
    paddingHorizontal: space.s16,
    gap: space.s12,
  },
  centerCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typo.body,
    color: colors.mute,
  },
  scrollBottomPad: {
    height: space.s24,
  },
  card: {
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    padding: space.s16,
    gap: space.s12,
    minHeight: TOUCH + 12,
    justifyContent: 'center',
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.9,
    backgroundColor: colors.canvasSoft,
  },
  cardHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s12,
  },
  cardDoctorCol: {
    flex: 1,
    gap: 2,
  },
  cardDoctor: {
    ...typo.bodyStrong,
    color: colors.ink,
    fontSize: 16,
  },
  cardSpec: {
    ...typo.caption,
    color: colors.body,
  },
  cardToken: {
    alignItems: 'center',
    backgroundColor: colors.canvasSoft,
    borderRadius: radius.pill,
    paddingHorizontal: space.s12,
    paddingVertical: space.s4,
    minWidth: 56,
  },
  cardTokenNum: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  cardTokenLabel: {
    ...typo.caption,
    color: colors.mute,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s8,
  },
  cardWhen: {
    ...typo.caption,
    color: colors.body,
    flex: 1,
    fontVariant: ['tabular-nums'],
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: space.s12,
    paddingVertical: 5,
  },
  badgeText: {
    ...typo.caption,
    fontWeight: '600',
  },
  sheetTitle: {
    ...typo.title,
    color: colors.ink,
    paddingHorizontal: space.s4,
  },
  sheetBody: {
    ...typo.body,
    color: colors.body,
    marginTop: space.s8,
    marginBottom: space.s12,
    paddingHorizontal: space.s4,
  },
  sheetFieldWrap: {
    height: 56,
    borderRadius: radius.input,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    backgroundColor: colors.canvas,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    paddingHorizontal: space.s16,
    marginBottom: space.s12,
  },
  sheetInput: {
    ...typo.body,
    flex: 1,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
    paddingVertical: 0,
  },
})
