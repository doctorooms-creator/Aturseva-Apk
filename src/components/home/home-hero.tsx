/**
 * Z1 · HOME HERO (doc 17 PART 4, R49 monochrome): the band that opens
 * the home — greeting (real name when signed in, else "Namaste") · CITY
 * CHIP promoted here from the old footer (location-first: doc 16 usability
 * law B2 — the patient's city is the #1 context switch, it belongs at the
 * top) · search crown in GLASS chrome (G3 search-pill grammar from the
 * website, v1 simulated) · symptom quick-chips (white surface + hairline
 * ring — they read on the near-white canvas by ring, not fill).
 *
 * The search field never navigates (S3 suggest-sheet law — focus raises
 * the sheet); chips walk straight into the S4 listing (zero-thinking
 * path). All state stays in the screen; the hero is presentation.
 */

import { type ComponentRef, type Ref } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View, type TextInput } from 'react-native'
import { MapPin, ChevronDown } from 'lucide-react-native'
import { radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { Chip } from '@/components/press'
import { SearchField } from '@/components/search-field'

export interface HomeHeroProps {
  /** Stored auth display name (null = guest → "Namaste"). */
  name: string | null
  /** Stored city (null = "Select city" prompt state). */
  city: string | null
  onCityPress: () => void
  searchRef: Ref<ComponentRef<typeof TextInput>>
  query: string
  onQueryChange: (q: string) => void
  onSearchFocus: () => void
  /** Quick-chip terms (S3 doorway words). */
  chips: readonly string[]
  onChipPress: (term: string) => void
}

export function HomeHero({
  name,
  city,
  onCityPress,
  searchRef,
  query,
  onQueryChange,
  onSearchFocus,
  chips,
  onChipPress,
}: HomeHeroProps) {
  const c = useColors()
  const greeting = name ? `Namaste, ${firstName(name)}` : 'Namaste'
  return (
    <View style={styles.band}>
      <View style={styles.topRow}>
        <Text style={[styles.greeting, { color: c.ink }]} numberOfLines={1}>
          {greeting}
        </Text>
        <Pressable
          onPress={onCityPress}
          accessibilityRole="button"
          accessibilityLabel={city ? `City ${city}, change city` : 'Select your city'}
          style={({ pressed }) => [styles.cityChip, { backgroundColor: c.canvas, borderColor: c.hairline }, pressed && styles.pressed]}
        >
          <MapPin size={13} color={c.tealText} strokeWidth={2} />
          <Text style={[styles.cityText, { color: c.ink }]} numberOfLines={1}>
            {city ?? 'Select city'}
          </Text>
          <ChevronDown size={13} color={c.mute} strokeWidth={2} />
        </Pressable>
      </View>

      <SearchField
        ref={searchRef}
        variant="glass"
        value={query}
        onChangeText={onQueryChange}
        onFocus={onSearchFocus}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {chips.map((term) => (
          <Chip key={term} label={term} surface={c.canvas} onPress={() => onChipPress(term)} />
        ))}
      </ScrollView>
    </View>
  )
}

/** First name only for the greeting line (long full names wrap badly). */
function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}

const styles = StyleSheet.create({
  band: {
    gap: space.s12,
    paddingTop: space.s12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s12,
    paddingHorizontal: space.s16,
    minHeight: TOUCH,
  },
  greeting: {
    ...typo.display,
    flex: 1,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: TOUCH,
    borderRadius: radius.pill,
    paddingHorizontal: space.s12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cityText: {
    ...typo.caption,
    fontWeight: '600',
  },
  chipsRow: {
    gap: space.s8,
    paddingHorizontal: space.s16,
  },
  pressed: {
    opacity: 0.85,
  },
})
