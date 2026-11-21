/**
 * HOSPITALS · browse list (APK-B7 · doc 06 hospitals browse). Public —
 * no account needed (doorways-never-walls law). Grammar mirrors the S4
 * doctor listing: back bar · search field (submit = new first page) ·
 * city filter chips · count line · card list with pagination ·
 * skeletons · 0-result doorway (clear actions, never a dead-end) ·
 * degraded = cached list + amber strip + retry.
 * Data: /api/hospitals?search=&city=&page= (contract verified on prod).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, Platform, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Building2, ChevronLeft, MapPin } from 'lucide-react-native'
import { space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { getHospitals, type HospitalCard } from '@/lib/api'
import { getCity } from '@/lib/storage'
import { Chip } from '@/components/press'
import { SearchField } from '@/components/search-field'
import { OfflineBanner } from '@/components/offline-banner'
import { EmptyState } from '@/components/empty-state'
import { CityPickerSheet } from '@/components/city-picker'
import { HospitalListCard, HospitalListCardSkeleton } from '@/components/hospital-card'

const PAGE_SIZE = 10

/** City-filter state: null = all cities; undefined = still loading the stored default. */
type CityState = string | null | undefined

export default function HospitalsScreen() {
  const c = useColors()
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [cityFilter, setCityFilter] = useState<CityState>(undefined)
  const [citySheetOpen, setCitySheetOpen] = useState(false)
  const [storedCity, setStoredCity] = useState<string | null>(null)

  const [list, setList] = useState<HospitalCard[]>([])
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

  // Stored city starts as the quiet default filter (changeable, resettable).
  useEffect(() => {
    void (async () => {
      await null
      const stored = await getCity()
      if (!mounted.current) return
      setStoredCity(stored)
      setCityFilter((prev) => (prev === undefined ? stored : prev))
    })()
  }, [])

  const fetchPage = useCallback(
    async (p: number, city: string | null) => {
      return getHospitals({
        search: submitted || undefined,
        city: city ?? undefined,
        page: p,
        limit: PAGE_SIZE,
      })
    },
    [submitted],
  )

  // (Re)load page 1 whenever the submitted search / cityFilter change.
  // Cached-last-good: a failed refresh keeps the current list + amber strip.
  const loadFirst = useCallback(
    async (city: string | null) => {
      setLoadingFirst(list.length === 0)
      try {
        const res = await fetchPage(1, city)
        if (!mounted.current) return
        setList(res.hospitals)
        setTotal(res.total)
        setPage(1)
        setDegraded(false)
      } catch {
        if (!mounted.current) return
        if (list.length > 0) setDegraded(true)
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
    // effect body (cascading-render law — house pattern).
    void (async () => {
      await null
      await loadFirst(cityFilter)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityFilter, submitted])

  const loadMore = useCallback(async () => {
    if (loadingMore || loadingFirst || total === null || list.length >= total) return
    setLoadingMore(true)
    try {
      const next = page + 1
      const res = await fetchPage(next, cityFilter ?? null)
      if (!mounted.current) return
      setList((prev) => {
        const seen = new Set(prev.map((h) => h.id))
        return [...prev, ...res.hospitals.filter((h) => !seen.has(h.id))]
      })
      setPage(next)
      setTotal(res.total)
    } catch {
      // Quiet: pagination failures keep the list; the count line stays
      // honest — a later pull-to-refresh retries silently.
    } finally {
      if (mounted.current) setLoadingMore(false)
    }
  }, [loadingMore, loadingFirst, total, list.length, page, fetchPage, cityFilter])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    void loadFirst(cityFilter ?? null)
  }, [loadFirst, cityFilter])

  const openHospital = (id: string) => {
    void router.push({ pathname: '/hospital/[id]', params: { id } })
  }

  const submitSearch = () => {
    setSubmitted(search.trim())
  }

  const clearSearch = () => {
    setSearch('')
    setSubmitted('')
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
        <Text style={[styles.title, { color: c.ink }]} numberOfLines={1}>
          Hospitals
        </Text>
        <View style={styles.topSpacer} />
      </View>

      <View style={styles.searchWrap}>
        <SearchField
          placeholder="Search hospitals"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={submitSearch}
          returnKeyType="search"
        />
      </View>

      {/* City filter chips */}
      <View style={styles.filterRow}>
        <Chip
          label={cityFilter ?? 'All cities'}
          leading={<MapPin size={14} color={cityFilter ? c.ink : c.body} strokeWidth={2} />}
          onPress={() => setCitySheetOpen(true)}
          selected={cityFilter !== null && cityFilter !== undefined}
        />
        {cityFilter ? <Chip label="All cities" onPress={() => setCityFilter(null)} /> : null}
      </View>

      {/* Count line — real totals only; at 0 the EmptyState below carries
          the message (B12: "0 hospitals found" above it was redundant noise) */}
      {total !== null && total > 0 ? (
        <Text style={[styles.countLine, { color: c.mute }]}>
          {total} {total === 1 ? 'hospital' : 'hospitals'} found
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
        keyExtractor={(h) => h.id}
        renderItem={({ item }) => (
          <HospitalListCard hospital={item} onOpen={() => openHospital(item.id)} />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={
          loadingFirst ? (
            <View>
              <HospitalListCardSkeleton />
              <View style={styles.skellyGap} />
              <HospitalListCardSkeleton />
              <View style={styles.skellyGap} />
              <HospitalListCardSkeleton />
              <View style={styles.skellyGap} />
              <HospitalListCardSkeleton />
              <View style={styles.skellyGap} />
              <HospitalListCardSkeleton />
              <View style={styles.skellyGap} />
              <HospitalListCardSkeleton />
            </View>
          ) : list.length === 0 ? (
            <View style={styles.emptyWrap}>
              <EmptyState
                icon={Building2}
                title="No hospitals for this search"
                caption="Clear the search or the city filter to see every hospital."
                actions={[
                  ...(submitted ? [{ label: 'Clear search', onPress: clearSearch }] : []),
                  ...(cityFilter
                    ? [{ label: 'All cities', onPress: () => setCityFilter(null), primary: true }]
                    : []),
                ]}
              />
            </View>
          ) : undefined
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerRow}>
              <HospitalListCardSkeleton />
            </View>
          ) : total !== null && list.length > 0 && list.length >= total ? (
            <Text style={[styles.footerEnd, { color: c.mute }]}>
              That is every hospital for this search
            </Text>
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
  title: {
    ...typo.title,
    flex: 1,
  },
  topSpacer: {
    width: space.s16,
  },
  searchWrap: {
    marginTop: space.s12,
    marginHorizontal: space.s16,
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
