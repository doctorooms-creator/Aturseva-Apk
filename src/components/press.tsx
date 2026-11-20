/**
 * Press primitives — pill grammar (doc 03 §4): everything interactive is a
 * 999px pill; pressed = scale .98 + darken (80ms); min 44 touch (doc 04).
 */

import { type ReactNode } from 'react'
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native'
import { colors, motion, radius, space, TOUCH, type as typo } from '@/lib/tokens'

interface PillButtonProps {
  label: string
  onPress?: () => void
  /** primary = ink pill (the ONE primary action per screen). */
  variant?: 'primary' | 'secondary' | 'quiet'
  disabled?: boolean
  /** Spinner-in-place, text kept (doc 03 §5). */
  loading?: boolean
  /** 56 for screen-level CTAs; 44 rows. */
  height?: 44 | 52 | 56
  style?: StyleProp<ViewStyle>
}

export function PillButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  height = 52,
  style,
}: PillButtonProps) {
  const base: ViewStyle =
    variant === 'primary'
      ? { backgroundColor: colors.ink, height }
      : variant === 'secondary'
        ? { backgroundColor: colors.canvasSoft, height }
        : { backgroundColor: 'transparent', height: TOUCH }
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        base,
        variant === 'quiet' && styles.quiet,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          typo.bodyStrong,
          variant === 'primary' && { color: colors.canvas },
          variant === 'secondary' && { color: colors.ink },
          variant === 'quiet' && { color: colors.body },
        ]}
        numberOfLines={1}
      >
        {loading ? `${label}…` : label}
      </Text>
    </Pressable>
  )
}

interface ChipProps {
  label: string
  onPress?: () => void
  selected?: boolean
  disabled?: boolean
  /** Leading content (icon) inside the pill. */
  leading?: ReactNode
}

export function Chip({ label, onPress, selected = false, disabled = false, leading }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      hitSlop={6}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : styles.chipDefault,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {leading}
      <Text
        style={[typo.body, styles.chipText, selected && { color: colors.canvas }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  )
}

/** Quiet text row action (share/legal links) — still ≥44px hit. */
export function QuietAction({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.quietWrap} accessibilityRole="button">
      <Text style={[typo.caption, { color: colors.body }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.s24,
    minHeight: TOUCH,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.45,
  },
  quiet: {
    paddingHorizontal: space.s12,
  },
  chip: {
    borderRadius: radius.pill,
    minHeight: TOUCH,
    paddingHorizontal: space.s16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: space.s8,
  },
  chipDefault: {
    backgroundColor: colors.canvasSoft,
  },
  chipSelected: {
    backgroundColor: colors.ink,
  },
  chipText: {
    color: colors.ink,
  },
  quietWrap: {
    minHeight: TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.s8,
  },
})

// Keep motion import used (pressed duration documented at tokens.motion.press)
void motion.press
