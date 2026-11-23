/**
 * NAV PILL — the floating tab shell (V3.1 restyle of doc 17 PART 3 / H2).
 *
 * Geometry: 64 tall · 36 radius (V3 refresh — the 999 stadium gives way
 * to the mockup's softer corner) · 16 side margins · bottom =
 * safe-inset + 12 · absolute — floats OVER content. Screens hand-pad
 * their scroll ends with NAV_PILL_FOOTPRINT (+ their own safe inset) —
 * the B9 scroll-limit law, last row never tucks behind the shell.
 *
 * V3 fill: the simulated-glass stack (translucent fill + edge + inset
 * shine) is RETIRED — the pill is now SOLID white (light) / #161618
 * (dark) with a hairline border + the soft navPill elevation, matching
 * the mockup's clean white pill. (The GLASS_V2/BlurView flip point died
 * with the glass; solid is the spec.)
 *
 * Tabs: 4 (V3 — Home · Bookings · Records · Account) via state.routes
 * (flex:1 each). Labels ALWAYS (doc 03 — icons-only is a don't) ·
 * full-height press targets (64 ≥ TOUCH 44) · active = SOFT GRAY POD
 * (46×30 r28, #EFEFEF light / #1E1E22 dark) behind an ink icon + ink
 * 700 label · inactive = transparent pod, mute icon + mute 500 label.
 * Labels are Geist 9/12 (the V3 type ramp's nav scale).
 * Press contract mirrors the built-in bar exactly: preventable
 * `tabPress` event → navigateToTab (no-op when already focused).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { BottomTabBarProps } from 'expo-router/tabs'
import { elevation, radius, space, TOUCH } from '@/lib/tokens'
import { useColors, useTheme } from '@/lib/theme'

/** Pill height — the geometry contract (64, doc 17 PART 3). */
export const NAV_PILL_HEIGHT = 64
/** Gap between pill bottom edge and the screen's bottom safe edge. */
export const NAV_PILL_FLOAT_GAP = 12
/**
 * What a tab screen's scroll-end must clear: pill 64 + float gap 12 +
 * 16 breathing. Screens add their own safe-area bottom inset on top
 * (insets differ per device — web 0, gesture-nav ~24-48).
 */
export const NAV_PILL_FOOTPRINT = NAV_PILL_HEIGHT + NAV_PILL_FLOAT_GAP + space.s16

export function NavPill({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const c = useColors()
  const { resolved } = useTheme()
  const bottom = Math.max(insets?.bottom ?? 0, 0) + NAV_PILL_FLOAT_GAP
  // V3 solid fill + active pod grays (spec constants, not token slots).
  const pillFill = resolved === 'dark' ? c.cardSoft : c.canvas
  const podFill = resolved === 'dark' ? '#1E1E22' : '#EFEFEF'

  return (
    <View
      accessibilityLabel="Main navigation"
      style={[
        styles.float,
        elevation.navPill,
        {
          bottom,
          height: NAV_PILL_HEIGHT,
          backgroundColor: pillFill,
          borderColor: c.hairline,
        },
      ]}
    >
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = index === state.index
          const descriptor = descriptors[route.key]
          const { options } = descriptor ?? {}
          const label =
            typeof options?.tabBarLabel === 'string' ? options.tabBarLabel : (options?.title ?? route.name)
          const icon = options?.tabBarIcon?.({
            focused,
            color: focused ? c.ink : c.mute,
            size: 22,
          })
          const onPress = () => {
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })
            if (!focused && !event.defaultPrevented) navigateToTab(route.key)
          }
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={() => {
                emitter.emit({ type: 'tabLongPress', target: route.key })
              }}
              accessibilityRole="tab"
              accessibilityLabel={typeof label === 'string' ? label : route.name}
              accessibilityState={{ selected: focused }}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            >
              <View style={[styles.pod, { backgroundColor: focused ? podFill : 'transparent' }]}>
                {icon}
              </View>
              <Text
                style={[
                  styles.label,
                  focused ? styles.labelOn : styles.labelOff,
                  { color: focused ? c.ink : c.mute },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  /** Floats over content (screens fill the full height; the bar is out
   *  of flow). zIndex keeps it above detached sibling screens. */
  float: {
    position: 'absolute',
    left: space.s16,
    right: space.s16,
    borderRadius: radius.navPill,
    borderWidth: 1,
    zIndex: 10,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  /** Full pill height (64) — comfortably above the 44 TOUCH floor. */
  tab: {
    flex: 1,
    minHeight: TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  /** V3 active pod: soft gray rounded rect BEHIND the icon (46×30 r28). */
  pod: {
    width: 46,
    height: 30,
    borderRadius: radius.activePod,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Labels 9/12 (V3 nav scale) — Geist 700 active / 500 inactive. */
  label: {
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.1,
  },
  labelOn: {
    fontFamily: 'Geist_700Bold',
    fontWeight: '700',
  },
  labelOff: {
    fontFamily: 'Geist_500Medium',
    fontWeight: '500',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.88,
  },
})
