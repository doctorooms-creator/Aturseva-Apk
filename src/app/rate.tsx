/**
 * S18 · RATE YOUR VISITS (doc 06 #18, P1) — APK-B6.
 *
 * Stack route (full-screen, back to Profile). Auth-gated honestly:
 * the rating API is the patient's own voice — a guest gets the sign-in
 * doorway (never a wall).
 *
 * List: completed visits (GET /api/patient/feedback) — doctor · visit
 * reason · date · "Rate this visit" pill, or a settled "Rated" chip
 * (alreadyRated honesty — no re-rating UI for done rows; the server
 * would update, but the patient-facing truth is one rating per visit).
 *
 * RateSheet (bottom sheet, doc 03 sheet law): star row (1–5, 44px
 * targets) → optional detail rows (consultation · wait · staff, each
 * 1–5 pills, default blank = "not answered") → optional review text →
 * anonymous toggle → Submit. Server answers surface verbatim (409
 * honest). One rating per visit; submit settles the row.
 */

import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ArrowLeft, Star } from 'lucide-react-native'
import { radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { getFeedbackList, postRating, type FeedbackRow } from '@/lib/api'
import { getStoredUser } from '@/lib/auth'
import { EmptyState } from '@/components/empty-state'
import { PillButton } from '@/components/press'
import { BottomSheet, GrabHandle } from '@/components/sheets'
import { AuthSheet } from '@/components/auth-sheet'

function dateLabel(iso: string): string {
  const dt = new Date(iso)
  if (isNaN(dt.getTime())) return iso
  return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function RateScreen() {
  const c = useColors()
  const router = useRouter()

  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [rows, setRows] = useState<FeedbackRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [authSheetOpen, setAuthSheetOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // RateSheet state
  const [sheetRow, setSheetRow] = useState<FeedbackRow | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setRows(await getFeedbackList())
    } catch {
      setRows([])
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

  const onRated = (row: FeedbackRow) => {
    // Settle the row honestly (list refresh would also show it, but the
    // instant settle closes the loop without a refetch flash).
    setRows((prev) => prev?.map((r) => (r.id === row.id ? { ...r, alreadyRated: true } : r)) ?? prev)
    setSheetRow(null)
  }

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
        <Text style={[styles.title, { color: c.ink }]}>Rate your visits</Text>
        <View style={styles.titleRight} />
      </View>

      {signedIn === null ? null : !signedIn ? (
        <EmptyState
          icon={Star}
          title="Sign in to rate your visits"
          caption="Ratings come from your completed visits — they help the next patient choose well."
          actions={[{ label: 'Sign in', onPress: () => setAuthSheetOpen(true) }]}
        />
      ) : rows === null ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={c.mute} />
        </View>
      ) : error && rows.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Could not load your visits"
          caption={error}
          actions={[{ label: 'Try again', onPress: () => void load() }]}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No completed visits yet"
          caption="After a visit finishes, it appears here and you can rate the experience."
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.ink} />
          }
        >
          {rows.map((r) => (
            <View key={r.id} style={[styles.card, { backgroundColor: c.canvasSoft }]}>
              <View style={styles.cardHead}>
                <View style={styles.cardCol}>
                  <Text style={[styles.docName, { color: c.ink }]} numberOfLines={1}>
                    {r.doctorName}
                  </Text>
                  <Text style={[styles.subLine, { color: c.body }]} numberOfLines={1}>
                    {[r.disease, dateLabel(r.date)].filter(Boolean).join(' · ')}
                  </Text>
                  <Text style={[styles.subLine, { color: c.mute }]} numberOfLines={1}>
                    {`Visit ${r.appointmentNo}`}
                  </Text>
                </View>
                {r.alreadyRated ? (
                  <View style={[styles.ratedChip, { backgroundColor: c.successSoft }]}>
                    <Star size={13} color={c.success} strokeWidth={2} />
                    <Text style={[styles.ratedChipText, { color: c.success }]}>Rated</Text>
                  </View>
                ) : null}
              </View>
              {!r.alreadyRated ? (
                <PillButton
                  label="Rate this visit"
                  variant="secondary"
                  height={44}
                  onPress={() => setSheetRow(r)}
                />
              ) : null}
            </View>
          ))}
          <View style={styles.footerPad} />
        </ScrollView>
      )}

      <RateSheet row={sheetRow} onClose={() => setSheetRow(null)} onRated={onRated} />

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

/** 1–5 pick row — pills, 44px targets, blank = not answered (honest). */
function ScoreRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  const c = useColors()
  return (
    <View style={styles.scoreRow}>
      <Text style={[styles.scoreLabel, { color: c.body }]}>{label}</Text>
      <View style={styles.scorePills}>
        {[1, 2, 3, 4, 5].map((n) => {
          const on = value === n
          return (
            <Pressable
              key={n}
              onPress={() => onChange(on ? 0 : n)}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${n}${on ? ', selected' : ''}`}
              style={({ pressed }) => [
                styles.scorePill,
                { backgroundColor: on ? c.ink : c.canvasSoft },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.scorePillText, { color: on ? c.canvas : c.body }]}>{n}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

function RateSheet({
  row,
  onClose,
  onRated,
}: {
  row: FeedbackRow | null
  onClose: () => void
  onRated: (row: FeedbackRow) => void
}) {
  const c = useColors()
  const [star, setStar] = useState(0)
  const [consultation, setConsultation] = useState(0)
  const [waitTime, setWaitTime] = useState(0)
  const [staff, setStaff] = useState(0)
  const [review, setReview] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  // Sheet state resets per row (open same row twice = clean state).
  if (row && loadedFor !== row.id) {
    setLoadedFor(row.id)
    setStar(0)
    setConsultation(0)
    setWaitTime(0)
    setStaff(0)
    setReview('')
    setAnonymous(false)
    setServerError(null)
    setSubmitting(false)
  }

  const submit = async () => {
    if (!row || star === 0) return
    setSubmitting(true)
    setServerError(null)
    try {
      await postRating({
        bookingId: row.id,
        doctorUserId: row.doctorUserId,
        star,
        consultationRating: consultation,
        waitTimeRating: waitTime,
        staffRating: staff,
        review: review.trim() || undefined,
        isAnonymous: anonymous,
      })
      onRated(row)
    } catch (err) {
      // Honest server answers surface verbatim (409 already-rated etc).
      setServerError(err instanceof Error ? err.message : 'Could not submit your rating.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet visible={row !== null} onClose={onClose} accessibilityLabel="Rate visit sheet">
      <GrabHandle />
      {row ? (
        <>
          <Text style={[styles.sheetTitle, { color: c.ink }]}>{`How was your visit with ${row.doctorName}?`}</Text>
          <Text style={[styles.sheetCaption, { color: c.body }]}>
            Your rating helps the next patient choose with confidence.
          </Text>

          {/* Star row — the protagonist input (big targets). */}
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                onPress={() => setStar(n)}
                accessibilityRole="button"
                accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
                hitSlop={4}
                style={({ pressed }) => [styles.starBtn, pressed && { opacity: 0.6 }]}
              >
                <Star
                  size={34}
                  color={n <= star ? '#B45309' : c.mute}
                  strokeWidth={2}
                  {...(n <= star ? { fill: '#B45309' } : {})}
                />
              </Pressable>
            ))}
          </View>

          <ScoreRow label="Consultation" value={consultation} onChange={setConsultation} />
          <ScoreRow label="Wait time" value={waitTime} onChange={setWaitTime} />
          <ScoreRow label="Staff" value={staff} onChange={setStaff} />

          <TextInput
            value={review}
            onChangeText={setReview}
            placeholder="Anything to add? (optional)"
            placeholderTextColor={c.mute}
            multiline
            accessibilityLabel="Review"
            style={[styles.reviewInput, { color: c.ink, borderColor: c.hairline }]}
          />

          <View style={styles.anonRow}>
            <View style={styles.anonCol}>
              <Text style={[styles.anonLabel, { color: c.ink }]}>Post anonymously</Text>
              <Text style={[styles.anonCaption, { color: c.mute }]}>Your name is not shown with the review.</Text>
            </View>
            <Switch
              value={anonymous}
              onValueChange={setAnonymous}
              accessibilityLabel="Post anonymously"
              trackColor={{ false: `${c.mute}55`, true: c.ink }}
              thumbColor={c.canvas}
            />
          </View>

          {serverError ? (
            <Text style={[styles.serverError, { color: c.error }]}>{serverError}</Text>
          ) : null}

          <View style={styles.sheetActions}>
            <PillButton
              label={star === 0 ? 'Pick a star rating first' : 'Submit rating'}
              disabled={star === 0}
              loading={submitting}
              height={56}
              onPress={() => void submit()}
            />
          </View>
        </>
      ) : null}
    </BottomSheet>
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
  card: {
    borderRadius: radius.card,
    padding: space.s16,
    gap: space.s12,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.s8,
  },
  cardCol: {
    flex: 1,
    gap: 2,
  },
  docName: {
    ...typo.bodyStrong,
    fontSize: 16,
  },
  subLine: {
    ...typo.caption,
  },
  ratedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(21,128,61,0.1)',
  },
  ratedChipText: {
    ...typo.caption,
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  footerPad: {
    height: space.s32,
  },
  sheetTitle: {
    ...typo.title,
    paddingHorizontal: space.s4,
  },
  sheetCaption: {
    ...typo.caption,
    marginTop: 2,
    paddingHorizontal: space.s4,
    marginBottom: space.s16,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: space.s4,
    marginBottom: space.s16,
  },
  starBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    paddingHorizontal: space.s4,
    paddingVertical: space.s4,
  },
  scoreLabel: {
    ...typo.caption,
    width: 104,
  },
  scorePills: {
    flex: 1,
    flexDirection: 'row',
    gap: space.s8,
  },
  scorePill: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePillText: {
    ...typo.bodyStrong,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: radius.input,
    padding: space.s12,
    minHeight: 84,
    textAlignVertical: 'top',
    ...typo.caption,
    marginTop: space.s8,
  },
  anonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    marginTop: space.s12,
    paddingHorizontal: space.s4,
  },
  anonCol: {
    flex: 1,
    gap: 2,
  },
  anonLabel: {
    ...typo.bodyStrong,
    fontSize: 14,
  },
  anonCaption: {
    ...typo.caption,
  },
  serverError: {
    ...typo.caption,
    marginTop: space.s12,
    paddingHorizontal: space.s4,
  },
  sheetActions: {
    marginTop: space.s16,
    paddingHorizontal: space.s4,
  },
})
