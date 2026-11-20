/**
 * Search field (S3 crown): 56px pill, canvas-soft fill, search icon left.
 * Focus state handled by the parent (suggest sheet law — the field never
 * navigates; focus raises the sheet). Ref forwarded for blur control
 * (the sheet-close focus-restore guard).
 */

import { type ComponentRef, type Ref } from 'react'
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native'
import { Search } from 'lucide-react-native'
import { colors, radius, space, type as typo } from '@/lib/tokens'

export function SearchField({ ref, ...props }: TextInputProps & { ref?: Ref<ComponentRef<typeof TextInput>> }) {
  return (
    <View style={styles.wrap}>
      <Search size={20} color={colors.mute} strokeWidth={2} />
      <TextInput
        placeholder="Doctor name or problem — fever, knee pain"
        placeholderTextColor={colors.mute}
        underlineColorAndroid="transparent"
        autoCorrect={false}
        returnKeyType="search"
        ref={ref}
        {...props}
        style={[styles.input, props.style]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.canvasSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    paddingHorizontal: space.s20,
  },
  input: {
    ...typo.body,
    flex: 1,
    color: colors.ink,
    paddingVertical: 0,
  },
})
