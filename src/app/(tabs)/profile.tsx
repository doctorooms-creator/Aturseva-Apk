/**
 * PROFILE (tab 3) — P0 guest shell (doc 06 S12-lite).
 * Login/register arrive with APK-B4 (guest-first law). Real now: city
 * (storage-backed, live changes), version, honest guest status.
 * Pure English copy (owner directive).
 */

import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import * as Linking from 'expo-linking'
import Constants from 'expo-constants'
import { ChevronRight, Globe, MapPin, UserRound } from 'lucide-react-native'
import { colors, radius, space, type as typo } from '@/lib/tokens'
import { getCity, setCity } from '@/lib/storage'
import { CityPickerSheet } from '@/components/city-picker'

const WEB_URL = 'https://aturseva.com'

export default function ProfileScreen() {
  const [city, setCityState] = useState<string | null>(null)
  const [citySheetOpen, setCitySheetOpen] = useState(false)

  const load = useCallback(async () => {
    setCityState(await getCity())
  }, [])

  useEffect(() => {
    // Microtask barrier: city flag never flips synchronously inside the
    // mounting effect (cascading-render law).
    void (async () => {
      await null
      await load()
    })()
  }, [load])

  const version = Constants.expoConfig?.version ?? '0.1.0'

  return (
    <View style={styles.screen}>
      <View style={styles.safeTop} />
      <Text style={styles.title}>Profile</Text>

      {/* Guest card — honest: booking works without login (guest-first) */}
      <View style={styles.guestCard}>
        <UserRound size={24} color={colors.body} strokeWidth={1.75} />
        <View style={styles.guestCol}>
          <Text style={styles.guestTitle}>Guest</Text>
          <Text style={styles.guestCaption}>
            Booking works without an account — no login needed (booking flow lands in APK-B3, sign-in in APK-B4).
          </Text>
        </View>
      </View>

      {/* Settings — city is REAL (storage write) */}
      <Text style={styles.sectionCaption}>Settings</Text>
      <View style={styles.rows}>
        <Row
          icon={<MapPin size={20} color={colors.body} strokeWidth={2} />}
          label="City"
          value={city ?? 'Select'}
          onPress={() => setCitySheetOpen(true)}
        />
        <Row
          icon={<Globe size={20} color={colors.body} strokeWidth={2} />}
          label="Aturseva web"
          value="Privacy · Terms"
          onPress={() => {
            void Linking.openURL(WEB_URL).catch(() => {})
          }}
        />
      </View>

      <Text style={styles.versionText}>Aturseva v{version} · APK-B2</Text>
      <View style={styles.footerPad} />

      <CityPickerSheet
        visible={citySheetOpen}
        current={city}
        onClose={() => setCitySheetOpen(false)}
        onPick={(picked) => {
          setCitySheetOpen(false)
          setCityState(picked)
          if (picked) void setCity(picked)
        }}
      />
    </View>
  )
}

function Row({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode
  label: string
  value: string
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      {icon}
      <View style={styles.rowCol}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.mute} strokeWidth={2} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  safeTop: {
    height: 24,
  },
  title: {
    ...typo.title,
    color: colors.ink,
    marginHorizontal: space.s16,
    marginBottom: space.s16,
  },
  guestCard: {
    marginHorizontal: space.s16,
    borderRadius: radius.card,
    backgroundColor: colors.canvasSoft,
    padding: space.s16,
    flexDirection: 'row',
    gap: space.s12,
    alignItems: 'center',
  },
  guestCol: {
    flex: 1,
  },
  guestTitle: {
    ...typo.bodyStrong,
    color: colors.ink,
  },
  guestCaption: {
    ...typo.caption,
    color: colors.body,
    marginTop: 2,
  },
  sectionCaption: {
    ...typo.caption,
    color: colors.mute,
    marginHorizontal: space.s16,
    marginTop: space.s24,
    marginBottom: space.s8,
  },
  rows: {
    marginHorizontal: space.s16,
    gap: space.s8,
  },
  row: {
    minHeight: 56,
    borderRadius: radius.input,
    backgroundColor: colors.canvasSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    paddingHorizontal: space.s16,
  },
  rowCol: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    ...typo.bodyStrong,
    color: colors.ink,
  },
  rowValue: {
    ...typo.caption,
    color: colors.body,
  },
  versionText: {
    ...typo.caption,
    color: colors.mute,
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: space.s24,
  },
  footerPad: {
    height: space.s24,
  },
})
