/**
 * S3 · HOME — the V3.1 rebuilt flagship (doc 18 · P3+P4 zones over the B1
 * foundations): header → hero + search crown → quick actions → token
 * promo → booking zone (live appointment | track strip) → specialties →
 * doctors (chip-filtered, next-slot mini cards) → hospitals → labs rail
 * + mint promo → health tools → trust banner.
 *
 * Live data (doc 08 contract): doctors rail (100-row window, 60s SWR),
 * hospitals rail (300s SWR), per-doctor next-slot lookups (ref-cached,
 * failures degrade to the fee card — never a broken mini card). The
 * booking zone resolves the stored user's active booking → live token
 * (yours / serving / ahead); guest, empty, or ANY error collapses to the
 * track strip (error = hide law). Pull-to-refresh (native only).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { space } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { getDoctors, getHospitals, getSlots, getBookingToken, lookupBookings } from '@/lib/api'
import { useQuery } from '@/lib/use-query'
import { getCity, setCity } from '@/lib/storage'
import { getStoredUser } from '@/lib/auth'
import { OfflineBanner } from '@/components/offline-banner'
import { CityPickerSheet } from '@/components/city-picker'
import { NAV_PILL_FOOTPRINT } from '@/components/nav-pill'
import { HomeHeader } from '@/components/home3d/home-header'
import { HomeHero } from '@/components/home3d/home-hero'
import { HomeSearch } from '@/components/home3d/home-search'
import { QuickActions } from '@/components/home3d/quick-actions'
import { TokenBanner } from '@/components/home3d/token-banner'
import { AppointmentCard, AppointmentSkeleton, type AppointmentToken } from '@/components/home3d/appointment-card'
import { TrackStrip } from '@/components/home3d/track-strip'
import { SpecialtyRail, specialtyIcon } from '@/components/home3d/specialty-rail'
import { FindDoctors, matchesChip, type NextSlot } from '@/components/home3d/find-doctors'
import { HospitalRail } from '@/components/home3d/hospital-rail'
import { LabPills } from '@/components/home3d/lab-pills'
import { LabPromo } from '@/components/home3d/lab-promo'
import { HealthTools } from '@/components/home3d/health-tools'
import { TrustBanner } from '@/components/home3d/trust-banner'

/** The active-appointment payload the zone renders once resolved. */
interface LiveAppointment {
  doctorName: string
  sub: string
  token: AppointmentToken
}

type BookingZone = 'loading' | 'appointment' | 'track'

export default function HomeScreen() {
  const c = useColors()
  const insets = useSafeAreaInsets()

  // ————— Live data (doc 08 #1/#8) —————
  const doctors = useQuery('doctors-rail-v3', () => getDoctors({ limit: 100 }), { staleTime: 60_000 })
  const hospitals = useQuery('hospitals-rail', () => getHospitals({ limit: 6 }), { staleTime: 300_000 })

  // ————— City (location-first; Profile edits re-read on focus) —————
  const [city, setCityState] = useState<string | null>(null)
  const [citySheetOpen, setCitySheetOpen] = useState(false)
  const loadCity = useCallback(async () => {
    setCityState(await getCity())
  }, [])
  useEffect(() => {
    // Microtask barrier: local flags never flip synchronously inside the
    // mounting effect (cascading-render law).
    void (async () => {
      await null
      await loadCity()
    })()
  }, [loadCity])
  useFocusEffect(
    useCallback(() => {
      void loadCity()
    }, [loadCity]),
  )
  const onPickCity = (picked: string | null) => {
    setCitySheetOpen(false)
    setCityState(picked)
    if (picked) void setCity(picked)
  }

  // ————— Booking zone: stored user → active booking → live token —————
  const [zone, setZone] = useState<BookingZone>('loading')
  const [appointment, setAppointment] = useState<LiveAppointment | null>(null)
  useEffect(() => {
    void (async () => {
      await null
      try {
        const user = await getStoredUser()
        if (!user?.mobile) {
          setZone('track')
          return
        }
        const rows = await lookupBookings(user.mobile)
        const today = new Date().toISOString().slice(0, 10)
        const active = rows.find(
          (r) => r.status !== 'Cancelled' && r.status !== 'Completed' && r.date >= today,
        )
        if (!active) {
          setZone('track')
          return
        }
        const token = await getBookingToken(active.id)
        setAppointment({
          doctorName: token.doctorName,
          sub: `${token.specialization} · ${token.hospitalName}`,
          token: {
            yours: token.tokenNumber,
            serving: String(Math.max(Number(token.tokenNumber) - token.queuePosition, 0)),
            ahead: String(token.queuePosition).padStart(2, '0'),
          },
        })
        setZone('appointment')
      } catch {
        setZone('track') // error = hide law — the strip is the floor
      }
    })()
  }, [])

  // ————— Doctors: chip filter (lifted — the slot effect follows it) —————
  const [selected, setSelected] = useState('All')
  const doctorList = doctors.data?.doctors ?? null
  const filteredDoctors = useMemo(() => {
    if (!doctorList) return []
    return doctorList.filter((d) => matchesChip(d, selected))
  }, [doctorList, selected])

  // ————— Next-slot lookups: first 3 FILTERED doctors, ref-cached —————
  const slotsRef = useRef<Map<string, NextSlot | null>>(new Map())
  const [slots, setSlots] = useState<Record<string, NextSlot | null>>({})
  const firstThreeIds = useMemo(() => filteredDoctors.slice(0, 3).map((d) => d.id), [filteredDoctors])
  useEffect(() => {
    if (firstThreeIds.length === 0) return
    let alive = true
    void (async () => {
      await null
      const today = new Date().toISOString().slice(0, 10)
      const entries = await Promise.all(
        firstThreeIds.map(async (id): Promise<[string, NextSlot | null]> => {
          const cached = slotsRef.current.get(id)
          if (cached !== undefined) return [id, cached]
          try {
            const inv = await getSlots(id, today)
            const next: NextSlot | null =
              inv.available && inv.nextFreeSlot ? { day: inv.dayName, time: inv.nextFreeSlot } : null
            slotsRef.current.set(id, next)
            return [id, next]
          } catch {
            slotsRef.current.set(id, null) // failure = no slot today (fee card)
            return [id, null]
          }
        }),
      )
      if (!alive) return
      setSlots((prev) => {
        const merged: Record<string, NextSlot | null> = { ...prev }
        for (const [id, next] of entries) merged[id] = next
        return merged
      })
    })()
    return () => {
      alive = false
    }
  }, [firstThreeIds])

  // ————— Specialty items: derived from the live list, top 5 by count —————
  const specialtyItems = useMemo(() => {
    const counts = new Map<string, number>()
    for (const d of doctorList ?? []) {
      const label = d.specialization.trim()
      if (!label) continue
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label]) => ({ label, icon: specialtyIcon(label) }))
  }, [doctorList])

  const refreshAll = useCallback(() => {
    doctors.refresh()
    hospitals.refresh()
  }, [doctors, hospitals])

  return (
    <>
      <ScrollView
        style={[styles.screen, { backgroundColor: c.canvas }]}
        contentContainerStyle={{
          paddingTop: insets.top + 6,
          paddingBottom: insets.bottom + NAV_PILL_FOOTPRINT + 28,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          Platform.OS === 'web' ? undefined : (
            <RefreshControl refreshing={doctors.refreshing || hospitals.refreshing} onRefresh={refreshAll} tintColor={c.ink} />
          )
        }
      >
        <HomeHeader city={city ?? 'Select city'} onCityPress={() => setCitySheetOpen(true)} />

        {/* Offline/degraded banner — cached last-good stays underneath */}
        {(doctors.error || hospitals.error) && (doctors.data || hospitals.data) ? (
          <View style={styles.bannerWrap}>
            <OfflineBanner onRetry={refreshAll} />
          </View>
        ) : null}

        <View style={styles.heroBand}>
          <HomeHero />
          <HomeSearch />
        </View>

        <QuickActions />
        <TokenBanner />

        {/* Booking zone: live appointment | track strip | shimmer while
            the auth check resolves. Any error collapses to the strip. */}
        {zone === 'loading' ? (
          <AppointmentSkeleton />
        ) : zone === 'appointment' && appointment ? (
          <AppointmentCard
            doctorName={appointment.doctorName}
            sub={appointment.sub}
            photo={null}
            photoRepresentative
            token={appointment.token}
          />
        ) : (
          <TrackStrip />
        )}

        <SpecialtyRail items={specialtyItems} loading={doctors.loading && !doctors.data} />
        <FindDoctors
          doctors={doctorList ?? []}
          loading={doctors.loading && !doctors.data}
          slots={slots}
          selected={selected}
          onSelect={setSelected}
        />
        <HospitalRail hospitals={hospitals.data?.hospitals ?? []} loading={hospitals.loading && !hospitals.data} />
        <LabPills />
        <LabPromo />
        <HealthTools />
        <TrustBanner />
      </ScrollView>

      <CityPickerSheet visible={citySheetOpen} current={city} onClose={() => setCitySheetOpen(false)} onPick={onPickCity} />
    </>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  /** The banner carries its own 16px side margins — +8 aligns it to 24. */
  bannerWrap: {
    marginTop: 12,
    marginHorizontal: 8,
  },
  heroBand: {
    marginTop: 6,
    marginHorizontal: space.s24,
    gap: 12,
  },
})
