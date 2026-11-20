/**
 * HOSPITAL PROFILE (APK-B7 · doc 06 hospitals browse). Public — no
 * account needed. One screen, restraint law: identity hero (avatar
 * initials), honest fact strip (ONLY non-zero facts — zero beds /
 * established years are hidden, never shown as "0"), about, facilities
 * pills, departments list → department-doctors sheet (tap a doctor →
 * their profile, where the booking doorway lives). Call row = quiet
 * tel: action. Data: /api/hospitals/[id] + departments/[id]/doctors
 * (loaded on sheet open — additive contract, verified on prod).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Linking, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Building2, ChevronLeft, ChevronRight, MapPin, Phone, Users } from 'lucide-react-native'
import { radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import {
  getHospitalProfile,
  getDepartmentDoctors,
  type HospitalDepartment,
  type DepartmentDoctor,
} from '@/lib/api'
import { useQuery } from '@/lib/use-query'
import { Chip } from '@/components/press'
import { EmptyState } from '@/components/empty-state'
import { Avatar } from '@/components/avatar'
import { BottomSheet, GrabHandle } from '@/components/sheets'
import { SkeletonBlock } from '@/components/skeleton'

export default function HospitalProfileScreen() {
  const c = useColors()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const hospitalId = typeof id === 'string' ? id : ''

  const profile = useQuery(
    hospitalId ? `hospital-${hospitalId}` : 'hospital-none',
    () => getHospitalProfile(hospitalId),
    { staleTime: 60_000 },
  )

  // Department-doctors sheet: loaded on open (quiet, per-department).
  const [dept, setDept] = useState<HospitalDepartment | null>(null)
  const [deptDoctors, setDeptDoctors] = useState<DepartmentDoctor[] | null>(null)
  const [deptLoading, setDeptLoading] = useState(false)
  const [deptFailed, setDeptFailed] = useState(false)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const openDepartment = useCallback(
    (department: HospitalDepartment) => {
      setDept(department)
      setDeptDoctors(null)
      setDeptFailed(false)
      setDeptLoading(true)
      void (async () => {
        await null
        try {
          const doctors = await getDepartmentDoctors(hospitalId, department.id)
          if (!mounted.current) return
          setDeptDoctors(doctors)
        } catch {
          if (!mounted.current) return
          setDeptFailed(true)
        } finally {
          if (mounted.current) setDeptLoading(false)
        }
      })()
    },
    [hospitalId],
  )

  const closeDepartment = () => {
    setDept(null)
    setDeptDoctors(null)
    setDeptFailed(false)
  }

  const openDoctor = (doctorId: string) => {
    setDept(null)
    void router.push({ pathname: '/doctor/[id]', params: { id: doctorId } })
  }

  const h = profile.data

  if (hospitalId === '') {
    return (
      <View style={[styles.screen, { backgroundColor: c.canvas }]}>
        <View style={styles.topBar}>
          <View style={styles.backBtn}>
            <Chip
              label="Back"
              leading={<ChevronLeft size={16} color={c.ink} strokeWidth={2} />}
              onPress={() => void router.back()}
            />
          </View>
          <Text style={[styles.topTitle, { color: c.ink }]} numberOfLines={1}>
            Hospital
          </Text>
          <View style={styles.topSpacer} />
        </View>
        <View style={styles.emptyWrap}>
          <EmptyState
            icon={Building2}
            title="Hospital not found"
            caption="Go back and pick a hospital from the list."
            actions={[{ label: 'Back', onPress: () => void router.back() }]}
          />
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          Platform.OS === 'web' ? undefined : (
            <RefreshControl refreshing={profile.refreshing} onRefresh={profile.refresh} tintColor={c.ink} />
          )
        }
      >
        <View style={styles.topBar}>
          <View style={styles.backBtn}>
            <Chip
              label="Back"
              leading={<ChevronLeft size={16} color={c.ink} strokeWidth={2} />}
              onPress={() => void router.back()}
            />
          </View>
          <Text style={[styles.topTitle, { color: c.ink }]} numberOfLines={1}>
            Hospital
          </Text>
          <View style={styles.topSpacer} />
        </View>

        {profile.loading && !profile.data ? (
          <View style={styles.skeletonCol}>
            <SkeletonBlock width={280} height={20} radiusValue={radius.pill} />
            <SkeletonBlock width={180} height={12} radiusValue={radius.pill} />
            <SkeletonBlock width="100%" height={72} radiusValue={radius.card} />
            <SkeletonBlock width="100%" height={44} radiusValue={radius.card} />
            <SkeletonBlock width="100%" height={44} radiusValue={radius.card} />
          </View>
        ) : profile.error && !profile.data ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              icon={Building2}
              title="Could not load this hospital"
              caption="Check your connection and try again."
              actions={[{ label: 'Try again', onPress: () => profile.refresh() }]}
            />
          </View>
        ) : h ? (
          <View>
            {/* Identity — avatar initials hero (photos arrive with real assets) */}
            <View style={styles.hero}>
              <Avatar name={h.name} size={72} />
              <View style={styles.heroCol}>
                <Text style={[styles.heroName, { color: c.ink }]}>{h.name}</Text>
                <Text style={[styles.heroType, { color: c.body }]}>{h.type}</Text>
                {h.city || h.state ? (
                  <View style={styles.cityRow}>
                    <MapPin size={11} color={c.mute} strokeWidth={2} />
                    <Text style={[styles.cityText, { color: c.mute }]} numberOfLines={1}>
                      {[h.city, h.state].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                ) : null}
                {h.totalDoctors > 0 ? (
                  <Text style={[styles.heroCount, { color: c.body }]}>
                    {h.totalDoctors} {h.totalDoctors === 1 ? 'doctor' : 'doctors'} listed
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Honest fact strip — only non-zero facts, never "0" */}
            {h.bedCount > 0 || h.establishedYear > 0 || h.departments.length > 0 ? (
              <View style={styles.factRow}>
                {h.bedCount > 0 ? (
                  <View style={[styles.factPill, { backgroundColor: c.canvasSoft }]}>
                    <Text style={[styles.factText, { color: c.body }]}>{h.bedCount} beds</Text>
                  </View>
                ) : null}
                {h.establishedYear > 0 ? (
                  <View style={[styles.factPill, { backgroundColor: c.canvasSoft }]}>
                    <Text style={[styles.factText, { color: c.body }]}>Since {h.establishedYear}</Text>
                  </View>
                ) : null}
                {h.departments.length > 0 ? (
                  <View style={[styles.factPill, { backgroundColor: c.canvasSoft }]}>
                    <Text style={[styles.factText, { color: c.body }]}>
                      {h.departments.length} departments
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {h.accreditation ? (
              <Text style={[styles.accreditation, { color: c.body }]} numberOfLines={2}>
                {h.accreditation}
              </Text>
            ) : null}

            {h.about ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: c.ink }]}>About</Text>
                <Text style={[styles.aboutText, { color: c.body }]}>{h.about}</Text>
              </View>
            ) : null}

            {h.facilities.length > 0 ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: c.ink }]}>Facilities</Text>
                <View style={styles.facilityRow}>
                  {h.facilities.slice(0, 12).map((f) => (
                    <View key={f} style={[styles.factPill, { backgroundColor: c.canvasSoft }]}>
                      <Text style={[styles.factText, { color: c.body }]} numberOfLines={1}>
                        {f}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Departments — the primary navigation of this screen */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: c.ink }]}>Departments</Text>
              {h.departments.length === 0 ? (
                <Text style={[styles.noneText, { color: c.mute }]}>
                  No departments listed yet.
                </Text>
              ) : (
                h.departments.map((d) => (
                  <Pressable
                    key={d.id}
                    onPress={() => openDepartment(d)}
                    accessibilityRole="button"
                    accessibilityLabel={`${d.name} department, ${d.doctorCount} doctors`}
                    style={({ pressed }) => [
                      styles.deptRow,
                      { backgroundColor: c.canvas, borderColor: c.hairline },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <View style={styles.deptCol}>
                      <Text style={[styles.deptName, { color: c.ink }]} numberOfLines={1}>
                        {d.name}
                      </Text>
                      <Text style={[styles.deptMeta, { color: c.body }]} numberOfLines={1}>
                        {[
                          d.doctorCount > 0
                            ? `${d.doctorCount} ${d.doctorCount === 1 ? 'doctor' : 'doctors'}`
                            : 'No doctors listed yet',
                          d.floorNo ? `Floor ${d.floorNo}` : '',
                          d.opdRoom ? `Room ${d.opdRoom}` : '',
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                    </View>
                    <ChevronRight size={20} color={c.mute} strokeWidth={2} />
                  </Pressable>
                ))
              )}
            </View>

            {/* Contact — quiet rows, one primary action per screen */}
            {h.address || h.contactNo ? (
              <View style={styles.contactCard}>
                {h.address ? (
                  <View style={styles.contactRow}>
                    <MapPin size={14} color={c.body} strokeWidth={2} />
                    <Text style={[styles.contactText, { color: c.body }]}>{h.address}</Text>
                  </View>
                ) : null}
                {h.contactNo ? (
                  <Chip
                    label={`Call ${h.contactNo}`}
                    leading={<Phone size={14} color={c.ink} strokeWidth={2} />}
                    onPress={() => void Linking.openURL(`tel:${h.contactNo}`)}
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      {/* Department-doctors sheet — tap a doctor → their profile */}
      <BottomSheet
        visible={dept !== null}
        onClose={closeDepartment}
        accessibilityLabel="Department doctors"
      >
        <GrabHandle />
        {dept ? (
          <View>
            <Text style={[styles.sheetTitle, { color: c.ink }]} numberOfLines={1}>
              {dept.name}
            </Text>
            <Text style={[styles.sheetCaption, { color: c.body }]} numberOfLines={1}>
              {dept.doctorCount > 0
                ? `${dept.doctorCount} ${dept.doctorCount === 1 ? 'doctor' : 'doctors'} in this department`
                : 'Doctors in this department'}
            </Text>

            {deptLoading ? (
              <View style={styles.sheetSkeletonCol}>
                <SkeletonBlock width="70%" height={14} radiusValue={radius.pill} />
                <SkeletonBlock width="45%" height={10} radiusValue={radius.pill} />
                <SkeletonBlock width="55%" height={10} radiusValue={radius.pill} />
              </View>
            ) : deptFailed ? (
              <View style={styles.emptyWrap}>
                <EmptyState
                  icon={Users}
                  title="Could not load doctors"
                  caption="Check your connection and try again."
                  actions={[
                    { label: 'Try again', onPress: () => openDepartment(dept) },
                  ]}
                />
              </View>
            ) : deptDoctors && deptDoctors.length > 0 ? (
              <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
                {deptDoctors.map((d) => (
                  <Pressable
                    key={d.id}
                    onPress={() => openDoctor(d.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${d.name}, ${d.specialization}`}
                    style={({ pressed }) => [
                      styles.docRow,
                      { backgroundColor: c.canvas, borderColor: c.hairline },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Avatar name={d.name} size={40} />
                    <View style={styles.docCol}>
                      <Text style={[styles.docName, { color: c.ink }]} numberOfLines={1}>
                        {d.name}
                      </Text>
                      <Text style={[styles.docSpec, { color: c.body }]} numberOfLines={1}>
                        {[d.specialization, d.designation].filter(Boolean).join(' · ') || 'Doctor'}
                      </Text>
                      <Text style={[styles.docMeta, { color: c.mute }]} numberOfLines={1}>
                        {[
                          d.fees > 0 ? `₹${d.fees.toLocaleString('en-IN')} visit` : '',
                          d.isAvailable ? 'Available' : '',
                          d.rating > 0 && d.ratingCount > 0
                            ? `★ ${d.rating.toFixed(1)} · ${d.ratingCount}`
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={c.mute} strokeWidth={2} />
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyWrap}>
                <EmptyState
                  icon={Users}
                  title="No doctors listed yet"
                  caption="This department has no doctors listed right now — check back later."
                />
              </View>
            )}
          </View>
        ) : null}
      </BottomSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: space.s32,
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
  skeletonCol: {
    gap: space.s12,
    paddingHorizontal: space.s16,
    paddingTop: space.s8,
  },
  hero: {
    flexDirection: 'row',
    gap: space.s16,
    alignItems: 'flex-start',
    paddingHorizontal: space.s16,
    paddingTop: space.s8,
  },
  heroCol: {
    flex: 1,
    gap: 2,
  },
  heroName: {
    ...typo.title,
  },
  heroType: {
    ...typo.caption,
  },
  heroCount: {
    ...typo.caption,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cityText: {
    ...typo.caption,
  },
  factRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.s8,
    paddingHorizontal: space.s16,
    marginTop: space.s16,
  },
  factPill: {
    borderRadius: 999,
    paddingHorizontal: space.s12,
    paddingVertical: 6,
  },
  factText: {
    ...typo.caption,
  },
  accreditation: {
    ...typo.caption,
    paddingHorizontal: space.s16,
    marginTop: space.s12,
  },
  section: {
    marginTop: space.s24,
    paddingHorizontal: space.s16,
    gap: space.s12,
  },
  sectionTitle: {
    ...typo.title,
    fontSize: 18,
  },
  aboutText: {
    ...typo.body,
    lineHeight: 22,
  },
  facilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.s8,
  },
  noneText: {
    ...typo.caption,
    color: undefined,
  },
  deptRow: {
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.s16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
  },
  deptCol: {
    flex: 1,
    gap: 2,
  },
  deptName: {
    ...typo.bodyStrong,
  },
  deptMeta: {
    ...typo.caption,
  },
  contactCard: {
    marginTop: space.s24,
    marginHorizontal: space.s16,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: undefined,
    padding: space.s16,
    gap: space.s8,
  },
  contactRow: {
    flexDirection: 'row',
    gap: space.s8,
    alignItems: 'flex-start',
  },
  contactText: {
    ...typo.body,
    flex: 1,
  },
  emptyWrap: {
    paddingTop: space.s24,
  },
  sheetTitle: {
    ...typo.title,
  },
  sheetCaption: {
    ...typo.caption,
    marginTop: 2,
  },
  sheetSkeletonCol: {
    gap: space.s8,
    paddingTop: space.s16,
  },
  sheetList: {
    marginTop: space.s12,
  },
  docRow: {
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.s12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    marginBottom: space.s12,
  },
  docCol: {
    flex: 1,
    gap: 2,
  },
  docName: {
    ...typo.bodyStrong,
  },
  docSpec: {
    ...typo.caption,
  },
  docMeta: {
    ...typo.caption,
    fontVariant: ['tabular-nums'],
  },
})
