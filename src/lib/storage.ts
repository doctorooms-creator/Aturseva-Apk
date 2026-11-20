/**
 * ATURSEVA APP — local storage whitelist (doc 09 §: storage keys are a
 * CLOSED list — nothing else ever persists; no health data on device).
 *
 * Keys (P0):
 * - aturseva.onboarding-done   boolean
 * - aturseva.city              string | null
 * - aturseva.recent-searches   string[] (max 3, LRU)
 * All reads/writes are fail-quiet: storage failure never breaks the app.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'

const K = {
  onboardingDone: 'aturseva.onboarding-done',
  city: 'aturseva.city',
  recentSearches: 'aturseva.recent-searches',
} as const

export async function getOnboardingDone(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(K.onboardingDone)) === '1'
  } catch {
    return false
  }
}

export async function setOnboardingDone(): Promise<void> {
  try {
    await AsyncStorage.setItem(K.onboardingDone, '1')
  } catch {
    /* fail-quiet */
  }
}

export async function getCity(): Promise<string | null> {
  try {
    const v = await AsyncStorage.getItem(K.city)
    return v && v.length > 0 ? v : null
  } catch {
    return null
  }
}

export async function setCity(city: string): Promise<void> {
  try {
    await AsyncStorage.setItem(K.city, city)
  } catch {
    /* fail-quiet */
  }
}

export async function getRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(K.recentSearches)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/** LRU push, dedupe, cap 3 — the suggest sheet's "recent" row. */
export async function pushRecentSearch(term: string): Promise<void> {
  const t = term.trim()
  if (!t) return
  try {
    const current = await getRecentSearches()
    const next = [t, ...current.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 3)
    await AsyncStorage.setItem(K.recentSearches, JSON.stringify(next))
  } catch {
    /* fail-quiet */
  }
}
