/**
 * BOTTOM TABS (doc 05 §1): exactly 3 in P0 — Home · Bookings · Profile.
 * Active = ink icon+label; inactive = mute. No color explosion. Labels
 * always (icons-without-labels is a doc 03 don't).
 */

import { Tabs } from 'expo-router'
import { CalendarCheck2, Home, UserRound } from 'lucide-react-native'
import { colors } from '@/lib/tokens'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.mute,
        tabBarStyle: {
          backgroundColor: colors.canvas,
          borderTopColor: colors.hairline,
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
