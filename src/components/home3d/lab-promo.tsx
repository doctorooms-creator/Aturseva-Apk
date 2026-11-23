/**
 * V3 HOME · LAB PROMO (Home V3.1 · P4): the mint handoff card under the
 * lab rail — "Book Lab Tests from trusted labs" with the one ink pill of
 * the band (Book Tests → aturseva.com/labs, the D3 website-handoff
 * ruling) and the lab-tube art on the right.
 *
 * Zone geometry: follows the LabPills Section's own 44 bottom rhythm;
 * owns marginHorizontal 24 + marginBottom 44.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import * as Linking from 'expo-linking'
import { ArrowRight } from 'lucide-react-native'
import { space } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { v3 } from '@/components/home3d/v3-type'
import { Asset3D } from '@/components/home3d/asset'

const LABS_WEB_URL = 'https://aturseva.com/labs'

export function LabPromo() {
  const c = useColors()
  return (
    <View style={[styles.card, { backgroundColor: c.promoMint }]}>
      <View style={styles.main}>
        <Text style={[v3.mintTitle, { color: c.ink }]}>Book Lab Tests from trusted labs</Text>
        <Text style={[v3.mintSub, { color: c.body }]}>Home collection available</Text>
        <Pressable
          onPress={() => void Linking.openURL(LABS_WEB_URL).catch(() => {})}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          accessibilityRole="button"
          accessibilityLabel="Book lab tests on aturseva.com (opens the website)"
          style={({ pressed }) => [styles.pill, { backgroundColor: c.ink }, pressed && styles.pressed]}
        >
          <Text style={[v3.toolTitle, { color: '#FFFFFF' }]}>Book Tests</Text>
          <ArrowRight size={12} color="#FFFFFF" strokeWidth={2} />
        </Pressable>
      </View>
      <Asset3D name="tile-labtubes" height={78} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: space.s24,
    marginBottom: 44,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  main: {
    flex: 1,
    gap: 6,
  },
  /** The ink pill — white label + arrow are the spec's fixed constants. */
  pill: {
    marginTop: 2,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
