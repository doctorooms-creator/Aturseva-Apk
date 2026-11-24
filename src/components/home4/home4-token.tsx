/**
 * V4 HOME · ZONE 5 — ONLINE TOKEN BANNER (doc 21): the #252525 ink card
 * (392×82 r14). "Skip the wait.\nBook your token online." 16.5 Bold
 * white; the chips are INLINE (no pill borders): ⚡ Real-time queue +
 * 📅 Confirmed slot at 10 Medium white on the original Figma white-on-ink
 * icons. The token-stack artwork (145×81, right radii baked) sits flush
 * to the banner's right edge, 1px proud of its top — exactly as sliced.
 */

import { Text, View } from 'react-native'
import { useV4, v4t, v4c } from '@/components/home4/v4'
import { FigIcon, FigArt } from '@/components/home4/figma'

export function Home4TokenBanner() {
  const s = useV4()
  return (
    <View
      style={{
        // minHeight (not height): at 1.0 the content fits exactly in 82 —
        // pixel law holds — but a user's larger text grows the card
        // instead of clipping it (overflow: hidden stays for the art).
        minHeight: 82 * s,
        borderRadius: 14 * s,
        marginHorizontal: 17 * s,
        marginTop: 18 * s,
        backgroundColor: v4c.banner,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          paddingLeft: 24 * s,
          paddingTop: 12 * s,
          // Keep text clear of the token-stack art zone (145 wide, flush
          // right = art-left at 247; minus the 24 left pad = exactly 223
          // of text zone, the design's own measure): long text wraps
          // instead of running under the artwork. At 1.0 the chips row
          // (≈217) still fits one line — pixel law preserved.
          paddingRight: 145 * s,
        }}
      >
        <Text
          style={[v4t('bannerTitle', s), { color: v4c.white }]}
          maxFontSizeMultiplier={1.15}
        >
          {'Skip the wait.\nBook your token online.'}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            rowGap: 4 * s,
            marginTop: 7 * s,
            gap: 6 * s,
          }}
        >
          <FigIcon name="lightning" s={s} />
          <Text style={[v4t('chip', s), { color: v4c.white }]} maxFontSizeMultiplier={1.15}>
            Real-time queue
          </Text>
          <View style={{ width: 18 * s }} />
          <FigIcon name="calendar" s={s} />
          <Text style={[v4t('chip', s), { color: v4c.white }]} maxFontSizeMultiplier={1.15}>
            Confirmed slot
          </Text>
        </View>
      </View>
      {/* The stack art — flush right, 1px proud of the top, on top. */}
      <FigArt name="token-stack" width={145 * s} style={{ position: 'absolute', right: 0, top: 0.5 * s }} />
    </View>
  )
}
