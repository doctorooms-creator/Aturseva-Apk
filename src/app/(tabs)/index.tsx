/**
 * S3 · HOME — the V4 authoritative rebuild (doc 21 · doc 22) on the
 * APP-SHELL system (the Uber-class layout law): the screen ALWAYS fills.
 *
 * Shell anatomy:
 * - TOP: safe-area top pad (native inset, floored at the design's 42·s
 *   zone-0 rhythm) — the header never moves.
 * - MIDDLE: the zone stack inside a ScrollView. The content container
 *   flexGrow:1 and V4Stretch bands between the zones absorb ANY extra
 *   height (taller-than-design phones — the 20:9 / 21:9 class) by
 *   breathing into the designed gaps; on shorter screens the bands
 *   collapse to 0 and the stack scrolls exactly as before. At exactly
 *   923-scaled the bands are 0 — the shipped pixel-exact composition
 *   is untouched.
 * - BOTTOM: the floating nav pill (tabs layout, safe-area anchored).
 *
 * Window-size classes: wider-than-phone devices (folding / small tablet)
 * cap at V4_MAX_W centered (useV4's scale ceiling) — the composition
 * stays a phone screen, never a balloon.
 *
 * Booking zone (doc 21 honesty law): the stored user's active booking
 * resolves to the live appointment card (real data only); guest, no
 * active booking, or ANY error renders the designed GuestCta state
 * (Law 3 — every state is a layout, never a hole).
 */

import { useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { useColors } from '@/lib/theme'
import { useV4, V4_MAX_W } from '@/components/home4/v4'
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
import { Home4GuestCta } from '@/components/home4/home4-guest-cta'
import { Home4Specialties } from '@/components/home4/home4-specialties'
import { Home4LabPromo } from '@/components/home4/home4-lab'

/** The active-appointment payload the zone renders once resolved. */
interface LiveAppointment {
  doctorName: string
  sub: string
  token: V4AppointmentToken
}

type BookingZone = 'loading' | 'appointment' | 'guest'

/**
 * A stretch band — 0 height at the design's exact geometry, flexGrow
 * when the screen has more room than the composition. Even flex weights
 * distribute the delta across the designed gaps (no single dead band);
 * the terminal band carries double weight so residual air settles low,
 * under the last card, above the pill.
 */
function V4Stretch({ weight = 1 }: { weight?: number }) {
  return <View style={{ height: 0, flexGrow: weight, flexShrink: 0 }} />
}

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
        setZone('guest')
        return
      }
      const rows = await lookupBookings(user.mobile)
      const today = new Date().toISOString().slice(0, 10)
      const active = rows.find(
        (r) => r.status !== 'Cancelled' && r.status !== 'Completed' && r.date >= today,
      )
      if (!active) {
        setZone('guest')
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
      setZone('guest') // error = designed state (never a broken hole)
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
          flexGrow: 1,
          paddingTop: Math.max(insets.top + 6, 42 * s),
          paddingBottom: insets.bottom + NAV_PILL_FOOTPRINT + 28,
          // Window-size-class law: the composition is a phone column —
          // centered and capped on anything wider.
          width: '100%',
          maxWidth: V4_MAX_W,
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <Home4Header city={city ?? ''} onCityPress={() => setCitySheetOpen(true)} />
        <V4Stretch />
        <Home4Hero />
        <V4Stretch />
        <Home4Search />
        <V4Stretch />
        <Home4Services />
        <V4Stretch />
        <Home4TokenBanner />
        <V4Stretch />
        {zone === 'loading' ? (
          <Home4AppointmentSkeleton />
        ) : zone === 'appointment' && appointment ? (
          <Home4Appointment
            doctorName={appointment.doctorName}
            sub={appointment.sub}
            token={appointment.token}
          />
        ) : (
          <Home4GuestCta />
        )}
        <V4Stretch />
        <Home4Specialties />
        <V4Stretch />
        <Home4LabPromo />
        <V4Stretch weight={2} />
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
