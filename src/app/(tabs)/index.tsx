/**
 * S3 · HOME — the flagship screen (doc 06 S3).
 *
 * Layout: search crown (no top bar) → symptom chips → live trust strip →
 * live doctor rail → quiet footer. ONE crown = search (no banner fights
 * it). Live data: /api/public/stats + /api/doctors (prod monolith — doc 08
 * contract). Cross-cutting: skeletons mirror layout; network fail =
 * cached cards + amber strip + retry; pull-to-refresh (native).
 *
 * APK-B2: chips and suggest rows walk into the S4 listing (/search?q=)
 * and rail cards open the S5 profile (/doctor/[id]) — the B1 recap
 * sheet retired. Pure English copy (owner directive).
 */

import { type ComponentRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { ChevronRight, MapPin } from 'lucide-react-native'
import { space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { getDoctors, getStats, getBookAgain, getHospitals, type BookAgainDoctor } from '@/lib/api'
import { useQuery } from '@/lib/use-query'
import { getCity, getRecentSearches, pushRecentSearch, setCity } from '@/lib/storage'
import { getStoredToken } from '@/lib/auth'
import { matchSymptom } from '@/lib/website/symptom-search'
import { SearchField } from '@/components/search-field'
import { Chip, QuietAction } from '@/components/press'
import { PulseDot } from '@/components/pulse-dot'
import { OfflineBanner } from '@/components/offline-banner'
import { DoctorRailCard } from '@/components/doctor-card'
import { HospitalRailCard } from '@/components/hospital-card'
import { DoctorRailSkeleton, TrustStripSkeleton } from '@/components/skeleton'
import { BottomSheet, GrabHandle } from '@/components/sheets'
import { CityPickerSheet } from '@/components/city-picker'

/** Home quick-chips (S3 list — the doorway words, pure English). */
const CHIPS = ['fever', 'knee pain', 'skin', 'child', 'acidity', 'headache'] as const

interface SymptomRow {
  term: string
  specialtyNames: string[]
}

function rowFor(term: string): SymptomRow | null {
  const match = matchSymptom(term)
  if (!match) return null
  return { term, specialtyNames: match.specialties.map((s) => s.displayName) }
}

function symptomRowsFor(query: string): SymptomRow[] {
  const q = query.trim()
  if (q.length > 0) {
    // Typed query: ONE honest row — the query's own mapping (all matched
    // specialties, visible-context law).
    const row = rowFor(q)
    return row ? [row] : []
  }
  // Empty query: the curated chip set — each chip its OWN mapping.
  return CHIPS.map((c) => rowFor(c)).filter((r): r is SymptomRow => r !== null)
}

export default function HomeScreen() {
  const c = useColors()
  const router = useRouter()

  // Live data (doc 08 #1/#8): stats 5-min SWR · doctors rail SWR.
  const stats = useQuery('stats', () => getStats(), { staleTime: 300_000 })
  const rail = useQuery('doctors-rail', () => getDoctors({ limit: 12 }), { staleTime: 60_000 })
  const hospitalsRail = useQuery('hospitals-rail', () => getHospitals({ limit: 6 }), { staleTime: 300_000 })

  const [query, setQuery] = useState('')
  const [suggestOpen, setSuggestOpen] = useState(false)
  // RN-web Modal restores focus to the field that opened it AFTER its exit
  // animation — that returned focus must NOT re-open the sheet (otherwise
  // close = instant reopen loop). WEB-ONLY guard: the first focus event
  // after a close is consumed; native has no focus-restore phenomenon.
  const justClosedSuggest = useRef(false)
  const searchRef = useRef<ComponentRef<typeof TextInput>>(null)

  const closeSuggest = useCallback(() => {
    setSuggestOpen(false)
    searchRef.current?.blur()
    if (Platform.OS === 'web') {
      justClosedSuggest.current = true
      // Fallback clear: if the restore-focus never arrives, a later real
      // focus still opens (800ms covers the modal exit animation).
      setTimeout(() => {
        justClosedSuggest.current = false
      }, 800)
    }
  }, [])

  const openSuggestFromFocus = useCallback(() => {
    if (justClosedSuggest.current) {
      justClosedSuggest.current = false // consume the restore-focus
      return
    }
    setSuggestOpen(true)
  }, [])
  const [recents, setRecents] = useState<string[]>([])
  const [city, setCityState] = useState<string | null>(null)
  const [citySheetOpen, setCitySheetOpen] = useState(false)

  // APK-B6 · Book-again rail (doc 06 S3 / doc 18): the logged-in
  // patient's last doctors, one tap away. Hide-if-empty law is absolute —
  // guest, error, or empty list renders NOTHING (zero chrome change for
  // the guest). A Pending booking earns nothing (server honesty gate).
  const [bookAgain, setBookAgain] = useState<BookAgainDoctor[] | null>(null)
  const loadBookAgain = useCallback(async () => {
    const token = await getStoredToken()
    if (!token) {
      setBookAgain(null)
      return
    }
    try {
      const doctors = await getBookAgain()
      setBookAgain(doctors.length > 0 ? doctors : null)
    } catch {
      setBookAgain(null) // hide-if-empty on error too (rail is a gift, not a duty)
    }
  }, [])

  const loadLocal = useCallback(async () => {
    const [r, c] = await Promise.all([getRecentSearches(), getCity()])
    setRecents(r)
    setCityState(c)
  }, [])

  useEffect(() => {
    // Microtask barrier: local flags never flip synchronously inside the
    // mounting effect (cascading-render law).
    void (async () => {
      await null
      await loadLocal()
    })()
  }, [loadLocal])

  // Tab re-focus re-reads city + recents (city changed in Profile makes
  // Home's footer instantly true — doc 04 live-state law). B6: the rail
  // re-checks on focus too (a fresh login in Profile paints it without a
  // cold start).
  useFocusEffect(
    useCallback(() => {
      void loadLocal()
      void loadBookAgain()
    }, [loadLocal, loadBookAgain]),
  )

  const applyQuery = useCallback(
    (term: string) => {
      const t = term.trim()
      setQuery(t)
      void pushRecentSearch(t)
      void loadLocal()
      closeSuggest()
      // B2: the S4 listing walk — chip/row taps carry the query over.
      void router.push({ pathname: '/search', params: { q: t } })
    },
    [loadLocal, closeSuggest, router],
  )

  const symptomRows = useMemo(() => symptomRowsFor(query), [query])

  const onPickCity = (picked: string | null) => {
    setCitySheetOpen(false)
    setCityState(picked)
    if (picked) void setCity(picked)
  }

  const version = Constants.expoConfig?.version ?? '0.1.0'

  const refreshAll = useCallback(() => {
    stats.refresh()
    rail.refresh()
  }, [stats, rail])

  return (
    <>
    <ScrollView
      style={[styles.screen, { backgroundColor: c.canvas }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        Platform.OS === 'web' ? undefined : (
          <RefreshControl refreshing={rail.refreshing || stats.refreshing} onRefresh={refreshAll} tintColor={c.ink} />
        )
      }
    >
      {/* Search crown — content starts at y=0, safe-area padded (S3 law) */}
      <View style={styles.safeTop} />
      <SearchField ref={searchRef} value={query} onChangeText={setQuery} onFocus={openSuggestFromFocus} />

      {/* Symptom quick-chips — zero-thinking path */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroller}
      >
        {CHIPS.map((c) => (
          <Chip
            key={c}
            label={c}
            onPress={() => {
              // Zero-thinking path (doc 06 S3): chip tap walks STRAIGHT
              // into the S4 listing — no suggest sheet in between.
              applyQuery(c)
            }}
          />
        ))}
      </ScrollView>

      {/* Offline/degraded banner — cached last-good stays underneath */}
      {(rail.error || stats.error) && (rail.data || stats.data) ? (
        <View style={styles.bannerWrap}>
          <OfflineBanner onRetry={refreshAll} />
        </View>
      ) : null}

      {/* Live trust strip — only real numbers (no labs count exists on the
          stats contract — honesty law wins over the spec's example) */}
      <View style={styles.trustRow}>
        {stats.data ? (
          <>
            <PulseDot size={8} />
            <Text style={[styles.trustText, { color: c.body }]}>
              {stats.data.doctors} doctors · {stats.data.hospitals} hospitals · {stats.data.bookings} visits booked — live
            </Text>
          </>
        ) : (
          <TrustStripSkeleton />
        )}
      </View>

      {/* B6 · Book-again rail — logged-in only, hide-if-empty. The last
          doctors you actually visited, one tap to the booking sheet. */}
      {bookAgain ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.ink }]}>Book again</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railRow}>
            {bookAgain.map((d) => (
              <DoctorRailCard
                key={d.id}
                doctor={{
                  id: d.id,
                  name: d.name,
                  specialization: d.specialization,
                  city: d.city,
                  state: d.state,
                  fees: d.fees,
                  experience: d.experience,
                  isEmergency: false,
                  rating: 0,
                  ratingCount: 0,
                }}
                onPress={() => void router.push({ pathname: '/doctor/[id]', params: { id: d.id } })}
              />
            ))}
          </ScrollView>
        </>
      ) : null}

      {/* Doctor rail — LIVE cards */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: c.ink }]}>Doctors</Text>
        <View style={[styles.liveChip, { backgroundColor: c.tealLiveSoft }]}>
          <PulseDot size={6} />
          <Text style={[styles.liveText, { color: c.tealLive }]}>live</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railRow}>
        {rail.loading && !rail.data ? (
          <>
            <DoctorRailSkeleton />
            <DoctorRailSkeleton />
            <DoctorRailSkeleton />
          </>
        ) : rail.data && rail.data.doctors.length === 0 ? (
          <View style={styles.railEmpty}>
            <Text style={[styles.railEmptyText, { color: c.body }]}>No live doctors right now — check back in a little while.</Text>
          </View>
        ) : (
          rail.data?.doctors.map((d) => (
            <DoctorRailCard
              key={d.id}
              doctor={d}
              onPress={() => void router.push({ pathname: '/doctor/[id]', params: { id: d.id } })}
            />
          ))
        )}
      </ScrollView>

      {/* B7 · Hospitals rail — hide-if-empty ABSOLUTE (public data, guest ok) */}
      {hospitalsRail.data && hospitalsRail.data.hospitals.length > 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.ink }]}>Hospitals</Text>
            <View style={styles.hospitalsSpacer} />
            <Chip label="See all" onPress={() => void router.push('/hospitals')} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railRow}>
            {hospitalsRail.data.hospitals.map((h) => (
              <HospitalRailCard
                key={h.id}
                hospital={h}
                onPress={() => void router.push({ pathname: '/hospital/[id]', params: { id: h.id } })}
              />
            ))}
          </ScrollView>
        </>
      ) : null}

      {/* Quiet footer: city + version + legal (S3 law: ≤1 line each) */}
      <View style={styles.footer}>
        <Pressable style={styles.cityRow} onPress={() => setCitySheetOpen(true)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Change city">
          <MapPin size={13} color={c.mute} strokeWidth={2} />
          <Text style={[styles.cityText, { color: c.body }]}>{city ?? 'Select city'} · change</Text>
        </Pressable>
        <Text style={[styles.versionText, { color: c.mute }]}>Aturseva v{version}</Text>
        <QuietAction
          label="Privacy · Terms"
          onPress={() => {
            void router.push('/profile')
          }}
        />
      </View>
      <View style={styles.safeBottom} />
    </ScrollView>

    {/* Suggest sheet (S3): typed-query "search anyway" row + recent 3 +
        symptom rows. Fee meta per doctor (not per specialty) arrives on the
        S4 listing; per-specialty fee would be fabrication (honesty law). */}
    <BottomSheet visible={suggestOpen} onClose={closeSuggest} accessibilityLabel="Search suggestions">
      <GrabHandle />
      {query.trim().length > 0 ? (
        <>
          <Pressable style={({ pressed }) => [styles.suggestRow, pressed && { opacity: 0.7 }]} onPress={() => applyQuery(query)} accessibilityRole="button">
            <View style={styles.suggestRowMain}>
              <Text style={[styles.suggestRowText, { color: c.ink }]} numberOfLines={1}>
                Search for “{query.trim()}”
              </Text>
              <Text style={[styles.suggestRowCaption, { color: c.body }]} numberOfLines={1}>
                Doctors matching this word or name
              </Text>
            </View>
            <ChevronRight size={16} color={c.mute} strokeWidth={2} />
          </Pressable>
          {symptomRows.length === 0 ? (
            <Text style={[styles.suggestHonest, { color: c.body }]}>No symptom match — searching by doctor name still works.</Text>
          ) : null}
        </>
      ) : null}
      {query.trim().length === 0 && recents.length > 0 ? (
        <Text style={[styles.suggestCaption, { color: c.mute }]}>Recent</Text>
      ) : null}
      {query.trim().length === 0
        ? recents.map((r) => (
            <Pressable key={`recent-${r}`} style={({ pressed }) => [styles.suggestRow, pressed && { opacity: 0.7 }]} onPress={() => applyQuery(r)} accessibilityRole="button">
              <Text style={[styles.suggestRowText, { color: c.ink }]} numberOfLines={1}>
                {r}
              </Text>
              <ChevronRight size={16} color={c.mute} strokeWidth={2} />
            </Pressable>
          ))
        : null}
      {query.trim().length === 0 ? <Text style={[styles.suggestCaption, { color: c.mute }]}>Search by problem</Text> : null}
      {query.trim().length === 0
        ? symptomRows.map((row) => (
            <Pressable key={`sym-${row.term}`} style={({ pressed }) => [styles.suggestRow, pressed && { opacity: 0.7 }]} onPress={() => applyQuery(row.term)} accessibilityRole="button">
              <View style={styles.suggestRowMain}>
                <Text style={[styles.suggestRowText, { color: c.ink }]} numberOfLines={1}>
                  {row.specialtyNames.join(' · ')}
                </Text>
                <Text style={[styles.suggestRowCaption, { color: c.body }]} numberOfLines={1}>
                  Treats {row.term}
                </Text>
              </View>
              <ChevronRight size={16} color={c.mute} strokeWidth={2} />
            </Pressable>
          ))
        : null}
    </BottomSheet>

    <CityPickerSheet visible={citySheetOpen} current={city} onClose={() => setCitySheetOpen(false)} onPick={onPickCity} />
    </>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: space.s24,
  },
  safeTop: {
    height: 12,
  },
  chipsScroller: {
    marginTop: space.s12,
  },
  chipsRow: {
    paddingHorizontal: space.s16,
    gap: space.s8,
  },
  bannerWrap: {
    marginTop: space.s12,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
    marginTop: space.s20,
    marginHorizontal: space.s16,
    minHeight: TOUCH - 24,
  },
  trustText: {
    ...typo.caption,
    fontVariant: ['tabular-nums'],
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
    marginTop: space.s24,
    marginBottom: space.s12,
    marginHorizontal: space.s16,
  },
  sectionTitle: {
    ...typo.title,
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: space.s8,
    paddingVertical: 2,
  },
  liveText: {
    ...typo.caption,
    fontWeight: '600',
  },
  railRow: {
    paddingHorizontal: space.s16,
    gap: space.s12,
  },
  hospitalsSpacer: {
    flex: 1,
  },
  railEmpty: {
    paddingHorizontal: space.s16,
  },
  railEmptyText: {
    ...typo.body,
  },
  footer: {
    marginTop: space.s32,
    marginHorizontal: space.s16,
    gap: space.s8,
    alignItems: 'center',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: TOUCH - 20,
  },
  cityText: {
    ...typo.caption,
  },
  versionText: {
    ...typo.caption,
  },
  safeBottom: {
    height: space.s24,
  },
  suggestHonest: {
    ...typo.body,
    paddingHorizontal: space.s4,
    marginBottom: space.s8,
  },
  suggestCaption: {
    ...typo.caption,
    marginTop: space.s12,
    marginBottom: space.s4,
    paddingHorizontal: space.s4,
  },
  suggestRow: {
    minHeight: TOUCH + 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.s4,
    gap: space.s8,
  },
  suggestRowMain: {
    flex: 1,
    gap: 2,
  },
  suggestRowText: {
    ...typo.bodyStrong,
    flex: 1,
  },
  suggestRowCaption: {
    ...typo.caption,
  },
})
