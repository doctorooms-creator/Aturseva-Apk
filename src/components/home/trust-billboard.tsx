/**
 * Z2 · TRUST BILLBOARD (doc 17 PART 4): the ink band with big tabular
 * numbers — the home's trust anchor (Practo pattern 10, billboard stats).
 *
 * Laws: real numbers ONLY (stats contract — doctors · hospitals ·
 * bookings; no labs count exists on the contract — honesty law wins over
 * any spec example) · loading = skeleton band · error = HIDE (the offline
 * banner owns degraded comms messaging; a half-empty billboard would
 * read as broken trust — worse than absent trust) · numbers white on ink
 * (max punch) + aqua pulse dots (tealLive graphics-only token — the
 * 2s ambient pulse, doc 03 §6).
 */

import { StyleSheet, Text, View } from 'react-native'
import { PulseDot } from '@/components/pulse-dot'
import { elevation, radius, space, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'

export interface BillboardStats {
  doctors: number
  hospitals: number
  bookings: number
}

function fmt(n: number): string {
  return n.toLocaleString('en-IN')
}

export function TrustBillboard({ stats }: { stats: BillboardStats }) {
  const c = useColors()
  return (
    <View
      accessibilityLabel={`${fmt(stats.doctors)} doctors, ${fmt(stats.hospitals)} hospitals, ${fmt(stats.bookings)} visits booked — live`}
      style={[styles.band, { backgroundColor: c.ink }, elevation.card]}
    >
      <Stat number={fmt(stats.doctors)} label="doctors" live />
      <Stat number={fmt(stats.hospitals)} label="hospitals" />
      <Stat number={fmt(stats.bookings)} label="visits booked" />
    </View>
  )
}

function Stat({ number, label, live = false }: { number: string; label: string; live?: boolean }) {
  const c = useColors()
  return (
    <View style={styles.stat}>
      <View style={styles.numberRow}>
        {live ? <PulseDot size={7} /> : null}
        <Text style={[styles.number, { color: c.canvas }]}>{number}</Text>
      </View>
      <Text style={[styles.label, { color: c.canvas }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

/** Loading band — mirrors the final geometry (the skeleton law). */
export function TrustBillboardSkeleton() {
  const c = useColors()
  return (
    <View
      style={[
        styles.band,
        { backgroundColor: c.canvas, borderColor: c.hairline, borderWidth: StyleSheet.hairlineWidth },
      ]}
    >
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.stat}>
          <View style={[styles.skNumber, { backgroundColor: c.canvasSoft }]} />
          <View style={[styles.skLabel, { backgroundColor: c.canvasSoft }]} />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  band: {
    flexDirection: 'row',
    borderRadius: radius.card,
    paddingVertical: space.s20,
    paddingHorizontal: space.s8,
    marginHorizontal: space.s16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  number: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  label: {
    ...typo.caption,
    opacity: 0.72,
  },
  skNumber: {
    height: 22,
    width: 64,
    borderRadius: radius.pill,
  },
  skLabel: {
    height: 12,
    width: 72,
    borderRadius: radius.pill,
  },
})
