/**
 * BOTTOM TABS (doc 05 §1): 4 tabs as of V3.1 (P2 foundations) —
 * Home · Bookings · Records · Account. Labels always (icons-without-
 * labels is a doc 03 don't). No color explosion.
 *
 * APK-H2 (doc 17 PART 3): the bordered bottom bar is RETIRED — the
 * shell is now the floating PILL (NavPill, V3-restyled: solid fill +
 * soft active pod). The pill floats OVER content (absolute), so the
 * tab hosts hand-pad their scroll ends with NAV_PILL_FOOTPRINT + safe
 * inset (B9 scroll-limit law). Stack screens keep their own headers —
 * only these 4 hosts get the pill.
 */

import { Tabs } from 'expo-router'
import { CalendarCheck2, ClipboardList, Home, UserRound } from 'lucide-react-native'
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
      {/* V3.1: the records hub (4th tab) — doorways to reports, history,
          bills. Profile retitled "Account" the same release. */}
      <Tabs.Screen
        name="records"
        options={{
          title: 'Health Records',
          tabBarIcon: ({ color }) => <ClipboardList size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <UserRound size={22} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  )
}
