/**
 * ROOT LAYOUT (doc 05 §3): stack + session bootstrap.
 * Splash law (S1): auto-route in ≤400ms after flags load — native splash
 * (expo-splash-screen, diya mark on white) covers until the first route
 * decision renders. Never a spinner here.
 *
 * The first-run redirect fires EXACTLY ONCE (ref-guarded) and the Stack
 * always mounts — a Redirect left in the render tree would loop the
 * router and never let the onboarding screen load.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter, Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { getOnboardingDone } from '@/lib/storage'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const router = useRouter()
  // null = still booting (native splash covers); then the flag value.
  const [booted, setBooted] = useState<boolean | null>(null)
  const redirected = useRef(false)

  useEffect(() => {
    let mounted = true
    void (async () => {
      const done = await getOnboardingDone()
      if (!mounted) return
      if (!done && !redirected.current) {
        // S1 auto-route: first run lands on onboarding (S2) — once only.
        redirected.current = true
        router.replace('/onboarding')
        // Native splash hides just after the route paints — no flash.
        setTimeout(() => {
          SplashScreen.hideAsync().catch(() => {})
        }, 250)
      } else {
        SplashScreen.hideAsync().catch(() => {})
      }
      // State ALWAYS resolves (both branches) — null only while booting.
      setBooted(done)
    })()
    return () => {
      mounted = false
    }
  }, [router])

  if (booted === null) return null

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      </Stack>
    </SafeAreaProvider>
  )
}
