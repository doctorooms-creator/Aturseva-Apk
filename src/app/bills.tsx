/**
 * S-BILLS — bills & payments viewer — APK-B8.
 *
 * Stack route (full-screen, back to Profile). READ-ONLY records: the
 * patient's OPD receipts, IPD hospital-stay bills and online payment
 * attempts exactly as the monolith records them (GET /api/patient/bills,
 * Bearer). Paying from the app is deliberately NOT here — the online
 * gateway is a P2 item (Razorpay keys) and a fake pay button would be
 * a dead button (honest-copy law).
 *
 * Zones are hide-if-empty ABSOLUTE (fresh patient = one honest doorway,
 * not three empty headings). Money is PLAIN ink with tabular numerals —
 * NO colored money (web §9.1 law mirrored). Guest sees a sign-in
 * doorway (never a wall).
 */

import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ArrowLeft, Receipt, Stethoscope, CreditCard } from 'lucide-react-native'
import { radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import {
  getPatientBills,
  type GatewayTxnRow,
  type IpdBillRow,
  type OpdBillRow,
  type PatientBills,
} from '@/lib/api'
import { getStoredUser } from '@/lib/auth'
import { EmptyState } from '@/components/empty-state'
import { AuthSheet } from '@/components/auth-sheet'

/** Status tone ladder — mirrors the web patient-bills tone table
 *  (Paid/Final/Draft = calm, PartiallyPaid = warn, Failed = error;
 *  unknown statuses degrade to mute, never a guess). */
type Tone = 'done' | 'warn' | 'mute' | 'error'
const BILL_STATUS: Record<string, { label: string; tone: Tone }> = {
  Paid: { label: 'Paid', tone: 'done' },
  PartiallyPaid: { label: 'Partially paid', tone: 'warn' },
  Draft: { label: 'Draft', tone: 'mute' },
  Final: { label: 'Final', tone: 'mute' },
  Failed: { label: 'Failed', tone: 'error' },
  Created: { label: 'Started', tone: 'warn' },
  Success: { label: 'Paid online', tone: 'done' },
  Refunded: { label: 'Refunded', tone: 'mute' },
}

function statusChip(s: string) {
  return BILL_STATUS[s] ?? { label: s, tone: 'mute' as const }
}

function money(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`
}

function dateLabel(iso: string): string {
  const dt = new Date(iso)
  if (isNaN(dt.getTime())) return iso
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function shortRef(s: string): string {
  // CUIDs are long; bills read better with the tail-8 (web shows full
  // refs on its wider canvas — app keeps the scannable suffix).
  return s.length > 12 ? `…${s.slice(-8)}` : s
}

export default function BillsScreen() {
  const c = useColors()
  const router = useRouter()

  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [bills, setBills] = useState<PatientBills | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [authSheetOpen, setAuthSheetOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      setBills(await getPatientBills())
    } catch {
      setBills(null)
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

  const toneColor = (tone: Tone) =>
    tone === 'done' ? c.success : tone === 'warn' ? c.warn : tone === 'error' ? c.error : c.mute

  const anything =
    bills !== null && bills.opdBills.length + bills.ipdBills.length + bills.gatewayTransactions.length > 0

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
        <Text style={[styles.title, { color: c.ink }]}>Bills</Text>
        <View style={styles.titleRight} />
      </View>

      {signedIn === null ? null : !signedIn ? (
        <EmptyState
          icon={Receipt}
          title="Sign in to see your bills"
          caption="Receipts from your clinic visits and hospital stays, tied to your account."
          actions={[{ label: 'Sign in', onPress: () => setAuthSheetOpen(true) }]}
        />
      ) : bills === null && !error ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={c.mute} />
        </View>
      ) : error && !bills ? (
        <EmptyState
          icon={Receipt}
          title="Could not load your bills"
          caption={error}
          actions={[{ label: 'Try again', onPress: () => void load() }]}
        />
      ) : !anything ? (
        <EmptyState
          icon={Receipt}
          title="No bills yet"
          caption="Receipts appear here once the hospital records them for your visits or stays. Nothing to pay from the app today — payments happen at the hospital counter."
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.ink} />
          }
        >
          {/* OPD zone — hide-if-empty ABSOLUTE */}
          {bills && bills.opdBills.length > 0 ? (
            <View style={styles.zone}>
              <View style={styles.zoneHead}>
                <Stethoscope size={16} color={c.body} strokeWidth={2} />
                <Text style={[styles.zoneTitle, { color: c.body }]}>
                  Clinic visits · {bills.opdBills.length} bill{bills.opdBills.length === 1 ? '' : 's'}
                </Text>
              </View>
              {bills.opdBills.map((b) => (
                <OpdCard key={b.id} b={b} toneColor={toneColor} />
              ))}
            </View>
          ) : null}

          {/* IPD zone — hide-if-empty ABSOLUTE */}
          {bills && bills.ipdBills.length > 0 ? (
            <View style={styles.zone}>
              <View style={styles.zoneHead}>
                <Receipt size={16} color={c.body} strokeWidth={2} />
                <Text style={[styles.zoneTitle, { color: c.body }]}>
                  Hospital stays · {bills.ipdBills.length} bill{bills.ipdBills.length === 1 ? '' : 's'}
                </Text>
              </View>
              {bills.ipdBills.map((b) => (
                <IpdCard key={b.id} b={b} toneColor={toneColor} />
              ))}
            </View>
          ) : null}

          {/* Online payments zone — hide-if-empty ABSOLUTE */}
          {bills && bills.gatewayTransactions.length > 0 ? (
            <View style={styles.zone}>
              <View style={styles.zoneHead}>
                <CreditCard size={16} color={c.body} strokeWidth={2} />
                <Text style={[styles.zoneTitle, { color: c.body }]}>
                  Online payments · {bills.gatewayTransactions.length} recent
                </Text>
              </View>
              {bills.gatewayTransactions.map((t) => (
                <GatewayCard key={t.id} t={t} toneColor={toneColor} />
              ))}
            </View>
          ) : null}

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

/** Status chip (soft bg + tone text) — same grammar as reports.tsx. */
function StatusChipView({ label, tone, toneColor }: { label: string; tone: Tone; toneColor: (t: Tone) => string }) {
  return (
    <View style={[styles.statusChip, { backgroundColor: `${toneColor(tone)}1A` }]}>
      <Text style={[styles.statusChipText, { color: toneColor(tone) }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

function OpdCard({ b, toneColor }: { b: OpdBillRow; toneColor: (t: Tone) => string }) {
  const c = useColors()
  const chip = statusChip(b.status)
  return (
    <View
      style={[styles.card, { backgroundColor: c.canvasSoft }]}
      accessibilityLabel={`Clinic bill ${money(b.totalAmount)} for ${b.doctorName || 'your visit'}, ${chip.label}`}
    >
      <View style={styles.cardHead}>
        <Text style={[styles.cardTitle, { color: c.ink }]} numberOfLines={2}>
          {b.doctorName ? `Visit with ${b.doctorName}` : 'Clinic visit'}
        </Text>
        <Text style={[styles.amount, { color: c.ink }]}>{money(b.totalAmount)}</Text>
      </View>
      <Text style={[styles.subLine, { color: c.body }]} numberOfLines={1}>
        {[b.hospitalName, b.receiptNo ? `Receipt ${shortRef(b.receiptNo)}` : ''].filter(Boolean).join(' · ')}
      </Text>
      <View style={styles.chipRow}>
        <StatusChipView label={chip.label} tone={chip.tone} toneColor={toneColor} />
        <Text style={[styles.metaLine, { color: c.mute }]} numberOfLines={1}>
          {[b.paymentMethod, dateLabel(b.paymentDate || b.createdAt)].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </View>
  )
}

function IpdCard({ b, toneColor }: { b: IpdBillRow; toneColor: (t: Tone) => string }) {
  const c = useColors()
  const chip = statusChip(b.status)
  return (
    <View
      style={[styles.card, { backgroundColor: c.canvasSoft }]}
      accessibilityLabel={`Hospital stay bill ${money(b.netPayable)} for admission ${shortRef(b.admissionNo)}, ${chip.label}`}
    >
      <View style={styles.cardHead}>
        <Text style={[styles.cardTitle, { color: c.ink }]} numberOfLines={2}>
          Hospital stay{b.wardName ? ` · ${b.wardName}` : ''}
        </Text>
        <Text style={[styles.amount, { color: c.ink }]}>{money(b.netPayable)}</Text>
      </View>
      <Text style={[styles.subLine, { color: c.body }]} numberOfLines={1}>
        {[
          b.hospitalName,
          b.admissionNo ? `Admission ${shortRef(b.admissionNo)}` : '',
          b.billNo ? `Bill ${shortRef(b.billNo)}` : '',
        ]
          .filter(Boolean)
          .join(' · ')}
      </Text>
      {/* Money ladder — plain ink, tabular numerals, no colored money. */}
      <View style={styles.moneyRows}>
        <MoneyRow label="Net payable" value={money(b.netPayable)} />
        <MoneyRow label="Paid so far" value={money(b.paidAmount)} />
        {b.balance > 0 ? <MoneyRow label="Balance" value={money(b.balance)} strong /> : null}
        {b.advanceAdjusted > 0 ? (
          <MoneyRow label="Advance adjusted" value={money(b.advanceAdjusted)} />
        ) : null}
        {b.discountAmount > 0 ? (
          <MoneyRow label="Discount" value={`− ${money(b.discountAmount)}`} />
        ) : null}
      </View>
      <View style={styles.chipRow}>
        <StatusChipView label={chip.label} tone={chip.tone} toneColor={toneColor} />
        {chip.tone === 'warn' && b.balance > 0 ? (
          <Text style={[styles.metaLine, { color: c.body }]} numberOfLines={2}>
            Balance is settled at the hospital counter.
          </Text>
        ) : null}
      </View>
      {b.payments.length > 0 ? (
        <View style={styles.paymentsBlock} accessibilityLabel={`${b.payments.length} recorded payment${b.payments.length === 1 ? '' : 's'}`}>
          <Text style={[styles.paymentsHead, { color: c.mute }]}>
            Recorded payments ({b.payments.length})
          </Text>
          {b.payments.map((p) => (
            <View key={p.id} style={styles.paymentRow}>
              <Text style={[styles.paymentText, { color: c.body }]} numberOfLines={1}>
                {dateLabel(p.paymentDate)} · {p.paymentMethod}
              </Text>
              <Text style={[styles.paymentAmount, { color: c.ink }]}>{money(p.amount)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}

function MoneyRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const c = useColors()
  return (
    <View style={styles.moneyRow}>
      <Text style={[styles.moneyLabel, { color: c.body }]} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[styles.moneyValue, { color: c.ink }, strong ? styles.moneyValueStrong : null]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  )
}

function GatewayCard({ t, toneColor }: { t: GatewayTxnRow; toneColor: (t: Tone) => string }) {
  const c = useColors()
  const chip = statusChip(t.status)
  return (
    <View
      style={[styles.card, { backgroundColor: c.canvasSoft }]}
      accessibilityLabel={`Online payment ${money(t.amount)}, ${chip.label}`}
    >
      <View style={styles.cardHead}>
        <Text style={[styles.cardTitle, { color: c.ink }]} numberOfLines={1}>
          Online payment
        </Text>
        <Text style={[styles.amount, { color: c.ink }]}>{money(t.amount)}</Text>
      </View>
      <Text style={[styles.subLine, { color: c.body }]} numberOfLines={1}>
        {[dateLabel(t.createdAt), t.razorpayPaymentId ? `Payment ${shortRef(t.razorpayPaymentId)}` : `Order ${shortRef(t.razorpayOrderId)}`]
          .filter(Boolean)
          .join(' · ')}
      </Text>
      <View style={styles.chipRow}>
        <StatusChipView label={chip.label} tone={chip.tone} toneColor={toneColor} />
      </View>
      {t.errorMessage ? (
        <Text style={[styles.note, { color: c.mute }]} numberOfLines={3}>
          {t.errorMessage}
        </Text>
      ) : null}
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
    gap: space.s16,
  },
  zone: {
    gap: space.s8,
  },
  zoneHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
    paddingHorizontal: space.s4,
  },
  zoneTitle: {
    ...typo.bodyStrong,
    fontSize: 13,
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
  cardTitle: {
    ...typo.bodyStrong,
    fontSize: 16,
    flex: 1,
  },
  amount: {
    ...typo.bodyStrong,
    fontVariant: ['tabular-nums'],
  },
  subLine: {
    ...typo.caption,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
    flexWrap: 'wrap',
  },
  statusChip: {
    borderRadius: radius.pill,
    paddingHorizontal: space.s8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    ...typo.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  metaLine: {
    ...typo.caption,
    flex: 1,
  },
  moneyRows: {
    gap: 4,
    marginTop: space.s4,
  },
  moneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s8,
  },
  moneyLabel: {
    ...typo.caption,
  },
  moneyValue: {
    ...typo.caption,
    fontVariant: ['tabular-nums'],
  },
  moneyValueStrong: {
    fontWeight: '700',
  },
  paymentsBlock: {
    gap: 6,
    marginTop: space.s4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.25)',
    paddingTop: space.s12,
  },
  paymentsHead: {
    ...typo.caption,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s8,
  },
  paymentText: {
    ...typo.caption,
    flex: 1,
  },
  paymentAmount: {
    ...typo.caption,
    fontVariant: ['tabular-nums'],
  },
  note: {
    ...typo.caption,
    fontStyle: 'italic',
  },
  footerPad: {
    height: space.s32,
  },
})
