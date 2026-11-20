/**
 * S9 · LIVE QUEUE TRACKER (doc 06 S9) — APK-B3 — THE live surface.
 *
 * Header "Your turn" · big position block ("#3" display tabular + people
 * ahead + teal pulse) · wait estimate (labeled estimate — honesty law 9)
 * · leave-by advisory (computed from the ETA window, labeled) · honest
 * states (pending / not-started / paused / next / live / done) ·
 * refresh timestamp + pull-to-refresh.
 *
 * Data: GET /api/public/booking/[id]/token — the same engine the web
 * token page uses (queuePosition + eta L0–L4 ladder). Poll 20s while the
 * booking is live and the screen is foreground; stop at done (battery-
 * friendly — no socket in P0).
 */

import { useCallback, useEffect, useState } from 'react'
import { AppState, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, Clock3 } from 'lucide-react-native'
import { radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { getBookingToken, type TokenState } from '@/lib/api'
import { Chip } from '@/components/press'
import { PulseDot } from '@/components/pulse-dot'
import { OfflineBanner } from '@/components/offline-banner'

const POLL_MS = 20_000

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

export default function QueueScreen() {
  const c = useColors()
  const router = useRouter()
  const params = useLocalSearchParams<{ id?: string }>()
  const bookingId = typeof params.id === 'string' ? params.id : ''

  const [t, setT] = useState<TokenState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)

  const fetchQ = useCallback(async () => {
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
    // Async-first barrier (cascading-render law — see use-query).
    void (async () => {
      await null
      await fetchQ()
    })()
  }, [bookingId, fetchQ])

  // Foreground poll: 20s while the booking is live AND the app is active.
  useEffect(() => {
    if (!bookingId || !t) return
    const live = t.status === 'Pending' || t.status === 'Approve'
    if (!live) return
    let timer: ReturnType<typeof setInterval> | null = null
    const start = () => {
      if (timer) return
      timer = setInterval(() => void fetchQ(), POLL_MS)
    }
    const stop = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') start()
      else stop()
    })
    start()
    return () => {
      stop()
      sub.remove()
    }
  }, [bookingId, t, fetchQ])

  if (!bookingId) {
    return (
      <View style={[styles.screen, { backgroundColor: c.canvas }]}>
        <View style={styles.errorWrap}>
          <Text style={[styles.errorTitle, { color: c.ink }]}>Queue not found.</Text>
          <Chip label="Back to Home" onPress={() => void router.replace('/')} />
        </View>
      </View>
    )
  }

  const eta = t?.eta ?? null
  const peopleAhead = t ? Math.max(0, t.queuePosition - 1) : 0
  // Leave-by = last-fresh snapshot + the honest ETA high bound — computed
  // from state, never Date.now() during render (purity law).
  const leaveBy =
    eta && eta.state === 'live' && typeof eta.high === 'number' && updatedAt
      ? updatedAt + eta.high * 60_000
      : null

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          Platform.OS === 'web' ? undefined : (
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void fetchQ() }} tintColor={c.ink} />
          )
        }
      >
        {/* Back bar */}
        <View style={styles.topBar}>
          <View style={styles.backBtn}>
            <Chip
              label="Back"
              leading={<ChevronLeft size={16} color={c.ink} strokeWidth={2} />}
              onPress={() => void router.back()}
            />
          </View>
          <Text style={[styles.topTitle, { color: c.ink }]} numberOfLines={1}>
            Your turn
          </Text>
          <View style={styles.topSpacer} />
        </View>

        {error && t ? (
          <View style={styles.bannerWrap}>
            <OfflineBanner onRetry={() => void fetchQ()} />
          </View>
        ) : null}

        {loading ? (
          <View style={styles.centerCol}>
            <Text style={[styles.loadingText, { color: c.mute }]}>Loading the live queue…</Text>
          </View>
        ) : !t ? (
          <View style={styles.errorWrap}>
            <Text style={[styles.errorTitle, { color: c.ink }]}>Could not load the queue.</Text>
            <Text style={[styles.errorCaption, { color: c.mute }]}>Check your connection and try again.</Text>
            <Chip label="Try again" onPress={() => { setLoading(true); void fetchQ() }} />
          </View>
        ) : (
          <>
            {/* THE position block — the live hero */}
            <View style={[styles.positionCard, { backgroundColor: c.canvasSoft }]}>
              {t.status === 'Pending' ? (
                <>
                  <View style={styles.liveRow}>
                    <PulseDot size={10} />
                    <Text style={[styles.liveLabel, { color: c.tealLive }]}>Waiting for confirmation</Text>
                  </View>
                  <Text style={[styles.positionBigTitle, { color: c.ink }]}>Not in the line yet</Text>
                  <Text style={[styles.positionCaption, { color: c.body }]}>
                    Reception confirms your request, then your position appears here automatically.
                  </Text>
                </>
              ) : t.status === 'Visited' || t.status === 'Finish' ? (
                <>
                  <View style={styles.liveRow}>
                    <Text style={[styles.liveLabel, { color: c.tealLive }]}>Visit complete</Text>
                  </View>
                  <Text style={[styles.positionBigTitle, { color: c.ink }]}>Your visit is done</Text>
                  <Text style={[styles.positionCaption, { color: c.body }]}>
                    Hope it went well — the doctor’s notes reach you after the visit.
                  </Text>
                </>
              ) : t.status === 'Canceled' ? (
                <>
                  <View style={styles.liveRow}>
                    <Text style={[styles.liveLabel, { color: c.tealLive }]}>Cancelled</Text>
                  </View>
                  <Text style={[styles.positionBigTitle, { color: c.ink }]}>This booking was cancelled</Text>
                  <Text style={[styles.positionCaption, { color: c.body }]}>Book again any time — the doctor page is one tap away.</Text>
                </>
              ) : eta === null ? (
                <>
                  <View style={styles.liveRow}>
                    <PulseDot size={10} />
                    <Text style={[styles.liveLabel, { color: c.tealLive }]}>Confirmed</Text>
                  </View>
                  <Text style={[styles.positionBig, { color: c.ink }]}>—</Text>
                  <Text style={[styles.positionCaption, { color: c.body }]}>
                    Token {t.tokenNumber || '—'}. The live line for this doctor has not started yet.
                  </Text>
                </>
              ) : eta.state === 'not-started' ? (
                <>
                  <View style={styles.liveRow}>
                    <PulseDot size={10} />
                    <Text style={[styles.liveLabel, { color: c.tealLive }]}>Confirmed · token {t.tokenNumber || '—'}</Text>
                  </View>
                  <Text style={[styles.positionBigTitle, { color: c.ink }]}>The queue hasn’t started</Text>
                  <Text style={[styles.positionCaption, { color: c.body }]}>
                    Arrive before your slot time — this screen shows the live line the moment it starts.
                  </Text>
                </>
              ) : eta.state === 'paused' ? (
                <>
                  <View style={styles.liveRow}>
                    <PulseDot size={10} />
                    <Text style={[styles.liveLabel, { color: c.tealLive }]}>Live · doctor on a short break</Text>
                  </View>
                  <Text style={[styles.positionBig, { color: c.ink }]}>#{t.queuePosition || '—'}</Text>
                  <Text style={[styles.positionCaption, { color: c.body }]}>
                    {peopleAhead > 0 ? `${peopleAhead} ${peopleAhead === 1 ? 'person' : 'people'} ahead of you` : 'You are at the front'} · the
                    queue resumes shortly.
                  </Text>
                </>
              ) : eta.state === 'next' ? (
                <>
                  <View style={styles.liveRow}>
                    <PulseDot size={10} />
                    <Text style={[styles.liveLabel, { color: c.tealLive }]}>Live · you are next</Text>
                  </View>
                  <Text style={[styles.positionBig, { color: c.ink }]}>NEXT</Text>
                  <Text style={[styles.positionCaption, { color: c.body }]}>Please be at the clinic now — your turn is next.</Text>
                </>
              ) : (
                <>
                  <View style={styles.liveRow}>
                    <PulseDot size={10} />
                    <Text style={[styles.liveLabel, { color: c.tealLive }]}>Live · token {t.tokenNumber || '—'}</Text>
                  </View>
                  <Text style={[styles.positionBig, { color: c.ink }]}>#{t.queuePosition || '—'}</Text>
                  <Text style={[styles.positionCaption, { color: c.body }]}>
                    {peopleAhead > 0
                      ? `${peopleAhead} ${peopleAhead === 1 ? 'person' : 'people'} ahead of you`
                      : 'You are at the front'}
                  </Text>
                </>
              )}

              {/* Wait estimate — labeled as an estimate (honesty law 9) */}
              {eta && (eta.state === 'live' || eta.state === 'paused') && typeof eta.low === 'number' ? (
                <View style={styles.etaRow}>
                  <Clock3 size={15} color={c.body} strokeWidth={2} />
                  <Text style={[styles.etaText, { color: c.body }]}>
                    {eta.state === 'paused'
                      ? 'Estimate paused — the doctor is on a break'
                      : eta.high && eta.high > eta.low
                        ? `Estimated wait ~${eta.low}–${eta.high} min`
                        : `Estimated wait ~${eta.low} min`}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Leave-by advisory — honest, computed, labeled */}
            {leaveBy ? (
              <View style={[styles.leaveByCard, { backgroundColor: c.warnSoft }]}>
                <Text style={[styles.leaveByText, { color: c.warn }]}>
                  Reach the clinic by ~{fmtTime(leaveBy)} to be comfortable — estimate, not a promise.
                </Text>
              </View>
            ) : null}

            {/* Doctor + clinic context */}
            <View style={[styles.doctorCard, { borderColor: c.hairline }]}>
              <Text style={[styles.doctorName, { color: c.ink }]} numberOfLines={1}>
                {t.doctorName ? `Dr. ${t.doctorName.replace(/^Dr\.?\s*/, '')}` : 'Your doctor'}
                {t.specialization ? ` · ${t.specialization}` : ''}
              </Text>
              {t.hospitalName ? (
                <Text style={[styles.doctorSub, { color: c.body }]} numberOfLines={2}>
                  {t.hospitalName}
                  {t.hospitalCity ? ` · ${t.hospitalCity}` : ''}
                </Text>
              ) : null}
              <Text style={[styles.bookingRef, { color: c.mute }]}>Booking #{t.bookingId.slice(-6).toUpperCase()}</Text>
            </View>

            {/* Refresh honesty — timestamp always visible */}
            <Text style={[styles.updatedAt, { color: c.mute }]}>
              {updatedAt ? `Updated ${fmtTime(updatedAt)}` : ''} · refreshes automatically
            </Text>
            <View style={styles.webRefreshRow}>
              <Chip label="Refresh now" onPress={() => { setRefreshing(true); void fetchQ() }} />
            </View>
            <View style={styles.scrollBottomPad} />
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
    flex: 1,
  },
  topSpacer: {
    width: space.s16,
  },
  bannerWrap: {
    marginHorizontal: space.s16,
    marginBottom: space.s8,
  },
  positionCard: {
    marginHorizontal: space.s16,
    marginTop: space.s12,
    borderRadius: radius.card,
    padding: space.s20,
    gap: space.s8,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
  },
  liveLabel: {
    ...typo.caption,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  positionBig: {
    fontSize: 56,
    lineHeight: 60,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  positionBigTitle: {
    ...typo.display,
  },
  positionCaption: {
    ...typo.body,
    fontVariant: ['tabular-nums'],
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
    marginTop: space.s4,
  },
  etaText: {
    ...typo.body,
    fontVariant: ['tabular-nums'],
  },
  leaveByCard: {
    marginHorizontal: space.s16,
    marginTop: space.s12,
    borderRadius: radius.card,
    padding: space.s16,
  },
  leaveByText: {
    ...typo.body,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  doctorCard: {
    marginHorizontal: space.s16,
    marginTop: space.s12,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.s16,
    gap: space.s4,
  },
  doctorName: {
    ...typo.bodyStrong,
    fontSize: 16,
  },
  doctorSub: {
    ...typo.caption,
  },
  bookingRef: {
    ...typo.caption,
    fontVariant: ['tabular-nums'],
  },
  updatedAt: {
    ...typo.caption,
    textAlign: 'center',
    marginTop: space.s20,
    fontVariant: ['tabular-nums'],
  },
  webRefreshRow: {
    alignItems: 'center',
    marginTop: space.s8,
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
    textAlign: 'center',
  },
  errorCaption: {
    ...typo.caption,
    textAlign: 'center',
  },
})
