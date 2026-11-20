/**
 * S2 · ONBOARDING — 3 slides, skippable, first run only (doc 06 S2).
 * City ask lives on slide-3's bottom (quiet field → picker sheet, NO
 * location permission — that's P2 near-me). Finish/Skip both write
 * onboarding-done (never repeats). Next button = black pill; last slide
 * reads "Get started". Pure English copy (owner directive, APK-B2).
 */

import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { colors, space, TOUCH, type as typo } from '@/lib/tokens'
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
    <View style={styles.screen}>
      {/* Skip — always visible, always 44px (never unskippable law) */}
      <Pressable onPress={() => finish(city)} hitSlop={8} style={styles.skip} accessibilityRole="button" accessibilityLabel="Skip">
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <View style={styles.artWrap}>{SLIDES[slide].art}</View>

      <View style={styles.textCol}>
        <Text style={styles.title}>{SLIDES[slide].title}</Text>
        <Text style={styles.caption}>{SLIDES[slide].caption}</Text>
      </View>

      {/* Progress dots */}
      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View key={s.title} style={[styles.dot, i === slide && styles.dotActive]} />
        ))}
      </View>

      {/* City ask — slide 3 bottom, quiet (S2) */}
      <View style={styles.cityBlock}>
        {isLast ? (
          <Pressable onPress={() => setCitySheetOpen(true)} style={({ pressed }) => [styles.cityField, pressed && { opacity: 0.7 }]} accessibilityRole="button" accessibilityLabel="Select your city">
            <Text style={styles.cityFieldText}>{city ?? 'Your city — select one'}</Text>
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
    backgroundColor: colors.canvas,
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
    color: colors.mute,
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
    color: colors.ink,
    textAlign: 'center',
  },
  caption: {
    ...typo.body,
    color: colors.body,
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
    backgroundColor: colors.hairline,
  },
  dotActive: {
    backgroundColor: colors.ink,
    width: 20,
  },
  cityBlock: {
    marginBottom: space.s12,
  },
  cityField: {
    borderRadius: 999,
    backgroundColor: colors.canvasSoft,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.s20,
  },
  cityFieldText: {
    ...typo.body,
    color: colors.body,
  },
})
