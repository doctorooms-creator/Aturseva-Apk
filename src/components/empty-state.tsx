/**
 * Empty state = doorway, never dead-end (doc 03 §7): line-art icon (2
 * colors max) + one human sentence + 1-3 action chips.
 */

import { StyleSheet, Text, View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { colors, space, type as typo } from '@/lib/tokens'
import { Chip } from '@/components/press'

export function EmptyState({
  icon: Icon,
  title,
  caption,
  actions,
}: {
  icon: LucideIcon
  title: string
  caption?: string
  actions?: { label: string; onPress: () => void }[]
}) {
  return (
    <View style={styles.wrap}>
    <View style={styles.iconWrap}>
        <Icon size={32} color={colors.mute} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      {actions && actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map((a) => (
            <Chip key={a.label} label={a.label} onPress={a.onPress} />
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    padding: space.s32,
    gap: space.s12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: colors.canvasSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typo.title,
    color: colors.ink,
    textAlign: 'center',
  },
  caption: {
    ...typo.caption,
    color: colors.body,
    textAlign: 'center',
    maxWidth: 280,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.s8,
    justifyContent: 'center',
    marginTop: space.s8,
  },
})
