/**
 * V4 HOME · ZONE 8 — LAB TESTS PROMO (doc 21): the mint-gradient card
 * (392×104 r15 #F8F9F8→#DCE5DC). Rendered as ONE original Figma image —
 * the whole card as the owner designed it (gradient + microscope/tube/
 * plant artwork + text + CTA pill, all baked) — the pixel-perfect
 * reproduction; a native rebuild would re-type the design's own copy.
 * The whole card is the press target → aturseva.com/labs (D3 ruling:
 * the app is the entry, the website is the lab cart).
 *
 * RN clips the baked corners with borderRadius 15 — the design's own
 * r15 arc, so no page-white fringe survives on any surface.
 */

import { Pressable, StyleSheet } from 'react-native'
import * as Linking from 'expo-linking'
import { useV4 } from '@/components/home4/v4'
import { FigArt } from '@/components/home4/figma'

const LABS_WEB_URL = 'https://aturseva.com/labs'

export function Home4LabPromo() {
  const s = useV4()
  return (
    <Pressable
      onPress={() => void Linking.openURL(LABS_WEB_URL).catch(() => {})}
      accessibilityRole="button"
      accessibilityLabel="Book lab tests on aturseva.com (opens the website)"
      style={({ pressed }) => [
        styles.card,
        {
          marginHorizontal: 17 * s,
          marginTop: 14 * s,
          borderRadius: 15 * s,
        },
        pressed && styles.pressed,
      ]}
    >
      <FigArt name="lab-card" width={392 * s} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    backgroundColor: '#FDFDFD',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
})
