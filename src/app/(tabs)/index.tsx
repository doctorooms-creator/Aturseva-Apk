/**
 * S3 · HOME — the V4 authoritative rebuild (doc 21 · doc 22): the
 * owner's Figma single-screen composition, zone for zone, on the 426→
 * device scale system. Option A (owner GO): the home IS the Figma
 * screen; the earlier lower half (Find Doctors rail, Hospitals rail,
 * lab price rail, Health Tools, trust banner) is NOT in this design —
 * discovery lives in the service tiles + specialties + search.
 *
 * Booking zone (doc 21 honesty law): the stored user's active booking
 * resolves to the live appointment card (real data only); guest, no
 * active booking, or ANY error hides the whole zone (error = hide law).
 * Resolves on mount and again on focus — returning from a booking
 * refreshes the card without a full remount.
 */

import { useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { useColors } from '@/lib/theme'
import { useV4 } from '@/components/home4/v4'
import { getBookingToken, lookupBookings } from '@/lib/api'
import { getCity, setCity } from '@/lib/storage'
import { getStoredUser } from '@/lib/auth'
import { CityPickerSheet } from '@/components/city-picker'
import { NAV_PILL_FOOTPRINT } from '@/components/nav-pill'
import { Home4Header } from '@/components/home4/home4-header'
import { Home4Hero } from '@/components/home4/home4-hero'
import { Home4Search } from '@/components/home4/home4-search'
import { Home4Services } from '@/components/home4/home4-services'
import { Home4TokenBanner } from '@/components/home4/home4-token'
import { Home4Appointment, Home4AppointmentSkeleton, type V4AppointmentToken } from '@/components/home4/home4-appointment'
import { Home4Specialties } from '@/components/home4/home4-specialties'
import { Home4LabPromo } from '@/components/home4/home4-lab'

/** The active-appointment payload the zone renders once resolved. */
interface LiveAppointment {
  doctorName: string
  sub: string
  token: V4AppointmentToken
}

type BookingZone = 'loading' | 'appointment' | 'hidden'

export default function HomeScreen() {
  const c = useColors()
  const insets = useSafeAreaInsets()
  // The 426-frame's own scale — the composition's top pad (design zone 0
  // = 42px status area) floors at 42·s so the design's vertical rhythm
  // holds on web/low-inset devices (native insets already ≈ 24–48).
  const s = useV4()

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
  const resolveBooking = useCallback(async () => {
    try {
      const user = await getStoredUser()
      if (!user?.mobile) {
        setZone('hidden')
        return
      }
      const rows = await lookupBookings(user.mobile)
      const today = new Date().toISOString().slice(0, 10)
      const active = rows.find(
        (r) => r.status !== 'Cancelled' && r.status !== 'Completed' && r.date >= today,
      )
      if (!active) {
        setZone('hidden')
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
      setZone('hidden') // error = hide law
    }
  }, [])
  useEffect(() => {
    void (async () => {
      await null
      await resolveBooking()
    })()
  }, [resolveBooking])
  useFocusEffect(
    useCallback(() => {
      void resolveBooking()
    }, [resolveBooking]),
  )

  return (
    <>
      <ScrollView
        style={[styles.screen, { backgroundColor: c.canvas }]}
        contentContainerStyle={{
          paddingTop: Math.max(insets.top + 6, 42 * s),
          paddingBottom: insets.bottom + NAV_PILL_FOOTPRINT + 28,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Home4Header city={city ?? ''} onCityPress={() => setCitySheetOpen(true)} />
        <Home4Hero />
        <Home4Search />
        <Home4Services />
        <Home4TokenBanner />
        {zone === 'loading' ? (
          <Home4AppointmentSkeleton />
        ) : zone === 'appointment' && appointment ? (
          <Home4Appointment
            doctorName={appointment.doctorName}
            sub={appointment.sub}
            token={appointment.token}
          />
        ) : null}
        <Home4Specialties />
        <Home4LabPromo />
      </ScrollView>

      <CityPickerSheet visible={citySheetOpen} current={city} onClose={() => setCitySheetOpen(false)} onPick={onPickCity} />
    </>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
})
