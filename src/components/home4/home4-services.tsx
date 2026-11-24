/**
 * V4 HOME · ZONE 4 — SERVICES (doc 21): the four doorways on the
 * original Figma tile art. Cards 92×98 r17 WHITE + #F2F2F2 hairline +
 * the v4 shadow; margins 17/15 with 8–9 gaps → flex:1 cards land at
 * exactly 92 wide. The art anchors from the top (5 in), title 4 below
 * the art, sub 2 below that. Three routes in-app; Lab Tests hands off
 * to aturseva.com/labs (D3 ruling: the app is the entry, the website is
 * the lab cart).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { useV4, v4t, v4c, v4Shadow } from '@/components/home4/v4'
import { FigArt, type FigArtName } from '@/components/home4/figma'

const LABS_WEB_URL = 'https://aturseva.com/labs'

interface Tile {
  key: string
  title: string
  sub: string
  art: FigArtName
  onPress: () => void
}

export function Home4Services() {
  const s = useV4()
  const router = useRouter()
  const tiles: Tile[] = [
    {
      key: 'doctors',
      title: 'Doctors',
      sub: 'Clinic & Video',
      art: 'tile-doctor',
      onPress: () => void router.push('/search'),
    },
    {
      key: 'hospitals',
      title: 'Hospitals',
      sub: 'OPD & Departments',
      art: 'tile-hospital',
      onPress: () => void router.push('/hospitals'),
    },
    {
      key: 'labs',
      title: 'Lab Tests',
      sub: 'Diagnostics',
      art: 'tile-lab',
      onPress: () => void Linking.openURL(LABS_WEB_URL).catch(() => {}),
    },
    {
      key: 'video',
      title: 'Video Consult',
      sub: 'Consult from home',
      art: 'tile-video',
      onPress: () => void router.push({ pathname: '/search', params: { q: 'video consult' } }),
    },
  ]
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 8.67 * s,
        marginHorizontal: 16 * s,
        marginTop: 16 * s,
      }}
    >
      {tiles.map((t) => (
        <Pressable
          key={t.key}
          onPress={t.onPress}
          accessibilityRole="button"
          accessibilityLabel={`${t.title} — ${t.sub}`}
          style={({ pressed }) => [
            styles.tile,
            {
              height: 98 * s,
              borderRadius: 17 * s,
              paddingTop: 5 * s,
              gap: 0,
              borderWidth: Math.max(0.5, 0.5 * s),
            },
            v4Shadow,
            pressed && styles.pressed,
          ]}
        >
          <FigArt name={t.art} height={53 * s} />
          <Text style={[v4t('tileTitle', s), { color: v4c.ink, marginTop: 4 * s }]} numberOfLines={1}>
            {t.title}
          </Text>
          <Text style={[v4t('tileSub', s), { color: v4c.gray1, marginTop: 2 * s }]} numberOfLines={1}>
            {t.sub}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: v4c.white,
    borderColor: v4c.strokeCard,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
