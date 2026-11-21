/**
 * Empty state = doorway, never dead-end (doc 03 §7): line-art icon (2
 * colors max) + one human sentence + 1-3 action chips.
 */

import { StyleSheet, Text, View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { space, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { Chip, PillButton } from '@/components/press'

export function EmptyState({
  icon: Icon,
  title,
  caption,
  actions,
}: {
  icon: LucideIcon
  title: string
  caption?: string
  actions?: { label: string; onPress: () => void; primary?: boolean }[]
}) {
  const c = useColors()
  return (
    <View style={styles.wrap}>
    <View style={[styles.iconWrap, { backgroundColor: c.canvasSoft }]}>
        <Icon size={32} color={c.mute} strokeWidth={1.5} />
      </View>
      <Text style={[styles.title, { color: c.ink }]}>{title}</Text>
      {caption ? <Text style={[styles.caption, { color: c.body }]}>{caption}</Text> : null}
      {actions && actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map((a) =>
            // B12 (VLM d03/d04): the strongest recovery action may carry
            // the screen's ONE primary treatment (doc 03 hierarchy law) —
            // ink PillButton, same grammar as every primary CTA; alternates
            // stay quiet chips. 44px either way (touch law).
            a.primary ? (
              <PillButton key={a.label} label={a.label} variant="primary" height={44} onPress={a.onPress} />
            ) : (
              <Chip key={a.label} label={a.label} onPress={a.onPress} />
            ),
          )}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typo.title,
    textAlign: 'center',
  },
  caption: {
    ...typo.caption,
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
