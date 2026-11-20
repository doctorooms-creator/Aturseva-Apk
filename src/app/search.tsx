/**
 * S4 · SEARCH RESULTS / DOCTOR LISTING (doc 06 S4) — APK-B2.
 *
 * Layout: back bar + query echo · honesty line (the dictionary mapping
 * NAMED, never silent) · city filter chips · vertical card list with
 * infinite pagination (10/page) + count line. States: skeletons ·
 * 0-result doorway (problem-word chips + browse-all — never a
 * dead-end) · offline = cached list + amber strip + retry.
 * Data: /api/doctors?search=&city=&page= (doc 08 #1, SWR semantics:
 * page 1 revalidates, appended pages are session state).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, Platform, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { ChevronLeft, MapPin, SearchX } from 'lucide-react-native'
import { space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { getDoctors, type DoctorCard } from '@/lib/api'
import { getCity } from '@/lib/storage'
import { matchSymptom } from '@/lib/website/symptom-search'
import { Chip } from '@/components/press'
import { OfflineBanner } from '@/components/offline-banner'
import { EmptyState } from '@/components/empty-state'
import { ListingCard, ListingCardSkeleton } from '@/components/listing-card'
import { CityPickerSheet } from '@/components/city-picker'

const PAGE_SIZE = 10

/** Doorway problem-words (S4 empty state) — same set as Home chips. */
const DOORWAY_WORDS = ['fever', 'knee pain', 'skin', 'child', 'acidity', 'headache'] as const

/** City-filter state: null = all cities; undefined = still loading the stored default. */
type CityState = string | null | undefined

export default function SearchScreen() {
  const c = useColors()
  const router = useRouter()
  const { q, all } = useLocalSearchParams<{ q?: string; all?: string }>()
  const query = typeof q === 'string' && q.trim().length > 0 ? q.trim() : ''
  // "Browse all doctors" doorway param: suppresses the stored-city default
  // so the promise "browse every doctor" is literally true (honesty law).
  const browseAll = all === '1'

  // Honesty line: the dictionary mapping NAMED back (visible-context law).
  const match = matchSymptom(query)
  const mapping = match ? match.specialties.map((s) => s.displayName).join(' · ') : ''

  const [cityFilter, setCityFilter] = useState<CityState>(undefined)
  const [citySheetOpen, setCitySheetOpen] = useState(false)
  const [storedCity, setStoredCity] = useState<string | null>(null)

  const [list, setList] = useState<DoctorCard[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [loadingFirst, setLoadingFirst] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [degraded, setDegraded] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // Stored city starts as the default filter (quiet, changeable, resettable) —
  // unless the browse-all doorway asked for the unfiltered truth.
  useEffect(() => {
    void (async () => {
      await null
      const c = browseAll ? null : await getCity()
      if (!mounted.current) return
      setStoredCity(c)
      setCityFilter((prev) => (prev === undefined ? c : prev))
    })()
  }, [browseAll])

  const fetchPage = useCallback(
    async (p: number, city: string | null) => {
      const res = await getDoctors({
        search: query || undefined,
        city: city ?? undefined,
        page: p,
        limit: PAGE_SIZE,
      })
      if (!mounted.current) return
      return res
    },
    [query],
  )

  // (Re)load page 1 whenever query/cityFilter change. Cached-last-good:
  // a failed refresh keeps the current list and raises the amber strip.
  const loadFirst = useCallback(
    async (city: string | null) => {
      setLoadingFirst(list.length === 0)
      try {
        const res = await fetchPage(1, city)
        if (!mounted.current || !res) return
        setList(res.doctors)
        setTotal(res.total)
        setPage(1)
        setDegraded(false)
      } catch {
        if (!mounted.current) return
        if (list.length > 0) setDegraded(true)
        else setDegraded(false)
      } finally {
        if (mounted.current) {
          setLoadingFirst(false)
          setRefreshing(false)
        }
      }
    },
    [fetchPage, list.length],
  )

  useEffect(() => {
    if (cityFilter === undefined) return
    // Microtask barrier: loading flags never flip synchronously inside the
    // effect body (cascading-render law — B1 house pattern).
    void (async () => {
      await null
      await loadFirst(cityFilter)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityFilter, query])

  const loadMore = useCallback(async () => {
    if (loadingMore || loadingFirst || total === null || list.length >= total) return
    setLoadingMore(true)
    try {
      const next = page + 1
      const res = await fetchPage(next, cityFilter ?? null)
      if (!mounted.current || !res) return
      setList((prev) => {
        const seen = new Set(prev.map((d) => d.id))
        return [...prev, ...res.doctors.filter((d) => !seen.has(d.id))]
      })
      setPage(next)
      setTotal(res.total)
    } catch {
      // Quiet: pagination failures keep the list; the count line stays
      // honest — a later pull-to-refresh or scroll retries silently.
    } finally {
      if (mounted.current) setLoadingMore(false)
    }
  }, [loadingMore, loadingFirst, total, list.length, page, fetchPage, cityFilter])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    void loadFirst(cityFilter ?? null)
  }, [loadFirst, cityFilter])

  const openDoctor = (id: string) => {
    void router.push({ pathname: '/doctor/[id]', params: { id } })
  }

  const clearToBrowseAll = () => {
    setCityFilter(null)
    // Query echo cleared by navigating to the plain listing route; the
    // all=1 param keeps the fresh mount from re-applying the stored city
    // (the doorway's "browse every doctor" promise stays literally true).
    void router.replace({ pathname: '/search', params: { all: '1' } })
  }

  const header = (
    <View>
      <View style={styles.topBar}>
        <View style={styles.backBtn}>
          <Chip
            label="Back"
            leading={<ChevronLeft size={16} color={c.ink} strokeWidth={2} />}
            onPress={() => void router.back()}
          />
        </View>
        <Text style={[styles.queryEcho, { color: c.ink }]} numberOfLines={1}>
          {query || 'All doctors'}
        </Text>
        <View style={styles.topSpacer} />
      </View>

      {/* Honesty line — the mapping is NAMED, never silent (doc 21 law) */}
      {mapping ? (
        <Text style={[styles.honestyLine, { color: c.body }]} numberOfLines={2}>
          {query} → {mapping}
        </Text>
      ) : null}

      {/* City filter chips */}
      <View style={styles.filterRow}>
        <Chip
          label={cityFilter ?? 'All cities'}
          leading={<MapPin size={14} color={cityFilter ? c.ink : c.body} strokeWidth={2} />}
          onPress={() => setCitySheetOpen(true)}
          selected={cityFilter !== null && cityFilter !== undefined}
        />
        {cityFilter ? (
          <Chip label="All cities" onPress={() => setCityFilter(null)} />
        ) : null}
      </View>

      {/* Count line — real totals only */}
      {total !== null ? (
        <Text style={[styles.countLine, { color: c.mute }]}>
          {total} {total === 1 ? 'doctor' : 'doctors'} found
        </Text>
      ) : null}

      {degraded && list.length > 0 ? (
        <View style={styles.bannerWrap}>
          <OfflineBanner onRetry={onRefresh} />
        </View>
      ) : null}
    </View>
  )

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <FlatList
        data={loadingFirst ? [] : list}
        keyExtractor={(d) => d.id}
        renderItem={({ item }) => (
          <ListingCard doctor={item} onOpen={() => openDoctor(item.id)} onBook={() => openDoctor(item.id)} />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={
          loadingFirst ? (
            <View>
              <ListingCardSkeleton />
              <View style={styles.skellyGap} />
              <ListingCardSkeleton />
              <View style={styles.skellyGap} />
              <ListingCardSkeleton />
              <View style={styles.skellyGap} />
              <ListingCardSkeleton />
              <View style={styles.skellyGap} />
              <ListingCardSkeleton />
              <View style={styles.skellyGap} />
              <ListingCardSkeleton />
            </View>
          ) : list.length === 0 ? (
            <View style={styles.emptyWrap}>
              <EmptyState
                icon={SearchX}
                title={`No doctors for “${query || 'this search'}”`}
                caption="Try one of these common problems, or browse every doctor."
                actions={[
                  ...DOORWAY_WORDS.map((w) => ({
                    label: w,
                    onPress: () => {
                      void router.replace({ pathname: '/search', params: { q: w } })
                    },
                  })),
                  { label: 'Browse all doctors', onPress: clearToBrowseAll },
                ]}
              />
            </View>
          ) : undefined
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerRow}>
              <ListingCardSkeleton />
            </View>
          ) : total !== null && list.length > 0 && list.length >= total ? (
            <Text style={[styles.footerEnd, { color: c.mute }]}>That is every doctor for this search</Text>
          ) : total !== null && list.length > 0 && list.length < total ? (
            <View style={styles.footerRow}>
              <Text style={[styles.footerEnd, { color: c.mute }]}>
                Showing {list.length} of {total}
              </Text>
              <Chip label="Show more" onPress={() => void loadMore()} />
            </View>
          ) : undefined
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          Platform.OS === 'web' ? undefined : (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.ink} />
          )
        }
      />

      <CityPickerSheet
        visible={citySheetOpen}
        current={cityFilter ?? storedCity}
        onClose={() => setCitySheetOpen(false)}
        onPick={(picked) => {
          setCitySheetOpen(false)
          setCityFilter(picked)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingBottom: space.s32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
    paddingHorizontal: space.s16,
    paddingTop: space.s12,
    minHeight: TOUCH + 8,
  },
  backBtn: {
    minHeight: TOUCH,
    justifyContent: 'center',
  },
  queryEcho: {
    ...typo.title,
    flex: 1,
  },
  topSpacer: {
    width: space.s16,
  },
  honestyLine: {
    ...typo.caption,
    marginHorizontal: space.s16,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: space.s8,
    paddingHorizontal: space.s16,
    marginTop: space.s12,
  },
  countLine: {
    ...typo.caption,
    marginHorizontal: space.s16,
    marginTop: space.s12,
    fontVariant: ['tabular-nums'],
  },
  bannerWrap: {
    marginTop: space.s12,
  },
  emptyWrap: {
    paddingTop: space.s24,
  },
  skellyGap: {
    height: space.s12,
  },
  footerRow: {
    marginTop: space.s12,
  },
  footerEnd: {
    ...typo.caption,
    textAlign: 'center',
    marginTop: space.s16,
  },
})
