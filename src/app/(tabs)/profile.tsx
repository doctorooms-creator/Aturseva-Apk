/**
 * S-PROFILE (doc 06 S-Profile) — APK-B4 upgrade.
 *
 * Guest-first stays the load-bearing law (booking needs NO account), but
 * the tab now owns the full account + appearance story:
 *
 * - Logged-in card: Avatar + name + email + masked mobile + Sign out
 *   (server revoke best-effort + local clear; the app degrades to guest
 *   instantly, everything keeps working).
 * - Guest card: honest copy + Sign in door (AuthSheet) — never a wall.
 * - Session boot: cached user paints instantly (secure-store snapshot),
 *   then /api/auth/me verifies; a 401/revoked session clears to guest
 *   (honest), network failure keeps the cached card (offline law).
 * - Appearance: System · Light · Dark (doc 03 §2 — dark values were
 *   dual-defined from day 1; this is the consumption point).
 * - City row + web row unchanged (real storage write / real URL).
 */

import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import * as Linking from 'expo-linking'
import { useFocusEffect, useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { Bell, ChevronRight, ClipboardList, FileCheck2, Globe, LogOut, MapPin, Moon, MonitorSmartphone, PenLine, Receipt, Star, Sun, UserRound } from 'lucide-react-native'
import { radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors, useTheme } from '@/lib/theme'
import type { AuthUser } from '@/lib/api'
import { getMe, getNotifications, logoutRemote } from '@/lib/api'
import { clearSession, getStoredToken, getStoredUser, updateStoredUser } from '@/lib/auth'
import { getCity, setCity, type ThemeMode } from '@/lib/storage'
import { Avatar } from '@/components/avatar'
import { CityPickerSheet } from '@/components/city-picker'
import { AuthSheet } from '@/components/auth-sheet'
import { EditProfileSheet } from '@/components/edit-profile-sheet'
import { BottomSheet, GrabHandle } from '@/components/sheets'

const WEB_URL = 'https://aturseva.com'

function maskMobile(m: string | null): string {
  if (!m || m.length < 10) return m ?? ''
  return `${m.slice(0, 2)}••••${m.slice(6)}`
}

export default function ProfileScreen() {
  const c = useColors()
  const router = useRouter()
  const { mode, setMode } = useTheme()

  const [user, setUser] = useState<AuthUser | null>(null)
  const [authSheetOpen, setAuthSheetOpen] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [city, setCityState] = useState<string | null>(null)
  const [citySheetOpen, setCitySheetOpen] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [unread, setUnread] = useState<number | null>(null)

  const load = useCallback(async () => {
    setCityState(await getCity())
  }, [])

  useEffect(() => {
    // Microtask barrier: session + city never flip synchronously inside the
    // mounting effect (cascading-render law).
    void (async () => {
      await null
      const cached = await getStoredUser()
      if (cached) setUser(cached) // instant paint, verified below
      await load()
      try {
        const me = await getMe()
        if (me) setUser(me)
        else if (cached) {
          // 401/expired/revoked — honest downgrade to guest.
          await clearSession()
          setUser(null)
        }
      } catch {
        /* network — keep the cached card (offline law) */
      }
    })()
  }, [load])

  // B6: unread badge stays fresh while the tab is around (cheap GET,
  // guest = null = no badge; error = last value, offline law).
  useFocusEffect(
    useCallback(() => {
      void (async () => {
        await null
        if (!(await getStoredToken())) {
          setUnread(null)
          return
        }
        try {
          const page = await getNotifications()
          setUnread(page.unreadCount)
        } catch {
          /* keep last badge (offline law) */
        }
      })()
    }, []),
  )

  const version = Constants.expoConfig?.version ?? '0.1.0'

  const signOut = async () => {
    // Local clear is the real sign-out (instant, offline-safe); the server
    // revoke is best-effort with the token captured BEFORE the clear (order
    // law — a revoke after clear would read an empty keystore).
    const token = await getStoredToken()
    setUser(null)
    await clearSession()
    if (token) void logoutRemote(token)
  }

  return (
    // B8 scroll fix: the account section grew to 5 rows — a plain View
    // overflowed short screens (Sign out + version clipped behind the tab
    // bar). ScrollView + flexGrow keeps the short-screen footer pinned
    // (marginTop auto on the version line) and scrolls when long — the
    // sticky-footer law in RN form.
    <ScrollView
      style={[styles.screen, { backgroundColor: c.canvas }]}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.safeTop} />
      <Text style={[styles.title, { color: c.ink }]}>Profile</Text>

      {/* Account card — logged-in truth or the guest door (never a wall).
          APK-B9: the logged-in card is the edit door (tap → EditProfileSheet) —
          the card shows exactly the fields the sheet edits, so it IS the
          affordance; guests keep their sign-in door (no edit for what does
          not exist yet). */}
      {user ? (
        <Pressable
          onPress={() => setEditSheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          style={({ pressed }) => [
            styles.accountCard,
            { backgroundColor: c.canvasSoft },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Avatar name={user.name || 'Member'} size={48} />
          <View style={styles.accountCol}>
            <Text style={[styles.accountName, { color: c.ink }]} numberOfLines={1}>
              {user.name || 'Member'}
            </Text>
            <Text style={[styles.accountEmail, { color: c.body }]} numberOfLines={1}>
              {user.email}
            </Text>
            {user.mobile ? (
              <Text style={[styles.accountMobile, { color: c.mute }]} numberOfLines={1}>
                {maskMobile(user.mobile)}
              </Text>
            ) : null}
          </View>
          <View
            style={[
              styles.editChip,
              { backgroundColor: c.canvas, borderColor: c.hairline },
            ]}
          >
            <PenLine size={14} color={c.tealLive} strokeWidth={2} />
            <Text style={[styles.editChipText, { color: c.tealLive }]}>Edit</Text>
          </View>
        </Pressable>
      ) : (
        <View style={[styles.guestCard, { backgroundColor: c.canvasSoft }]}>
          <UserRound size={24} color={c.body} strokeWidth={1.75} />
          <View style={styles.guestCol}>
            <Text style={[styles.guestTitle, { color: c.ink }]}>Guest</Text>
            <Text style={[styles.guestCaption, { color: c.body }]}>
              Booking works without an account. Sign in to keep your history in one place.
            </Text>
            <Pressable
              onPress={() => setAuthSheetOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              style={({ pressed }) => [styles.signInRow, pressed && { opacity: 0.7 }]}
            >
              <Text style={[styles.signInText, { color: c.tealLive }]}>Sign in or create account</Text>
              <ChevronRight size={16} color={c.tealLive} strokeWidth={2} />
            </Pressable>
          </View>
        </View>
      )}

      {/* B6 · Account rows — logged-in only (progressive disclosure law:
          these screens mean nothing to a guest; they appear with history). */}
      {user ? (
        <>
          <Text style={[styles.sectionCaption, { color: c.mute }]}>Your account</Text>
          <View style={styles.rows}>
            <Row
              icon={<Bell size={20} color={c.body} strokeWidth={2} />}
              label="Notifications"
              value={unread === null ? 'Booking and queue updates' : unread > 0 ? `${unread} unread` : 'All caught up'}
              badge={unread !== null && unread > 0 ? unread : null}
              chevron={<ChevronRight size={18} color={c.mute} strokeWidth={2} />}
              onPress={() => void router.push('/notifications')}
            />
            <Row
              icon={<FileCheck2 size={20} color={c.body} strokeWidth={2} />}
              label="Reports"
              value="Lab test orders and reports"
              chevron={<ChevronRight size={18} color={c.mute} strokeWidth={2} />}
              onPress={() => void router.push('/reports')}
            />
            <Row
              icon={<ClipboardList size={20} color={c.body} strokeWidth={2} />}
              label="Medical history"
              value="Visits, prescriptions and stays"
              chevron={<ChevronRight size={18} color={c.mute} strokeWidth={2} />}
              onPress={() => void router.push('/medical-history')}
            />
            <Row
              icon={<Receipt size={20} color={c.body} strokeWidth={2} />}
              label="Bills"
              value="Payments and billing records"
              chevron={<ChevronRight size={18} color={c.mute} strokeWidth={2} />}
              onPress={() => void router.push('/bills')}
            />
            <Row
              icon={<Star size={20} color={c.body} strokeWidth={2} />}
              label="Rate your visits"
              value="Help the next patient choose"
              chevron={<ChevronRight size={18} color={c.mute} strokeWidth={2} />}
              onPress={() => void router.push('/rate')}
            />
          </View>
        </>
      ) : null}

      {/* Settings — city REAL (storage write) · appearance REAL (theme) */}
      <Text style={[styles.sectionCaption, { color: c.mute }]}>Settings</Text>
      <View style={styles.rows}>
        <Row
          icon={<MapPin size={20} color={c.body} strokeWidth={2} />}
          label="City"
          value={city ?? 'Select'}
          chevron={<ChevronRight size={18} color={c.mute} strokeWidth={2} />}
          onPress={() => setCitySheetOpen(true)}
        />
        <Row
          icon={
            mode === 'dark' ? (
              <Moon size={20} color={c.body} strokeWidth={2} />
            ) : mode === 'light' ? (
              <Sun size={20} color={c.body} strokeWidth={2} />
            ) : (
              <MonitorSmartphone size={20} color={c.body} strokeWidth={2} />
            )
          }
          label="Appearance"
          value={
            mode === 'dark' ? 'Dark' : mode === 'light' ? 'Light' : 'Follow system'
          }
          chevron={<ChevronRight size={18} color={c.mute} strokeWidth={2} />}
          onPress={() => setAppearanceOpen(true)}
        />
        <Row
          icon={<Globe size={20} color={c.body} strokeWidth={2} />}
          label="Aturseva web"
          value="aturseva.com"
          chevron={<ChevronRight size={18} color={c.mute} strokeWidth={2} />}
          onPress={() => {
            void Linking.openURL(WEB_URL).catch(() => {})
          }}
        />
        {user ? (
          <Row
            icon={<LogOut size={20} color={c.error} strokeWidth={2} />}
            label="Sign out"
            value="Session ends on this device"
            chevron={null}
            onPress={() => void signOut()}
          />
        ) : null}
      </View>

      <Text style={[styles.versionText, { color: c.mute }]}>Aturseva v{version}</Text>
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

      <AppearanceSheet
        visible={appearanceOpen}
        current={mode}
        onClose={() => setAppearanceOpen(false)}
        onPick={(picked) => {
          setAppearanceOpen(false)
          setMode(picked)
        }}
      />

      <AuthSheet
        visible={authSheetOpen}
        onClose={() => setAuthSheetOpen(false)}
        onSignedIn={(u) => {
          setAuthSheetOpen(false)
          setUser(u)
        }}
      />

      {/* APK-B9 · the account card's edit door — save → card + snapshot +
          close, one callback; the number the card masks is the number the
          confirm sheet pre-fills next time (identity law, both ends). */}
      {user ? (
        <EditProfileSheet
          visible={editSheetOpen}
          user={user}
          onClose={() => setEditSheetOpen(false)}
          onSaved={(saved) => {
            setEditSheetOpen(false)
            setUser(saved)
            void updateStoredUser(saved)
          }}
        />
      ) : null}
    </ScrollView>
  )
}

/** Appearance picker — System · Light · Dark (one row per mode, check on the active one). */
function AppearanceSheet({
  visible,
  current,
  onClose,
  onPick,
}: {
  visible: boolean
  current: ThemeMode
  onClose: () => void
  onPick: (m: ThemeMode) => void
}) {
  const c = useColors()
  const rows: { mode: ThemeMode; label: string; hint: string }[] = [
    { mode: 'system', label: 'Follow system', hint: 'Matches your phone setting' },
    { mode: 'light', label: 'Light', hint: 'White clinic canvas' },
    { mode: 'dark', label: 'Dark', hint: 'Easier in low light' },
  ]
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Appearance picker">
      <GrabHandle />
      <Text style={[styles.pickerTitle, { color: c.ink }]}>Appearance</Text>
      <Text style={[styles.pickerCaption, { color: c.body }]}>Applies instantly, everywhere in the app.</Text>
      <View style={styles.pickerList}>
        {rows.map((r) => {
          const active = current === r.mode
          return (
            <Pressable
              key={r.mode}
              onPress={() => onPick(r.mode)}
              accessibilityRole="button"
              accessibilityLabel={r.label}
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.pickerRow,
                { backgroundColor: active ? c.canvasSoft : 'transparent' },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.pickerRowCol}>
                <Text style={[styles.pickerRowLabel, { color: active ? c.ink : c.body }]}>{r.label}</Text>
                <Text style={[styles.pickerRowHint, { color: c.mute }]}>{r.hint}</Text>
              </View>
              {active ? <View style={[styles.pickerDot, { backgroundColor: c.tealLive }]} /> : null}
            </Pressable>
          )
        })}
      </View>
    </BottomSheet>
  )
}

function Row({
  icon,
  label,
  value,
  chevron,
  badge,
  onPress,
}: {
  icon: React.ReactNode
  label: string
  value: string
  chevron: React.ReactNode
  /** Unread count chip (B6) — null hides it. */
  badge?: number | null
  onPress: () => void
}) {
  const c = useColors()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      style={({ pressed }) => [styles.row, { backgroundColor: c.canvasSoft }, pressed && { opacity: 0.7 }]}
    >
      {icon}
      <View style={styles.rowCol}>
        <Text style={[styles.rowLabel, { color: c.ink }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: c.body }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
      {badge != null ? (
        <View style={[styles.badge, { backgroundColor: c.tealLive }]}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : String(badge)}</Text>
        </View>
      ) : null}
      {chevron}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenContent: {
    flexGrow: 1,
  },
  safeTop: {
    height: 24,
  },
  title: {
    ...typo.title,
    marginHorizontal: space.s16,
    marginBottom: space.s16,
  },
  accountCard: {
    marginHorizontal: space.s16,
    borderRadius: radius.card,
    padding: space.s16,
    flexDirection: 'row',
    gap: space.s12,
    alignItems: 'center',
  },
  accountCol: {
    flex: 1,
    gap: 2,
  },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    /** VLM fix-loop: a bare text+icon reads as a link, not a control —
     *  the chip gets a real container (outlined pill — canvas + hairline,
     *  theme-token colors inline; readable on the canvasSoft card in
     *  both modes) so the eye reads "tappable" before the thumb agrees. */
    minHeight: 32,
    paddingHorizontal: space.s12,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  editChipText: {
    ...typo.bodyStrong,
    fontSize: 13,
  },
  accountName: {
    ...typo.bodyStrong,
  },
  accountEmail: {
    ...typo.caption,
  },
  accountMobile: {
    ...typo.caption,
    fontVariant: ['tabular-nums'],
  },
  guestCard: {
    marginHorizontal: space.s16,
    borderRadius: radius.card,
    padding: space.s16,
    flexDirection: 'row',
    gap: space.s12,
    alignItems: 'flex-start',
  },
  guestCol: {
    flex: 1,
  },
  guestTitle: {
    ...typo.bodyStrong,
  },
  guestCaption: {
    ...typo.caption,
    marginTop: 2,
  },
  signInRow: {
    minHeight: TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s4,
    alignSelf: 'flex-start',
    marginTop: space.s4,
  },
  signInText: {
    ...typo.bodyStrong,
    fontSize: 14,
  },
  sectionCaption: {
    ...typo.caption,
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
  },
  rowValue: {
    ...typo.caption,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typo.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  versionText: {
    ...typo.caption,
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: space.s24,
  },
  footerPad: {
    /** VLM-caught B9 regression guard: 24 was 4px short of the 48px
     *  tab-bar overlay at the scroll limit — the last row's bottom edge
     *  tucked behind the tab bar (Sign out). 72 clears it with room for
     *  the version line + breathing space (scroll-limit law, not guesswork:
     *  tab bar measured 48px in the web preview). */
    height: 72,
  },
  pickerTitle: {
    ...typo.title,
    paddingHorizontal: space.s4,
  },
  pickerCaption: {
    ...typo.caption,
    marginTop: 2,
    paddingHorizontal: space.s4,
    marginBottom: space.s12,
  },
  pickerList: {
    gap: space.s4,
  },
  pickerRow: {
    minHeight: TOUCH + 12,
    borderRadius: radius.input,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.s12,
  },
  pickerRowCol: {
    flex: 1,
    gap: 2,
  },
  pickerRowLabel: {
    ...typo.bodyStrong,
  },
  pickerRowHint: {
    ...typo.caption,
  },
  pickerDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
})
