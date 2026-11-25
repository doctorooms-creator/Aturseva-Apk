/**
 * S5 · DOCTOR PROFILE — REDESIGN (doc 24 §9 owner fidelity directive).
 *
 * The screen renders EXACTLY the owner's Figma frame 25:4 "Doctors
 * Profile": gradient-tone profile background → Ø44 back circle header →
 * hero (rating + fee pills, name, specialty, outlined Message button on
 * the left; cutout photo block anchored right whose bottom layer-overs
 * the frosted glass stats card) → 3-column real-number stats strip →
 * About / Reviews / Availability tabs (ink underline on a hairline) →
 * About tab (bio with see-more + Reviews & Ratings summary with the
 * huge Geist-800 rating) → Reviews tab (texture + histogram + patient
 * reviews, restyled) → Availability tab (7-day clinic hours, restyled)
 * → sticky "Book Now" stadium CTA. The frame IS the screen: related
 * doctors / posts / procedures / services / awards / share zones are
 * intentionally absent (frame authority law).
 *
 * Every number is REAL (DoctorProfile contract — nothing fabricated):
 * the stats strip ALWAYS renders 3 columns — experience → totalPatients
 * → ratingCount (fallbacks totalAppointments → hospitals, honestly
 * labeled, one winner per slot; a real 0 renders, never hides). The
 * booking journey is untouched: the CTA opens the S6 SlotSheet and
 * Confirm pushes S7 with the same 8 params.
 *
 * Scaling: 390-frame px → rdScale() × useV4() s (the 426 law). Font:
 * Geist (owner's website-consistency decision). Skin: rd/rdDark
 * (src/lib/redesign.ts) — Figma-verbatim light, mirrored dark.
 */

import { useMemo, useState } from 'react'
import { Alert, Image, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getDoctor, getDoctorRatings, type DoctorProfile, type DoctorReview, type ScheduleRow } from '@/lib/api'
import { useQuery } from '@/lib/use-query'
import { useTheme } from '@/lib/theme'
import { Chip } from '@/components/press'
import { SkeletonBlock } from '@/components/skeleton'
import { OfflineBanner } from '@/components/offline-banner'
import { SlotSheet } from '@/components/booking/slot-sheet'
import { useV4 } from '@/components/home4/v4'
import { rd, rdDark, rdScale } from '@/lib/redesign'
import { RdBack, RdRupeeCircle, RdStar, RdStarHalf } from '@/components/redesign/icons'

const WEEK_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const TEXTURE_ROWS: { key: 'consultation' | 'waitTime' | 'staff'; label: string }[] = [
  { key: 'consultation', label: 'Consultation' },
  { key: 'waitTime', label: 'Wait time' },
  { key: 'staff', label: 'Staff' },
]

const TABS = [
  { key: 'about', label: 'About' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'availability', label: 'Availability' },
] as const
type TabKey = (typeof TABS)[number]['key']

/** rd/rdDark share one shape (redesign.ts) — the skin palette type. */
type RdPalette = { [K in keyof typeof rd]: string }

function scheduleForDay(schedules: ScheduleRow[], day: string): ScheduleRow | null {
  return schedules.find((s) => s.day.toLowerCase() === day.toLowerCase()) ?? null
}

function reviewMeta(r: DoctorReview): string {
  const date = r.createdAt
    ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''
  return [r.patientName, date].filter(Boolean).join(' · ')
}

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '?'
  )
}

/**
 * Stats strip mapping — REAL DoctorProfile fields only, and EXACTLY
 * three columns (FIX-2 E2E catch: the old hide-if-zero law collapsed
 * real profiles — QA doctors with 0 patients and 0 reviews — to a
 * 2-column strip). The frame is Experience / Patients / Reviews:
 * — Experience: the raw contract string ("8" renders "8 years").
 * — Patients: the real totalPatients; when the HMS carries no patient
 *   count yet, the next REAL count fills the slot, honestly labeled
 *   (Visits = totalAppointments, Clinics = hospitals) — one winner per
 *   slot, so no two columns ever repeat the same count.
 * — Reviews: ratingCount; a real 0 is honest and stays a column.
 */
function statColumns(d: DoctorProfile): { value: string; label: string }[] {
  const fmt = (n: number) => n.toLocaleString('en-IN')
  const expRaw = (d.experience ?? '').trim()
  const expNum = /^\d+/.exec(expRaw)
  const experience = expNum ? `${expNum[0]} years` : expRaw || '—'
  const patients =
    d.totalPatients > 0
      ? { value: fmt(d.totalPatients), label: 'Patients' }
      : d.totalAppointments > 0
        ? { value: fmt(d.totalAppointments), label: 'Visits' }
        : d.hospitals.length > 0
          ? { value: fmt(d.hospitals.length), label: 'Clinics' }
          : { value: fmt(d.totalPatients), label: 'Patients' }
  return [
    { value: experience, label: 'Experience' },
    patients,
    { value: fmt(d.ratingCount), label: 'Reviews' },
  ]
}

/** The big summary star row: full = floor(rating), half when the
 * fraction ≥ 0.25, rest on the #D9D9D9 track (frame law). */
function BigStarRow({ rating, starSize, gap, gold, track }: { rating: number; starSize: number; gap: number; gold: string; track: string }) {
  const full = Math.floor(rating)
  const frac = rating - full
  return (
    <View style={{ flexDirection: 'row', gap }}>
      {[1, 2, 3, 4, 5].map((i) =>
        i <= full ? (
          <RdStar key={i} size={starSize} color={gold} />
        ) : i === full + 1 && frac >= 0.25 ? (
          <RdStarHalf key={i} size={starSize} color={gold} track={track} />
        ) : (
          <RdStar key={i} size={starSize} color={track} />
        ),
      )}
    </View>
  )
}

/** Per-review star row (Reviews tab) — gold fills on the gray track. */
function ReviewStars({ star, starSize, gap, gold, track }: { star: number; starSize: number; gap: number; gold: string; track: string }) {
  return (
    <View style={{ flexDirection: 'row', gap }} accessibilityLabel={`${star} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <RdStar key={i} size={starSize} color={i <= star ? gold : track} />
      ))}
    </View>
  )
}

export default function DoctorProfileScreen() {
  const s = useV4()
  const { resolved } = useTheme()
  const dark = resolved === 'dark'
  const P: RdPalette = dark ? rdDark : rd
  const body = dark ? '#B9B9B7' : '#4A4A48'
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const doctorId = typeof id === 'string' ? id : ''

  const [bookSheetOpen, setBookSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('about')
  const [bioExpanded, setBioExpanded] = useState(false)
  /** Measured hero-left height — guarantees the stats card never slides
   * under the Message button when the name wraps (frame geometry holds
   * for every real name length). */
  const [leftH, setLeftH] = useState(0)

  // SWR 10-min (spec S5) — cache survives back-and-forth navigation.
  const q = useQuery(
    doctorId ? `doctor:${doctorId}` : 'doctor:none',
    () => getDoctor(doctorId),
    { staleTime: 600_000 },
  )
  const d = q.data

  // Secondary zone (parallel, cached 10 min): rating texture for the
  // Reviews tab. Errors never break the profile — the rows hide.
  const rq = useQuery(
    doctorId ? `doctor-ratings:${doctorId}` : 'doctor-ratings:none',
    () => getDoctorRatings(doctorId),
    { staleTime: 600_000 },
  )

  const { st, z } = useMemo(() => {
    const z = (px: number) => rdScale(px) * s
    return { st: mkStyles(z, P, body), z }
  }, [s, P, body])

  // Hero geometry (frame 390-px values): photo block 43% × 224 with a
  // rounded top-right corner, its bottom overlapping the glass card top
  // by 30; the spacer keeps the card below the left column on wrap.
  const photoH = z(224)
  const cardOverlap = z(30)
  const slotH = Math.max(photoH, leftH > 0 ? leftH + cardOverlap + z(8) : photoH)

  if (!doctorId) {
    return (
      <View style={[st.screen, st.errorWrap]}>
        <Text style={st.errorText}>Doctor not found.</Text>
        <View style={st.errorAction}>
          <Chip label="Back to Home" onPress={() => void router.replace('/')} />
        </View>
      </View>
    )
  }

  const hasRating = d ? d.ratingCount > 0 && d.rating > 0 : false
  const cols = d ? statColumns(d) : []

  const renderTab = () => {
    if (!d) return null
    if (activeTab === 'about') {
      const bioLong = d.description.length > 190
      const showBio = Boolean(d.description)
      const showRr = d.ratingCount > 0
      return (
        <View style={st.tabBody}>
          {showBio ? (
            <>
              <Text style={st.h2}>About the doctor</Text>
              <Text style={st.bio} numberOfLines={bioExpanded ? undefined : 4}>
                {d.description}
              </Text>
              {bioLong ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setBioExpanded((v) => !v)}
                  style={st.seeMoreBtn}
                >
                  <Text style={st.seeMore}>{bioExpanded ? 'see less' : 'see more…'}</Text>
                </Pressable>
              ) : null}
            </>
          ) : null}
          {showRr ? (
            <View style={st.rrSection}>
              <View style={st.rrHead}>
                <Text style={st.h2}>Reviews &amp; Ratings</Text>
                <View style={st.countBadge}>
                  <Text style={st.countText}>{d.ratingCount.toLocaleString('en-IN')}</Text>
                </View>
              </View>
              <View style={st.bigRow}>
                <Text style={st.bigRating}>{d.rating.toFixed(1)}</Text>
                <View>
                  <BigStarRow rating={d.rating} starSize={z(26)} gap={z(4)} gold={P.gold} track={P.halfStarTrack} />
                  <Text style={st.starCaption}>Overall Ratings</Text>
                </View>
              </View>
            </View>
          ) : null}
          {!showBio && !showRr ? <Text style={st.emptyLine}>Details coming soon.</Text> : null}
        </View>
      )
    }
    if (activeTab === 'reviews') {
      const texture = rq.data
      const textureRows = texture ? TEXTURE_ROWS.filter((r) => texture[r.key] > 0) : []
      const dist = d.starDistribution
      const showDist = dist.length >= 2
      const reviews = d.reviews
      if (textureRows.length === 0 && !showDist && reviews.length === 0) {
        return (
          <View style={st.tabBody}>
            <Text style={st.emptyLine}>No reviews yet — they appear after patients rate their visits.</Text>
          </View>
        )
      }
      return (
        <View style={st.tabBody}>
          <View style={st.listCard}>
            {textureRows.length > 0 ? (
              <View style={st.listGroup}>
                {textureRows.map((r, idx) => (
                  <View key={r.key} style={idx > 0 ? st.hairRow : st.listRow}>
                    <Text style={st.listLabel}>{r.label}</Text>
                    <Text style={st.listValue}>{texture ? texture[r.key].toFixed(1) : ''} / 5</Text>
                  </View>
                ))}
                {texture && texture.ratedCount > 0 ? (
                  <Text style={st.textureCaption}>
                    Rated by {texture.ratedCount.toLocaleString('en-IN')}{' '}
                    {texture.ratedCount === 1 ? 'patient' : 'patients'} after their visits
                  </Text>
                ) : null}
              </View>
            ) : null}
            {showDist ? (
              <View style={st.listGroup}>
                {dist.map((row, idx) => (
                  <View key={row.star} style={idx > 0 ? st.hairRow : st.listRow}>
                    <Text style={st.listLabel}>{row.star}★</Text>
                    <Text style={st.listValue}>
                      {row.count.toLocaleString('en-IN')} {row.count === 1 ? 'rating' : 'ratings'}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
            {reviews.length > 0 ? (
              <View style={st.listGroup}>
                {reviews.map((r) => (
                  <View
                    key={r.id}
                    style={st.reviewRow}
                    accessibilityLabel={`Review by ${r.isAnonymous ? 'an anonymous patient' : r.patientName}: ${r.star} out of 5`}
                  >
                    <ReviewStars star={r.star} starSize={z(13)} gap={z(3)} gold={P.gold} track={P.halfStarTrack} />
                    {r.review ? <Text style={st.reviewText}>{r.review}</Text> : null}
                    <Text style={st.reviewMeta} numberOfLines={1}>
                      {reviewMeta(r)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      )
    }
    // availability
    if (d.schedules.length === 0) {
      return (
        <View style={st.tabBody}>
          <Text style={st.emptyLine}>Clinic hours not shared yet.</Text>
        </View>
      )
    }
    return (
      <View style={st.tabBody}>
        <View style={st.listCard}>
          {WEEK_ORDER.map((day, idx) => {
            const row = scheduleForDay(d.schedules, day)
            return (
              <View key={day} style={idx > 0 ? st.hairRow : st.listRow}>
                <Text style={st.dayText}>{day}</Text>
                {row ? (
                  <Text style={st.hoursText}>
                    {row.start} – {row.end}
                  </Text>
                ) : (
                  <Text style={st.closedText}>Closed</Text>
                )}
              </View>
            )
          })}
        </View>
      </View>
    )
  }

  return (
    <View style={st.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: z(90) + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          Platform.OS === 'web' ? undefined : (
            <RefreshControl refreshing={q.refreshing} onRefresh={q.refresh} tintColor={P.ink} />
          )
        }
      >
        {/* 1 · Header — Ø44 back circle + frame title */}
        <View style={st.header}>
          <Pressable
            style={st.backCircle}
            onPress={() => void router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={6}
          >
            {/* FIX-2: frame-verbatim ink arrow — the skin's P.ink flips to
                #F5F5F5 in dark, unreadable on the white circle. */}
            <RdBack size={z(18)} color={rd.ink} />
          </Pressable>
          <Text style={st.headerTitle}>Doctors Profile</Text>
        </View>

        {q.loading && !d ? (
          <ProfileSkeleton />
        ) : d ? (
          <>
            {q.error ? (
              <View style={st.bannerWrap}>
                <OfflineBanner onRetry={q.refresh} />
              </View>
            ) : null}

            {/* 2 · Hero + 3 · glass stats card (photo layers over the
                card top — absolute last child paints above it). */}
            <View style={st.heroZone}>
              <View style={st.heroRow}>
                <View style={st.heroLeft} onLayout={(e) => setLeftH(e.nativeEvent.layout.height)}>
                  <View style={st.pillRow}>
                    {hasRating ? (
                      <View style={st.pill}>
                        <RdStar size={z(13)} color={P.gold} />
                        <Text style={st.pillText}>{d.rating.toFixed(1)}</Text>
                      </View>
                    ) : null}
                    {d.fees > 0 ? (
                      <View style={st.pill}>
                        <RdRupeeCircle size={z(14)} />
                        <Text style={st.pillText}>₹{d.fees.toLocaleString('en-IN')}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={st.name} numberOfLines={2}>
                    {d.name}
                  </Text>
                  <Text style={st.spec} numberOfLines={2}>
                    {d.specialization || 'Doctor'}
                  </Text>
                  <Pressable
                    style={st.messageBtn}
                    onPress={() => Alert.alert('Aturseva', 'Message feature jald aa raha hai')}
                    accessibilityRole="button"
                    accessibilityLabel="Message the doctor"
                  >
                    <Text style={st.messageText}>Message</Text>
                  </Pressable>
                </View>
                <View style={{ width: '43%', height: slotH }} />
              </View>

              <View style={st.statsCard}>
                {cols.map((col) => (
                  <View key={col.label} style={st.statCol}>
                    <Text style={st.statValue}>{col.value}</Text>
                    <Text style={st.statLabel}>{col.label}</Text>
                  </View>
                ))}
              </View>

              {d.photo ? (
                <Image
                  source={{ uri: d.photo }}
                  style={[st.photo, { height: photoH }]}
                  resizeMode="cover"
                  accessibilityLabel={d.photoRepresentative ? `${d.name} — representative photo` : `${d.name} photo`}
                />
              ) : (
                <View style={[st.photo, st.photoFallback, { height: photoH }]}>
                  <View style={st.monoCircle}>
                    <Text style={st.monoText}>{initialsOf(d.name)}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* 4 · Tabs — ink indicator on a full-width hairline */}
            <View style={st.tabsRow}>
              {TABS.map((t) => {
                const active = activeTab === t.key
                return (
                  <Pressable
                    key={t.key}
                    style={st.tab}
                    onPress={() => setActiveTab(t.key)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={active ? st.tabTextActive : st.tabText}>{t.label}</Text>
                    <View style={active ? st.tabBar : st.tabBarGhost} />
                  </Pressable>
                )
              })}
            </View>

            {/* 5-7 · Tab content */}
            {renderTab()}
          </>
        ) : q.error ? (
          <View style={st.errorWrap}>
            <Text style={st.errorText}>Could not load this doctor.</Text>
            <Text style={st.errorCaption}>{q.error.message}</Text>
            <View style={st.errorAction}>
              <Chip label="Try again" onPress={q.refresh} />
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* 8 · Sticky CTA — opens the S6 slot sheet (golden journey). */}
      {d ? (
        <View pointerEvents="box-none" style={[st.ctaWrap, { marginBottom: insets.bottom }]}>
          <Pressable
            style={st.ctaBtn}
            onPress={() => setBookSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`Book appointment with ${d.name}`}
          >
            <Text style={st.ctaText}>Book Now</Text>
          </Pressable>
        </View>
      ) : null}

      {/* S6 slot sheet — live inventory over the profile (wiring
          identical to the pre-redesign screen: 8-param S7 push). */}
      {d ? (
        <SlotSheet
          visible={bookSheetOpen}
          onClose={() => setBookSheetOpen(false)}
          doctor={{ userId: doctorId, name: d.name, specialization: d.specialization, fees: d.fees, photo: d.photo, photoRepresentative: d.photoRepresentative }}
          onConfirm={(date, time) => {
            setBookSheetOpen(false)
            void router.push({
              pathname: '/doctor/[id]/book',
              params: { id: doctorId, date, time, name: d.name, spec: d.specialization, fee: String(d.fees), photo: d.photo ?? '', rep: d.photoRepresentative ? '1' : '' },
            })
          }}
        />
      ) : null}
    </View>
  )
}

/** Loading state — mirrors the hero/card composition (skeleton law). */
function ProfileSkeleton() {
  const s = useV4()
  const z = (px: number) => rdScale(px) * s
  return (
    <View style={{ paddingHorizontal: z(20), paddingTop: z(14), gap: z(14) }}>
      <View style={{ flexDirection: 'row', gap: z(14), alignItems: 'center' }}>
        <SkeletonBlock width={z(44)} height={z(44)} radiusValue={z(22)} />
        <SkeletonBlock width={z(150)} height={z(16)} radiusValue={z(8)} />
      </View>
      <View style={{ flexDirection: 'row', gap: z(8) }}>
        <SkeletonBlock width={z(86)} height={z(30)} radiusValue={z(15)} />
        <SkeletonBlock width={z(86)} height={z(30)} radiusValue={z(15)} />
      </View>
      <SkeletonBlock width="70%" height={z(24)} radiusValue={z(8)} />
      <SkeletonBlock width="45%" height={z(14)} radiusValue={z(7)} />
      <SkeletonBlock width={z(132)} height={z(46)} radiusValue={z(23)} />
      <SkeletonBlock width="100%" height={z(84)} radiusValue={z(24)} />
    </View>
  )
}

/** The redesign skin — every value is a 390-frame design-px through
 *  z() (rdScale × useV4). Figma-verbatim light, mirrored dark. */
function mkStyles(z: (px: number) => number, P: RdPalette, body: string) {
  const softShadow = {
    shadowColor: '#000000',
    shadowOpacity: 0.07,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
  } as const
  return StyleSheet.create({
    screen: {
      flex: 1,
      // Frame: vertical #F4F4F5 → #EDEDEE gradient; expo-linear-gradient
      // is not a dependency (install forbidden) — the flat top tone.
      backgroundColor: P.profileBgTop,
    },

    // ————— Header —————
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: z(14),
      paddingHorizontal: z(20),
      paddingTop: z(12),
      paddingBottom: z(12),
    },
    backCircle: {
      width: z(44),
      height: z(44),
      borderRadius: z(22),
      // FIX-2 (E2E catch): frame-verbatim WHITE circle, 1px #E8E8E8
      // hairline, soft shadow — in BOTH modes (the skin's P.white flips
      // to #0C0C0C in dark, which read as a dark button).
      backgroundColor: rd.white,
      borderWidth: 1,
      borderColor: rd.border,
      alignItems: 'center',
      justifyContent: 'center',
      ...softShadow,
      elevation: 3,
    },
    headerTitle: {
      fontFamily: 'Geist_600SemiBold',
      fontWeight: '600',
      fontSize: z(17),
      lineHeight: z(22),
      color: P.ink,
    },

    // ————— Hero —————
    heroZone: {
      position: 'relative',
    },
    heroRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    heroLeft: {
      flex: 1,
      paddingTop: z(20),
      paddingLeft: z(20),
      paddingRight: z(14),
    },
    pillRow: {
      flexDirection: 'row',
      gap: z(8),
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: z(5),
      height: z(30),
      borderRadius: z(15),
      backgroundColor: P.white,
      paddingHorizontal: z(11),
      ...softShadow,
      elevation: 2,
    },
    pillText: {
      fontFamily: 'Geist_600SemiBold',
      fontWeight: '600',
      fontSize: z(12.5),
      lineHeight: z(16),
      color: P.ink,
      fontVariant: ['tabular-nums'],
    },
    name: {
      fontFamily: 'Geist_700Bold',
      fontWeight: '700',
      fontSize: z(23),
      lineHeight: z(28),
      color: P.ink,
      marginTop: z(12),
    },
    spec: {
      fontFamily: 'Geist_400Regular',
      fontWeight: '400',
      fontSize: z(14),
      lineHeight: z(18),
      color: P.secondary2,
      marginTop: z(5),
    },
    messageBtn: {
      alignSelf: 'flex-start',
      height: z(46),
      borderRadius: z(23),
      borderWidth: 1.5,
      borderColor: P.ink,
      paddingHorizontal: z(26),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: z(14),
    },
    messageText: {
      fontFamily: 'Geist_500Medium',
      fontWeight: '500',
      fontSize: z(14),
      lineHeight: z(18),
      color: P.ink,
    },

    // ————— Photo block (absolute, right-anchored cutout) —————
    photo: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: '43%',
      borderTopRightRadius: z(24),
      backgroundColor: P.card,
      zIndex: 3,
      elevation: 4,
    },
    photoFallback: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    monoCircle: {
      width: z(120),
      height: z(120),
      borderRadius: z(60),
      backgroundColor: P.white,
      borderWidth: 1,
      borderColor: P.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    monoText: {
      fontFamily: 'Geist_700Bold',
      fontWeight: '700',
      fontSize: z(34),
      color: P.ink,
    },

    // ————— Glass stats card —————
    statsCard: {
      flexDirection: 'row',
      alignItems: 'center',
      height: z(84),
      borderRadius: z(24),
      backgroundColor: P.glass,
      marginHorizontal: z(20),
      marginTop: -z(30),
      paddingHorizontal: z(16),
      paddingTop: z(6),
      zIndex: 1,
      elevation: 2,
      ...softShadow,
    },
    statCol: {
      flex: 1,
      alignItems: 'flex-start',
    },
    statValue: {
      fontFamily: 'Geist_600SemiBold',
      fontWeight: '600',
      fontSize: z(17),
      lineHeight: z(21),
      color: P.ink,
      fontVariant: ['tabular-nums'],
    },
    statLabel: {
      fontFamily: 'Geist_400Regular',
      fontWeight: '400',
      fontSize: z(12),
      lineHeight: z(15),
      color: P.secondary2,
      marginTop: z(2),
    },

    // ————— Tabs —————
    tabsRow: {
      flexDirection: 'row',
      gap: z(28),
      paddingHorizontal: z(20),
      marginTop: z(20),
      paddingBottom: z(10),
      borderBottomWidth: 1,
      borderBottomColor: P.border,
    },
    tab: {
      alignItems: 'flex-start',
    },
    tabText: {
      fontFamily: 'Geist_500Medium',
      fontWeight: '500',
      fontSize: z(15),
      lineHeight: z(20),
      color: P.secondary2,
    },
    tabTextActive: {
      fontFamily: 'Geist_600SemiBold',
      fontWeight: '600',
      fontSize: z(15),
      lineHeight: z(20),
      color: P.ink,
    },
    tabBar: {
      alignSelf: 'stretch',
      height: Math.max(2, z(2.5)),
      borderRadius: Math.max(1, z(1.25)),
      backgroundColor: P.ink,
      marginTop: z(8),
    },
    tabBarGhost: {
      alignSelf: 'stretch',
      height: Math.max(2, z(2.5)),
      marginTop: z(8),
      backgroundColor: 'transparent',
    },

    // ————— Tab body / About —————
    tabBody: {
      paddingHorizontal: z(20),
      paddingTop: z(18),
    },
    h2: {
      fontFamily: 'Geist_600SemiBold',
      fontWeight: '600',
      fontSize: z(16),
      lineHeight: z(21),
      color: P.ink,
    },
    bio: {
      fontFamily: 'Geist_400Regular',
      fontWeight: '400',
      fontSize: z(14),
      lineHeight: z(23),
      color: body,
      marginTop: z(8),
    },
    seeMoreBtn: {
      alignSelf: 'flex-start',
      marginTop: z(6),
    },
    seeMore: {
      fontFamily: 'Geist_600SemiBold',
      fontWeight: '600',
      fontSize: z(14),
      lineHeight: z(18),
      color: P.ink,
    },
    rrSection: {
      marginTop: z(26),
    },
    rrHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    countBadge: {
      minWidth: z(26),
      height: z(26),
      borderRadius: z(13),
      paddingHorizontal: z(7),
      backgroundColor: P.ink,
      alignItems: 'center',
      justifyContent: 'center',
    },
    countText: {
      fontFamily: 'Geist_600SemiBold',
      fontWeight: '600',
      fontSize: z(12),
      lineHeight: z(15),
      color: P.white,
      fontVariant: ['tabular-nums'],
    },
    bigRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: z(16),
      marginTop: z(14),
    },
    bigRating: {
      fontFamily: 'Geist_800ExtraBold',
      fontWeight: '800',
      fontSize: z(46),
      lineHeight: z(50),
      color: P.ink,
      fontVariant: ['tabular-nums'],
    },
    starCaption: {
      fontFamily: 'Geist_400Regular',
      fontWeight: '400',
      fontSize: z(12.5),
      lineHeight: z(16),
      color: P.secondary2,
      marginTop: z(6),
    },

    // ————— Reviews / Availability cards —————
    listCard: {
      backgroundColor: P.white,
      borderRadius: z(24),
      padding: z(18),
      gap: z(14),
      ...softShadow,
      elevation: 2,
    },
    listGroup: {
      gap: z(4),
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: z(30),
      paddingVertical: z(6),
    },
    hairRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: z(30),
      paddingVertical: z(6),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: P.border,
    },
    listLabel: {
      fontFamily: 'Geist_400Regular',
      fontWeight: '400',
      fontSize: z(13),
      lineHeight: z(17),
      color: P.secondary2,
    },
    listValue: {
      fontFamily: 'Geist_600SemiBold',
      fontWeight: '600',
      fontSize: z(13.5),
      lineHeight: z(17),
      color: P.ink,
      fontVariant: ['tabular-nums'],
    },
    textureCaption: {
      fontFamily: 'Geist_400Regular',
      fontWeight: '400',
      fontSize: z(12),
      lineHeight: z(16),
      color: P.secondary2,
      marginTop: z(2),
    },
    reviewRow: {
      gap: z(6),
      paddingVertical: z(8),
    },
    reviewText: {
      fontFamily: 'Geist_400Regular',
      fontWeight: '400',
      fontSize: z(14),
      lineHeight: z(21),
      color: body,
    },
    reviewMeta: {
      fontFamily: 'Geist_400Regular',
      fontWeight: '400',
      fontSize: z(12),
      lineHeight: z(15),
      color: P.secondary2,
    },
    dayText: {
      fontFamily: 'Geist_500Medium',
      fontWeight: '500',
      fontSize: z(14),
      lineHeight: z(18),
      color: P.ink,
    },
    hoursText: {
      fontFamily: 'Geist_400Regular',
      fontWeight: '400',
      fontSize: z(13.5),
      lineHeight: z(18),
      color: body,
      fontVariant: ['tabular-nums'],
    },
    closedText: {
      fontFamily: 'Geist_400Regular',
      fontWeight: '400',
      fontSize: z(13.5),
      lineHeight: z(18),
      color: P.secondary2,
    },
    emptyLine: {
      fontFamily: 'Geist_400Regular',
      fontWeight: '400',
      fontSize: z(14),
      lineHeight: z(20),
      color: P.secondary2,
      textAlign: 'center',
      paddingVertical: z(26),
    },

    // ————— Sticky CTA —————
    ctaWrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: z(20),
      paddingBottom: z(24),
    },
    ctaBtn: {
      height: z(54),
      borderRadius: z(27),
      backgroundColor: P.ink,
      alignItems: 'center',
      justifyContent: 'center',
      ...softShadow,
      elevation: 6,
    },
    ctaText: {
      fontFamily: 'Geist_600SemiBold',
      fontWeight: '600',
      fontSize: z(16),
      lineHeight: z(20),
      color: P.white,
    },

    // ————— Degenerate states —————
    bannerWrap: {
      marginBottom: z(10),
      paddingHorizontal: z(20),
    },
    errorWrap: {
      padding: z(24),
      alignItems: 'center',
      gap: z(8),
    },
    errorText: {
      fontFamily: 'Geist_600SemiBold',
      fontWeight: '600',
      fontSize: z(17),
      lineHeight: z(22),
      color: P.ink,
      textAlign: 'center',
    },
    errorCaption: {
      fontFamily: 'Geist_400Regular',
      fontWeight: '400',
      fontSize: z(13),
      lineHeight: z(17),
      color: P.secondary2,
      textAlign: 'center',
    },
    errorAction: {
      marginTop: z(8),
      alignItems: 'center',
    },
  })
}
