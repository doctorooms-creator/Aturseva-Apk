/**
 * NAV PILL — the floating glass tab shell (doc 17 PART 3, H2; Practo
 * pattern 3 + the website's measured glass grammar, doc 16 PART 2 G1).
 *
 * Geometry: 64 tall · 999 radius · 16 side margins · bottom =
 * safe-inset + 12 · absolute — floats OVER content. Screens hand-pad
 * their scroll ends with NAV_PILL_FOOTPRINT (+ their own safe inset) —
 * the B9 scroll-limit law, last row never tucks behind the shell.
 *
 * Glass v1 (OTA, SIMULATED — no native blur): translucent fill + 1px
 * edge + inset top shine hairline + navPill elevation. The true
 * BlurView (expo-blur) is NOT in the shipped binary (measured, doc 16
 * PART 2) — it rides the one vc3 APK per doc 17 D4. Flip point marked
 * GLASS_V2 below.
 *
 * Tabs: exactly 3 (doc 05 §1 law) · labels ALWAYS (doc 03 — icons-only
 * is a don't) · full-height press targets (64 ≥ TOUCH 44) · active =
 * ink filled-circle behind white icon + ink label (Practo's own home
 * pattern; ink/canvas invert automatically in dark) · inactive = mute.
 * Press contract mirrors the built-in bar exactly: preventable
 * `tabPress` event → navigateToTab (no-op when already focused).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { BottomTabBarProps } from 'expo-router/tabs'
import { elevation, radius, space, TOUCH } from '@/lib/tokens'
import { useColors } from '@/lib/theme'

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
  const bottom = Math.max(insets?.bottom ?? 0, 0) + NAV_PILL_FLOAT_GAP

  return (
    <View
      accessibilityLabel="Main navigation"
      style={[
        styles.float,
        elevation.navPill,
        {
          bottom,
          height: NAV_PILL_HEIGHT,
          backgroundColor: c.glassFill,
          borderColor: c.glassEdge,
        },
      ]}
    >
      {/* GLASS_V2 flip point (vc3 APK): replace this simulated stack with
          <BlurView> + translucent tint overlay. Shine hairline below = the
          website's inset-top-light recipe (w-nav), RN-native. */}
      <View style={[styles.shine, { backgroundColor: c.glassShine }]} />

      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = index === state.index
          const descriptor = descriptors[route.key]
          const { options } = descriptor ?? {}
          const label =
            typeof options?.tabBarLabel === 'string' ? options.tabBarLabel : (options?.title ?? route.name)
          const icon = options?.tabBarIcon?.({
            focused,
            color: focused ? c.canvas : c.mute,
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
              <View style={[styles.circle, { backgroundColor: focused ? c.ink : 'transparent' }]}>
                {icon}
              </View>
              <Text
                style={[
                  styles.label,
                  { color: focused ? c.ink : c.mute, fontWeight: focused ? '600' : '500' },
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
    borderRadius: radius.pill,
    borderWidth: 1,
    zIndex: 10,
  },
  /** Inset top hairline — the measured glass "shine". */
  shine: {
    position: 'absolute',
    top: 1,
    left: space.s12,
    right: space.s12,
    height: 1,
    borderRadius: radius.pill,
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
  /** Practo pattern 3: filled circle BEHIND the icon when active. */
  circle: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.1,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.88,
  },
})
