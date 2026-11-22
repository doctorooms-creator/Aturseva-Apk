/**
 * Search field (S3 crown): 56px pill, canvas-soft fill, search icon left.
 * Focus state handled by the parent (suggest sheet law — the field never
 * navigates; focus raises the sheet). Ref forwarded for blur control
 * (the sheet-close focus-restore guard).
 *
 * APK-H3: variant="glass" = the website's G3 search-pill grammar for the
 * cream home canvas (glass v1: translucent fill + 1px edge + shine
 * hairline — the same trio the nav pill uses; true blur = vc3 APK).
 * Default "soft" stays for white canvases (hospitals browse).
 */

import { type ComponentRef, type Ref } from 'react'
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native'
import { Search } from 'lucide-react-native'
import { radius, space, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'

export function SearchField({
  ref,
  variant = 'soft',
  ...props
}: TextInputProps & {
  ref?: Ref<ComponentRef<typeof TextInput>>
  /** "glass" = home hero on cream; "soft" = default white canvases. */
  variant?: 'soft' | 'glass'
}) {
  const c = useColors()
  const glass = variant === 'glass'
  return (
    <View
      style={[
        styles.wrap,
        glass
          ? {
              backgroundColor: c.glassFill,
              borderWidth: 1,
              borderColor: c.glassEdge,
              elevation: 2,
              shadowColor: '#0A0A0A',
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
            }
          : { backgroundColor: c.canvasSoft },
      ]}
    >
      {/* Glass shine — the search pill's inset top hairline (website
          w-searchpill recipe, v1 simulated). */}
      {glass ? <View style={[styles.shine, { backgroundColor: c.glassShine }]} /> : null}
      <Search size={20} color={glass ? c.tealText : c.mute} strokeWidth={2} />
      <TextInput
        placeholder="Doctor name or problem — fever, knee pain"
        placeholderTextColor={c.mute}
        underlineColorAndroid="transparent"
        autoCorrect={false}
        returnKeyType="search"
        ref={ref}
        {...props}
        style={[styles.input, { color: c.ink }, props.style]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    height: 56,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    paddingHorizontal: space.s20,
  },
  shine: {
    position: 'absolute',
    top: 1,
    left: space.s12,
    right: space.s12,
    height: 1,
    borderRadius: radius.pill,
  },
  input: {
    ...typo.body,
    flex: 1,
    paddingVertical: 0,
  },
})
