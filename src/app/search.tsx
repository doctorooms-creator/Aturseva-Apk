/**
 * S4 · SEARCH — REDESIGN (doc 24 §9 owner fidelity directive, Figma file
 * koY1wZRoJtIP72D0YpbEZm nodes 25:2/25:3). One screen, two EXACT states:
 *
 * FIND CARE (entry) — white page, "Find Care" title (no nav chrome; the
 * system status bar only), 3 stadium input pills (condition TextInput ·
 * location → existing CityPickerSheet · date → 7-day bottom sheet), ink
 * "Continue" stadium CTA, then a 2×3 specialty tile grid (Ø102 tiles; tap
 * runs the MEDICAL search term). Geometry measured from the reference
 * crops (crop px × 1.402 = 390-frame design px; rdScale() → 426-frame).
 *
 * FIND DOCTOR (results) — #EFEFED page, back circle + title, search pill,
 * honest count row + map/sliders circles, alternating light/ink doctor
 * cards (r26, right-anchored 45% photo, rating/fee badges — hidden when
 * the data is absent, real 6-day strip with per-card selection).
 *
 * Data logic preserved from APK-B2 verbatim: getDoctors pagination
 * (PAGE_SIZE, loadMore id-dedupe, pull-to-refresh), stored-city default
 * (suppressed by the all=1 browse-all doorway), symptom-dictionary
 * honesty line (visible-context law), cached-last-good degrade +
 * OfflineBanner, doorway empty state, openDoctor push to /doctor/[id].
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SearchX } from 'lucide-react-native'
import { rd, rdDark, rdScale } from '@/lib/redesign'
import { useTheme } from '@/lib/theme'
import { getDoctors, type DoctorCard } from '@/lib/api'
import { getCity } from '@/lib/storage'
import { matchSymptom } from '@/lib/website/symptom-search'
import { OfflineBanner } from '@/components/offline-banner'
import { EmptyState } from '@/components/empty-state'
import { CityPickerSheet } from '@/components/city-picker'
import { BottomSheet, GrabHandle } from '@/components/sheets'
import {
  RdBack,
  RdBrain,
  RdCalendar,
  RdEar,
  RdEye,
  RdHeart,
  RdLungs,
  RdMap,
  RdPin,
  RdRupeeCircle,
  RdSearch,
  RdSliders,
  RdStar,
  RdTooth,
} from '@/components/redesign/icons'

const PAGE_SIZE = 10

/** Doorway problem-words (S4 empty state) — same set as Home chips. */
const DOORWAY_WORDS = ['fever', 'knee pain', 'skin', 'child', 'acidity', 'headache'] as const

/** City-filter state: null = all cities; undefined = still loading the stored default. */
type CityState = string | null | undefined

/** The redesign skin, widened so rd and rdDark both fit one prop type. */
type RdSkin = { [K in keyof typeof rd]: string }

/** 390-frame design-px → device-dp (rdScale → 426 frame, × window scale). */
type Scale = (framePx: number) => number

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

/** Owner's Figma labels → the MEDICAL search term each tile runs. */
const SPECIALTY_TILES = [
  { label: 'Dental', term: 'Dental', Icon: RdTooth },
  { label: 'Cardiology', term: 'Cardiology', Icon: RdHeart },
  { label: 'Lungs', term: 'Pulmonology', Icon: RdLungs },
  { label: 'Brain', term: 'Neurology', Icon: RdBrain },
  { label: 'Ear', term: 'ENT', Icon: RdEar },
  { label: 'Optometry', term: 'Ophthalmology', Icon: RdEye },
] as const

/**
 * Geometry (390-frame design px, PIL-measured from the reference crops —
 * the ground-truth visuals; every value converts via the local z()).
 */
const G = {
  /** Screen side margin (title, pills, CTA, cards, count row). */
  margin: 24,
  // — Find Care —
  inputH: 46,
  inputGap: 17,
  ctaH: 48,
  ctaTop: 31,
  gridTop: 52,
  tile: 102,
  tileIcon: 36,
  tileGapV: 30,
  labelTop: 14,
  // — Find Doctor —
  headerTop: 18,
  headerH: 46,
  searchTop: 28,
  searchH: 54,
  countTop: 30,
  countBot: 18,
  circle: 48,
  // — Doctor card —
  cardH: 233,
  cardR: 26,
  cardGap: 13,
  pad: 16,
  padT: 14,
  photoW: 154,
  photoH: 145,
  bandH: 82,
  bandR: 20,
  bandBot: 6,
  pillW: 40,
  pillH: 62,
} as const

function nextDays(n: number): Date[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** "Wed, 14 May" — the entry pill's selected-date format (pure English). */
function formatDisplayDate(d: Date): string {
  return `${DAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
}

/** Ø48 white circle button (map / filters) — the count row's pair. */
function circleBtn(c: RdSkin, z: Scale, diameter: number) {
  return {
    width: z(diameter),
    height: z(diameter),
    borderRadius: z(diameter / 2),
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  }
}

/** Card initials for the no-photo monogram (Avatar grammar, circular here). */
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
 * Card secondary line — REAL fields only (honesty law): parsed experience
 * years + city, exactly what the data carries; never a fabricated slot
 * line. Empty string hides the line.
 */
function cardSecondary(d: DoctorCard): string {
  const parts: string[] = []
  const yrs = parseInt(d.experience ?? '', 10)
  if (Number.isFinite(yrs) && yrs > 0) parts.push(`${yrs} yrs`)
  if (d.city) parts.push(d.city)
  return parts.join(' · ')
}

/* ------------------------------------------------------------------ *
 * DOCTOR CARD (Find Doctor) — alternating LIGHT (index even) / INK
 * (index odd) variants, right-anchored 45% photo, badge pills (hide
 * when the data is absent), 6 real-date day pills with per-card
 * selection. The card body opens the profile; day pills are their own
 * pressables (RN inner-touchable law — a pill tap never opens).
 * ------------------------------------------------------------------ */

/** Day-pill palette per (ink card?, selected?) — Figma states, dark-mirrored. */
function pillTheme(isDark: boolean, inkCard: boolean, selected: boolean) {
  if (inkCard) {
    return selected
      ? { bg: isDark ? '#F5F5F5' : '#FFFFFF', label: 'rgba(44,41,40,0.72)', num: isDark ? '#0C0C0C' : '#2C2928' }
      : { bg: 'rgba(255,255,255,0.14)', label: 'rgba(255,255,255,0.65)', num: isDark ? '#F5F5F5' : '#FFFFFF' }
  }
  return selected
    ? {
        bg: isDark ? '#F5F5F5' : '#2C2928',
        label: isDark ? 'rgba(12,12,12,0.72)' : 'rgba(255,255,255,0.75)',
        num: isDark ? '#0C0C0C' : '#FFFFFF',
      }
    : {
        bg: isDark ? '#141413' : '#FFFFFF',
        label: isDark ? '#7A7A78' : '#8A8A8A',
        num: isDark ? '#F5F5F5' : '#2C2928',
      }
}

function RdDoctorCard({
  doctor,
  index,
  isDark,
  c,
  z,
  onOpen,
}: {
  doctor: DoctorCard
  index: number
  isDark: boolean
  c: RdSkin
  z: Scale
  onOpen: () => void
}) {
  // Day-strip selection is per-card local state (default: today, first).
  const [sel, setSel] = useState(0)
  const days = useMemo(() => nextDays(6), [])

  const inkCard = index % 2 === 1 // 0 = light, 1 = ink (design alternation)
  const cardBg = inkCard ? (isDark ? '#0C0C0C' : '#2C2928') : c.card
  const nameCol = inkCard ? (isDark ? '#F5F5F5' : '#FFFFFF') : c.ink
  const specCol = inkCard ? (isDark ? '#8E8E8C' : 'rgba(255,255,255,0.72)') : c.secondary
  const secCol = inkCard ? (isDark ? 'rgba(245,245,245,0.55)' : 'rgba(255,255,255,0.55)') : c.placeholder
  const bandBg = inkCard ? 'rgba(255,255,255,0.08)' : isDark ? 'rgba(255,255,255,0.06)' : '#FAFAF8'
  // Badges: white pills in light mode; near-white in dark (visible on both variants).
  const badgeBg = isDark ? '#F5F5F5' : '#FFFFFF'
  const badgeText = '#2C2928'

  const hasRating = doctor.rating > 0 && doctor.ratingCount > 0
  const hasFee = doctor.fees > 0
  const secondary = cardSecondary(doctor)

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${doctor.name}, ${doctor.specialization}`}
      style={({ pressed }) => [
        {
          height: z(G.cardH),
          borderRadius: z(G.cardR),
          backgroundColor: cardBg,
          paddingLeft: z(G.pad),
          paddingRight: z(G.pad),
          marginBottom: z(G.cardGap),
          overflow: 'hidden',
        },
        pressed && styles.pressed,
      ]}
    >
      {/* Doctor photo — right-anchored 45%, flush to the card top, bottom
          edge = day-strip top; top-right corner carries the card radius.
          Source is the api.ts H1 pipeline output (absolute, curated-or-real). */}
      {doctor.photo ? (
        <Image
          source={{ uri: doctor.photo }}
          resizeMode="cover"
          accessibilityLabel={doctor.photoRepresentative ? `${doctor.name} — representative photo` : `${doctor.name} photo`}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: z(G.photoW),
            height: z(G.photoH),
            borderTopRightRadius: z(G.cardR),
          }}
        />
      ) : (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: z(G.photoW),
            height: z(G.photoH),
            borderTopRightRadius: z(G.cardR),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: z(72),
              height: z(72),
              borderRadius: z(36),
              backgroundColor: c.iconTile,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: 'Geist_600SemiBold', fontWeight: '600', fontSize: z(20), color: c.ink }}>
              {initialsOf(doctor.name)}
            </Text>
          </View>
        </View>
      )}

      {/* Left column — badges (hide-if-empty law), name, specialization,
          real secondary line. Text stops short of the photo zone. */}
      <View style={{ paddingTop: z(G.padT), paddingRight: z(G.photoW - G.pad + 6) }}>
        {hasRating || hasFee ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(8), marginBottom: z(8) }}>
            {hasRating ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: z(4),
                  height: z(26),
                  borderRadius: z(13),
                  paddingHorizontal: z(10),
                  backgroundColor: badgeBg,
                }}
              >
                <RdStar size={z(13)} />
                <Text
                  style={{
                    fontFamily: 'Geist_600SemiBold',
                    fontWeight: '600',
                    fontSize: z(12.5),
                    color: badgeText,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {doctor.rating.toFixed(1)}
                </Text>
              </View>
            ) : null}
            {hasFee ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: z(4),
                  height: z(26),
                  borderRadius: z(13),
                  paddingHorizontal: z(10),
                  backgroundColor: badgeBg,
                }}
              >
                <RdRupeeCircle size={z(14)} />
                <Text
                  style={{
                    fontFamily: 'Geist_600SemiBold',
                    fontWeight: '600',
                    fontSize: z(12.5),
                    color: badgeText,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  ₹{doctor.fees.toLocaleString('en-IN')}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={1.15}
          style={{ fontFamily: 'Geist_700Bold', fontWeight: '700', fontSize: z(17), lineHeight: z(22), color: nameCol }}
        >
          {doctor.name}
        </Text>
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={1.15}
          style={{
            fontFamily: 'Geist_400Regular',
            fontWeight: '400',
            fontSize: z(13.5),
            lineHeight: z(17),
            color: specCol,
            marginTop: z(2),
          }}
        >
          {doctor.specialization || 'Doctor'}
        </Text>
        {secondary ? (
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={1.15}
            style={{
              fontFamily: 'Geist_400Regular',
              fontWeight: '400',
              fontSize: z(12),
              lineHeight: z(15),
              color: secCol,
              marginTop: z(3),
            }}
          >
            {secondary}
          </Text>
        ) : null}
      </View>

      {/* Day strip — full-width inner band, 6 real-date stadium pills
          (today first, selected by default), space-between pitch 52. */}
      <View
        style={{
          position: 'absolute',
          left: z(G.pad),
          right: z(G.pad),
          bottom: z(G.bandBot),
          height: z(G.bandH),
          borderRadius: z(G.bandR),
          backgroundColor: bandBg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: z(3),
        }}
      >
        {days.map((d, i) => {
          const p = pillTheme(isDark, inkCard, i === sel)
          return (
            <Pressable
              key={d.toISOString()}
              onPress={() => setSel(i)}
              accessibilityRole="button"
              accessibilityLabel={`${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}${i === sel ? ', selected' : ''}`}
              style={({ pressed }) => [
                {
                  width: z(G.pillW),
                  height: z(G.pillH),
                  borderRadius: z(G.pillH / 2),
                  backgroundColor: p.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: z(3),
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={{ fontFamily: 'Geist_500Medium', fontWeight: '500', fontSize: z(10), lineHeight: z(12), color: p.label }}
              >
                {DAY_SHORT[d.getDay()]}
              </Text>
              <Text
                style={{
                  fontFamily: 'Geist_600SemiBold',
                  fontWeight: '600',
                  fontSize: z(15),
                  lineHeight: z(18),
                  color: p.num,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {d.getDate()}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </Pressable>
  )
}

/** One redesign-card-shaped skeleton (mirrors the final layout, quiet pulse). */
function RdCardSkeleton({ isDark, z }: { isDark: boolean; z: Scale }) {
  const [opacity] = useState(() => new Animated.Value(0.55))
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 850, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 850, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])
  const base = isDark ? '#2A2A28' : '#E8E8E8'
  const block = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
  return (
    <Animated.View
      style={{
        height: z(G.cardH),
        borderRadius: z(G.cardR),
        backgroundColor: base,
        marginBottom: z(G.cardGap),
        opacity,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: z(G.photoW),
          height: z(G.photoH),
          borderTopRightRadius: z(G.cardR),
          backgroundColor: block,
        }}
      />
      <View style={{ position: 'absolute', left: z(G.pad), top: z(G.padT), gap: z(10) }}>
        <View style={{ width: z(124), height: z(26), borderRadius: z(13), backgroundColor: block }} />
        <View style={{ width: z(142), height: z(14), borderRadius: z(7), backgroundColor: block }} />
        <View style={{ width: z(100), height: z(12), borderRadius: z(6), backgroundColor: block }} />
      </View>
      <View
        style={{
          position: 'absolute',
          left: z(G.pad),
          right: z(G.pad),
          bottom: z(G.bandBot),
          height: z(G.bandH),
          borderRadius: z(G.bandR),
          backgroundColor: block,
        }}
      />
    </Animated.View>
  )
}

/* ------------------------------------------------------------------ *
 * DATE SHEET (Find Care · pill 3) — the app's BottomSheet pattern with
 * the next 7 days as stadium pills; tap selects, tap the selected day
 * to clear. The chosen date rides to the booking flow later — search
 * results stay unfiltered (stated honestly in the sheet).
 * ------------------------------------------------------------------ */

function DateSheet({
  visible,
  value,
  onClose,
  onPick,
  c,
}: {
  visible: boolean
  value: Date | null
  onClose: () => void
  onPick: (d: Date | null) => void
  c: RdSkin
}) {
  const days = useMemo(() => (visible ? nextDays(7) : []), [visible])
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Select a date">
      <GrabHandle />
      <Text style={{ fontFamily: 'Geist_600SemiBold', fontWeight: '600', fontSize: 16, color: c.ink }}>Select a date</Text>
      <Text
        style={{
          marginTop: 4,
          marginBottom: 16,
          fontFamily: 'Geist_400Regular',
          fontWeight: '400',
          fontSize: 12.5,
          lineHeight: 16,
          color: c.secondary,
        }}
      >
        Saved for booking — search results stay unfiltered for now.
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {days.map((d) => {
          const sel = value ? sameDay(d, value) : false
          return (
            <Pressable
              key={d.toISOString()}
              onPress={() => onPick(sel ? null : d)}
              accessibilityRole="button"
              accessibilityLabel={sel ? `Clear ${formatDisplayDate(d)}` : formatDisplayDate(d)}
              style={({ pressed }) => [
                {
                  width: 76,
                  height: 58,
                  borderRadius: 29,
                  borderWidth: 1,
                  borderColor: sel ? 'transparent' : c.border,
                  backgroundColor: sel ? c.ink : c.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={{
                  fontFamily: 'Geist_500Medium',
                  fontWeight: '500',
                  fontSize: 10.5,
                  lineHeight: 13,
                  color: sel ? c.white : c.placeholder,
                }}
              >
                {DAY_SHORT[d.getDay()]}
              </Text>
              <Text
                style={{
                  fontFamily: 'Geist_600SemiBold',
                  fontWeight: '600',
                  fontSize: 15,
                  lineHeight: 18,
                  color: sel ? c.white : c.ink,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {d.getDate()}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </BottomSheet>
  )
}

/* ------------------------------------------------------------------ *
 * FIND CARE (entry state)
 * ------------------------------------------------------------------ */

function CareView({
  c,
  z,
  insets,
  text,
  setText,
  onSearch,
  onSpecialty,
  city,
  onCityPress,
  date,
  onDatePress,
}: {
  c: RdSkin
  z: Scale
  insets: { top: number }
  text: string
  setText: (v: string) => void
  onSearch: () => void
  onSpecialty: (term: string) => void
  city: string | null
  onCityPress: () => void
  date: Date | null
  onDatePress: () => void
}) {
  const pillShell = {
    height: z(G.inputH),
    borderRadius: z(G.inputH / 2),
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.border,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: z(20),
    gap: z(13),
  }
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: insets.top + z(20), paddingHorizontal: z(G.margin), paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    >
      {/* Title — left-aligned, no nav chrome (system status bar only). */}
      <Text
        maxFontSizeMultiplier={1.15}
        style={{ fontFamily: 'Geist_700Bold', fontWeight: '700', fontSize: z(25), lineHeight: z(30), color: c.ink }}
      >
        Find Care
      </Text>

      {/* 3 stacked input pills (gap 17). */}
      <View style={{ marginTop: z(44), gap: z(G.inputGap) }}>
        <View style={pillShell}>
          <RdSearch size={z(22)} color={c.iconGray} />
          <TextInput
            value={text}
            onChangeText={setText}
            onSubmitEditing={onSearch}
            placeholder="Condition, Procedure, Doctor..."
            placeholderTextColor={c.placeholder}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            accessible
            accessibilityLabel="Search condition, procedure or doctor"
            style={{
              flex: 1,
              fontFamily: 'Geist_400Regular',
              fontWeight: '400',
              fontSize: z(15),
              color: c.ink,
              paddingVertical: 0,
            }}
          />
        </View>

        <Pressable onPress={onCityPress} accessibilityRole="button" accessibilityLabel={`Location ${city ?? 'not selected'}, change`} style={({ pressed }) => [pillShell, pressed && styles.pressed]}>
          <RdPin size={z(22)} color={c.iconGray} />
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontFamily: 'Geist_400Regular',
              fontWeight: '400',
              fontSize: z(15),
              color: city ? c.ink : c.placeholder,
            }}
          >
            {city ?? 'Select a Location'}
          </Text>
        </Pressable>

        <Pressable onPress={onDatePress} accessibilityRole="button" accessibilityLabel={`Date ${date ? formatDisplayDate(date) : 'not selected'}, change`} style={({ pressed }) => [pillShell, pressed && styles.pressed]}>
          <RdCalendar size={z(22)} color={c.iconGray} />
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontFamily: 'Geist_400Regular',
              fontWeight: '400',
              fontSize: z(15),
              color: date ? c.ink : c.placeholder,
            }}
          >
            {date ? formatDisplayDate(date) : 'Select a date'}
          </Text>
        </Pressable>
      </View>

      {/* CTA — ink stadium, full width. */}
      <Pressable
        onPress={onSearch}
        accessibilityRole="button"
        accessibilityLabel="Continue — find doctors"
        style={({ pressed }) => [
          {
            marginTop: z(G.ctaTop),
            height: z(G.ctaH),
            borderRadius: z(G.ctaH / 2),
            backgroundColor: c.ink,
            alignItems: 'center',
            justifyContent: 'center',
          },
          pressed && styles.pressed,
        ]}
      >
        <Text style={{ fontFamily: 'Geist_600SemiBold', fontWeight: '600', fontSize: z(16), color: c.white }}>Continue</Text>
      </Pressable>

      {/* Specialty grid — 2 rows × 3 columns, Ø102 tiles, col gap 18. */}
      <View style={{ marginTop: z(G.gridTop), gap: z(G.tileGapV) }}>
        {[0, 1].map((row) => (
          <View key={row} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {SPECIALTY_TILES.slice(row * 3, row * 3 + 3).map((sp) => (
              <Pressable
                key={sp.label}
                onPress={() => onSpecialty(sp.term)}
                accessibilityRole="button"
                accessibilityLabel={`Search ${sp.label}`}
                style={({ pressed }) => [styles.tileCell, { width: z(G.tile) }, pressed && styles.pressed]}
              >
                <View
                  style={{
                    width: z(G.tile),
                    height: z(G.tile),
                    borderRadius: z(G.tile / 2),
                    backgroundColor: c.iconTile,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <sp.Icon size={z(G.tileIcon)} color={c.ink} />
                </View>
                <Text
                  maxFontSizeMultiplier={1.15}
                  style={{
                    marginTop: z(G.labelTop),
                    fontFamily: 'Geist_500Medium',
                    fontWeight: '500',
                    fontSize: z(13),
                    lineHeight: z(16),
                    color: c.ink,
                  }}
                >
                  {sp.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

/* ------------------------------------------------------------------ *
 * SCREEN — state machine + data logic
 * ------------------------------------------------------------------ */

export default function SearchScreen() {
  const { resolved } = useTheme()
  const isDark = resolved === 'dark'
  const c: RdSkin = isDark ? rdDark : rd
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { width } = useWindowDimensions()
  // Scale law (house): 390-frame design px → rdScale (426 frame) → window.
  const s = Math.min(width / 426, 1.2)
  const z: Scale = (framePx: number) => rdScale(framePx) * s

  const { q, all } = useLocalSearchParams<{ q?: string; all?: string }>()
  const paramQuery = typeof q === 'string' && q.trim().length > 0 ? q.trim() : ''
  // "Browse all doctors" doorway param: suppresses the stored-city default
  // so the promise "browse every doctor" is literally true (honesty law).
  const browseAll = all === '1'

  // ---- state machine ------------------------------------------------
  // 'care' = Find Care entry; 'find' = Find Doctor results. Arriving with
  // q (or the all=1 doorway) lands on FIND DOCTOR directly.
  const [mode, setMode] = useState<'care' | 'find'>(paramQuery || browseAll ? 'find' : 'care')
  const [query, setQuery] = useState(paramQuery) // SUBMITTED query (drives the API)
  const [text, setText] = useState(paramQuery) // live TextInput value
  // True when the patient reached FIND DOCTOR via this screen's entry
  // state — the back circle then returns to FIND CARE, not out of the app.
  const [fromCare, setFromCare] = useState(false)

  // Honesty line: the dictionary mapping NAMED back (visible-context law).
  const match = matchSymptom(query)
  const mapping = match ? match.specialties.map((sp) => sp.displayName).join(' · ') : ''

  const [cityFilter, setCityFilter] = useState<CityState>(undefined)
  const [citySheetOpen, setCitySheetOpen] = useState(false)
  const [storedCity, setStoredCity] = useState<string | null>(null)
  const [dateSheetOpen, setDateSheetOpen] = useState(false)
  const [date, setDate] = useState<Date | null>(null)

  const [list, setList] = useState<DoctorCard[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [loadingFirst, setLoadingFirst] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [degraded, setDegraded] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // Adopt navigation params while mounted (e.g. a fresh /search?q= push
  // that replaced params on this instance): q → FIND DOCTOR, all=1 →
  // FIND DOCTOR unfiltered. Internal searches never touch the URL.
  // Microtask barrier: state never flips synchronously inside the effect
  // body (cascading-render law — B1 house pattern).
  useEffect(() => {
    void (async () => {
      await null
      if (paramQuery) {
        setQuery(paramQuery)
        setText(paramQuery)
        setMode('find')
        setFromCare(false)
      } else if (browseAll) {
        setMode('find')
      }
    })()
  }, [paramQuery, browseAll])

  // Stored city starts as the default filter (quiet, changeable, resettable) —
  // unless the browse-all doorway asked for the unfiltered truth.
  useEffect(() => {
    void (async () => {
      await null
      const stored = browseAll ? null : await getCity()
      if (!mounted.current) return
      setStoredCity(stored)
      setCityFilter((prev) => (prev === undefined ? stored : prev))
    })()
  }, [browseAll])

  const fetchPage = useCallback(
    async (p: number, city: string | null) => {
      const res = await getDoctors({
        search: query || undefined,
        city: city ?? undefined,
        page: p,
        limit: PAGE_SIZE,
      })
      if (!mounted.current) return
      return res
    },
    [query],
  )

  // (Re)load page 1 whenever query/cityFilter/mode change. Cached-last-good:
  // a failed refresh keeps the current list and raises the amber strip.
  // FIND CARE never fetches (entry state = no results loaded).
  const loadFirst = useCallback(
    async (city: string | null) => {
      setLoadingFirst(list.length === 0)
      try {
        const res = await fetchPage(1, city)
        if (!mounted.current || !res) return
        setList(res.doctors)
        setTotal(res.total)
        setPage(1)
        setDegraded(false)
      } catch {
        if (!mounted.current) return
        if (list.length > 0) setDegraded(true)
        else setDegraded(false)
      } finally {
        if (mounted.current) {
          setLoadingFirst(false)
          setRefreshing(false)
        }
      }
    },
    [fetchPage, list.length],
  )

  useEffect(() => {
    if (cityFilter === undefined || mode !== 'find') return
    // Microtask barrier: loading flags never flip synchronously inside the
    // effect body (cascading-render law — B1 house pattern).
    void (async () => {
      await null
      await loadFirst(cityFilter)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityFilter, query, mode])

  const loadMore = useCallback(async () => {
    if (loadingMore || loadingFirst || total === null || list.length >= total) return
    setLoadingMore(true)
    try {
      const next = page + 1
      const res = await fetchPage(next, cityFilter ?? null)
      if (!mounted.current || !res) return
      setList((prev) => {
        const seen = new Set(prev.map((d) => d.id))
        return [...prev, ...res.doctors.filter((d) => !seen.has(d.id))]
      })
      setPage(next)
      setTotal(res.total)
    } catch {
      // Quiet: pagination failures keep the list; the count line stays
      // honest — a later pull-to-refresh or scroll retries silently.
    } finally {
      if (mounted.current) setLoadingMore(false)
    }
  }, [loadingMore, loadingFirst, total, list.length, page, fetchPage, cityFilter])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    void loadFirst(cityFilter ?? null)
  }, [loadFirst, cityFilter])

  const openDoctor = (id: string) => {
    void router.push({ pathname: '/doctor/[id]', params: { id } })
  }

  // ---- transitions ---------------------------------------------------

  /** Run a search and land on FIND DOCTOR (marks the internal transition). */
  const runSearch = (raw: string) => {
    if (mode === 'care') setFromCare(true)
    setQuery(raw.trim())
    setMode('find')
    Keyboard.dismiss()
  }

  /** Find Doctor back circle: internal transition → entry state; else pop. */
  const goBack = () => {
    if (fromCare) {
      setMode('care')
      setQuery('')
      setText('')
      setList([])
      setTotal(null)
      setPage(1)
      setDegraded(false)
      setFromCare(false)
    } else {
      router.back()
    }
  }

  /** Browse-all doorway: every doctor, city filter honestly cleared. */
  const browseAllHere = () => {
    setQuery('')
    setText('')
    setCityFilter(null)
    setMode('find')
  }

  // The entry pill shows the stored default until the patient chooses;
  // an explicit "All cities" pick (null) shows the placeholder again.
  const careCity = cityFilter === undefined ? storedCity : cityFilter

  /* ---- FIND DOCTOR list header (search + count + circles) ---- */
  const findHeader = (
    <View style={{ paddingTop: insets.top + z(G.headerTop), paddingHorizontal: z(G.margin) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(14) }}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => [
            {
              width: z(G.headerH),
              height: z(G.headerH),
              borderRadius: z(G.headerH / 2),
              backgroundColor: c.white,
              borderWidth: 1,
              borderColor: c.border,
              alignItems: 'center',
              justifyContent: 'center',
            },
            pressed && styles.pressed,
          ]}
        >
          <RdBack size={z(20)} color={c.ink} />
        </Pressable>
        <Text
          maxFontSizeMultiplier={1.15}
          style={{ fontFamily: 'Geist_700Bold', fontWeight: '700', fontSize: z(20), color: c.ink }}
        >
          Find Doctor
        </Text>
      </View>

      {/* Search pill — real TextInput; submit re-runs the search. */}
      <View
        style={{
          marginTop: z(G.searchTop),
          height: z(G.searchH),
          borderRadius: z(G.searchH / 2),
          backgroundColor: c.searchFill,
          borderWidth: 1,
          borderColor: c.searchBorder,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: z(20),
          gap: z(13),
        }}
      >
        <RdSearch size={z(22)} color={c.iconGray} />
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => runSearch(text)}
          placeholder="Condition, Procedure, Doctor..."
          placeholderTextColor={c.placeholder}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          accessible
          accessibilityLabel="Search condition, procedure or doctor"
          style={{
            flex: 1,
            fontFamily: 'Geist_400Regular',
            fontWeight: '400',
            fontSize: z(15),
            color: c.ink,
            paddingVertical: 0,
          }}
        />
      </View>

      {/* Honesty line — the symptom mapping is NAMED, never silent (doc 21
          law); renders only for problem-language queries, so pure name and
          specialty searches see the design exactly. */}
      {mapping ? (
        <Text
          numberOfLines={2}
          style={{
            marginTop: z(8),
            fontFamily: 'Geist_400Regular',
            fontWeight: '400',
            fontSize: z(11),
            lineHeight: z(14),
            color: c.secondary,
          }}
        >
          {query} → {mapping}
        </Text>
      ) : null}

      {/* Count row — real totals only (at 0 the EmptyState below carries
          the message) + map / filter circles. */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: z(12),
          marginTop: z(G.countTop),
          marginBottom: z(G.countBot),
          minHeight: z(G.circle),
        }}
      >
        {total !== null && total > 0 ? (
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontFamily: 'Geist_600SemiBold',
              fontWeight: '600',
              fontSize: z(15),
              color: c.ink,
              fontVariant: ['tabular-nums'],
            }}
          >
            {total} {total === 1 ? 'Doctor' : 'Doctors'} found
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <Pressable
          onPress={() => void router.push('/hospitals')}
          accessibilityRole="button"
          accessibilityLabel="Hospitals map"
          style={({ pressed }) => [circleBtn(c, z, G.circle), pressed && styles.pressed]}
        >
          <RdMap size={z(22)} color={c.ink} />
        </Pressable>
        <Pressable
          onPress={() => setCitySheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Filters — change city"
          style={({ pressed }) => [circleBtn(c, z, G.circle), pressed && styles.pressed]}
        >
          <RdSliders size={z(22)} color={c.ink} />
        </Pressable>
      </View>

      {degraded && list.length > 0 ? (
        <OfflineBanner onRetry={onRefresh} />
      ) : null}
    </View>
  )

  return (
    <View style={[styles.screen, { backgroundColor: mode === 'care' ? c.white : c.pageFind }]}>
      {mode === 'care' ? (
        <CareView
          c={c}
          z={z}
          insets={insets}
          text={text}
          setText={setText}
          onSearch={() => runSearch(text)}
          onSpecialty={(term) => {
            setText(term)
            runSearch(term)
          }}
          city={careCity}
          onCityPress={() => setCitySheetOpen(true)}
          date={date}
          onDatePress={() => setDateSheetOpen(true)}
        />
      ) : (
        <FlatList
          data={loadingFirst ? [] : list}
          keyExtractor={(d) => d.id}
          renderItem={({ item, index }) => (
            <RdDoctorCard doctor={item} index={index} isDark={isDark} c={c} z={z} onOpen={() => openDoctor(item.id)} />
          )}
          ListHeaderComponent={findHeader}
          ListEmptyComponent={
            loadingFirst ? (
              <View>
                <RdCardSkeleton isDark={isDark} z={z} />
                <RdCardSkeleton isDark={isDark} z={z} />
                <RdCardSkeleton isDark={isDark} z={z} />
              </View>
            ) : list.length === 0 ? (
              <View style={styles.emptyWrap}>
                <EmptyState
                  icon={SearchX}
                  title={`No doctors for “${query || 'this search'}”`}
                  caption="Try one of these common problems, or browse every doctor."
                  actions={[
                    ...DOORWAY_WORDS.map((w) => ({
                      label: w,
                      onPress: () => runSearch(w),
                    })),
                    { label: 'Browse all doctors', onPress: browseAllHere, primary: true },
                  ]}
                />
              </View>
            ) : undefined
          }
          ListFooterComponent={
            loadingMore ? (
              <RdCardSkeleton isDark={isDark} z={z} />
            ) : total !== null && list.length > 0 && list.length >= total ? (
              <Text style={[styles.footerEnd, { color: c.secondary }]}>That is every doctor for this search</Text>
            ) : undefined
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          contentContainerStyle={{ paddingHorizontal: z(G.margin), paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            Platform.OS === 'web' ? undefined : (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.ink} />
            )
          }
        />
      )}

      <CityPickerSheet
        visible={citySheetOpen}
        current={cityFilter ?? storedCity}
        onClose={() => setCitySheetOpen(false)}
        onPick={(picked) => {
          setCitySheetOpen(false)
          setCityFilter(picked)
        }}
      />

      <DateSheet
        visible={dateSheetOpen}
        value={date}
        c={c}
        onClose={() => setDateSheetOpen(false)}
        onPick={(picked) => {
          setDateSheetOpen(false)
          setDate(picked)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  tileCell: {
    alignItems: 'center',
  },
  emptyWrap: {
    paddingTop: 24,
  },
  footerEnd: {
    fontFamily: 'Geist_400Regular',
    fontWeight: '400',
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
})
