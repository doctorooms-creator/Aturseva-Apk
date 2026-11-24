/**
 * V4 HOME · ZONE 2 — HERO (doc 21): the compact 122-band. Headline
 * "Healthcare,\nmade simpler." (26 Bold, 2 lines) + sub (11.3, 2 lines)
 * on the left at x29; the original doctor+hospital illustration (199×133)
 * flush right at x210 — its top bleeds 11px ABOVE the zone line (the
 * design's signature overlap: the art leads, the copy follows at 26 in).
 */

import { Text, View } from 'react-native'
import { useV4, v4t, v4c } from '@/components/home4/v4'
import { FigArt } from '@/components/home4/figma'

export function Home4Hero() {
  const s = useV4()
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        // minHeight (not height): 133 exact at 1.0 (pixel law); a larger
        // user font wraps the subtitle further and grows the band
        // instead of clipping it against the search doorway.
        minHeight: 133 * s,
        marginTop: -11 * s,
      }}
    >
      {/* Text runway = the design's own geometry: x29 from the left, the
          art's left edge (x210) is the right bound — no extra padding (a
          10dp inset truncated "made simpler." at Geist's metrics). */}
      <View style={{ flex: 1, marginTop: 26 * s, paddingLeft: 29 * s, paddingRight: 0, gap: 7 * s }}>
        <Text
          style={[v4t('heroTitle', s), { color: v4c.ink }]}
          numberOfLines={3}
          maxFontSizeMultiplier={1.15}
        >
          {'Healthcare,\nmade simpler.'}
        </Text>
        <Text
          style={[v4t('heroSub', s), { color: v4c.gray1 }]}
          numberOfLines={4}
          maxFontSizeMultiplier={1.3}
        >
          {'Find doctors, book appointments\nand track your turn in real time.'}
        </Text>
      </View>
      <FigArt name="hero" width={199 * s} style={{ marginRight: 17 * s }} />
    </View>
  )
}
