/**
 * S5 · DOCTOR PROFILE (doc 06 S5) — APK-B2 (+B3 wiring, +B7-P2 depth).
 *
 * Layout: back bar → identity block (avatar/photo, name, spec, Reg
 * chip, experience, education) → FEE block (big, tabular, first-visit
 * caption — honesty through scale) → 7-day timing table → ratings
 * summary + sub-rating texture (only when real) → quiet stats →
 * practices-at → description → health tips (published posts —
 * hide-if-empty ABSOLUTE) → share row → sticky bottom CTA "Book
 * appointment — ₹300". B3: the CTA opens the S6 slot sheet (live
 * inventory); Confirm slot pushes S7 (the confirm step) — the golden
 * journey starts here.
 * Data: /api/doctors/[id] (doc 08 #2, SWR 10min via useQuery cache)
 * + B7-P2 secondary zones: /api/public/doctor/[id]/ratings (consultation/
 * wait/staff texture — the OUTPUT side of the B6 rate flow) and
 * /api/public/doctor/[id]/posts (published posts → PostSheet reader
 * via /api/blog/[permalink]). Secondary-zone failures NEVER break the
 * profile — the zones simply hide (hide-if-empty ABSOLUTE).
 */

import { useState } from 'react'
import { Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, BadgeCheck, Star } from 'lucide-react-native'
import { radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { getDoctor, getDoctorPosts, getDoctorRatings, type DoctorPost, type ScheduleRow } from '@/lib/api'
import { useQuery } from '@/lib/use-query'
import { Chip, PillButton } from '@/components/press'
import { Avatar } from '@/components/avatar'
import { SkeletonBlock } from '@/components/skeleton'
import { OfflineBanner } from '@/components/offline-banner'
import { buildShareCard, openWhatsApp } from '@/lib/share'
import { SlotSheet } from '@/components/booking/slot-sheet'
import { DoctorPostsZone, PostSheet, RatingTextureRows } from '@/components/doctor-depth'

const WEEK_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function DoctorProfileScreen() {
  const c = useColors()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const doctorId = typeof id === 'string' ? id : ''

  const [bookSheetOpen, setBookSheetOpen] = useState(false)
  const [openPost, setOpenPost] = useState<DoctorPost | null>(null)

  // SWR 10-min (spec S5). Cache survives back-and-forth navigation.
  const q = useQuery(
    doctorId ? `doctor:${doctorId}` : 'doctor:none',
    () => getDoctor(doctorId),
    { staleTime: 600_000 },
  )
  const d = q.data

  // B7-P2 secondary zones (parallel, cached 10 min, CDN-cached 60s
  // server-side). Errors never surface a banner — zones hide.
  const rq = useQuery(
    doctorId ? `doctor-ratings:${doctorId}` : 'doctor-ratings:none',
    () => getDoctorRatings(doctorId),
    { staleTime: 600_000 },
  )
  const pq = useQuery(
    doctorId ? `doctor-posts:${doctorId}` : 'doctor-posts:none',
    () => getDoctorPosts(doctorId),
    { staleTime: 600_000 },
  )

  if (!doctorId) {
    return (
      <View style={[styles.screen, { backgroundColor: c.canvas }]}>
        <Text style={[styles.errorText, { color: c.ink }]}>Doctor not found.</Text>
        <View style={styles.errorAction}>
          <Chip label="Back to Home" onPress={() => void router.replace('/')} />
        </View>
      </View>
    )
  }

  const shareCard = d ? buildShareCard(d) : ''

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          Platform.OS === 'web' ? undefined : (
            <RefreshControl refreshing={q.refreshing} onRefresh={q.refresh} tintColor={c.ink} />
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
            Doctor
          </Text>
          <View style={styles.topSpacer} />
        </View>

        {q.loading && !d ? (
          <ProfileSkeleton />
        ) : d ? (
          <>
            {q.error ? (
              <View style={styles.bannerWrap}>
                <OfflineBanner onRetry={q.refresh} />
              </View>
            ) : null}

            {/* Identity block */}
            <View style={styles.identity}>
              <View style={styles.identityMedia}>
                {d.photo ? (
                  <Image
                    source={{ uri: d.photo }}
                    style={[styles.photo, { backgroundColor: c.canvasSoft }]}
                    accessibilityLabel={`${d.name} photo`}
                  />
                ) : (
                  <Avatar name={d.name} size={72} />
                )}
                {d.registration ? (
                  <View style={[styles.regChip, { backgroundColor: c.tealLiveSoft }]}>
                    <BadgeCheck size={13} color={c.tealLive} strokeWidth={2.2} />
                    <Text style={[styles.regChipText, { color: c.tealLive }]} numberOfLines={1}>
                      Reg. {d.registration}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.identityCol}>
                <Text style={[styles.name, { color: c.ink }]}>{d.name}</Text>
                <Text style={[styles.spec, { color: c.body }]}>{d.specialization || 'Doctor'}</Text>
                <Text style={[styles.quietLine, { color: c.mute }]}>
                  {[
                    d.experience ? `${d.experience} yrs` : '',
                    d.education ? d.education : '',
                    [d.city, d.state].filter(Boolean).join(', '),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
            </View>

            {/* Fee block — the number is BIG (honesty through scale) */}
            <View style={[styles.feeBlock, { backgroundColor: c.canvasSoft }]}>
              <View style={styles.feeRow}>
                <Text style={[styles.fee, { color: c.ink }]}>₹{d.fees.toLocaleString('en-IN')}</Text>
                <Text style={[styles.feeCaption, { color: c.body }]}>first visit</Text>
              </View>
              <Text style={[styles.feeNote, { color: c.mute }]}>Pay at the clinic — no advance payment.</Text>
            </View>

            {/* Timing table — 7-day fixed grid */}
            <Text style={[styles.sectionTitle, { color: c.ink }]}>Clinic hours</Text>
            <View style={[styles.timingCard, { borderColor: c.hairline }]}>
              {WEEK_ORDER.map((day) => {
                const row = scheduleForDay(d.schedules, day)
                return (
                  <View key={day} style={styles.timingRow}>
                    <Text style={[styles.timingDay, { color: !row ? c.mute : c.ink }]}>{day}</Text>
                    {row ? (
                      <Text style={[styles.timingHours, { color: c.body }]} numberOfLines={1}>
                        {row.start} – {row.end}
                      </Text>
                    ) : (
                      <Text style={[styles.timingClosedText, { color: c.mute }]}>Closed</Text>
                    )}
                  </View>
                )
              })}
            </View>

            {/* Ratings summary + sub-rating texture — only when real
                (honesty law; unrated dimensions never render) */}
            {d.ratingCount > 0 ? (
              <>
                <Text style={[styles.sectionTitle, { color: c.ink }]}>Ratings</Text>
                <View style={[styles.ratingCard, { borderColor: c.hairline }]}>
                  <View style={styles.ratingHeadRow}>
                    <Star size={16} color={c.ink} strokeWidth={2.2} fill={c.ink} />
                    <Text style={[styles.ratingText, { color: c.ink }]}>
                      {d.rating.toFixed(1)} · {d.ratingCount} {d.ratingCount === 1 ? 'review' : 'reviews'}
                    </Text>
                  </View>
                  {rq.data ? <RatingTextureRows texture={rq.data} /> : null}
                </View>
              </>
            ) : null}

            {/* Quiet stats — real API numbers only */}
            <Text style={[styles.quietStat, { color: c.mute }]}>
              {d.totalAppointments} visits · {d.totalPatients} patients on Aturseva
            </Text>

            {/* Practices-at */}
            {d.hospitals.length > 0 ? (
              <>
                <Text style={[styles.sectionTitle, { color: c.ink }]}>Practices at</Text>
                <View style={[styles.hospitalCard, { borderColor: c.hairline }]}>
                  {d.hospitals.map((h) => (
                    <View key={h.id} style={styles.hospitalRow}>
                      <Text style={[styles.hospitalName, { color: c.ink }]} numberOfLines={1}>
                        {h.name}
                      </Text>
                      {h.city ? (
                        <Text style={[styles.hospitalCity, { color: c.mute }]} numberOfLines={1}>
                          {h.city}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </>
            ) : null}

            {/* Description — only when the doctor wrote one */}
            {d.description ? (
              <>
                <Text style={[styles.sectionTitle, { color: c.ink }]}>About</Text>
                <Text style={[styles.aboutText, { color: c.body }]}>{d.description}</Text>
              </>
            ) : null}

            {/* Health tips — the doctor's published posts (hide-if-empty
                ABSOLUTE: guest/error/empty renders NOTHING) */}
            <DoctorPostsZone posts={pq.data ?? []} onOpen={(p) => setOpenPost(p)} />

            {/* Share row — WhatsApp text card, zero login */}
            <View style={styles.shareRow}>
              <PillButton
                label="Share on WhatsApp"
                variant="secondary"
                height={44}
                onPress={() => void openWhatsApp(shareCard)}
              />
            </View>

            <View style={styles.scrollBottomPad} />
          </>
        ) : q.error ? (
          <View style={styles.errorWrap}>
            <Text style={[styles.errorText, { color: c.ink }]}>Could not load this doctor.</Text>
            <Text style={[styles.errorCaption, { color: c.mute }]}>{q.error.message}</Text>
            <View style={styles.errorAction}>
              <Chip label="Try again" onPress={q.refresh} />
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky bottom CTA — fee in the button, safe-area padded (S5 law).
          B3: opens the S6 slot sheet (the golden journey's first step). */}
      {d ? (
        <View style={[styles.ctaBar, { borderTopColor: c.hairline, backgroundColor: c.canvas }]}>
          <PillButton
            label={`Book appointment — ₹${d.fees.toLocaleString('en-IN')}`}
            height={56}
            onPress={() => setBookSheetOpen(true)}
          />
        </View>
      ) : null}

      {/* B7-P2 · Post reader sheet — the task never leaves the screen */}
      <PostSheet post={openPost} onClose={() => setOpenPost(null)} />

      {/* S6 slot sheet — live inventory over the profile */}
      {d ? (
        <SlotSheet
          visible={bookSheetOpen}
          onClose={() => setBookSheetOpen(false)}
          doctor={{ userId: doctorId, name: d.name, specialization: d.specialization, fees: d.fees }}
          onConfirm={(date, time) => {
            setBookSheetOpen(false)
            void router.push({
              pathname: '/doctor/[id]/book',
              params: { id: doctorId, date, time, name: d.name, spec: d.specialization, fee: String(d.fees) },
            })
          }}
        />
      ) : null}
    </View>
  )
}

function scheduleForDay(schedules: ScheduleRow[], day: string): ScheduleRow | null {
  return schedules.find((s) => s.day.toLowerCase() === day.toLowerCase()) ?? null
}

function ProfileSkeleton() {
  const c = useColors()
  return (
    <View style={styles.skelCol}>
      <View style={styles.skelIdentity}>
        <View style={[styles.skelAvatar, { backgroundColor: c.canvasSoft }]} />
        <View style={styles.skelIdentityRails}>
          <SkeletonBlock width="70%" height={18} />
          <SkeletonBlock width="45%" height={12} radiusValue={radius.pill} />
          <SkeletonBlock width="60%" height={10} radiusValue={radius.pill} />
        </View>
      </View>
      <SkeletonBlock width="45%" height={34} />
      <SkeletonBlock width={240} height={12} radiusValue={radius.pill} />
      <SkeletonBlock width="100%" height={230} />
      <SkeletonBlock width="55%" height={12} radiusValue={radius.pill} />
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
    marginBottom: space.s8,
  },
  identity: {
    flexDirection: 'row',
    gap: space.s16,
    alignItems: 'center',
    marginHorizontal: space.s16,
    marginTop: space.s8,
  },
  identityMedia: {
    alignItems: 'center',
    gap: space.s8,
  },
  identityCol: {
    flex: 1,
    gap: 3,
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: radius.card,
  },
  regChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: space.s8,
    paddingVertical: 3,
    maxWidth: 116,
  },
  regChipText: {
    ...typo.caption,
    fontWeight: '600',
  },
  name: {
    ...typo.title,
    fontSize: 22,
  },
  spec: {
    ...typo.body,
  },
  quietLine: {
    ...typo.caption,
  },
  feeBlock: {
    marginHorizontal: space.s16,
    marginTop: space.s24,
    borderRadius: radius.card,
    padding: space.s16,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.s8,
  },
  fee: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  feeCaption: {
    ...typo.caption,
  },
  feeNote: {
    ...typo.caption,
    marginTop: 4,
  },
  sectionTitle: {
    ...typo.bodyStrong,
    marginHorizontal: space.s16,
    marginTop: space.s24,
    marginBottom: space.s8,
  },
  timingCard: {
    marginHorizontal: space.s16,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.s16,
    gap: space.s8,
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    minHeight: TOUCH - 20,
  },
  timingDay: {
    ...typo.body,
  },
  timingHours: {
    ...typo.body,
    fontVariant: ['tabular-nums'],
  },
  timingClosedText: {
    ...typo.caption,
  },
  ratingCard: {
    marginHorizontal: space.s16,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.s16,
  },
  ratingHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
  },
  ratingText: {
    ...typo.bodyStrong,
    fontVariant: ['tabular-nums'],
  },
  quietStat: {
    ...typo.caption,
    marginHorizontal: space.s16,
    marginTop: space.s12,
    fontVariant: ['tabular-nums'],
  },
  hospitalCard: {
    marginHorizontal: space.s16,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.s16,
    gap: space.s8,
  },
  hospitalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: space.s8,
  },
  hospitalName: {
    ...typo.body,
    flex: 1,
  },
  hospitalCity: {
    ...typo.caption,
  },
  aboutText: {
    ...typo.body,
    marginHorizontal: space.s16,
  },
  shareRow: {
    marginHorizontal: space.s16,
    marginTop: space.s24,
  },
  scrollBottomPad: {
    height: space.s24,
  },
  ctaBar: {
    paddingHorizontal: space.s16,
    paddingTop: space.s8,
    // B11: 12→20px under the 56px pill (VLM-measured tight clearance —
    // the sticky CTA deserves breathing room above the viewport edge).
    paddingBottom: space.s20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  errorWrap: {
    padding: space.s24,
    alignItems: 'center',
    gap: space.s8,
  },
  errorText: {
    ...typo.title,
    textAlign: 'center',
  },
  errorCaption: {
    ...typo.caption,
    textAlign: 'center',
  },
  errorAction: {
    marginTop: space.s8,
    alignItems: 'center',
  },
  skelCol: {
    marginHorizontal: space.s16,
    marginTop: space.s8,
    gap: space.s12,
  },
  skelIdentity: {
    flexDirection: 'row',
    gap: space.s16,
    alignItems: 'center',
  },
  skelAvatar: {
    width: 96,
    height: 96,
    borderRadius: radius.card,
  },
  skelIdentityRails: {
    flex: 1,
    gap: space.s8,
  },
})
