/**
 * V3 HOME · QUICK ACTIONS (Home V3.1 · P3): the four doorways — Doctors,
 * Hospitals, Lab Tests, Video Consult — on the pre-rendered 3D tile art.
 * Equal-height white tiles (top-aligned content, the art sets the anchor
 * row) with the search crown's soft shadow. Three routes are in-app;
 * Lab Tests hands off to aturseva.com/labs (the D3 ruling — the app is
 * the entry, the website is the lab cart).
 *
 * Zone geometry: owns marginHorizontal 24 + the spec'd marginTop 18 from
 * the hero/search band above.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { useColors } from '@/lib/theme'
import { v3 } from '@/components/home3d/v3-type'
import { Asset3D, type AssetName } from '@/components/home3d/asset'
import { space } from '@/lib/tokens'

const LABS_WEB_URL = 'https://aturseva.com/labs'

interface QuickTile {
  key: string
  title: string
  sub: string
  asset: AssetName
  /** Tile art height (dp) — the manifest aspect derives the width. */
  assetHeight: number
  onPress: () => void
}

export function QuickActions() {
  const c = useColors()
  const router = useRouter()
  const tiles: QuickTile[] = [
    {
      key: 'doctors',
      title: 'Doctors',
      sub: 'Clinic & Video',
      asset: 'tile-doctor',
      assetHeight: 64,
      onPress: () => void router.push('/search'),
    },
    {
      key: 'hospitals',
      title: 'Hospitals',
      sub: 'OPD & Departments',
      asset: 'tile-hospital',
      assetHeight: 64,
      onPress: () => void router.push('/hospitals'),
    },
    {
      key: 'labs',
      title: 'Lab Tests',
      sub: 'Diagnostics',
      asset: 'tile-labtubes',
      assetHeight: 58,
      onPress: () => void Linking.openURL(LABS_WEB_URL).catch(() => {}),
    },
    {
      key: 'video',
      title: 'Video Consult',
      sub: 'Consult from home',
      asset: 'tile-video',
      assetHeight: 64,
      onPress: () => void router.push({ pathname: '/search', params: { q: 'video consult' } }),
    },
  ]
  return (
    <View style={styles.row}>
      {tiles.map((t) => (
        <Pressable
          key={t.key}
          onPress={t.onPress}
          accessibilityRole="button"
          accessibilityLabel={`${t.title} — ${t.sub}`}
          style={({ pressed }) => [
            styles.tile,
            { backgroundColor: c.canvas, borderColor: c.hairline2 },
            pressed && styles.pressed,
          ]}
        >
          <Asset3D name={t.asset} height={t.assetHeight} />
          <Text style={[v3.tileTitle, { color: c.ink }]} numberOfLines={1}>
            {t.title}
          </Text>
          <Text style={[v3.tileSub, { color: c.mute2 }]} numberOfLines={2}>
            {t.sub}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    marginTop: 18,
    marginHorizontal: space.s24,
    flexDirection: 'row',
    gap: 10,
  },
  /** Equal heights, content anchored from the top (the art leads). */
  tile: {
    flex: 1,
    height: 146,
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
