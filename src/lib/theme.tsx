/**
 * ATURSEVA APP — theme runtime (APK-B4, doc 03 §2 note: dark values were
 * dual-defined from day 1; this module is the consumption half).
 *
 * Laws:
 * - 'system' is the default and follows the OS; explicit Light/Dark wins.
 * - The resolved ColorSet is the ONLY thing screens consume — no screen
 *   reads colors/darkColors directly anymore (chrome + all surfaces go
 *   through useColors()).
 * - Storage fail-quiet like every persistence in this app (doc 09).
 * - Cascading-render law: the provider's boot read resolves via microtask
 *   barrier (await null) — mode never flips synchronously mid-mount.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Appearance, useColorScheme } from 'react-native'
import { colors, darkColors, type ColorToken } from '@/lib/tokens'
import { getThemeMode, setThemeMode, type ThemeMode } from '@/lib/storage'

export type ColorSet = Record<ColorToken, string>

interface ThemeCtx {
  /** The stored preference: 'system' | 'light' | 'dark'. */
  mode: ThemeMode
  /** Preference write — persists (fail-quiet) and re-resolves immediately. */
  setMode: (m: ThemeMode) => void
  /** Resolved palette for the CURRENT mode + OS state. */
  c: ColorSet
  /** 'light' | 'dark' — for StatusBar style + one-off needs. */
  resolved: 'light' | 'dark'
}

const Ctx = createContext<ThemeCtx | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const os = useColorScheme()
  // null = still booting (root renders before the stored flag resolves);
  // renders as system until then — one frame at most, style-stable.
  const [mode, setModeState] = useState<ThemeMode | null>(null)

  useEffect(() => {
    let mounted = true
    void (async () => {
      await null // microtask barrier (cascading-render law)
      const stored = await getThemeMode()
      if (!mounted) return
      setModeState(stored)
    })()
    return () => {
      mounted = false
    }
  }, [])

  const effective = mode ?? 'system'
  const resolved: 'light' | 'dark' = effective === 'system' ? (os === 'dark' ? 'dark' : 'light') : effective

  const value = useMemo<ThemeCtx>(
    () => ({
      mode: effective,
      resolved,
      c: resolved === 'dark' ? darkColors : colors,
      setMode: (m) => {
        setModeState(m)
        void setThemeMode(m)
      },
    }),
    [effective, resolved],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useColors(): ColorSet {
  const v = useContext(Ctx)
  // Outside the provider (never in this app — every root is wrapped):
  // fall back to the light set so imports stay total.
  return v ? v.c : colors
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx)
  if (v) return v
  return {
    mode: 'system',
    resolved: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
    c: Appearance.getColorScheme() === 'dark' ? darkColors : colors,
    setMode: () => {},
  }
}
