/**
 * BOTTOM TABS (doc 05 §1): exactly 3 in P0 — Home · Bookings · Profile.
 * Labels always (icons-without-labels is a doc 03 don't). No color
 * explosion.
 *
 * APK-H2 (doc 17 PART 3): the bordered bottom bar is RETIRED — the
 * shell is now the floating GLASS PILL (NavPill): website glass grammar
 * v1 + ink filled-circle active tabs. The pill floats OVER content
 * (absolute), so the three tab hosts hand-pad their scroll ends with
 * NAV_PILL_FOOTPRINT + safe inset (B9 scroll-limit law). Stack screens
 * keep their own headers — only these 3 hosts get the pill.
 */

import { Tabs } from 'expo-router'
import { CalendarCheck2, Home, UserRound } from 'lucide-react-native'
import { NavPill } from '@/components/nav-pill'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <NavPill {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color }) => <CalendarCheck2 size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserRound size={22} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  )
}
