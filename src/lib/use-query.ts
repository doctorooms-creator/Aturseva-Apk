/**
 * ATURSEVA APP — useQuery-lite (doc 02 §5: custom cache hook, SWR semantics).
 *
 * Server state NEVER gets copied into stores — this cache layer is the
 * only home for it (doc 02 §6 law). P0 scope:
 * - module-level cache (cached-last-good serves instantly, revalidate in bg)
 * - staleTime gate + foreground revalidate (AppState)
 * - manual refresh (pull-to-refresh / retry)
 * Deliberately NO TanStack/lib dependency (B4 revisits if complexity demands).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'

export interface UseQueryResult<T> {
  /** Cached-last-good when present (offline law: fail = cached + banner). */
  data: T | null
  /** No cache yet and fetching. */
  loading: boolean
  /** Last fetch failed (cached data may still be showing). */
  error: Error | null
  /** Manual refresh (pull-to-refresh) in flight. */
  refreshing: boolean
  /** Silent background revalidation in flight. */
  validating: boolean
  /** Epoch ms of the cached snapshot (for "last updated" honesty). */
  cachedAt: number | null
  refresh: () => void
}

interface CacheEntry {
  data: unknown
  at: number
}

const cache = new Map<string, CacheEntry>()

export function useQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts: { staleTime?: number } = {},
): UseQueryResult<T> {
  const staleTime = opts.staleTime ?? 60_000
  // Latest-ref pattern: the fetcher identity changes every render (inline
  // arrows at call sites); effects read it through the ref, updated in
  // an effect — the sanctioned pattern (never written during render).
  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const [data, setData] = useState<T | null>(() => {
    const hit = cache.get(key)
    return hit ? (hit.data as T) : null
  })
  const [cachedAt, setCachedAt] = useState<number | null>(() => cache.get(key)?.at ?? null)
  const [loading, setLoading] = useState(() => !cache.has(key))
  const [error, setError] = useState<Error | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [validating, setValidating] = useState(false)

  const run = useCallback(
    async (mode: 'initial' | 'validate' | 'refresh') => {
      // Async-first: state flags flip in the microtask continuation, never
      // synchronously inside the mounting effect (cascading-render law).
      await null
      if (mode === 'refresh') setRefreshing(true)
      else if (mode === 'validate') setValidating(true)
      else setLoading(true)
      setError(null)
      try {
        const fresh = await fetcherRef.current()
        cache.set(key, { data: fresh, at: Date.now() })
        setData(fresh)
        setCachedAt(Date.now())
      } catch (err) {
        // Keep cached-last-good on screen; surface the error for the banner.
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
        setRefreshing(false)
        setValidating(false)
      }
    },
    [key],
  )

  useEffect(() => {
    const hit = cache.get(key)
    const needs = !hit || Date.now() - hit.at > staleTime
    if (needs) {
      // Microtask barrier: fetch flags never flip synchronously inside
      // the mounting effect (cascading-render law).
      void (async () => {
        await null
        await run(!hit ? 'initial' : 'validate')
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    // Foreground revalidate if stale (battery-friendly: only on active).
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return
      const hit = cache.get(key)
      if (hit && Date.now() - hit.at > staleTime) void run('validate')
    })
    return () => sub.remove()
  }, [key, staleTime, run])

  return { data, loading, error, refreshing, validating, cachedAt, refresh: () => void run('refresh') }
}
