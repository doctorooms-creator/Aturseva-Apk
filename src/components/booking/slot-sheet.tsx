/**
 * S6 · SLOT PICKER — bottom sheet over S5 (doc 06 S6) — APK-B3.
 *
 * Grab handle · doctor mini-header (avatar + name + fee reminder) · 7-day
 * date strip (today-first, selected=ink, non-consult days disabled) ·
 * slot grid grouped Morning/Afternoon/Evening (free selectable with a
 * teal ring, taken struck + disabled, past struck) · honest day counts ·
 * fee line + "Confirm slot" pill at sheet-bottom.
 *
 * Laws: counts NEVER fake (server status per slot; day totals from
 * opdCount/opdLimit); selection survives date-switch-and-back within the
 * session (a per-date memory); live refresh while picking (30s poll,
 * matching the web sheet); sheet never overflows (grid wraps inside).
 * Data: /api/doctors/[userId]/schedule (once per open) →
 * /api/public/slots?doctorId&date (per date change + 30s while open).
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { CalendarDays } from 'lucide-react-native'
import { radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { getDoctorSchedule, getSlots, type SlotInventory } from '@/lib/api'
import { Avatar } from '@/components/avatar'
import { BottomSheet, GrabHandle } from '@/components/sheets'
import { SkeletonBlock } from '@/components/skeleton'
import { Chip, PillButton } from '@/components/press'

export interface SlotSheetDoctor {
  /** User-table id (the profile route param). */
  userId: string
  name: string
  specialization: string
  fees: number
}

const DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** Local date math (no date-fns in P0 — thin-client law). The server is
 *  the only clock that matters (past-times struck server-side). */
function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function dayName(d: Date): string {
  return DAY_ORDER[d.getDay()]
}
function addDays(d: Date, n: number): Date {
  const out = new Date(d)
  out.setDate(out.getDate() + n)
  return out
}
/** "07/25" style short label from a YYYY-MM-DD string. */
function shortDate(dstr: string): string {
  return dstr.slice(5).replace('-', '/')
}

interface SlotGroup {
  label: string
  slots: SlotInventory['slots']
}

function groupSlots(slots: SlotInventory['slots']): SlotGroup[] {
  const morning: SlotInventory['slots'] = []
  const afternoon: SlotInventory['slots'] = []
  const evening: SlotInventory['slots'] = []
  for (const s of slots) {
    const hour = Number(s.time.slice(0, 2))
    if (hour < 12) morning.push(s)
    else if (hour < 16) afternoon.push(s)
    else evening.push(s)
  }
  return [
    { label: 'Morning', slots: morning },
    { label: 'Afternoon', slots: afternoon },
    { label: 'Evening', slots: evening },
  ].filter((g) => g.slots.length > 0)
}

/** One slot time chip — free = selectable (teal ring when selected),
 *  taken/past = struck + disabled (honesty through the strike). */
function SlotChip({
  time,
  status,
  selected,
  onPress,
}: {
  time: string
  status: 'free' | 'taken' | 'past'
  selected: boolean
  onPress: () => void
}) {
  const c = useColors()
  const free = status === 'free'
  return (
    <Pressable
      onPress={free ? onPress : undefined}
      disabled={!free}
      accessibilityRole="button"
      accessibilityLabel={`${time} ${free ? 'available' : status === 'taken' ? 'booked' : 'past'}`}
      accessibilityState={{ disabled: !free, selected }}
      style={({ pressed }) => [
        styles.slotChip,
        // B11 state grammar (VLM fix-loop): AVAILABLE = white pill + hairline
        // ring (an OPEN affordance); taken/past = soft-grey, faded,
        // struck-through (closed); SELECTED = teal ring + teal soft fill.
        free ? { backgroundColor: c.canvas, borderColor: c.hairline } : { backgroundColor: c.canvasSoft },
        !free && styles.slotChipClosed,
        selected && {
          borderColor: c.tealLive,
          borderWidth: 1.5,
          backgroundColor: c.tealLiveSoft,
        },
        pressed && free && styles.slotChipPressed,
      ]}
    >
      <Text
        style={[
          styles.slotChipText,
          { color: c.ink },
          !free && { textDecorationLine: 'line-through', color: c.mute },
          selected && { color: c.tealLive, fontWeight: '600' },
        ]}
      >
        {time}
      </Text>
    </Pressable>
  )
}

export function SlotSheet({
  visible,
  onClose,
  doctor,
  onConfirm,
}: {
  visible: boolean
  onClose: () => void
  doctor: SlotSheetDoctor
  onConfirm: (date: string, time: string) => void
}) {
  const c = useColors()
  const [scheduleTick, setScheduleTick] = useState(0)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState(false)
  const [doctorRowId, setDoctorRowId] = useState('')
  const [consultDays, setConsultDays] = useState<string[]>([])
  const [holidays, setHolidays] = useState<string[]>([])

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  /** Session memory: per-date selection survives date-switch-and-back. */
  const memory = useRef(new Map<string, string>())
  const [inv, setInv] = useState<SlotInventory | null>(null)
  const [invLoading, setInvLoading] = useState(false)
  const [invError, setInvError] = useState(false)

  const today = useMemo(() => new Date(), [])
  const dates = useMemo(() => {
    const out: { ymd: string; disabled: boolean }[] = []
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i)
      const dstr = ymd(date)
      const consults = consultDays.length === 0 ? true : consultDays.includes(dayName(date))
      out.push({ ymd: dstr, disabled: !consults || holidays.includes(dstr) })
    }
    return out
  }, [today, consultDays, holidays])

  // Reset per open (fresh session memory is per-sheet-open) — async-first
  // barrier (cascading-render law).
  useEffect(() => {
    if (visible) return
    void (async () => {
      await null
      setSelectedDate('')
      setSelectedTime('')
      memory.current.clear()
      setInv(null)
      setInvError(false)
    })()
  }, [visible])

  // Schedule (once per open / retry): real Doctor-table id + consult days.
  useEffect(() => {
    if (!visible) return
    let alive = true
    void (async () => {
      await null
      if (!alive) return
      setScheduleLoading(true)
      setScheduleError(false)
      try {
        const s = await getDoctorSchedule(doctor.userId)
        if (!alive) return
        setDoctorRowId(s.doctorId)
        setConsultDays(s.days.map((d) => d.day))
        setHolidays(s.holidays)
      } catch {
        if (alive) setScheduleError(true)
      } finally {
        if (alive) setScheduleLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [visible, scheduleTick, doctor.userId])

  // Default the selection to today (or the first pickable day) — async-first
  // barrier (cascading-render law).
  useEffect(() => {
    if (!visible || selectedDate || dates.length === 0) return
    const first = dates.find((d) => !d.disabled)
    if (!first) return
    void (async () => {
      await null
      setSelectedDate(first.ymd)
      setSelectedTime(memory.current.get(first.ymd) ?? '')
    })()
  }, [visible, dates, selectedDate])

  // Slot inventory: per date change + 30s live refresh while picking.
  useEffect(() => {
    if (!visible || !doctorRowId || !selectedDate) return
    let alive = true
    const load = () => {
      if (!alive) return
      void (async () => {
        await null
        if (!alive) return
        setInvLoading(true)
        setInvError(false)
        try {
          const i = await getSlots(doctorRowId, selectedDate)
          if (alive) setInv(i)
        } catch {
          if (!alive) return
          setInv(null)
          setInvError(true)
        } finally {
          if (alive) setInvLoading(false)
        }
      })()
    }
    load()
    const t = setInterval(load, 30_000)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [visible, doctorRowId, selectedDate])

  const pickDate = (dstr: string) => {
    setSelectedDate(dstr)
    setSelectedTime(memory.current.get(dstr) ?? '')
  }

  const pickTime = (time: string) => {
    memory.current.set(selectedDate, time)
    setSelectedTime(time)
  }

  const confirm = () => {
    if (!selectedTime) return
    onConfirm(selectedDate, selectedTime)
  }

  const groups = inv ? groupSlots(inv.slots) : []
  const freeCount = inv ? inv.slots.filter((s) => s.status === 'free').length : 0
  const gridSkeleton = (
    <View style={styles.gridSkeleton}>
      {Array.from({ length: 12 }).map((_, i) => (
        <SkeletonBlock key={i} width={72} height={TOUCH} radiusValue={radius.pill} />
      ))}
    </View>
  )

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Pick a slot">
      <GrabHandle />

      {/* Doctor mini-header — the fee reminder travels with the choice */}
      <View style={styles.header}>
        <Avatar name={doctor.name} size={44} />
        <View style={styles.headerCol}>
          <Text style={[styles.headerName, { color: c.ink }]} numberOfLines={1}>
            {doctor.name}
          </Text>
          <Text style={[styles.headerSpec, { color: c.body }]} numberOfLines={1}>
            {doctor.specialization || 'Doctor'} · ₹{doctor.fees.toLocaleString('en-IN')} consult
          </Text>
        </View>
      </View>

      {/* Date strip — 7 chips, today first */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateStrip}
        accessibilityLabel="Appointment dates"
      >
        {dates.map((d, i) => (
          <Chip
            key={d.ymd}
            label={i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : shortDate(d.ymd)}
            selected={selectedDate === d.ymd}
            disabled={d.disabled || scheduleLoading}
            onPress={() => pickDate(d.ymd)}
          />
        ))}
      </ScrollView>

      {/* Slot grid — grouped, live, honest */}
      {scheduleError ? (
        <View style={styles.centerCol}>
          <Text style={[styles.emptyTitle, { color: c.ink }]}>Could not load the schedule.</Text>
          <Text style={[styles.emptyCaption, { color: c.mute }]}>Check your connection and try again.</Text>
          <View style={styles.centerRow}>
            <Chip label="Try again" onPress={() => setScheduleTick((t) => t + 1)} />
          </View>
        </View>
      ) : scheduleLoading ? (
        gridSkeleton
      ) : invLoading && !inv ? (
        gridSkeleton
      ) : invError ? (
        <View style={styles.centerCol}>
          <Text style={[styles.emptyTitle, { color: c.ink }]}>Could not load slots for this day.</Text>
          <Text style={[styles.emptyCaption, { color: c.mute }]}>Check your connection and try again.</Text>
          <View style={styles.centerRow}>
            <Chip
              label="Try again"
              onPress={() => {
                setInvError(false)
                setInv(null)
              }}
            />
          </View>
        </View>
      ) : inv ? (
        inv.available && inv.slots.length > 0 ? (
          <View style={styles.gridWrap}>
            {groups.map((g) => (
              <View key={g.label} style={styles.group}>
                <Text style={[styles.groupLabel, { color: c.mute }]}>{g.label}</Text>
                <View style={styles.grid}>
                  {g.slots.map((s) => (
                    <SlotChip
                      key={s.time}
                      time={s.time}
                      status={s.status}
                      selected={selectedTime === s.time}
                      onPress={() => pickTime(s.time)}
                    />
                  ))}
                </View>
              </View>
            ))}
            {/* Honest day counts — real API numbers only */}
            <Text style={[styles.countsLine, { color: c.mute }]}>
              {freeCount} slot{freeCount === 1 ? '' : 's'} open · {inv.opdCount} booked today
              {inv.opdLimit > 0 ? ` · limit ${inv.opdLimit}` : ''}
            </Text>
          </View>
        ) : inv.available && inv.slots.length === 0 ? (
          <View style={styles.centerCol}>
            <Text style={[styles.emptyTitle, { color: c.ink }]}>No slots this day.</Text>
            <Text style={[styles.emptyCaption, { color: c.mute }]}>The doctor consults but has no open times listed.</Text>
          </View>
        ) : (
          <View style={styles.centerCol}>
            <CalendarDays size={28} color={c.mute} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: c.ink }]}>{inv.reason || 'No slots this day.'}</Text>
            <NextDayChip dates={dates} selectedDate={selectedDate} onPick={pickDate} />
          </View>
        )
      ) : null}

      {/* Fee line + confirm — sticky sheet-bottom (52px pill). B11: an
          unselected state gets its honest hint (why is the button dim?) */}
      <View style={[styles.footer, { borderTopColor: c.hairline }]}>
        <View style={styles.feeLine}>
          <Text style={[styles.feeText, { color: c.ink }]}>₹{doctor.fees.toLocaleString('en-IN')} · pay at the clinic</Text>
          {selectedTime ? (
            <Text style={[styles.feeTime, { color: c.tealLive }]}>
              {selectedDate === ymd(today) ? 'Today' : shortDate(selectedDate)} · {selectedTime}
            </Text>
          ) : (
            <Text style={[styles.feeHint, { color: c.mute }]}>Pick a time to continue</Text>
          )}
        </View>
        <PillButton label="Confirm slot" height={52} disabled={!selectedTime} onPress={confirm} style={styles.confirmBtn} />
      </View>
    </BottomSheet>
  )
}

function NextDayChip({
  dates,
  selectedDate,
  onPick,
}: {
  dates: { ymd: string; disabled: boolean }[]
  selectedDate: string
  onPick: (dstr: string) => void
}) {
  const idx = dates.findIndex((d) => d.ymd === selectedDate)
  const next = dates.slice(idx + 1).find((d) => !d.disabled)
  if (!next) return null
  return (
    <View style={styles.centerRow}>
      <Chip label={`Next open day · ${shortDate(next.ymd)}`} onPress={() => onPick(next.ymd)} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: space.s12,
    alignItems: 'center',
    marginBottom: space.s12,
  },
  headerCol: {
    flex: 1,
    gap: 2,
  },
  headerName: {
    ...typo.bodyStrong,
    fontSize: 16,
  },
  headerSpec: {
    ...typo.caption,
    fontVariant: ['tabular-nums'],
  },
  dateStrip: {
    gap: space.s8,
    paddingBottom: space.s12,
  },
  gridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.s8,
    paddingBottom: space.s8,
  },
  gridWrap: {
    gap: space.s12,
    paddingBottom: space.s8,
  },
  group: {
    gap: space.s8,
  },
  groupLabel: {
    ...typo.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.s8,
  },
  slotChip: {
    // B11 UX fix: was TOUCH - 12 (32px) — under the doc 04 44px law in
    // the most-tapped grid of the app (VLM-measured). The sheet scrolls;
    // height is cheap, mistaps are not.
    minHeight: TOUCH,
    minWidth: 68,
    paddingHorizontal: space.s12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  slotChipPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  slotChipClosed: {
    opacity: 0.5,
  },
  slotChipText: {
    ...typo.body,
    fontVariant: ['tabular-nums'],
  },
  countsLine: {
    ...typo.caption,
    fontVariant: ['tabular-nums'],
  },
  centerCol: {
    alignItems: 'center',
    gap: space.s8,
    paddingVertical: space.s20,
  },
  centerRow: {
    marginTop: space.s4,
  },
  emptyTitle: {
    ...typo.bodyStrong,
    textAlign: 'center',
  },
  emptyCaption: {
    ...typo.caption,
    textAlign: 'center',
  },
  footer: {
    marginTop: space.s12,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: space.s12,
  },
  feeLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.s8,
  },
  feeText: {
    ...typo.bodyStrong,
    fontVariant: ['tabular-nums'],
  },
  feeTime: {
    ...typo.caption,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  feeHint: {
    ...typo.caption,
  },
  confirmBtn: {
    flex: 1,
  },
})
