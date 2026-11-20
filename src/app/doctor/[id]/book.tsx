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
 */

import { useEffect, useState } from 'react'
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { colors, radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { ApiError, getDoctorSchedule, postPublicBooking } from '@/lib/api'
import { useQuery } from '@/lib/use-query'
import { getCity, pushBookingId, setBookingPhone } from '@/lib/storage'
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

  if (!userId || !date || !time) {
    return (
      <View style={styles.screen}>
        <View style={styles.errorWrap}>
          <Text style={styles.errorTitle}>This booking link is incomplete.</Text>
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
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Back bar */}
        <View style={styles.topBar}>
          <View style={styles.backBtn}>
            <Chip
              label="Back"
              leading={<ChevronLeft size={16} color={colors.ink} strokeWidth={2} />}
              onPress={() => void router.back()}
            />
          </View>
          <Text style={styles.topTitle} numberOfLines={1}>
            Confirm appointment
          </Text>
          <View style={styles.topSpacer} />
        </View>

        {/* Summary card — everything together, for the first time */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHead}>
            <Avatar name={doctorName || 'Doctor'} size={48} />
            <View style={styles.summaryHeadCol}>
              <Text style={styles.summaryName} numberOfLines={1}>
                {doctorName}
              </Text>
              <Text style={styles.summarySpec} numberOfLines={1}>
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
        <Text style={styles.fieldTitle}>Your name</Text>
        <TextInput
          value={patientName}
          onChangeText={(v) => {
            setPatientName(v)
            setFieldError('')
          }}
          placeholder="Full name"
          placeholderTextColor={colors.mute}
          autoCorrect={false}
          autoCapitalize="words"
          underlineColorAndroid="transparent"
          accessibilityLabel="Your name"
          style={styles.input}
        />

        <Text style={styles.fieldTitle}>Mobile number</Text>
        <TextInput
          value={mobile}
          onChangeText={(v) => {
            setMobile(v.replace(/\D/g, '').slice(0, 10))
            setFieldError('')
          }}
          placeholder="10-digit Indian mobile"
          placeholderTextColor={colors.mute}
          keyboardType="phone-pad"
          maxLength={10}
          autoCorrect={false}
          underlineColorAndroid="transparent"
          accessibilityLabel="Mobile number"
          style={[styles.input, styles.numeric]}
        />
        <Text style={styles.fieldCaption}>Your token and booking updates travel to this number.</Text>

        <Text style={styles.fieldTitle}>Reason for the visit</Text>
        <TextInput
          value={reason}
          onChangeText={(v) => {
            setReason(v)
            setFieldError('')
          }}
          placeholder="One line — e.g. fever since 2 days"
          placeholderTextColor={colors.mute}
          autoCorrect={false}
          multiline
          underlineColorAndroid="transparent"
          accessibilityLabel="Reason for the visit"
          style={[styles.input, styles.reasonInput]}
        />

        {/* Inline validation — field-level, human copy */}
        {fieldError ? <Text style={styles.fieldError}>{fieldError}</Text> : null}

        {/* Fee line — cash-at-clinic law, visible at the moment of confirm */}
        <View style={styles.feeLine}>
          <Text style={styles.feeBig}>
            ₹{fee.toLocaleString('en-IN')} <Text style={styles.feeSuffix}>· pay at the clinic</Text>
          </Text>
          <Text style={styles.feeNote}>No advance payment. Free cancellation from this app.</Text>
        </View>

        {/* Honest server answers — never a silent fail */}
        {serverError ? (
          <View style={styles.serverErrorCard}>
            <Text style={styles.serverErrorText}>{serverError}</Text>
            {existingId ? (
              <Chip label="View your existing booking" onPress={() => void router.replace(`/booking/${existingId}`)} />
            ) : null}
          </View>
        ) : null}

        <View style={styles.scrollBottomPad} />
      </ScrollView>

      {/* Sticky confirm — 56px, loading state keeps the label */}
      <View style={styles.ctaBar}>
        <PillButton label="Confirm booking" height={56} loading={submitting} onPress={() => void submit()} />
      </View>
    </View>
  )
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryRowLabel}>{label}</Text>
      <Text style={[styles.summaryRowValue, strong && styles.summaryRowStrong]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
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
    color: colors.ink,
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
    borderColor: colors.hairline,
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
    color: colors.ink,
    fontSize: 16,
  },
  summarySpec: {
    ...typo.caption,
    color: colors.body,
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
    color: colors.body,
  },
  summaryRowValue: {
    ...typo.bodyStrong,
    color: colors.ink,
    flex: 1,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  summaryRowStrong: {
    fontSize: 17,
  },
  fieldTitle: {
    ...typo.bodyStrong,
    color: colors.ink,
    marginHorizontal: space.s16,
    marginTop: space.s20,
    marginBottom: space.s8,
  },
  input: {
    height: 56,
    borderRadius: radius.input,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    backgroundColor: colors.canvas,
    paddingHorizontal: space.s16,
    marginHorizontal: space.s16,
    ...typo.body,
    color: colors.ink,
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
    color: colors.mute,
    marginHorizontal: space.s16,
    marginTop: space.s4,
  },
  fieldError: {
    ...typo.caption,
    color: colors.error,
    marginHorizontal: space.s16,
    marginTop: space.s12,
    fontWeight: '600',
  },
  feeLine: {
    marginHorizontal: space.s16,
    marginTop: space.s24,
    backgroundColor: colors.canvasSoft,
    borderRadius: radius.card,
    padding: space.s16,
    gap: 4,
  },
  feeBig: {
    ...typo.title,
    color: colors.ink,
    fontSize: 20,
    fontVariant: ['tabular-nums'],
  },
  feeSuffix: {
    ...typo.caption,
    color: colors.body,
    fontWeight: '400',
  },
  feeNote: {
    ...typo.caption,
    color: colors.mute,
  },
  serverErrorCard: {
    marginHorizontal: space.s16,
    marginTop: space.s16,
    backgroundColor: colors.errorSoft,
    borderRadius: radius.card,
    padding: space.s16,
    gap: space.s8,
    alignItems: 'flex-start',
  },
  serverErrorText: {
    ...typo.body,
    color: colors.error,
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
    borderTopColor: colors.hairline,
    backgroundColor: colors.canvas,
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
    color: colors.ink,
    textAlign: 'center',
  },
})
