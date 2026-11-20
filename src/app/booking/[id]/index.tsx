/**
 * S8 · BOOKING SUCCESS / TOKEN + S11 · BOOKING DETAIL (doc 06 S8/S11) — APK-B3.
 *
 * THE protagonist screen: the token number is the LARGEST content (32px+
 * tabular on a soft card, teal pulse dot, "Turn confirmed"). Token-pending
 * is honest ("being assigned" + auto-poll — reception confirms; the token
 * arrives with the confirmation). Visit facts card · status timeline
 * (booked → confirmed → completed) · actions: Track queue (upcoming) ·
 * Share token (WhatsApp text card) · Cancel (quiet destructive — confirm
 * sheet, optional reason, NEVER one-tap) · Book again.
 *
 * ?new=1 → the S8 celebration moment: "Booked" title + calm teal pulse
 * (single micro-moment, then quiet — doc 03 §6 law).
 * Data: GET /api/public/booking/[id]/token — fresh every call, 20s poll
 * while the booking is live (Pending/Approve), stop at done states.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, XCircle } from 'lucide-react-native'
import { colors, radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { cancelPublicBooking, getBookingToken, type TokenState } from '@/lib/api'
import { getBookingPhone } from '@/lib/storage'
import { Chip, PillButton } from '@/components/press'
import { PulseDot } from '@/components/pulse-dot'
import { BottomSheet, GrabHandle } from '@/components/sheets'
import { OfflineBanner } from '@/components/offline-banner'
import { buildTokenShareCard, openWhatsApp } from '@/lib/share'

const POLL_MS = 20_000

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateLabel(iso: string): string {
  const dt = new Date(iso)
  if (isNaN(dt.getTime())) return iso
  const today = ymd(new Date())
  const tomorrow = ymd(new Date(Date.now() + 86_400_000))
  const dstr = ymd(dt)
  const label =
    dstr === today ? 'Today' : dstr === tomorrow ? 'Tomorrow' : dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  return label
}

type Live = 'Pending' | 'Approve'

export default function TokenScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id?: string; new?: string }>()
  const bookingId = typeof params.id === 'string' ? params.id : ''
  const celebrate = params.new === '1'

  const [t, setT] = useState<TokenState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)

  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [phone, setPhone] = useState('')

  const fetchToken = useCallback(async () => {
    try {
      const fresh = await getBookingToken(bookingId)
      setT(fresh)
      setError(false)
      setUpdatedAt(Date.now())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [bookingId])

  useEffect(() => {
    if (!bookingId) return
    let alive = true
    // Async-first barrier: state flips in the microtask continuation
    // (cascading-render law — same pattern as use-query).
    void (async () => {
      await null
      await fetchToken()
      const p = await getBookingPhone()
      if (alive) setPhone(p)
    })()
    return () => {
      alive = false
    }
  }, [bookingId, fetchToken])

  // Live poll while the booking is actionable; stops at done states.
  useEffect(() => {
    if (!bookingId || !t) return
    const live: Live[] = ['Pending', 'Approve']
    if (!live.includes(t.status as Live)) return
    const timer = setInterval(() => void fetchToken(), POLL_MS)
    return () => clearInterval(timer)
  }, [bookingId, t, fetchToken])

  const upcoming = t ? (t.status === 'Pending' || t.status === 'Approve') : false
  const cancellable = upcoming
  const tokenConfirmed = t ? t.tokenNumber.length > 0 : false

  const shareCard = useMemo(() => {
    if (!t) return ''
    return buildTokenShareCard({
      tokenNumber: t.tokenNumber,
      patientName: t.patientName,
      doctorName: t.doctorName,
      hospitalName: t.hospitalName,
      dateLabel: dateLabel(t.date),
      timeSlot: t.timeSlot,
      bookingId: t.bookingId,
    })
  }, [t])

  const doCancel = async () => {
    if (cancelling) return
    if (!phone) {
      setCancelError('This phone has no booking mobile saved — look up your bookings from the Bookings tab first.')
      return
    }
    setCancelling(true)
    setCancelError('')
    try {
      await cancelPublicBooking(bookingId, phone, cancelReason.trim() || undefined)
      setCancelOpen(false)
      await fetchToken()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not cancel — please try again.'
      setCancelError(msg)
    } finally {
      setCancelling(false)
    }
  }

  if (!bookingId) {
    return (
      <View style={styles.screen}>
        <View style={styles.errorWrap}>
          <Text style={styles.errorTitle}>Booking not found.</Text>
          <Chip label="Back to Home" onPress={() => void router.replace('/')} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          Platform.OS === 'web' ? undefined : (
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void fetchToken() }} tintColor="#0A0A0A" />
          )
        }
      >
        {/* Back bar */}
        <View style={styles.topBar}>
          <View style={styles.backBtn}>
            <Chip
              label="Back"
              leading={<ChevronLeft size={16} color={colors.ink} strokeWidth={2} />}
              onPress={() => void (celebrate ? router.replace('/') : router.back())}
            />
          </View>
          <Text style={styles.topTitle} numberOfLines={1}>
            {celebrate ? 'Booked' : 'Your booking'}
          </Text>
          <View style={styles.topSpacer} />
        </View>

        {/* Offline / error strip — cached facts stay, retry one-tap */}
        {error && t ? (
          <View style={styles.bannerWrap}>
            <OfflineBanner onRetry={() => void fetchToken()} />
          </View>
        ) : null}

        {loading ? (
          <View style={styles.centerCol}>
            <Text style={styles.loadingText}>Loading your booking…</Text>
          </View>
        ) : !t ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorTitle}>Could not load this booking.</Text>
            <Text style={styles.errorCaption}>Check your connection and try again.</Text>
            <Chip label="Try again" onPress={() => { setLoading(true); void fetchToken() }} />
          </View>
        ) : (
          <>
            {/* Booking id caption */}
            <Text style={styles.apptCaption}>Booking #{t.bookingId.slice(-6).toUpperCase()}</Text>

            {/* THE TOKEN — protagonist: largest content on the screen */}
            {t.status === 'Canceled' ? (
              <View style={styles.tokenCard}>
                <Text style={styles.tokenPendingTitle}>No token — cancelled</Text>
                <Text style={styles.tokenPendingCaption}>
                  This booking was cancelled, so no token was assigned. Book again any time — it takes 3 taps.
                </Text>
              </View>
            ) : tokenConfirmed ? (
              <View style={styles.tokenCard}>
                <View style={styles.tokenLiveRow}>
                  <PulseDot size={10} />
                  <Text style={styles.tokenLiveLabel}>Turn confirmed</Text>
                </View>
                <Text style={styles.tokenNumber} adjustsFontSizeToFit minimumFontScale={0.6}>
                  {t.tokenNumber}
                </Text>
                <Text style={styles.tokenOrder}>
                  Token {t.tokenNumber} · position {t.queuePosition > 0 ? `#${t.queuePosition}` : '—'}
                </Text>
              </View>
            ) : (
              <View style={styles.tokenCard}>
                <View style={styles.tokenLiveRow}>
                  <PulseDot size={10} />
                  <Text style={styles.tokenLiveLabel}>Request sent</Text>
                </View>
                <Text style={styles.tokenPendingTitle}>Token being assigned</Text>
                <Text style={styles.tokenPendingCaption}>
                  Reception confirms your request and assigns the token — this screen updates
                  automatically. No need to refresh.
                </Text>
              </View>
            )}

            {/* Status timeline — booked → confirmed → completed */}
            <View style={styles.timelineCard}>
              <TimelineStep label="Booked" done />
              <TimelineLine done={t.status !== 'Pending'} />
              <TimelineStep label="Confirmed" done={t.status !== 'Pending' && t.status !== 'Canceled'} />
              <TimelineLine done={t.status === 'Visited' || t.status === 'Finish'} />
              <TimelineStep label="Completed" done={t.status === 'Visited' || t.status === 'Finish'} />
            </View>
            {t.status === 'Canceled' ? (
              <Text style={styles.canceledBanner}>This booking was cancelled.</Text>
            ) : null}

            {/* Visit facts — everything, one card */}
            <View style={styles.factsCard}>
              <FactRow label="Doctor" value={t.doctorName ? `Dr. ${t.doctorName.replace(/^Dr\.?\s*/, '')}` : '—'} />
              {t.hospitalName ? <FactRow label="Clinic" value={t.hospitalName} /> : null}
              <FactRow label="Date" value={dateLabel(t.date)} />
              {t.timeSlot ? <FactRow label="Time" value={t.timeSlot} /> : null}
              {t.fees > 0 ? <FactRow label="Fee" value={`₹${t.fees.toLocaleString('en-IN')} · pay at clinic`} /> : null}
              {t.hospitalCity ? <FactRow label="City" value={t.hospitalCity} /> : null}
              <FactRow label="Patient" value={t.patientName || '—'} />
              {t.disease ? <FactRow label="Reason" value={t.disease} /> : null}
            </View>

            {/* Actions stack */}
            {upcoming ? (
              <View style={styles.actionRow}>
                <PillButton
                  label="Track queue"
                  variant="secondary"
                  height={52}
                  onPress={() => void router.push(`/booking/${bookingId}/queue`)}
                  style={styles.actionBtn}
                />
              </View>
            ) : null}
            <View style={styles.actionRow}>
              <PillButton
                label="Share token"
                variant="secondary"
                height={52}
                onPress={() => void openWhatsApp(shareCard)}
                style={styles.actionBtn}
              />
            </View>
            {t.doctorUserId ? (
              <View style={styles.actionRow}>
                <Chip label="Book again with this doctor" onPress={() => void router.push(`/doctor/${t.doctorUserId}`)} />
              </View>
            ) : null}

            {/* Quiet destructive — never one-tap (money/visit law) */}
            {cancellable ? (
              <View style={styles.cancelRow}>
                <Chip
                  label="Cancel booking"
                  leading={<XCircle size={15} color={colors.error} strokeWidth={2} />}
                  onPress={() => setCancelOpen(true)}
                />
              </View>
            ) : null}

            {/* Freshness honesty — last-updated stamp */}
            <Text style={styles.updatedAt}>
              {updatedAt
                ? `Updated ${new Date(updatedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`
                : ''}
            </Text>
            <View style={styles.scrollBottomPad} />
          </>
        )}
      </ScrollView>

      {/* Cancel confirm sheet — reason optional, destructive confirmed */}
      <BottomSheet visible={cancelOpen} onClose={() => setCancelOpen(false)} accessibilityLabel="Cancel booking">
        <GrabHandle />
        <Text style={styles.sheetTitle}>Cancel this appointment?</Text>
        <Text style={styles.sheetBody}>
          The slot goes back to the pool for other patients. You can book again any time. No fee is
          charged either way — payment happens only at the clinic.
        </Text>
        <TextInput
          value={cancelReason}
          onChangeText={setCancelReason}
          placeholder="Reason (optional) — helps the clinic"
          placeholderTextColor={colors.mute}
          autoCorrect={false}
          underlineColorAndroid="transparent"
          accessibilityLabel="Cancellation reason"
          style={styles.reasonInput}
        />
        {cancelError ? <Text style={styles.sheetError}>{cancelError}</Text> : null}
        <View style={styles.sheetActions}>
          <PillButton label="Keep my booking" height={52} onPress={() => setCancelOpen(false)} style={styles.sheetBtn} />
          <PillButton
            label={cancelling ? 'Cancelling…' : 'Yes, cancel it'}
            height={52}
            loading={cancelling}
            onPress={() => void doCancel()}
            style={[styles.sheetBtn, styles.cancelBtn]}
          />
        </View>
      </BottomSheet>
    </View>
  )
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.factRow}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  )
}

function TimelineStep({ label, done }: { label: string; done: boolean }) {
  return (
    <View style={styles.timelineStep}>
      <View style={[styles.timelineDot, done && styles.timelineDotDone]} />
      <Text style={[styles.timelineLabel, !done && styles.timelineLabelPending]}>{label}</Text>
    </View>
  )
}

function TimelineLine({ done }: { done: boolean }) {
  return <View style={[styles.timelineLine, done && styles.timelineLineDone]} />
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingBottom: space.s24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
    paddingHorizontal: space.s16,
    paddingTop: space.s12,
    minHeight: TOUCH + 8,
  },
  backBtn: {
    minHeight: TOUCH,
    justifyContent: 'center',
  },
  topTitle: {
    ...typo.title,
    color: colors.ink,
    flex: 1,
  },
  topSpacer: {
    width: space.s16,
  },
  bannerWrap: {
    marginHorizontal: space.s16,
    marginBottom: space.s8,
  },
  apptCaption: {
    ...typo.caption,
    color: colors.mute,
    marginHorizontal: space.s16,
    marginTop: space.s4,
    fontVariant: ['tabular-nums'],
  },
  tokenCard: {
    marginHorizontal: space.s16,
    marginTop: space.s12,
    backgroundColor: colors.canvasSoft,
    borderRadius: radius.card,
    padding: space.s20,
    gap: space.s8,
  },
  tokenLiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
  },
  tokenLiveLabel: {
    ...typo.caption,
    color: colors.tealLive,
    fontWeight: '600',
  },
  tokenNumber: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '700',
    color: colors.ink,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  tokenOrder: {
    ...typo.caption,
    color: colors.body,
    fontVariant: ['tabular-nums'],
  },
  tokenPendingTitle: {
    ...typo.display,
    color: colors.ink,
  },
  tokenPendingCaption: {
    ...typo.body,
    color: colors.body,
  },
  timelineCard: {
    marginHorizontal: space.s16,
    marginTop: space.s12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.s12,
  },
  timelineStep: {
    alignItems: 'center',
    gap: 6,
    minWidth: 72,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.mute,
    backgroundColor: colors.canvas,
  },
  timelineDotDone: {
    backgroundColor: colors.tealLive,
    borderColor: colors.tealLive,
  },
  timelineLabel: {
    ...typo.caption,
    color: colors.ink,
    fontWeight: '600',
  },
  timelineLabelPending: {
    color: colors.mute,
    fontWeight: '400',
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.hairline,
    marginHorizontal: space.s4,
  },
  timelineLineDone: {
    backgroundColor: colors.tealLive,
  },
  canceledBanner: {
    ...typo.caption,
    color: colors.error,
    marginHorizontal: space.s16,
    marginTop: space.s4,
    fontWeight: '600',
    textAlign: 'center',
  },
  factsCard: {
    marginHorizontal: space.s16,
    marginTop: space.s12,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    padding: space.s16,
    gap: space.s8,
  },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: space.s12,
    minHeight: TOUCH - 22,
  },
  factLabel: {
    ...typo.body,
    color: colors.body,
  },
  factValue: {
    ...typo.bodyStrong,
    color: colors.ink,
    flex: 1,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  actionRow: {
    marginHorizontal: space.s16,
    marginTop: space.s12,
    alignItems: 'center',
  },
  actionBtn: {
    alignSelf: 'stretch',
  },
  cancelRow: {
    marginTop: space.s16,
    alignItems: 'center',
  },
  updatedAt: {
    ...typo.caption,
    color: colors.mute,
    textAlign: 'center',
    marginTop: space.s20,
    fontVariant: ['tabular-nums'],
  },
  scrollBottomPad: {
    height: space.s24,
  },
  centerCol: {
    alignItems: 'center',
    paddingVertical: space.s32,
    gap: space.s8,
  },
  loadingText: {
    ...typo.body,
    color: colors.mute,
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.s8,
    padding: space.s24,
  },
  errorTitle: {
    ...typo.title,
    color: colors.ink,
    textAlign: 'center',
  },
  errorCaption: {
    ...typo.caption,
    color: colors.mute,
    textAlign: 'center',
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
  reasonInput: {
    minHeight: 56,
    borderRadius: radius.input,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    backgroundColor: colors.canvas,
    paddingHorizontal: space.s16,
    paddingVertical: space.s12,
    ...typo.body,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  sheetError: {
    ...typo.caption,
    color: colors.error,
    marginTop: space.s8,
    fontWeight: '600',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: space.s8,
    marginTop: space.s16,
  },
  sheetBtn: {
    flex: 1,
  },
  cancelBtn: {
    backgroundColor: colors.error,
  },
})
