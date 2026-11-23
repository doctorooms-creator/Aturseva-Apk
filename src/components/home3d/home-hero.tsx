/**
 * V3 HOME · HERO (Home V3.1 · P3): the "Healthcare, made simpler." band.
 * Left: headline + one supporting line (the whole story in 13 words).
 * Right: the hero-3d doctor bust floating OVER the ambient blob — the art
 * wraps in an overflow-visible, z-lifted view so the head breaks the
 * blob's top edge (the mockup's signature move; the blob is the mat,
 * never the frame).
 *
 * Presentation-only: margins and spacing belong to the composition.
 */

import { StyleSheet, Text, View } from 'react-native'
import { useColors } from '@/lib/theme'
import { v3 } from '@/components/home3d/v3-type'
import { Asset3D } from '@/components/home3d/asset'

export function HomeHero() {
  const c = useColors()
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={[v3.heroTitle, { color: c.ink }]} numberOfLines={2}>
          Healthcare, made simpler.
        </Text>
        <Text style={[v3.heroSub, { color: c.body }]} numberOfLines={3}>
          Find doctors, book appointments and track your turn in real time.
        </Text>
      </View>
      <View style={[styles.blob, { backgroundColor: c.blob }]}>
        <View style={styles.artWrap}>
          <Asset3D name="hero-3d" width={150} style={styles.art} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: 148,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  /** Ambient mat behind the doctor bust. */
  blob: {
    width: 170,
    height: 150,
    borderRadius: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** The bust must break the blob's top edge — overflow visible + z-lift. */
  artWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    zIndex: 1,
  },
  art: {
    marginTop: -22,
  },
})
