/**
 * NAV PILL — V4 restyle (doc 21 zone 9 · doc 22): the design's own
 * floating bar. 402×58 r30 white + #EBEBEB hairline + the v4 shadow,
 * 12 side insets, bottom = safe-inset + 20·s (measured on the reference:
 * pill y845–903 in the 923 frame). Tabs: 4 × flex — the ACTIVE tab
 * carries the light selected pill (71×47 r25 #F3F3F3, measured
 * x28.5–98 · y850–895) behind the original Figma icon + a SemiBold ink
 * label; inactive tabs show their original outline icons with Regular
 * #414141 labels (the design keeps ink icons in both states — only the
 * pill + weight signal state).
 *
 * Fills from the tabs' own options: each tab's icon is its FigIcon
 * (the icon is baked ink — never tinted), the label rides below at the
 * design's 5 gap. Press contract mirrors the built-in bar exactly.
 */

import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import type { BottomTabBarProps } from 'expo-router/tabs'
import { useV4, v4c, v4Shadow, v4t } from '@/components/home4/v4'
import type { FigIconName } from '@/components/home4/figma'
import { FigIcon } from '@/components/home4/figma'

/** Pill height (design 58) — exported as the geometry contract. */
export const NAV_PILL_HEIGHT = 58
/** Gap between pill bottom edge and the screen's bottom safe edge
 *  (design px — measured y903 on the reference = 20 above the frame). */
export const NAV_PILL_FLOAT_GAP = 20
/**
 * What a tab screen's scroll-end must clear: pill 58 + float gap 20 +
 * 16 breathing (design px, held unscaled as a conservative dp ceiling
 * for every phone ≤ ~490dp wide — extra clearance is always safe).
 * Screens add their own safe-area bottom inset on top.
 */
export const NAV_PILL_FOOTPRINT = NAV_PILL_HEIGHT + NAV_PILL_FLOAT_GAP + 16

/** The tab order → its Figma icon ( baked ink, untinted). */
const TAB_ICON: Record<string, FigIconName> = {
  index: 'nav-home',
  bookings: 'nav-bookings',
  records: 'nav-records',
  profile: 'nav-account',
}

export function NavPill({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const s = useV4()
  const barW = Math.min(402 * s, useWindowDimensions().width - 2 * 12 * s)
  const bottom = Math.max(insets?.bottom ?? 0, 0) + NAV_PILL_FLOAT_GAP * s
  return (
    <View
      accessibilityLabel="Main navigation"
      style={[
        styles.float,
        v4Shadow,
        {
          bottom,
          height: 58 * s,
          width: barW,
          borderRadius: 30 * s,
          alignSelf: 'center',
          borderWidth: Math.max(0.5, 0.6 * s),
          backgroundColor: v4c.white,
          borderColor: v4c.strokeNav,
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
          const iconName = TAB_ICON[route.name] ?? 'nav-home'
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
              style={({ pressed }) => [styles.tab, { gap: 5 * s }, pressed && styles.pressed]}
            >
              {/* The active pill — behind the icon+label (design: only the
                  selected tab carries it; icons stay ink in both states). */}
              {focused ? <View style={[styles.pod, { width: 71 * s, height: 47 * s, borderRadius: 25 * s }]} /> : null}
              <FigIcon name={iconName} s={s} />
              <Text
                style={[
                  v4t(focused ? 'navLabel' : 'navLabelOff', s),
                  { color: focused ? v4c.ink : v4c.gray3 },
                ]}
                numberOfLines={1}
                maxFontSizeMultiplier={1.15}
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
  /** Centered via left 50% + negative margin (inline) — the design's
   *  12dp insets hold on every device width. */
  float: {
    position: 'absolute',
    zIndex: 10,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  /** Full pill height press targets. */
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** The light selected pill — absolute behind the tab's content. */
  pod: {
    position: 'absolute',
    backgroundColor: v4c.pill,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
})
