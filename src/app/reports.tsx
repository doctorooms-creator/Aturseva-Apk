/**
 * S17 · REPORTS & RECORDS (doc 06 #17, P1) — APK-B6.
 *
 * Stack route (full-screen, back to Profile). The patient's lab-test
 * orders as an honest TRACKER: order no · test · lab · fee · collection
 * window · status chip. "View report" appears ONLY on Completed orders
 * with a report file (reportReady gate — never a dead button).
 *
 * Report opening, per platform (the proxy is Bearer-auth'd — a raw URL
 * would 401):
 * - web (E2E-verified here): fetch blob → object URL → window.open.
 * - native: expo-file-system cache write → expo-sharing sheet —
 *   device behaviour is owner-verified (honest-limit law, doc 12 §2).
 * Guest sees a sign-in doorway (never a wall).
 *
 * B10: pull-to-refresh (a Placed order can move to Sample-collected →
 * Completed while the patient holds this screen — house pattern, ink
 * spinner), and the prep-note seam (the contract always carried
 * prepNote — fasting/before-sample instructions — the card never
 * rendered it; shown only while the collection is still AHEAD:
 * Placed/Confirmed, hidden once collected — hide-if-empty law).
 */

import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { File as FsFile, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { ArrowLeft, FileCheck2, FlaskConical } from 'lucide-react-native'
import { radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { fetchLabReport, getLabOrders, type LabOrderRow } from '@/lib/api'
import { getStoredUser } from '@/lib/auth'
import { EmptyState } from '@/components/empty-state'
import { PillButton } from '@/components/press'
import { AuthSheet } from '@/components/auth-sheet'

/** Honest status ladder (schema statuses → patient language). */
const STATUS: Record<string, { label: string; tone: 'live' | 'done' | 'warn' | 'mute' }> = {
  Placed: { label: 'Placed — awaiting confirmation', tone: 'warn' },
  Confirmed: { label: 'Confirmed', tone: 'live' },
  SampleCollected: { label: 'Sample collected', tone: 'live' },
  Processing: { label: 'Being processed', tone: 'live' },
  Completed: { label: 'Report ready', tone: 'done' },
  Cancelled: { label: 'Cancelled', tone: 'mute' },
  Rejected: { label: 'Rejected', tone: 'mute' },
}

function statusChip(s: string) {
  return STATUS[s] ?? { label: s, tone: 'mute' as const }
}

/** Prep instructions still matter only BEFORE the sample is taken. */
function prepStillMatters(status: string): boolean {
  return status === 'Placed' || status === 'Confirmed'
}

function dateLabel(iso: string): string {
  const dt = new Date(iso)
  if (isNaN(dt.getTime())) return iso
  return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

function openReportWeb(blob: Blob) {
  // Web branch — the full open is E2E-verified in the browser loop.
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  // Revoke later; the viewer tab has already captured it.
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

async function openReportNative(blob: Blob, name: string): Promise<void> {
  // Native branch (SDK 58 file-system API): cache write + OS share/open
  // sheet — device behaviour is owner-verified (honest-limit law).
  const ext = name.includes('.pdf') || blob.type.includes('pdf') ? 'pdf' : 'img'
  const file = new FsFile(Paths.cache, `aturseva-report.${ext}`)
  file.write(await blob.arrayBuffer())
  await Sharing.shareAsync(file.uri, {
    mimeType: blob.type || 'application/octet-stream',
    dialogTitle: name,
  })
}

export default function ReportsScreen() {
  const c = useColors()
  const router = useRouter()

  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [rows, setRows] = useState<LabOrderRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [openFail, setOpenFail] = useState<string | null>(null)
  const [authSheetOpen, setAuthSheetOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      setRows(await getLabOrders())
    } catch {
      setRows([])
      setError('Could not reach the server. Try again.')
    }
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await load()
    } finally {
      setRefreshing(false)
    }
  }, [load])

  useEffect(() => {
    void (async () => {
      await null
      const user = await getStoredUser()
      setSignedIn(Boolean(user))
      if (user) await load()
    })()
  }, [load])

  const onViewReport = async (order: LabOrderRow) => {
    setOpeningId(order.id)
    setOpenFail(null)
    try {
      const { blob } = await fetchLabReport(order.id)
      if (Platform.OS === 'web') {
        openReportWeb(blob)
      } else {
        await openReportNative(blob, `report-${order.testName}`)
      }
    } catch {
      setOpenFail('The report could not be opened. Try again in a moment.')
    } finally {
      setOpeningId(null)
    }
  }

  const toneColor = (tone: 'live' | 'done' | 'warn' | 'mute') =>
    tone === 'live' ? c.tealLive : tone === 'done' ? c.success : tone === 'warn' ? c.warn : c.mute

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
        <Text style={[styles.title, { color: c.ink }]}>Reports</Text>
        <View style={styles.titleRight} />
      </View>

      {signedIn === null ? null : !signedIn ? (
        <EmptyState
          icon={FileCheck2}
          title="Sign in to see your reports"
          caption="Your lab-test orders and their reports live here, tied to your account."
          actions={[{ label: 'Sign in', onPress: () => setAuthSheetOpen(true) }]}
        />
      ) : rows === null ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={c.mute} />
        </View>
      ) : error && rows.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="Could not load your orders"
          caption={error}
          actions={[{ label: 'Try again', onPress: () => void load() }]}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No lab orders yet"
          caption="When you book a lab test — on aturseva.com or here — its status and report land on this screen."
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.ink} />
          }
        >
          {openFail ? (
            <Text style={[styles.openFail, { color: c.error }]}>{openFail}</Text>
          ) : null}
          {rows.map((o) => {
            const chip = statusChip(o.status)
            const busy = openingId === o.id
            return (
              <View key={o.id} style={[styles.card, { backgroundColor: c.canvasSoft }]}>
                <View style={styles.cardHead}>
                  <Text style={[styles.testName, { color: c.ink }]} numberOfLines={2}>
                    {o.testName}
                  </Text>
                  <Text style={[styles.fee, { color: c.ink }]}>₹{o.fee}</Text>
                </View>
                <Text style={[styles.subLine, { color: c.body }]} numberOfLines={1}>
                  {o.labName ? `${o.labName} · ` : ''}
                  {`Order ${o.orderNo}`}
                </Text>
                <Text style={[styles.subLine, { color: c.body }]} numberOfLines={1}>
                  {`Collection ${dateLabel(o.collectionDate)} · ${o.collectionSlot}${o.city ? ` · ${o.city}` : ''}`}
                </Text>
                <View style={styles.chipRow}>
                  <View style={[styles.statusChip, { backgroundColor: `${toneColor(chip.tone)}1A` }]}>
                    <Text style={[styles.statusChipText, { color: toneColor(chip.tone) }]} numberOfLines={1}>
                      {chip.label}
                    </Text>
                  </View>
                  {o.policy === 'rx' ? (
                    <View style={[styles.statusChip, { backgroundColor: `${c.mute}1A` }]}>
                      <Text style={[styles.statusChipText, { color: c.body }]}>Prescription required</Text>
                    </View>
                  ) : null}
                </View>
                {o.statusNote ? (
                  <Text style={[styles.note, { color: c.mute }]} numberOfLines={3}>
                    {o.statusNote}
                  </Text>
                ) : null}
                {o.prepNote && prepStillMatters(o.status) ? (
                  <View style={[styles.prepBox, { backgroundColor: c.warnSoft }]}>
                    <Text style={[styles.prepText, { color: c.warn }]} numberOfLines={4}>
                      {`Before the sample: ${o.prepNote}`}
                    </Text>
                  </View>
                ) : null}
                {o.reportReady ? (
                  <PillButton
                    label={busy ? 'Opening…' : 'View report'}
                    disabled={busy}
                    onPress={() => void onViewReport(o)}
                  />
                ) : null}
              </View>
            )
          })}
          <View style={styles.footerPad} />
        </ScrollView>
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
  loadingRow: {
    padding: space.s24,
  },
  list: {
    paddingHorizontal: space.s16,
    gap: space.s12,
  },
  openFail: {
    ...typo.caption,
    marginBottom: space.s4,
  },
  card: {
    borderRadius: radius.card,
    padding: space.s16,
    gap: space.s8,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.s8,
  },
  testName: {
    ...typo.bodyStrong,
    fontSize: 16,
    flex: 1,
  },
  fee: {
    ...typo.bodyStrong,
    fontVariant: ['tabular-nums'],
  },
  subLine: {
    ...typo.caption,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.s8,
    marginTop: space.s4,
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    ...typo.caption,
    fontSize: 12,
    fontWeight: '600',
  },
  note: {
    ...typo.caption,
  },
  prepBox: {
    borderRadius: radius.input,
    paddingVertical: space.s8,
    paddingHorizontal: space.s12,
    marginTop: space.s4,
  },
  prepText: {
    ...typo.caption,
    fontWeight: '500',
    lineHeight: 18,
  },
  footerPad: {
    height: space.s32,
  },
})
