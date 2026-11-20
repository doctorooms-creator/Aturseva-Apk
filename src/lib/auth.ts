/**
 * ATURSEVA APP — auth session store (APK-B4).
 *
 * The web monolith's P5-MOBILE contract: login returns a JWT in the JSON
 * body (browsers ignore it in favour of the httpOnly cookie); the app
 * persists it and sends it as `Authorization: Bearer <token>`. Sessions
 * are 7-day, DB-revocable.
 *
 * Storage law:
 * - Native: expo-secure-store (encrypted keystore — the production path).
 * - Web (the sandbox E2E static-export build ONLY — SecureStore has no
 *   web implementation): AsyncStorage with the same keys. The native app
 *   never touches that branch.
 * - Fail-quiet like every persistence in this app (doc 09) — a broken
 *   keystore degrades to "guest", never a crash.
 * - No health data on device: token + the /me snapshot (name/email/mobile/
 *   role) only. Bookings stay guest-phone-lookup based, as in B3.
 */

import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { AuthUser } from '@/lib/api'

const K_TOKEN = 'aturseva.auth-token'
const K_USER = 'aturseva.auth-user'

/** Web-E2E branch (sandbox static export only). */
const isWeb = Platform.OS === 'web'

async function getItem(key: string): Promise<string | null> {
  if (!isWeb) return await SecureStore.getItemAsync(key)
  try {
    return await AsyncStorage.getItem(key)
  } catch {
    return null
  }
}

async function setItem(key: string, value: string): Promise<void> {
  if (!isWeb) return await SecureStore.setItemAsync(key, value)
  try {
    await AsyncStorage.setItem(key, value)
  } catch {
    /* fail-quiet */
  }
}

async function deleteItem(key: string): Promise<void> {
  if (!isWeb) return await SecureStore.deleteItemAsync(key)
  try {
    await AsyncStorage.removeItem(key)
  } catch {
    /* fail-quiet */
  }
}

export async function getStoredToken(): Promise<string | null> {
  try {
    const v = await getItem(K_TOKEN)
    return v && v.length > 0 ? v : null
  } catch {
    return null
  }
}

/** Token + user snapshot written together — login's atomic pair. */
export async function saveSession(token: string, user: AuthUser): Promise<void> {
  try {
    await setItem(K_TOKEN, token)
    await setItem(K_USER, JSON.stringify(user))
  } catch {
    /* fail-quiet — the session lives in memory for this app run */
  }
}

export async function getStoredUser(): Promise<AuthUser | null> {
  try {
    const raw = await getItem(K_USER)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const p = parsed as Record<string, unknown>
    if (typeof p.id !== 'string' || typeof p.email !== 'string') return null
    return {
      id: p.id,
      name: typeof p.name === 'string' ? p.name : '',
      email: p.email,
      role: typeof p.role === 'string' ? p.role : 'patient',
      gender: typeof p.gender === 'string' ? p.gender : null,
      mobile: typeof p.mobile === 'string' ? p.mobile : null,
    }
  } catch {
    return null
  }
}

/** Sign-out — clears BOTH keys; a failing keystore still yields "guest". */
export async function clearSession(): Promise<void> {
  try {
    await deleteItem(K_TOKEN)
    await deleteItem(K_USER)
  } catch {
    /* fail-quiet */
  }
}
