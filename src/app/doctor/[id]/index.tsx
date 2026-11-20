/**
 * S5 · DOCTOR PROFILE (doc 06 S5) — APK-B2 (+B3 wiring).
 *
 * Layout: back bar → identity block (avatar/photo, name, spec, Reg
 * chip, experience, education) → FEE block (big, tabular, first-visit
 * caption — honesty through scale) → 7-day timing table → ratings
 * summary (only when real) → quiet stats → practices-at →
 * description → share row → sticky bottom CTA "Book appointment — ₹300".
 * B3: the CTA opens the S6 slot sheet (live inventory); Confirm slot
 * pushes S7 (the confirm step) — the golden journey starts here.
 * Data: /api/doctors/[id] (doc 08 #2, SWR 10min via useQuery cache).
 */

import { useState } from 'react'
import { Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, BadgeCheck, Star } from 'lucide-react-native'
import { colors, radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { getDoctor, type ScheduleRow } from '@/lib/api'
import { useQuery } from '@/lib/use-query'
import { Chip, PillButton } from '@/components/press'
import { Avatar } from '@/components/avatar'
import { SkeletonBlock } from '@/components/skeleton'
import { OfflineBanner } from '@/components/offline-banner'
import { buildShareCard, openWhatsApp } from '@/lib/share'
import { SlotSheet } from '@/components/booking/slot-sheet'

const WEEK_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function DoctorProfileScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const doctorId = typeof id === 'string' ? id : ''

  const [bookSheetOpen, setBookSheetOpen] = useState(false)

  // SWR 10-min (spec S5). Cache survives back-and-forth navigation.
  const q = useQuery(
    doctorId ? `doctor:${doctorId}` : 'doctor:none',
    () => getDoctor(doctorId),
    { staleTime: 600_000 },
  )
  const d = q.data

  if (!doctorId) {
    return (
      <View style={styles.screen}>
        <Text style={styles.errorText}>Doctor not found.</Text>
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
            <RefreshControl refreshing={q.refreshing} onRefresh={q.refresh} tintColor="#0A0A0A" />
          )
        }
      >
        {/* Back bar */}
        <View style={styles.topBar}>
          <View style={styles.backBtn}>
            <Chip
              label="Back"
              leading={<ChevronLeft size={16} color={colors.ink} strokeWidth={2} />}
              onPress={() => void router.back()}
            />
          </View>
          <Text style={styles.topTitle} numberOfLines={1}>
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
                  <Image source={{ uri: d.photo }} style={styles.photo} accessibilityLabel={`${d.name} photo`} />
                ) : (
                  <Avatar name={d.name} size={72} />
                )}
                {d.registration ? (
                  <View style={styles.regChip}>
                    <BadgeCheck size={13} color={colors.tealLive} strokeWidth={2.2} />
                    <Text style={styles.regChipText} numberOfLines={1}>
                      Reg. {d.registration}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.identityCol}>
                <Text style={styles.name}>{d.name}</Text>
                <Text style={styles.spec}>{d.specialization || 'Doctor'}</Text>
                <Text style={styles.quietLine}>
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
            <View style={styles.feeBlock}>
              <View style={styles.feeRow}>
                <Text style={styles.fee}>₹{d.fees.toLocaleString('en-IN')}</Text>
                <Text style={styles.feeCaption}>first visit</Text>
              </View>
              <Text style={styles.feeNote}>Pay at the clinic — no advance payment.</Text>
            </View>

            {/* Timing table — 7-day fixed grid */}
            <Text style={styles.sectionTitle}>Clinic hours</Text>
            <View style={styles.timingCard}>
              {WEEK_ORDER.map((day) => {
                const row = scheduleForDay(d.schedules, day)
                return (
                  <View key={day} style={styles.timingRow}>
                    <Text style={[styles.timingDay, !row && styles.timingClosed]}>{day}</Text>
                    {row ? (
                      <Text style={styles.timingHours} numberOfLines={1}>
                        {row.start} – {row.end}
                      </Text>
                    ) : (
                      <Text style={styles.timingClosedText}>Closed</Text>
                    )}
                  </View>
                )
              })}
            </View>

            {/* Ratings summary — only when real (honesty law) */}
            {d.ratingCount > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Ratings</Text>
                <View style={styles.ratingCard}>
                  <Star size={16} color={colors.ink} strokeWidth={2.2} fill={colors.ink} />
                  <Text style={styles.ratingText}>
                    {d.rating.toFixed(1)} · {d.ratingCount} {d.ratingCount === 1 ? 'review' : 'reviews'}
                  </Text>
                </View>
              </>
            ) : null}

            {/* Quiet stats — real API numbers only */}
            <Text style={styles.quietStat}>
              {d.totalAppointments} visits · {d.totalPatients} patients on Aturseva
            </Text>

            {/* Practices-at */}
            {d.hospitals.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Practices at</Text>
                <View style={styles.hospitalCard}>
                  {d.hospitals.map((h) => (
                    <View key={h.id} style={styles.hospitalRow}>
                      <Text style={styles.hospitalName} numberOfLines={1}>
                        {h.name}
                      </Text>
                      {h.city ? (
                        <Text style={styles.hospitalCity} numberOfLines={1}>
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
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.aboutText}>{d.description}</Text>
              </>
            ) : null}

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
            <Text style={styles.errorText}>Could not load this doctor.</Text>
            <Text style={styles.errorCaption}>{q.error.message}</Text>
            <View style={styles.errorAction}>
              <Chip label="Try again" onPress={q.refresh} />
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky bottom CTA — fee in the button, safe-area padded (S5 law).
          B3: opens the S6 slot sheet (the golden journey's first step). */}
      {d ? (
        <View style={styles.ctaBar}>
          <PillButton
            label={`Book appointment — ₹${d.fees.toLocaleString('en-IN')}`}
            height={56}
            onPress={() => setBookSheetOpen(true)}
          />
        </View>
      ) : null}

      {/* S6 slot sheet — live inventory over the profile */}
      {d ? (
        <SlotSheet
          visible={bookSheetOpen}
          onClose={() => setBookSheetOpen(false)}
          doctor={{ userId: doctorId, name: d.name, specialization: d.specialization, fees: d.fees }}
          onConfirm={(date, time) => {
            setBookSheetOpen(false)
            void router.push({
              pathname: `/doctor/${doctorId}/book`,
              params: { date, time, name: d.name, spec: d.specialization, fee: String(d.fees) },
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
  return (
    <View style={styles.skelCol}>
      <View style={styles.skelIdentity}>
        <View style={styles.skelAvatar} />
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
    backgroundColor: colors.canvasSoft,
  },
  regChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tealLiveSoft,
    borderRadius: radius.pill,
    paddingHorizontal: space.s8,
    paddingVertical: 3,
    maxWidth: 116,
  },
  regChipText: {
    ...typo.caption,
    color: colors.tealLive,
    fontWeight: '600',
  },
  name: {
    ...typo.title,
    color: colors.ink,
    fontSize: 22,
  },
  spec: {
    ...typo.body,
    color: colors.body,
  },
  quietLine: {
    ...typo.caption,
    color: colors.mute,
  },
  feeBlock: {
    marginHorizontal: space.s16,
    marginTop: space.s24,
    backgroundColor: colors.canvasSoft,
    borderRadius: radius.card,
    padding: space.s16,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.s8,
  },
  fee: {
    color: colors.ink,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  feeCaption: {
    ...typo.caption,
    color: colors.body,
  },
  feeNote: {
    ...typo.caption,
    color: colors.mute,
    marginTop: 4,
  },
  sectionTitle: {
    ...typo.bodyStrong,
    color: colors.ink,
    marginHorizontal: space.s16,
    marginTop: space.s24,
    marginBottom: space.s8,
  },
  timingCard: {
    marginHorizontal: space.s16,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
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
    color: colors.ink,
  },
  timingHours: {
    ...typo.body,
    color: colors.body,
    fontVariant: ['tabular-nums'],
  },
  timingClosed: {
    color: colors.mute,
  },
  timingClosedText: {
    ...typo.caption,
    color: colors.mute,
  },
  ratingCard: {
    marginHorizontal: space.s16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    padding: space.s16,
  },
  ratingText: {
    ...typo.bodyStrong,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  quietStat: {
    ...typo.caption,
    color: colors.mute,
    marginHorizontal: space.s16,
    marginTop: space.s12,
    fontVariant: ['tabular-nums'],
  },
  hospitalCard: {
    marginHorizontal: space.s16,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
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
    color: colors.ink,
    flex: 1,
  },
  hospitalCity: {
    ...typo.caption,
    color: colors.mute,
  },
  aboutText: {
    ...typo.body,
    color: colors.body,
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
    paddingBottom: space.s12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    backgroundColor: colors.canvas,
  },
  errorWrap: {
    padding: space.s24,
    alignItems: 'center',
    gap: space.s8,
  },
  errorText: {
    ...typo.title,
    color: colors.ink,
    textAlign: 'center',
  },
  errorCaption: {
    ...typo.caption,
    color: colors.mute,
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
    backgroundColor: colors.canvasSoft,
  },
  skelIdentityRails: {
    flex: 1,
    gap: space.s8,
  },
})
