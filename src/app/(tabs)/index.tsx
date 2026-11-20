/**
 * S3 · HOME — the flagship screen (doc 06 S3).
 *
 * Layout: search crown (no top bar) → symptom chips → live trust strip →
 * live doctor rail → quiet footer. ONE crown = search (no banner fights
 * it). Live data: /api/public/stats + /api/doctors (prod monolith — doc 08
 * contract). Cross-cutting: skeletons mirror layout; network fail =
 * cached cards + amber strip + retry; pull-to-refresh (native).
 *
 * APK-B1 scope note: chip/row taps fill the search (the S4 listing walk
 * opens with APK-B2; profile/booking with B2/B3). Card tap shows an
 * honest recap sheet — real card data only, zero fabricated fields.
 */

import { type ComponentRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { ChevronRight, MapPin } from 'lucide-react-native'
import { colors, space, TOUCH, type as typo } from '@/lib/tokens'
import { getDoctors, getStats, type DoctorCard } from '@/lib/api'
import { useQuery } from '@/lib/use-query'
import { getCity, getRecentSearches, pushRecentSearch, setCity } from '@/lib/storage'
import { matchSymptom } from '@/lib/website/symptom-search'
import { SearchField } from '@/components/search-field'
import { Chip, QuietAction } from '@/components/press'
import { PulseDot } from '@/components/pulse-dot'
import { OfflineBanner } from '@/components/offline-banner'
import { DoctorRailCard } from '@/components/doctor-card'
import { DoctorRailSkeleton, TrustStripSkeleton } from '@/components/skeleton'
import { BottomSheet, GrabHandle } from '@/components/sheets'
import { CityPickerSheet } from '@/components/city-picker'
import { Avatar } from '@/components/avatar'

/** Home quick-chips (S3 list — the doorway words). */
const CHIPS = ['fever', 'knee pain', 'skin', 'child', 'acidity', 'sar dard'] as const

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
  const router = useRouter()

  // Live data (doc 08 #1/#8): stats 5-min SWR · doctors rail SWR.
  const stats = useQuery('stats', () => getStats(), { staleTime: 300_000 })
  const rail = useQuery('doctors-rail', () => getDoctors({ limit: 12 }), { staleTime: 60_000 })

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
  const [recapDoctor, setRecapDoctor] = useState<DoctorCard | null>(null)

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

  // Tab re-focus re-reads city + recents (Profile me shehar badla to
  // Home ka footer turant sach ho jaaye — doc 04 live-state law).
  useFocusEffect(
    useCallback(() => {
      void loadLocal()
    }, [loadLocal]),
  )

  const applyQuery = useCallback(
    (term: string) => {
      const t = term.trim()
      setQuery(t)
      void pushRecentSearch(t)
      void loadLocal()
      closeSuggest()
    },
    [loadLocal, closeSuggest],
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
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        Platform.OS === 'web' ? undefined : (
          <RefreshControl refreshing={rail.refreshing || stats.refreshing} onRefresh={refreshAll} tintColor="#0A0A0A" />
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
              applyQuery(c)
              setSuggestOpen(true)
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
            <Text style={styles.trustText}>
              {stats.data.doctors} doctors · {stats.data.hospitals} hospitals · {stats.data.bookings} visits booked — live
            </Text>
          </>
        ) : (
          <TrustStripSkeleton />
        )}
      </View>

      {/* Doctor rail — LIVE cards */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Doctors</Text>
        <View style={styles.liveChip}>
          <PulseDot size={6} />
          <Text style={styles.liveText}>live</Text>
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
            <Text style={styles.railEmptyText}>Abhi koi live doctor nahi — thodi der me dobara dekhein.</Text>
          </View>
        ) : (
          rail.data?.doctors.map((d) => <DoctorRailCard key={d.id} doctor={d} onPress={() => setRecapDoctor(d)} />)
        )}
      </ScrollView>

      {/* Quiet footer: city + version + legal (S3 law: ≤1 line each) */}
      <View style={styles.footer}>
        <Pressable style={styles.cityRow} onPress={() => setCitySheetOpen(true)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Shehar badlein">
          <MapPin size={13} color={colors.mute} strokeWidth={2} />
          <Text style={styles.cityText}>{city ?? 'Shehar select karein'} · change</Text>
        </Pressable>
        <Text style={styles.versionText}>Aturseva v{version} · APK-B1</Text>
        <QuietAction
          label="Privacy · Terms"
          onPress={() => {
            void router.push('/profile')
          }}
        />
      </View>
      <View style={styles.safeBottom} />
    </ScrollView>

    {/* Suggest sheet (S3): recent 3 + symptom rows — fee meta per doctor
        (not per specialty) aata hai B2 listing me; per-specialty fee would
        be fabrication (honesty law). */}
    <BottomSheet visible={suggestOpen} onClose={closeSuggest} accessibilityLabel="Search suggestions">
      <GrabHandle />
      {query.trim().length > 0 && symptomRows.length === 0 ? (
        <Text style={styles.suggestHonest}>Is shabd ka match nahi mila — doctor ka naam bhi try karein.</Text>
      ) : null}
      {recents.length > 0 ? (
        <Text style={styles.suggestCaption}>Recent</Text>
      ) : null}
      {recents.map((r) => (
        <Pressable key={`recent-${r}`} style={({ pressed }) => [styles.suggestRow, pressed && { opacity: 0.7 }]} onPress={() => applyQuery(r)} accessibilityRole="button">
          <Text style={styles.suggestRowText} numberOfLines={1}>
            {r}
          </Text>
          <ChevronRight size={16} color={colors.mute} strokeWidth={2} />
        </Pressable>
      ))}
      <Text style={styles.suggestCaption}>Bimari ke shabd se dhoondo</Text>
      {symptomRows.map((row) => (
        <Pressable key={`sym-${row.term}`} style={({ pressed }) => [styles.suggestRow, pressed && { opacity: 0.7 }]} onPress={() => applyQuery(row.term)} accessibilityRole="button">
          <View style={styles.suggestRowMain}>
            <Text style={styles.suggestRowText} numberOfLines={1}>
              {row.specialtyNames.join(' · ')}
            </Text>
            <Text style={styles.suggestRowCaption} numberOfLines={1}>
              Treats {row.term}
            </Text>
          </View>
          <ChevronRight size={16} color={colors.mute} strokeWidth={2} />
        </Pressable>
      ))}
    </BottomSheet>

    {/* Doctor recap sheet — B1: the real card data, honest next-batch note */}
    <BottomSheet visible={recapDoctor !== null} onClose={() => setRecapDoctor(null)} accessibilityLabel="Doctor details">
      <GrabHandle />
      {recapDoctor ? (
        <View>
          <View style={styles.recapHead}>
            <Avatar name={recapDoctor.name} size={56} />
            <View style={styles.recapHeadCol}>
              <Text style={styles.recapName} numberOfLines={1}>
                {recapDoctor.name}
              </Text>
              <Text style={styles.recapSpec} numberOfLines={1}>
                {recapDoctor.specialization || 'Doctor'}
              </Text>
              <Text style={styles.recapCity} numberOfLines={1}>
                {recapDoctor.city}
                {recapDoctor.city && recapDoctor.state ? `, ${recapDoctor.state}` : ''}
              </Text>
            </View>
            <Text style={styles.recapFee}>₹{recapDoctor.fees.toLocaleString('en-IN')}</Text>
          </View>
          <Text style={styles.recapNote}>
            Poora profile aur booking — agle batches (APK-B2 · B3) me live honge. Abhi Home ke rail me sab live doctors hain.
          </Text>
          <Chip label="Theek hai" onPress={() => setRecapDoctor(null)} />
        </View>
      ) : null}
    </BottomSheet>

    <CityPickerSheet visible={citySheetOpen} current={city} onClose={() => setCitySheetOpen(false)} onPick={onPickCity} />
    </>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.canvas,
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
    color: colors.body,
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
    color: colors.ink,
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tealLiveSoft,
    borderRadius: 999,
    paddingHorizontal: space.s8,
    paddingVertical: 2,
  },
  liveText: {
    ...typo.caption,
    color: colors.tealLive,
    fontWeight: '600',
  },
  railRow: {
    paddingHorizontal: space.s16,
    gap: space.s12,
  },
  railEmpty: {
    paddingHorizontal: space.s16,
  },
  railEmptyText: {
    ...typo.body,
    color: colors.body,
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
    color: colors.body,
  },
  versionText: {
    ...typo.caption,
    color: colors.mute,
  },
  safeBottom: {
    height: space.s24,
  },
  suggestHonest: {
    ...typo.body,
    color: colors.body,
    paddingHorizontal: space.s4,
    marginBottom: space.s8,
  },
  suggestCaption: {
    ...typo.caption,
    color: colors.mute,
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
    color: colors.ink,
    flex: 1,
  },
  suggestRowCaption: {
    ...typo.caption,
    color: colors.body,
  },
  recapHead: {
    flexDirection: 'row',
    gap: space.s12,
    alignItems: 'flex-start',
    paddingHorizontal: space.s4,
  },
  recapHeadCol: {
    flex: 1,
    gap: 2,
  },
  recapName: {
    ...typo.title,
    color: colors.ink,
  },
  recapSpec: {
    ...typo.caption,
    color: colors.body,
  },
  recapCity: {
    ...typo.caption,
    color: colors.mute,
  },
  recapFee: {
    ...typo.bodyStrong,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
    fontSize: 18,
  },
  recapNote: {
    ...typo.caption,
    color: colors.body,
    marginTop: space.s16,
    marginBottom: space.s16,
    paddingHorizontal: space.s4,
  },
})
