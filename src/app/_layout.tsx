/**
 * ROOT LAYOUT (doc 05 §3): stack + session bootstrap.
 * Splash law (S1): auto-route in ≤400ms after flags load — native splash
 * (expo-splash-screen, diya mark on white) covers until the first route
 * decision renders. Never a spinner here.
 *
 * The first-run redirect fires EXACTLY ONCE (ref-guarded) and the Stack
 * always mounts — a Redirect left in the render tree would loop the
 * router and never let the onboarding screen load.
 *
 * APK-B4: the tree is wrapped in ThemeProvider (dark set consumed from
 * here down — doc 03 §2 note). StatusBar + stack chrome resolve with
 * the theme so the system chrome never flashes wrong on theme flips.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter, Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { getOnboardingDone } from '@/lib/storage'
import { ThemeProvider, useTheme } from '@/lib/theme'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  )
}

function Root() {
  const router = useRouter()
  const { resolved, c } = useTheme()
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
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: c.canvas },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="search" />
        <Stack.Screen name="doctor/[id]" />
        <Stack.Screen name="doctor/[id]/book" />
        <Stack.Screen name="booking/[id]" />
        <Stack.Screen name="booking/[id]/queue" options={{ animation: 'slide_from_bottom' }} />
        {/* APK-B6 · P1 polish stack routes (auth-gated, guest = doorway) */}
        <Stack.Screen name="notifications" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="rate" />
      </Stack>
    </SafeAreaProvider>
  )
}
