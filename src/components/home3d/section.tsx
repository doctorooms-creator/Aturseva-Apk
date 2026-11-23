/**
 * V3 SECTION SHELL (Home V3.1 · P2 foundations): the repeating rhythm of
 * the rebuilt home — every band is a Section (24 horizontal · 44 between
 * bands · 12 header-to-content) with an optional "View all" action that
 * keeps the doc 04 TOUCH 44 floor via padding (the 14-high row pads to
 * exactly 44 — hit area, not visual weight).
 */

import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import { space, TOUCH } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { v3 } from '@/components/home3d/v3-type'

interface SectionHeaderProps {
  title: string
  /** Optional trailing "View all" action — omit to render title only. */
  onViewAll?: () => void
}

export function SectionHeader({ title, onViewAll }: SectionHeaderProps) {
  const c = useColors()
  return (
    <View style={styles.headRow}>
      <Text style={[v3.sectionTitle, styles.headTitle, { color: c.ink }]} numberOfLines={1}>
        {title}
      </Text>
      {onViewAll ? (
        <Pressable
          onPress={onViewAll}
          accessibilityRole="button"
          accessibilityLabel={`View all ${title}`}
          style={({ pressed }) => [styles.viewAll, pressed && styles.pressed]}
        >
          <Text style={[v3.viewAll, { color: c.body }]}>View all</Text>
          <ChevronRight size={12} color={c.body} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  )
}

interface SectionProps {
  title: string
  onViewAll?: () => void
  children: ReactNode
  /** Extra/override styles on the band (gap, margins). */
  style?: StyleProp<ViewStyle>
}

export function Section({ title, onViewAll, children, style }: SectionProps) {
  return (
    <View style={[styles.section, style]}>
      <SectionHeader title={title} onViewAll={onViewAll} />
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  /** Band rhythm: 24 in from the edges, 44 of air to the next band. */
  section: {
    marginHorizontal: space.s24,
    marginBottom: 44,
    gap: space.s12,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s12,
  },
  /** Long titles yield, the View-all action never wraps away. */
  headTitle: {
    flexShrink: 1,
  },
  /** TOUCH 44 via padding (doc 04 law): (44 − viewAll's 14 line) / 2 per side. */
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: (TOUCH - 14) / 2,
    paddingLeft: space.s8,
    paddingRight: 2,
  },
  pressed: {
    opacity: 0.7,
  },
})
