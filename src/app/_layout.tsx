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
 *
 * V3.1 (P2 foundations): a FONT GATE joins the splash law — every Geist
 * + GeistMono face the V3 type ramp needs is loaded here (useFonts),
 * and the native splash stays up until BOTH the boot flag resolves AND
 * the faces are resident (the ramp never paints in the system fallback).
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter, Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
} from '@expo-google-fonts/geist'
import {
  GeistMono_400Regular,
  GeistMono_600SemiBold,
  GeistMono_700Bold,
} from '@expo-google-fonts/geist-mono'
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
  // V3 font gate: the map keys are the fontFamily strings the V3 type
  // ramp consumes ("Geist_600SemiBold" etc. — the package's own naming).
  const [fontsLoaded, fontError] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_800ExtraBold,
    GeistMono_400Regular,
    GeistMono_600SemiBold,
    GeistMono_700Bold,
  })
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
      }
      // State ALWAYS resolves (both branches) — null only while booting.
      setBooted(done)
    })()
    return () => {
      mounted = false
    }
  }, [router])

  // Splash comes down ONLY when BOTH gates clear: the boot flag resolved
  // (route decision made — the S1 law) AND the font gate settled (loaded —
  // or errored, in which case waiting is pointless: the ramp falls back to
  // system faces rather than hang on the splash forever).
  // The onboarding redirect keeps its 250ms paint-delay (no flash);
  // hideAsync is idempotent, so whichever gate clears last owns the hide.
  const fontsSettled = fontsLoaded || fontError !== null
  useEffect(() => {
    if (booted === null || !fontsSettled) return
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {})
    }, redirected.current ? 250 : 0)
    return () => clearTimeout(t)
  }, [booted, fontsSettled])

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
        {/* APK-B7 · hospitals browse (public — guest ok) */}
        <Stack.Screen name="hospitals" />
        <Stack.Screen name="hospital/[id]" />
      </Stack>
    </SafeAreaProvider>
  )
}
