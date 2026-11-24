/**
 * BOTTOM TABS (doc 05 §1 · V4 zone 9): 4 tabs — Home · Bookings ·
 * Records · Account. The pill (NavPill V4) maps each route to its
 * original Figma icon by name; tabBarIcon options are not used (the
 * icons are baked ink art, never tinted vectors). Labels always.
 */

import { Tabs } from 'expo-router'
import { NavPill } from '@/components/nav-pill'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <NavPill {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
      <Tabs.Screen name="records" options={{ title: 'Health Records' }} />
      <Tabs.Screen name="profile" options={{ title: 'Account' }} />
    </Tabs>
  )
}
