/**
 * S2 · ONBOARDING — 3 slides, skippable, first run only (doc 06 S2).
 * City ask lives on slide-3's bottom (quiet field → picker sheet, NO
 * location permission — that's P2 near-me). Finish/Skip both write
 * onboarding-done (never repeats). Next button = black pill; last slide
 * reads "Get started". Pure English copy (owner directive, APK-B2).
 *
 * APK-B13 (VLM + measurement round): the quiet city field now CARRIES
 * its affordance — a chevron-down (the one-hint-per-control grammar) +
 * a hairline ring so the pill reads as a control in BOTH themes (the
 * dark #1A1A19 fill on #0C0C0C canvas alone was near-invisible — VLM
 * flagged, geometry confirmed). A chosen city now reads ink/600 vs
 * the grey placeholder — committed vs uncommitted are two different
 * voices (state-feedback hierarchy). Inactive progress dots moved
 * hairline → mute (non-text 3:1 law; hairline dots measured 1.24:1 on
 * both canvases).
 */

import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronDown } from 'lucide-react-native'
import { space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { setOnboardingDone, setCity } from '@/lib/storage'
import { PillButton } from '@/components/press'
import { CityPickerSheet } from '@/components/city-picker'
import { ArtBook, ArtSearch, ArtToken } from '@/components/onboarding-art'

const SLIDES = [
  {
    art: <ArtSearch />,
    title: 'Find a doctor',
    caption: 'Search in your own words — fever, knee pain, headache. Straight to the right specialist.',
  },
  {
    art: <ArtBook />,
    title: 'Book in 3 taps',
    caption: 'See the fee before you book. No hidden costs, ever.',
  },
  {
    art: <ArtToken />,
    title: 'Turn confirmed',
    caption: 'Your token number arrives instantly. Live queue tracking tells you exactly when to leave.',
  },
] as const

export default function OnboardingScreen() {
  const c = useColors()
  const router = useRouter()
  const [slide, setSlide] = useState(0)
  const [city, setCityLocal] = useState<string | null>(null)
  const [citySheetOpen, setCitySheetOpen] = useState(false)

  const isLast = slide === SLIDES.length - 1

  const finish = (chosenCity: string | null) => {
    void setOnboardingDone()
    if (chosenCity) void setCity(chosenCity)
    router.replace('/')
  }

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      {/* Skip — always visible, always 44px (never unskippable law) */}
      <Pressable onPress={() => finish(city)} hitSlop={8} style={styles.skip} accessibilityRole="button" accessibilityLabel="Skip">
        <Text style={[styles.skipText, { color: c.mute }]}>Skip</Text>
      </Pressable>

      <View style={styles.artWrap}>{SLIDES[slide].art}</View>

      <View style={styles.textCol}>
        <Text style={[styles.title, { color: c.ink }]}>{SLIDES[slide].title}</Text>
        <Text style={[styles.caption, { color: c.body }]}>{SLIDES[slide].caption}</Text>
      </View>

      {/* Progress dots — inactive = mute (B13: non-text 3:1 law) */}
      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View key={s.title} style={[styles.dot, i === slide && styles.dotActive, { backgroundColor: i === slide ? c.ink : c.mute }]} />
        ))}
      </View>

      {/* City ask — slide 3 bottom, quiet (S2); affordance = chevron + ring (B13) */}
      <View style={styles.cityBlock}>
        {isLast ? (
          <Pressable
            onPress={() => setCitySheetOpen(true)}
            style={({ pressed }) => [
              styles.cityField,
              { backgroundColor: c.canvasSoft, borderColor: c.hairline, borderWidth: StyleSheet.hairlineWidth },
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Select your city"
          >
            <Text style={[styles.cityFieldText, { color: city ? c.ink : c.body }, !!city && styles.cityFieldChosen]} numberOfLines={1}>
              {city ?? 'Your city — select one'}
            </Text>
            <ChevronDown size={18} color={c.mute} strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>

      <PillButton
        label={isLast ? 'Get started' : 'Next'}
        height={56}
        onPress={() => {
          if (isLast) finish(city)
          else setSlide((s) => s + 1)
        }}
      />

      <CityPickerSheet
        visible={citySheetOpen}
        current={city}
        onClose={() => setCitySheetOpen(false)}
        onPick={(picked) => {
          setCitySheetOpen(false)
          setCityLocal(picked)
          if (picked) void setCity(picked)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: space.s24,
    paddingBottom: space.s24,
    paddingTop: space.s16,
  },
  skip: {
    minHeight: TOUCH,
    minWidth: TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  skipText: {
    ...typo.body,
  },
  artWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    gap: space.s8,
    paddingBottom: space.s24,
  },
  title: {
    ...typo.display,
    textAlign: 'center',
  },
  caption: {
    ...typo.body,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: space.s8,
    justifyContent: 'center',
    marginBottom: space.s24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  dotActive: {
    width: 20,
  },
  cityBlock: {
    marginBottom: space.s12,
  },
  cityField: {
    borderRadius: 999,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.s8,
    paddingHorizontal: space.s20,
  },
  cityFieldText: {
    ...typo.body,
  },
  cityFieldChosen: {
    fontWeight: '600',
  },
})
