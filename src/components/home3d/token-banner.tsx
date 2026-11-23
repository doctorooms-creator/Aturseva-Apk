/**
 * V3 HOME · TOKEN BANNER (Home V3.1 · P3): the ink promo card — "Skip the
 * wait. Book your token online." — with the token-stack art on the right.
 * The art ships with BLANK token cards by design (the C1 no-text law);
 * a live token number is stamped onto the top card via the overlay when
 * one is passed. The home keeps it a static promo (tokenNumber stays
 * undefined there — the live queue lives in the appointment card), but
 * the prop exists so the banner can carry a real figure later.
 *
 * White-on-ink constants are the spec's own (rgba washes + #fff on the
 * bannerInk surface — dark-mode correct by construction: the card is
 * near-black in BOTH modes). The overlay's grays sit on the pre-rendered
 * art (fixed light artwork), so they are literals like any art overlay.
 *
 * Zone geometry: owns marginHorizontal 24, the spec'd marginTop 22 from
 * the quick-actions band, and the marginBottom 44 that hands the rhythm
 * to the Section bands below.
 */

import { StyleSheet, Text, View } from 'react-native'
import { CalendarCheck2, Zap } from 'lucide-react-native'
import { space } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { v3 } from '@/components/home3d/v3-type'
import { Asset3D } from '@/components/home3d/asset'

interface TokenBannerProps {
  /** Live token figure for the art's top card — absent = "TOKEN" wordmark. */
  tokenNumber?: string | null
}

export function TokenBanner({ tokenNumber }: TokenBannerProps) {
  const c = useColors()
  return (
    <View style={[styles.card, { backgroundColor: c.bannerInk }]}>
      <View style={styles.copy}>
        <Text style={[v3.promoLead, { color: 'rgba(255,255,255,0.85)' }]}>Skip the wait.</Text>
        <Text style={[v3.promoTitle, { color: '#FFFFFF' }]}>Book your token online.</Text>
        <View style={styles.pillStack}>
          <View style={styles.pill}>
            <Zap size={11} color="#FFFFFF" strokeWidth={2} />
            <Text style={[v3.chip, { color: '#FFFFFF' }]}>Real-time queue</Text>
          </View>
          <View style={styles.pill}>
            <CalendarCheck2 size={11} color="#FFFFFF" strokeWidth={2} />
            <Text style={[v3.chip, { color: '#FFFFFF' }]}>Confirmed slot</Text>
          </View>
        </View>
      </View>
      <View style={styles.stack}>
        <Asset3D name="token-stack" width={108} />
        <View style={styles.stackOverlay}>
          {tokenNumber ? (
            <View style={styles.tokenCol}>
              <Text style={styles.tokenWord}>Token</Text>
              <Text style={[v3.metricNum, { color: '#0A0A0A' }]}>{tokenNumber}</Text>
            </View>
          ) : (
            <Text style={styles.tokenStatic}>TOKEN</Text>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginTop: 22,
    marginBottom: 44,
    marginHorizontal: space.s24,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    gap: 8,
  },
  pillStack: {
    marginTop: 4,
    gap: 6,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  stack: {
    position: 'relative',
  },
  /** Stamps the art's top (blank-by-design) token card. */
  stackOverlay: {
    position: 'absolute',
    top: '26%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tokenCol: {
    alignItems: 'center',
    gap: 1,
  },
  tokenWord: {
    fontFamily: 'Geist_500Medium',
    fontSize: 7.5,
    fontWeight: '500',
    lineHeight: 9,
    color: '#6E6E73',
  },
  tokenStatic: {
    fontFamily: 'Geist_700Bold',
    fontSize: 8,
    fontWeight: '700',
    lineHeight: 10,
    letterSpacing: 1,
    color: '#0A0A0A',
  },
})
