/**
 * Press primitives — pill grammar (doc 03 §4): everything interactive is a
 * 999px pill; pressed = scale .98 + darken (80ms); min 44 touch (doc 04).
 */

import { type ReactNode } from 'react'
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native'
import { motion, radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'

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
  const c = useColors()
  const base: ViewStyle =
    variant === 'primary'
      ? { backgroundColor: c.ink, height }
      : variant === 'secondary'
        ? { backgroundColor: c.canvasSoft, height }
        : { backgroundColor: 'transparent', height: TOUCH }
  // H1 CTA grammar (website .w-bookbtn): the ink primary floats — soft
  // lift shadow at rest, pressed scale .98 (below). The website's own
  // hover recipe (0 4px 18px rgba(21,21,21,.16)) translated RN-native.
  const ctaShadow: ViewStyle =
    variant === 'primary' ? styles.primaryLift : ({} as ViewStyle)
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
        ctaShadow,
        variant === 'quiet' && styles.quiet,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          typo.bodyStrong,
          {
            color:
              variant === 'primary' ? c.canvas : variant === 'quiet' ? c.body : c.ink,
          },
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
  /**
   * H3: fill for the UNSELECTED state on non-white canvases (the home
   * hero sits on cream — chips need the white card fill to read).
   * Default = canvasSoft (white canvases).
   */
  surface?: string
  /**
   * B14: SOFT selection tone for chips that toggle MODE/STATE (not the
   * patient's decision). Selected+soft = aquaSoft wash + tealText
   * (H1 re-measured: 5.39:1 light / 8.1:1 dark — tealLive is now
   * graphics-only #0D9488 at 3.68:1 on the wash, fails text AA) — reads
   * clearly selected WITHOUT competing with a same-surface ink primary
   * (the auth sheet's mode toggle vs its submit pill — the B14
   * dual-primary fix). The default ink-fill selection stays for decision
   * chips.
   */
  soft?: boolean
}

export function Chip({
  label,
  onPress,
  selected = false,
  disabled = false,
  leading,
  soft = false,
  surface,
}: ChipProps) {
  const c = useColors()
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
        { backgroundColor: selected ? (soft ? c.aquaSoft : c.ink) : (surface ?? c.canvasSoft) },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {leading}
      <Text
        style={[
          typo.body,
          styles.chipText,
          { color: selected ? (soft ? c.tealText : c.canvas) : c.ink },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  )
}

/** Quiet text row action (share/legal links) — still ≥44px hit.
 *  B11: optional tone 'error' — the QUIET destructive pattern (token
 *  screen cancel: text-only muted red, no icon — an iconed button reads
 *  louder than a quiet action should). */
export function QuietAction({
  label,
  onPress,
  tone = 'body',
}: {
  label: string
  onPress?: () => void
  tone?: 'body' | 'error'
}) {
  const c = useColors()
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.quietWrap} accessibilityRole="button">
      <Text style={[typo.caption, { color: tone === 'error' ? c.error : c.body }]} numberOfLines={1}>
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
  primaryLift: {
    shadowColor: '#0A0A0A',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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
  chipText: {},
  quietWrap: {
    minHeight: TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.s8,
  },
})

// Keep motion import used (pressed duration documented at tokens.motion.press)
void motion.press
