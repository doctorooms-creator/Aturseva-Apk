/**
 * V4 HOME · ZONE 1 — HEADER (doc 21): location-left · script wordmark
 * center · bell-right. The design's exact anatomy: pin (9×11.5 ink) +
 * 2-line city (10.5 SemiBold) + chevron-down, the "Atur Seva" Dancing
 * Script Bold 29 wordmark at the frame's exact center, and the bare
 * outline bell with the native red unread dot (live state, never baked
 * art). NO gear / account circles — the earlier iteration's extras.
 *
 * Geometry (design px, × s): zone height 54, its top at frame y42 (zone 0
 * = the 42px status area — the screen's top pad floors at 42·s). The
 * location block starts x24, its top 16.5 into the zone (measured: pin
 * ink y58.5 = 42+16.5 — the design sits it low against the wordmark's
 * optical center). Bell ink 15×20, frame right margin 30; its press area
 * is a 44dp padded wrapper (the TOUCH floor is an absolute standard — it
 * does NOT scale down).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useV4, v4t, v4c } from '@/components/home4/v4'
import { FigIcon } from '@/components/home4/figma'

/** The curated cities' states — the design's header shows the location as
 * a 2-line "City,\nState" block ("Gandhinagar,\nGujarat"); single-word
 * stored cities resolve their state so every city renders the same
 * anatomy. Unknown/free-form values pass through untouched. */
const CITY_STATE: Record<string, string> = {
  Delhi: 'Delhi',
  Mumbai: 'Maharashtra',
  Bengaluru: 'Karnataka',
  Hyderabad: 'Telangana',
  Ahmedabad: 'Gujarat',
  Chennai: 'Tamil Nadu',
  Kolkata: 'West Bengal',
  Pune: 'Maharashtra',
  Jaipur: 'Rajasthan',
  Lucknow: 'Uttar Pradesh',
  Gandhinagar: 'Gujarat',
  Chandigarh: 'Punjab',
  Indore: 'Madhya Pradesh',
  Bhopal: 'Madhya Pradesh',
  Nagpur: 'Maharashtra',
  Surat: 'Gujarat',
  Patna: 'Bihar',
  Kochi: 'Kerala',
  Coimbatore: 'Tamil Nadu',
  Guwahati: 'Assam',
}

/** "Gandhinagar" → "Gandhinagar,\nGujarat"; "Gandhinagar, Gujarat" →
 *  "Gandhinagar,\nGujarat"; unknown → as-is. */
function cityLabel(city: string): string {
  if (city.includes(',')) return city.split(/,\s*/).join(',\n')
  const state = CITY_STATE[city]
  return state ? `${city},\n${state}` : city
}

interface Home4HeaderProps {
  /** Selected city label ("" while loading → "Select city"). */
  city: string
  onCityPress: () => void
}

export function Home4Header({ city, onCityPress }: Home4HeaderProps) {
  const s = useV4()
  const router = useRouter()
  const label = city ? cityLabel(city) : 'Select city'
  return (
    <View style={{ position: 'relative', height: 54 * s, flexDirection: 'row', alignItems: 'flex-start' }}>
      {/* Location block — pin + 2-line city + chevron-down. The chevron
          rides the first line's optical center, as designed. */}
      <Pressable
        onPress={onCityPress}
        accessibilityRole="button"
        accessibilityLabel={`City ${label.replace('\n', ' ')}, change city`}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={({ pressed }) => [
          styles.city,
          { left: 24 * s, marginTop: 16.5 * s, gap: 6 * s },
          pressed && styles.pressed,
        ]}
      >
        <FigIcon name="pin" s={s} />
        <View style={{ maxWidth: 128 * s }}>
          <Text
            style={[v4t('location', s), { color: v4c.ink }]}
            numberOfLines={2}
            maxFontSizeMultiplier={1.15}
          >
            {label}
          </Text>
        </View>
        <FigIcon name="chevron-down" s={s} style={{ marginTop: 8.25 * s }} />
      </Pressable>

      {/* Wordmark — exactly the frame center (absolute full-width layer,
          centered; robust to the script face's natural width). */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.markLayer]}>
        <Text style={[v4t('wordmark', s), { color: v4c.ink }]} maxFontSizeMultiplier={1.15}>
          Atur Seva
        </Text>
      </View>

      {/* Bell — a 44dp touch wrapper centered on the ink's design center
          (x387 from frame left; y26 into the zone). The red unread dot is
          native state art at the bell's top-right. */}
      <Pressable
        onPress={() => void router.push('/notifications')}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        style={({ pressed }) => [
          styles.bell,
          { right: 39 * s - 22, top: 26 * s - 22 },
          pressed && styles.pressed,
        ]}
      >
        <View>
          <FigIcon name="bell" s={s} />
          <View style={[styles.dot, { top: -1.5 * s, right: -5.5 * s }]} />
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  city: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  /** Full-width absolute layer that centers the wordmark on the frame. */
  markLayer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** 44×44 hit area (absolute floor, unscaled); the ink centers inside. */
  bell: {
    position: 'absolute',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: v4c.redDot,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
})
