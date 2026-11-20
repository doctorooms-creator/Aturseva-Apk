/**
 * S15 · NOTIFICATIONS CENTER (doc 06 #15, P1 in-app) — APK-B6.
 *
 * Stack route (full-screen, back to Profile). Auth-gated honestly:
 * a guest sees a sign-in doorway — never a wall (guest-first law), and
 * the empty list is a doorway too ("your booking updates land here").
 *
 * Rows: title · message · time-ago · unread dot (teal-live — the ONLY
 * live accent, doc 03 law). Tap = mark-read (PATCH fires, row settles
 * locally — optimistic is safe here: it is UI state, not money).
 * "Mark all as read" header pill only when unreadCount > 0.
 * Data: GET /api/patient/notifications (Bearer) — contract in api.ts.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ArrowLeft, Bell } from 'lucide-react-native'
import { radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { getNotifications, markAllNotificationsRead, markNotificationRead, type NotificationRow } from '@/lib/api'
import { getStoredUser } from '@/lib/auth'
import { EmptyState } from '@/components/empty-state'
import { PillButton } from '@/components/press'
import { AuthSheet } from '@/components/auth-sheet'

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime()
  if (isNaN(t)) return ''
  const diff = Date.now() - t
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function NotificationsScreen() {
  const c = useColors()
  const router = useRouter()

  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [rows, setRows] = useState<NotificationRow[] | null>(null)
  const [unread, setUnread] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [authSheetOpen, setAuthSheetOpen] = useState(false)
  const loaded = useRef(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const page = await getNotifications()
      setRows(page.rows)
      setUnread(page.unreadCount)
    } catch {
      setRows([])
      setError('Could not reach the server. Pull down and try again.')
    }
  }, [])

  useEffect(() => {
    void (async () => {
      await null
      const user = await getStoredUser()
      setSignedIn(Boolean(user))
      if (user) await load()
      loaded.current = true
    })()
  }, [load])

  const onTapRow = (row: NotificationRow) => {
    if (row.read) return
    // Optimistic settle (UI state only); the PATCH is fire-and-honest.
    setRows((prev) => prev?.map((r) => (r.id === row.id ? { ...r, read: true } : r)) ?? prev)
    setUnread((u) => Math.max(0, u - 1))
    void markNotificationRead(row.id).catch(() => {})
  }

  const onMarkAll = async () => {
    setRows((prev) => prev?.map((r) => ({ ...r, read: true })) ?? prev)
    setUnread(0)
    try {
      await markAllNotificationsRead()
    } catch {
      void load() // honest revert on failure
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <ArrowLeft size={22} color={c.ink} strokeWidth={2} />
        </Pressable>
        <Text style={[styles.title, { color: c.ink }]}>Notifications</Text>
        <View style={styles.titleRight} />
      </View>

      {signedIn === null ? null : !signedIn ? (
        <EmptyState
          icon={Bell}
          title="Sign in to see your updates"
          caption="Booking confirmations and queue updates land here. Booking itself never needs an account."
          actions={[{ label: 'Sign in', onPress: () => setAuthSheetOpen(true) }]}
        />
      ) : (
        <>
          {unread > 0 ? (
            <View style={styles.markAllRow}>
              <Text style={[styles.unreadText, { color: c.body }]}>
                {unread} unread{unread === 1 ? '' : 's'}
              </Text>
              <PillButton label="Mark all as read" onPress={() => void onMarkAll()} />
            </View>
          ) : null}

          {rows === null ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={c.mute} />
            </View>
          ) : error && (rows?.length ?? 0) === 0 ? (
            <EmptyState
              icon={Bell}
              title="Could not load notifications"
              caption={error}
              actions={[{ label: 'Try again', onPress: () => void load() }]}
            />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              caption="Booking confirmations and queue updates will appear here automatically."
            />
          ) : (
            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
              {rows.map((n) => (
                <Pressable
                  key={n.id}
                  onPress={() => onTapRow(n)}
                  accessibilityRole="button"
                  accessibilityLabel={n.read ? n.title : `Unread: ${n.title}`}
                  style={({ pressed }) => [
                    styles.row,
                    { backgroundColor: n.read ? 'transparent' : c.canvasSoft },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={styles.rowDotCol}>
                    <View style={[styles.dot, { backgroundColor: n.read ? 'transparent' : c.tealLive }]} />
                  </View>
                  <View style={styles.rowCol}>
                    <Text style={[styles.rowTitle, { color: c.ink }]} numberOfLines={2}>
                      {n.title || 'Update'}
                    </Text>
                    <Text style={[styles.rowMessage, { color: c.body }]} numberOfLines={4}>
                      {n.message}
                    </Text>
                    <Text style={[styles.rowTime, { color: c.mute }]}>{timeAgo(n.createdAt)}</Text>
                  </View>
                </Pressable>
              ))}
              <View style={styles.footerPad} />
            </ScrollView>
          )}
        </>
      )}

      <AuthSheet
        visible={authSheetOpen}
        onClose={() => setAuthSheetOpen(false)}
        onSignedIn={() => {
          setAuthSheetOpen(false)
          setSignedIn(true)
          void load()
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.s12,
    paddingTop: space.s16,
    paddingBottom: space.s8,
    gap: space.s8,
  },
  backBtn: {
    width: TOUCH,
    height: TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typo.title,
    flex: 1,
  },
  titleRight: {
    width: TOUCH,
  },
  markAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.s16,
    paddingBottom: space.s8,
  },
  unreadText: {
    ...typo.caption,
  },
  loadingRow: {
    padding: space.s24,
  },
  list: {
    paddingHorizontal: space.s16,
    gap: space.s8,
  },
  row: {
    minHeight: TOUCH + 20,
    borderRadius: radius.card,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.s8,
    padding: space.s16,
  },
  rowDotCol: {
    width: 12,
    paddingTop: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  rowCol: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    ...typo.bodyStrong,
  },
  rowMessage: {
    ...typo.caption,
    lineHeight: 18,
  },
  rowTime: {
    ...typo.caption,
    marginTop: 4,
  },
  footerPad: {
    height: space.s32,
  },
})
