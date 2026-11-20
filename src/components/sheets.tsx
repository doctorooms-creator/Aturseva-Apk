/**
 * Bottom sheet (S3 suggest, city picker): sheets spring from the bottom —
 * the task NEVER leaves its screen (doc 04 law 6). Modal-based, grab
 * handle, sheet-top radius 24, scrim tap = close.
 */

import { type ReactNode } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { colors, elevation, radius, space } from '@/lib/tokens'

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
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} accessibilityLabel={accessibilityLabel}>
      <View style={styles.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Sheet band karein" />
        <View style={styles.sheet}>{children}</View>
      </View>
    </Modal>
  )
}

export function GrabHandle() {
  return <View style={styles.handle} />
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.canvas,
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
    backgroundColor: colors.hairline,
    marginTop: space.s4,
    marginBottom: space.s12,
  },
})
