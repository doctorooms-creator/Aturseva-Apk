/**
 * S7 · CONFIRM BOOKING — step screen (doc 06 S7) — APK-B3.
 *
 * Back bar → summary card (doctor mini + date + time + fee — everything
 * visible TOGETHER for the first time) → guest fields (name · 10-digit
 * phone · one-line reason) → fee line ("pay at the clinic" — cash law,
 * upfront) → "Confirm booking" 56px pill (double-tap guard + loading).
 *
 * Laws: NO new asks (no email, no OTP — minimality); fee + cash-at-clinic
 * visible at the confirm moment; server-fail = honest error + one-tap
 * retry (money/visit law — never a silent fail); 409 duplicate offers the
 * existing booking (never a dead end); success → stack replace to S8.
 * Data: POST /api/public/book {doctorId, slot, name, phone, city}.
 *
 * APK-B9 · identity pre-fill: a signed-in patient's name + account
 * mobile arrive PRE-FILLED (still editable — booking for a parent on
 * their number must stay possible). The mobile field's caption states the
 * identity law at the moment of decision: same-as-account → the booking
 * joins the account's history (the monolith resolves patients BY MOBILE,
 * B8's discovery); different number → honest "stays separate". Guests
 * see the classic static caption — nothing changes for them.
 */

import { useEffect, useState } from 'react'
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { ApiError, getDoctorSchedule, postPublicBooking } from '@/lib/api'
import { useQuery } from '@/lib/use-query'
import { getCity, pushBookingId, setBookingPhone } from '@/lib/storage'
import { getStoredUser } from '@/lib/auth'
import { Avatar } from '@/components/avatar'
import { Chip, PillButton } from '@/components/press'

const PHONE_RE = /^[6-9]\d{9}$/

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** "Today" / "Tomorrow" / "Fri, 21 Nov" — human, honest, never relative-vague. */
function visitDateLabel(dateStr: string): string {
  const today = ymd(new Date())
  const tomorrow = ymd(new Date(Date.now() + 86_400_000))
  if (dateStr === today) return 'Today'
  if (dateStr === tomorrow) return 'Tomorrow'
  const [y, m, dd] = dateStr.split('-').map(Number)
  if (!y || !m || !dd) return dateStr
  return new Date(y, m - 1, dd).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function ConfirmBookingScreen() {
  const c = useColors()
  const router = useRouter()
  const params = useLocalSearchParams<{
    id?: string
    date?: string
    time?: string
    name?: string
    spec?: string
    fee?: string
  }>()
  const userId = typeof params.id === 'string' ? params.id : ''
  const date = typeof params.date === 'string' ? params.date : ''
  const time = typeof params.time === 'string' ? params.time : ''
  const doctorName = typeof params.name === 'string' ? params.name : ''
  const spec = typeof params.spec === 'string' ? params.spec : ''
  const fee = typeof params.fee === 'string' ? Number(params.fee) : 0

  const [patientName, setPatientName] = useState('')
  const [mobile, setMobile] = useState('')
  const [reason, setReason] = useState('')
  const [city, setCity] = useState('')
  /** The signed-in patient's account mobile (identity seam), or null —
   *  drives the honest caption swap under the mobile field. */
  const [accountMobile, setAccountMobile] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<string>('')
  const [serverError, setServerError] = useState<string>('')
  const [existingId, setExistingId] = useState<string>('')

  // The Doctor-table id (what the POST expects) — SWR-cached schedule.
  const q = useQuery(userId ? `doc-schedule:${userId}` : 'doc-schedule:none', () => getDoctorSchedule(userId), {
    staleTime: 600_000,
  })

  useEffect(() => {
    void getCity().then((c) => setCity(c ?? ''))
  }, [])

  // APK-B9 · identity pre-fill — snapshot read once, fields fill ONLY if
  // still untouched (a fast-fingered user who already typed keeps their
  // text — storage never clobbers a human). Guests and accountless
  // sessions stay exactly as before.
  useEffect(() => {
    void (async () => {
      await null
      const user = await getStoredUser()
      if (!user) return
      if (user.name) setPatientName((cur) => (cur === '' ? user.name : cur))
      const m = user.mobile
      if (m && /^[6-9]\d{9}$/.test(m)) {
        setAccountMobile(m)
        setMobile((cur) => (cur === '' ? m : cur))
      }
    })()
  }, [])

  if (!userId || !date || !time) {
    return (
      <View style={[styles.screen, { backgroundColor: c.canvas }]}>
        <View style={styles.errorWrap}>
          <Text style={[styles.errorTitle, { color: c.ink }]}>This booking link is incomplete.</Text>
          <Chip label="Back to Home" onPress={() => void router.replace('/')} />
        </View>
      </View>
    )
  }

  const validate = (): boolean => {
    if (!patientName.trim()) {
      setFieldError('Please tell us your name.')
      return false
    }
    if (!PHONE_RE.test(mobile)) {
      setFieldError('Enter a valid 10-digit Indian mobile number.')
      return false
    }
    if (!reason.trim()) {
      setFieldError('A one-line reason helps the doctor prepare.')
      return false
    }
    setFieldError('')
    return true
  }

  const submit = async () => {
    if (submitting) return // double-tap guard
    if (!validate()) return
    if (!q.data?.doctorId) {
      setServerError('Doctor details are still loading — try again in a moment.')
      return
    }
    setSubmitting(true)
    setServerError('')
    setExistingId('')
    try {
      const placed = await postPublicBooking({
        doctorId: q.data.doctorId,
        bookingDate: date,
        timeSlot: time,
        bookingMode: 'InPerson',
        disease: reason.trim(),
        patientName: patientName.trim(),
        mobileNo: mobile,
        ...(city ? { city } : {}),
      })
      await pushBookingId(placed.id)
      await setBookingPhone(mobile)
      // Stack replace — the success screen owns the back stack from here.
      void router.replace({ pathname: '/booking/[id]', params: { id: placed.id, new: '1' } })
    } catch (err) {
      if (err instanceof ApiError && err.kind === 'server') {
        setServerError(err.message)
        const existing = err.data?.existingBookingId
        if (typeof existing === 'string' && existing) setExistingId(existing)
      } else if (err instanceof Error) {
        setServerError(err.message)
      } else {
        setServerError('Something went wrong — please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Back bar */}
        <View style={styles.topBar}>
          <View style={styles.backBtn}>
            <Chip
              label="Back"
              leading={<ChevronLeft size={16} color={c.ink} strokeWidth={2} />}
              onPress={() => void router.back()}
            />
          </View>
          <Text style={[styles.topTitle, { color: c.ink }]} numberOfLines={1}>
            Confirm appointment
          </Text>
          <View style={styles.topSpacer} />
        </View>

        {/* Summary card — everything together, for the first time */}
        <View style={[styles.summaryCard, { borderColor: c.hairline }]}>
          <View style={styles.summaryHead}>
            <Avatar name={doctorName || 'Doctor'} size={48} />
            <View style={styles.summaryHeadCol}>
              <Text style={[styles.summaryName, { color: c.ink }]} numberOfLines={1}>
                {doctorName}
              </Text>
              <Text style={[styles.summarySpec, { color: c.body }]} numberOfLines={1}>
                {spec || 'Doctor'}
              </Text>
            </View>
          </View>
          <View style={styles.summaryRows}>
            <SummaryRow label="Visit" value={`${visitDateLabel(date)} · ${time}`} />
            <SummaryRow label="Mode" value="In person at the clinic" />
            <SummaryRow label="Fee" value={`₹${fee.toLocaleString('en-IN')}`} strong />
          </View>
        </View>

        {/* Guest fields — minimality law: nothing more is asked */}
        <Text style={[styles.fieldTitle, { color: c.ink }]}>Your name</Text>
        <TextInput
          value={patientName}
          onChangeText={(v) => {
            setPatientName(v)
            setFieldError('')
          }}
          placeholder="Full name"
          placeholderTextColor={c.mute}
          autoCorrect={false}
          autoCapitalize="words"
          underlineColorAndroid="transparent"
          accessibilityLabel="Your name"
          style={[styles.input, { borderColor: c.hairline, backgroundColor: c.canvas, color: c.ink }]}
        />

        <Text style={[styles.fieldTitle, { color: c.ink }]}>Mobile number</Text>
        <TextInput
          value={mobile}
          onChangeText={(v) => {
            setMobile(v.replace(/\D/g, '').slice(0, 10))
            setFieldError('')
          }}
          placeholder="10-digit Indian mobile"
          placeholderTextColor={c.mute}
          keyboardType="phone-pad"
          maxLength={10}
          autoCorrect={false}
          underlineColorAndroid="transparent"
          accessibilityLabel="Mobile number"
          style={[styles.input, styles.numeric, { borderColor: c.hairline, backgroundColor: c.canvas, color: c.ink }]}
        />
        <Text
          style={[styles.fieldCaption, { color: accountMobile ? c.body : c.mute }]}
          accessibilityLiveRegion="polite"
        >
          {accountMobile
            ? mobile === accountMobile
              ? 'From your account — this booking joins your history.'
              : 'A different number — this booking stays separate from your account.'
            : 'Your token and booking updates travel to this number.'}
        </Text>

        <Text style={[styles.fieldTitle, { color: c.ink }]}>Reason for the visit</Text>
        <TextInput
          value={reason}
          onChangeText={(v) => {
            setReason(v)
            setFieldError('')
          }}
          placeholder="One line — e.g. fever since 2 days"
          placeholderTextColor={c.mute}
          autoCorrect={false}
          multiline
          underlineColorAndroid="transparent"
          accessibilityLabel="Reason for the visit"
          style={[styles.input, styles.reasonInput, { borderColor: c.hairline, backgroundColor: c.canvas, color: c.ink }]}
        />

        {/* Inline validation — field-level, human copy */}
        {fieldError ? <Text style={[styles.fieldError, { color: c.error }]}>{fieldError}</Text> : null}

        {/* Fee line — cash-at-clinic law, visible at the moment of confirm */}
        <View style={[styles.feeLine, { backgroundColor: c.canvasSoft }]}>
          <Text style={[styles.feeBig, { color: c.ink }]}>
            ₹{fee.toLocaleString('en-IN')} <Text style={[styles.feeSuffix, { color: c.body }]}>· pay at the clinic</Text>
          </Text>
          <Text style={[styles.feeNote, { color: c.mute }]}>No advance payment. Free cancellation from this app.</Text>
        </View>

        {/* Honest server answers — never a silent fail */}
        {serverError ? (
          <View style={[styles.serverErrorCard, { backgroundColor: c.errorSoft }]}>
            <Text style={[styles.serverErrorText, { color: c.error }]}>{serverError}</Text>
            {existingId ? (
              <Chip label="View your existing booking" onPress={() => void router.replace(`/booking/${existingId}`)} />
            ) : null}
          </View>
        ) : null}

        <View style={styles.scrollBottomPad} />
      </ScrollView>

      {/* Sticky confirm — 56px, loading state keeps the label */}
      <View style={[styles.ctaBar, { borderTopColor: c.hairline, backgroundColor: c.canvas }]}>
        <PillButton label="Confirm booking" height={56} loading={submitting} onPress={() => void submit()} />
      </View>
    </View>
  )
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  const c = useColors()
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryRowLabel, { color: c.body }]}>{label}</Text>
      <Text
        style={[styles.summaryRowValue, strong && styles.summaryRowStrong, { color: c.ink }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: space.s24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
    paddingHorizontal: space.s16,
    paddingTop: space.s12,
    minHeight: TOUCH + 8,
  },
  backBtn: {
    minHeight: TOUCH,
    justifyContent: 'center',
  },
  topTitle: {
    ...typo.title,
    flex: 1,
  },
  topSpacer: {
    width: space.s16,
  },
  summaryCard: {
    marginHorizontal: space.s16,
    marginTop: space.s8,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.s16,
    gap: space.s12,
  },
  summaryHead: {
    flexDirection: 'row',
    gap: space.s12,
    alignItems: 'center',
  },
  summaryHeadCol: {
    flex: 1,
    gap: 2,
  },
  summaryName: {
    ...typo.bodyStrong,
    fontSize: 16,
  },
  summarySpec: {
    ...typo.caption,
  },
  summaryRows: {
    gap: space.s8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: space.s8,
    minHeight: TOUCH - 22,
  },
  summaryRowLabel: {
    ...typo.body,
  },
  summaryRowValue: {
    ...typo.bodyStrong,
    flex: 1,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  summaryRowStrong: {
    fontSize: 17,
  },
  fieldTitle: {
    ...typo.bodyStrong,
    marginHorizontal: space.s16,
    marginTop: space.s20,
    marginBottom: space.s8,
  },
  input: {
    height: 56,
    borderRadius: radius.input,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.s16,
    marginHorizontal: space.s16,
    ...typo.body,
  },
  numeric: {
    fontVariant: ['tabular-nums'],
  },
  reasonInput: {
    minHeight: 84,
    paddingTop: space.s12,
    paddingBottom: space.s12,
    textAlignVertical: 'top',
  },
  fieldCaption: {
    ...typo.caption,
    marginHorizontal: space.s16,
    marginTop: space.s4,
  },
  fieldError: {
    ...typo.caption,
    marginHorizontal: space.s16,
    marginTop: space.s12,
    fontWeight: '600',
  },
  feeLine: {
    marginHorizontal: space.s16,
    marginTop: space.s24,
    borderRadius: radius.card,
    padding: space.s16,
    gap: 4,
  },
  feeBig: {
    ...typo.title,
    fontSize: 20,
    fontVariant: ['tabular-nums'],
  },
  feeSuffix: {
    ...typo.caption,
    fontWeight: '400',
  },
  feeNote: {
    ...typo.caption,
  },
  serverErrorCard: {
    marginHorizontal: space.s16,
    marginTop: space.s16,
    borderRadius: radius.card,
    padding: space.s16,
    gap: space.s8,
    alignItems: 'flex-start',
  },
  serverErrorText: {
    ...typo.body,
    fontWeight: '600',
  },
  scrollBottomPad: {
    height: space.s24,
  },
  ctaBar: {
    paddingHorizontal: space.s16,
    paddingTop: space.s8,
    paddingBottom: space.s12,
    borderTopWidth: StyleSheet.hairlineWidth,
    ...(Platform.OS === 'ios' ? { paddingBottom: space.s16 } : null),
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.s12,
    padding: space.s24,
  },
  errorTitle: {
    ...typo.title,
    textAlign: 'center',
  },
})
