/**
 * BOTTOM TABS (doc 05 §1): exactly 3 in P0 — Home · Bookings · Profile.
 * Active = ink icon+label; inactive = mute. No color explosion. Labels
 * always (icons-without-labels is a doc 03 don't).
 *
 * APK-B4: bar chrome (background · hairline · tints) consumes the live
 * theme — dark flips with the rest of the app, no light-only surface.
 */

import { Tabs } from 'expo-router'
import { CalendarCheck2, Home, UserRound } from 'lucide-react-native'
import { useColors } from '@/lib/theme'

export default function TabsLayout() {
  const c = useColors()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.ink,
        tabBarInactiveTintColor: c.mute,
        tabBarStyle: {
          backgroundColor: c.canvas,
          borderTopColor: c.hairline,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
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
