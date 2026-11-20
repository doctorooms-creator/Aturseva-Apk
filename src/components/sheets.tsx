/**
 * Bottom sheet (S3 suggest, city picker): sheets spring from the bottom —
 * the task NEVER leaves its screen (doc 04 law 6). Modal-based, grab
 * handle, sheet-top radius 24, scrim tap = close.
 */

import { type ReactNode } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { elevation, radius, space } from '@/lib/tokens'
import { useColors } from '@/lib/theme'

export function BottomSheet({
  visible,
  onClose,
  children,
  accessibilityLabel,
}: {
  visible: boolean
  onClose: () => void
  children: ReactNode
  accessibilityLabel?: string
}) {
  const c = useColors()
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} accessibilityLabel={accessibilityLabel}>
      <View style={styles.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close sheet" />
        <View style={[styles.sheet, { backgroundColor: c.canvas }]}>{children}</View>
      </View>
    </Modal>
  )
}

export function GrabHandle() {
  const c = useColors()
  return <View style={[styles.handle, { backgroundColor: c.hairline }]} />
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.sheetTop,
    borderTopRightRadius: radius.sheetTop,
    paddingHorizontal: space.s16,
    paddingBottom: space.s24,
    paddingTop: space.s8,
    ...elevation.sheet,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 999,
    marginTop: space.s4,
    marginBottom: space.s12,
  },
})
