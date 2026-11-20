/**
 * ATURSEVA APP — API layer (doc 08 contract, the load-bearing bond).
 *
 * LAWS:
 * - Adapters are the ONLY place raw JSON is touched (contract drift
 *   surfaces here, not in 20 screens — doc 08 §4).
 * - Timeout 8s + ONE auto retry (doc 08 §4 / doc 04 law 15).
 * - API_BASE: default = production monolith (doc 02 — app is a client).
 *   EXPO_PUBLIC_API_BASE="" (empty, set at build) = relative same-origin —
 *   used ONLY by the sandbox web-E2E build (static export served behind
 *   the same origin as the API proxy). Native/Expo Go/EAS always hit prod.
 */

// Session JWT home (secure-store). auth.ts imports api.ts TYPES only —
// no runtime cycle (this direction is the runtime one, and it is one-way).
import { getStoredToken } from '@/lib/auth'

const rawBase = process.env.EXPO_PUBLIC_API_BASE
export const API_BASE =
  rawBase === '' ? '' : (rawBase ?? 'https://aturseva.com').replace(/\/+$/, '')

const TIMEOUT_MS = 8000
const RETRY_DELAY_MS = 500

export type ApiErrorKind = 'timeout' | 'network' | 'server' | 'parse'

export class ApiError extends Error {
  kind: ApiErrorKind
  status?: number
  /** Parsed body of honest server answers (400/409 detail), when JSON. */
  data?: Record<string, unknown>
  constructor(kind: ApiErrorKind, message: string, status?: number, data?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
    this.data = data
  }
}

async function fetchJson<T>(
  path: string,
  init: {
    method?: 'GET' | 'POST' | 'DELETE' | 'PATCH'
    body?: unknown
    /** true = read the stored session JWT; a string = an explicit JWT
     *  (sign-out's captured-before-clear token — the revoke must fire
     *  even after the local session is gone). */
    auth?: boolean | string
  } = {},
): Promise<T> {
  const url = `${API_BASE}${path}`
  const attempt = async (): Promise<T> => {
    // APK-B4: authenticated calls carry the session JWT as a Bearer header
    // (the web's P5-MOBILE contract — cookie for browsers, header for the
    // app). No token = honest 401, same as the server's.
    let authHeaders: Record<string, string> = {}
    if (init.auth) {
      const token = typeof init.auth === 'string' ? init.auth : await getStoredToken()
      if (!token) throw new ApiError('server', 'Sign in required', 401)
      authHeaders = { Authorization: `Bearer ${token}` }
    }
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(url, {
        method: init.method,
        headers: {
          Accept: 'application/json',
          ...authHeaders,
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(init.body ? { body: JSON.stringify(init.body) } : {}),
        signal: controller.signal,
      })
      if (!res.ok) {
        // Honest server answers carry their own message when present.
        let message = `Server declined the request (HTTP ${res.status})`
        let data: Record<string, unknown> | undefined
        try {
          const parsed = (await res.json()) as Record<string, unknown>
          if (typeof parsed?.error === 'string' && parsed.error) message = parsed.error
          else if (typeof parsed?.message === 'string' && parsed.message) message = parsed.message
          if (parsed && typeof parsed === 'object') data = parsed
        } catch {
          /* non-JSON error body — keep the generic message */
        }
        throw new ApiError('server', message, res.status, data)
      }
      try {
        return (await res.json()) as T
      } catch {
        throw new ApiError('parse', "Could not read the server's response")
      }
    } catch (err) {
      if (err instanceof ApiError) throw err
      const aborted = err instanceof Error && err.name === 'AbortError'
      throw new ApiError(
        aborted ? 'timeout' : 'network',
        aborted ? 'Connection is slow — timed out' : 'Network problem',
      )
    } finally {
      clearTimeout(timer)
    }
  }
  try {
    return await attempt()
  } catch (err) {
    if (err instanceof ApiError && err.kind === 'server') throw err // no retry on honest server answers
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
    return attempt()
  }
}

// ————— APK-B4 · Auth (doc 08 contract extension: /api/auth/*) —————

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  gender: string | null
  mobile: string | null
}

interface RawAuthUser {
  id: string
  name: string
  email: string
  role: string
  gender: string | null
  profileImg: string | null
  mobileNo: string | null
}

function adaptUser(u: RawAuthUser): AuthUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    gender: u.gender,
    mobile: u.mobileNo,
  }
}

/** POST /api/auth/login — honest server messages surface verbatim
 *  (Invalid email or password / account locked / not verified). */
export async function login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const raw = await fetchJson<{
    success: boolean
    user: RawAuthUser
    token: string
    message?: string
  }>('/api/auth/login', { method: 'POST', body: { email, password } })
  if (!raw.token || !raw.user) {
    throw new ApiError('server', typeof raw.message === 'string' ? raw.message : 'Sign in failed')
  }
  return { user: adaptUser(raw.user), token: raw.token }
}

/** POST /api/auth/register — returns the server's honest message
 *  ("check your email to verify" vs "you can log in now"). */
export async function registerPatient(body: {
  name: string
  email: string
  mobileNo?: string
  gender?: string
  password: string
  referralCode?: string
}): Promise<string> {
  const raw = await fetchJson<{ success: boolean; message?: string }>('/api/auth/register', {
    method: 'POST',
    body: { ...body, role: 'patient' },
  })
  return typeof raw.message === 'string' && raw.message
    ? raw.message
    : 'Registration successful. You can log in now.'
}

/** GET /api/auth/me with the stored bearer — null when signed out,
 *  token expired, or session revoked server-side (honest guest fallback —
 *  the caller clears the local session and stays useful). */
export async function getMe(): Promise<AuthUser | null> {
  const token = await getStoredToken()
  if (!token) return null
  try {
    const raw = await fetchJson<{ success: boolean; user: RawAuthUser }>('/api/auth/me', {
      auth: true,
    })
    if (!raw.user) return null
    return adaptUser(raw.user)
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null
    throw err // network/timeout — propagate (caller shows offline state, not logout)
  }
}

/** POST /api/auth/logout — best-effort server revoke with the token the
 *  caller CAPTURED before clearing the local session (order law: the
 *  revoke must still fire after the keystore is empty). Never throws. */
export async function logoutRemote(token: string): Promise<void> {
  try {
    await fetchJson('/api/auth/logout', { method: 'POST', auth: token })
  } catch {
    /* best-effort — the local clear in lib/auth is the real sign-out */
  }
}

// ————— Adapters (the only raw-JSON touchpoints) —————

export interface Stats {
  doctors: number
  hospitals: number
  patients: number
  bookings: number
}

export async function getStats(): Promise<Stats> {
  const raw = await fetchJson<{
    doctorCount: number
    hospitalCount: number
    patientCount: number
    bookingCount: number
  }>('/api/public/stats')
  return {
    doctors: raw.doctorCount,
    hospitals: raw.hospitalCount,
    patients: raw.patientCount,
    bookings: raw.bookingCount,
  }
}

export interface DoctorCard {
  id: string
  name: string
  specialization: string
  city: string
  state: string
  fees: number
  experience: string
  isEmergency: boolean
  rating: number
  ratingCount: number
}

export interface DoctorsPage {
  doctors: DoctorCard[]
  total: number
}

export async function getDoctors(params: {
  search?: string
  city?: string
  page?: number
  limit?: number
}): Promise<DoctorsPage> {
  const q = new URLSearchParams()
  if (params.search) q.set('search', params.search)
  if (params.city) q.set('city', params.city)
  if (params.page) q.set('page', String(params.page))
  if (params.limit) q.set('limit', String(params.limit))
  const raw = await fetchJson<{
    data: {
      id: string
      name: string
      doctor: {
        specialization: string | null
        city: string | null
        state: string | null
        fees: number | null
        experience: string | null
        isEmergency: boolean | null
      }
      _avgRating: { star: number | null }
      _ratingCount: { star: number | null }
    }[]
    total: number
  }>(`/api/doctors?${q.toString()}`)
  return {
    doctors: raw.data.map((d) => ({
      id: d.id,
      name: d.name,
      specialization: d.doctor?.specialization ?? '',
      city: d.doctor?.city ?? '',
      state: d.doctor?.state ?? '',
      fees: d.doctor?.fees ?? 0,
      experience: d.doctor?.experience ?? '',
      isEmergency: d.doctor?.isEmergency ?? false,
      rating: d._avgRating?.star ?? 0,
      ratingCount: d._ratingCount?.star ?? 0,
    })),
    total: raw.total,
  }
}

// ————— S5 · Doctor profile (doc 08 #2: /api/doctors/[id]) —————

export interface ScheduleRow {
  /** Day name as stored on prod ("Monday" … "Sunday"). */
  day: string
  start: string
  end: string
}

export interface PracticeHospital {
  id: string
  name: string
  city: string
}

export interface DoctorProfile {
  id: string
  name: string
  /** Full http(s) image URL — null when the doctor has no real photo
   *  ("default.png" and empty are honesty-gated to null at the adapter,
   *  never rendered as a broken image). */
  photo: string | null
  specialization: string
  education: string
  /** Years, as stored ("12"). */
  experience: string
  city: string
  state: string
  fees: number
  /** Registration number — chip only when present (trust law). */
  registration: string
  description: string
  schedules: ScheduleRow[]
  hospitals: PracticeHospital[]
  services: string[]
  rating: number
  ratingCount: number
  totalPatients: number
  totalAppointments: number
}

export async function getDoctor(id: string): Promise<DoctorProfile> {
  const raw = await fetchJson<{
    doctor: {
      id: string
      name: string
      profileImg: string | null
      doctor: {
        specialization: string | null
        education: string | null
        experience: string | null
        city: string | null
        state: string | null
        fees: number | null
        description: string | null
        registrationDetail: string | null
        services: string[] | null
      }
      schedules: {
        day: string
        startTime: string
        endTime: string
      }[] | null
      hospitals: { id: string; hospitalName: string; city: string }[] | null
      avgRating: number | null
      ratingCount: number | null
      totalPatients: number | null
      totalAppointments: number | null
    }
  }>(`/api/doctors/${encodeURIComponent(id)}`)
  const d = raw.doctor
  const img = d.profileImg
  return {
    id: d.id,
    name: d.name,
    photo: img && /^https?:\/\//.test(img) ? img : null,
    specialization: d.doctor?.specialization ?? '',
    education: d.doctor?.education ?? '',
    experience: d.doctor?.experience ?? '',
    city: d.doctor?.city ?? '',
    state: d.doctor?.state ?? '',
    fees: d.doctor?.fees ?? 0,
    registration: d.doctor?.registrationDetail ?? '',
    description: d.doctor?.description ?? '',
    schedules: (d.schedules ?? []).map((s) => ({ day: s.day, start: s.startTime, end: s.endTime })),
    hospitals: (d.hospitals ?? []).map((h) => ({ id: h.id, name: h.hospitalName, city: h.city })),
    services: d.doctor?.services ?? [],
    rating: d.avgRating ?? 0,
    ratingCount: d.ratingCount ?? 0,
    totalPatients: d.totalPatients ?? 0,
    totalAppointments: d.totalAppointments ?? 0,
  }
}

// ————— B3 · THE GOLDEN JOURNEY (doc 08 #3–#7, #13 guest path) —————

/** Schedule + identity for the slot sheet (the real Doctor-table id
 *  lives here — /api/doctors/[userId] serves the User id). */
export interface DoctorScheduleInfo {
  /** Doctor-table id — the value slots/book endpoints expect. */
  doctorId: string
  dailyLimit: number
  fees: number
  days: { day: string; start: string; end: string }[]
  holidays: string[]
}

export async function getDoctorSchedule(userId: string): Promise<DoctorScheduleInfo> {
  const raw = await fetchJson<{
    doctorId: string
    fees?: number | null
    dailyLimit?: number | null
    schedules?: { day: string; startTime: string; endTime: string }[] | null
    holidays?: { date: string }[] | null
  }>(`/api/doctors/${encodeURIComponent(userId)}/schedule`)
  return {
    doctorId: raw.doctorId,
    dailyLimit: raw.dailyLimit ?? 0,
    fees: raw.fees ?? 0,
    days: (raw.schedules ?? []).map((s) => ({ day: s.day, start: s.startTime, end: s.endTime })),
    holidays: (raw.holidays ?? []).map((h) => h.date.slice(0, 10)),
  }
}

export interface SlotInventory {
  doctorId: string
  date: string
  dayName: string
  available: boolean
  /** Present when available === false (holiday / no schedule / limit). */
  reason?: string
  isHoliday: boolean
  hasSchedule: boolean
  startTime: string
  endTime: string
  slotDuration: number
  opdCount: number
  opdLimit: number
  nextFreeSlot: string | null
  slots: { time: string; status: 'free' | 'taken' | 'past' }[]
}

export async function getSlots(doctorId: string, date: string): Promise<SlotInventory> {
  const raw = await fetchJson<{
    doctorId: string
    date: string
    dayName: string
    available: boolean
    reason?: string
    isHoliday: boolean
    hasSchedule: boolean
    startTime: string
    endTime: string
    slotDuration: number
    opdCount: number
    opdLimit: number
    nextFreeSlot?: string | null
    slots: { time: string; status: 'free' | 'taken' | 'past' }[]
  }>(`/api/public/slots?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`)
  return {
    doctorId: raw.doctorId,
    date: raw.date,
    dayName: raw.dayName,
    available: raw.available,
    reason: raw.reason,
    isHoliday: raw.isHoliday,
    hasSchedule: raw.hasSchedule,
    startTime: raw.startTime,
    endTime: raw.endTime,
    slotDuration: raw.slotDuration,
    opdCount: raw.opdCount,
    opdLimit: raw.opdLimit,
    nextFreeSlot: raw.nextFreeSlot ?? null,
    slots: raw.slots.map((s) => ({ time: s.time, status: s.status })),
  }
}

export interface PlacedBooking {
  id: string
  appointmentNo: string
  status: string
  patientName: string
  timeSlot: string
  bookingDate: string
  bookingMode: string
  doctorName: string
  fees: number
}

/** POST /api/public/book — throws ApiError(kind:'server') with honest
 *  .message + .data (409 duplicate carries existingBookingId). */
export async function postPublicBooking(body: {
  doctorId: string
  bookingDate: string
  timeSlot: string
  bookingMode: 'InPerson'
  disease: string
  patientName: string
  mobileNo: string
  city?: string
  src?: 'app'
}): Promise<PlacedBooking> {
  const raw = await fetchJson<{
    success: boolean
    booking: {
      id: string
      appointmentNo: string
      status: string
      patientName: string
      timeSlot: string
      bookingDate: string
      bookingMode: string
    }
    doctor: { name: string; specialization: string }
    message: string
  }>('/api/public/book', { method: 'POST', body: { ...body, src: 'app' } })
  return {
    id: raw.booking.id,
    appointmentNo: raw.booking.appointmentNo,
    status: raw.booking.status,
    patientName: raw.booking.patientName,
    timeSlot: raw.booking.timeSlot,
    bookingDate: raw.booking.bookingDate,
    bookingMode: raw.booking.bookingMode,
    doctorName: raw.doctor?.name ?? '',
    fees: 0,
  }
}

/** Live token + queue state (S8/S9 — fresh, never cached). */
export interface TokenState {
  bookingId: string
  tokenNumber: string
  tokenOrder: number
  patientName: string
  status: string
  date: string
  queuePosition: number
  eta: { state: 'live' | 'paused' | 'not-started' | 'next' | 'none'; low: number | null; high: number | null } | null
  leavePing: { offered: boolean; optedIn: boolean; sent: boolean; sentAt?: string | null }
  doctorName: string
  /** Doctor's user id (the /doctor/[id] route) — Book again deep link. */
  doctorUserId: string
  specialization: string
  hospitalName: string
  hospitalAddress: string
  hospitalCity: string
  fees: number
  timeSlot: string
  disease: string
}

export async function getBookingToken(bookingId: string): Promise<TokenState> {
  const raw = await fetchJson<{
    token: {
      bookingId: string
      tokenNumber: string
      tokenOrder: number
      patientName: string
      disease: string
      date: string
      status: string
      timeSlot?: string
      fees?: number
      queuePosition: number
      eta: { state: 'live' | 'paused' | 'not-started' | 'next' | 'none'; low: number | null; high: number | null } | null
      leavePing: { offered: boolean; optedIn: boolean; sent: boolean; sentAt?: string | null }
      department: { name: string } | null
      doctor: { name: string; specialization: string; userId?: string; lat?: number; longi?: number } | null
      hospital: { name: string; address: string; city: string; contactNo: string } | null
    }
  }>(`/api/public/booking/${encodeURIComponent(bookingId)}/token`)
  const t = raw.token
  return {
    bookingId: t.bookingId,
    tokenNumber: t.tokenNumber,
    tokenOrder: t.tokenOrder,
    patientName: t.patientName,
    status: t.status,
    date: t.date,
    queuePosition: t.queuePosition,
    eta: t.eta,
    leavePing: t.leavePing,
    doctorName: t.doctor?.name ?? '',
    doctorUserId: t.doctor?.userId ?? '',
    specialization: t.doctor?.specialization ?? '',
    hospitalName: t.hospital?.name ?? '',
    hospitalAddress: t.hospital?.address ?? '',
    hospitalCity: t.hospital?.city ?? '',
    fees: typeof t.fees === 'number' ? t.fees : 0,
    timeSlot: typeof t.timeSlot === 'string' ? t.timeSlot : '',
    disease: t.disease,
  }
}

/** Guest bookings-by-phone (S10 — facts only). */
export interface GuestBookingRow {
  id: string
  appointmentNo: string
  status: string
  tokenNumber: string
  date: string
  timeSlot: string
  bookingMode: string
  fees: number
  city: string
  doctorName: string
  specialization: string
}

export async function lookupBookings(mobile: string): Promise<GuestBookingRow[]> {
  const raw = await fetchJson<{
    bookings: {
      id: string
      appointmentNo: string
      status: string
      tokenNumber: string
      tokenOrder: number
      patientName: string
      date: string
      timeSlot: string
      bookingMode: string
      fees: number
      city: string
      doctorName: string
      specialization: string
    }[]
    message?: string
  }>(`/api/public/booking/lookup?mobile=${encodeURIComponent(mobile)}`)
  return raw.bookings
}

/** Guest cancel — mobile is the ownership check (S11). */
export async function cancelPublicBooking(bookingId: string, mobile: string, reason?: string): Promise<void> {
  await fetchJson<{ success: boolean }>(`/api/public/booking/${encodeURIComponent(bookingId)}/cancel`, {
    method: 'POST',
    body: { mobile, ...(reason ? { reason } : {}) },
  })
}

// ————— APK-B6 · P1 polish: notifications · book-again · reports · rate —————
// Contracts verified against the monolith (patient-side, Bearer-gated).

/** In-app notification row (GET /api/patient/notifications). */
export interface NotificationRow {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface NotificationsPage {
  rows: NotificationRow[]
  unreadCount: number
  page: number
  totalPages: number
}

export async function getNotifications(page = 1): Promise<NotificationsPage> {
  const raw = await fetchJson<{
    notifications: { id: string; title: string; message: string; status: string; createdAt: string }[]
    pagination: { page: number; totalPages: number }
    unreadCount: number
  }>(`/api/patient/notifications?page=${page}&limit=25`, { auth: true })
  return {
    rows: raw.notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      read: n.status === 'READ',
      createdAt: n.createdAt,
    })),
    unreadCount: raw.unreadCount,
    page: raw.pagination.page,
    totalPages: raw.pagination.totalPages,
  }
}

/** PATCH /api/patient/notifications/[id]/read — tap marks one read. */
export async function markNotificationRead(id: string): Promise<void> {
  await fetchJson(`/api/patient/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
    auth: true,
  })
}

/** PATCH /api/patient/notifications/read-all — header pill. */
export async function markAllNotificationsRead(): Promise<void> {
  await fetchJson('/api/patient/notifications/read-all', { method: 'PATCH', auth: true })
}

/** Book-again rail doctor (GET /api/patient/book-again — DoctorListItem
 *  grammar, id = User id so profile/book deep links resolve). */
export interface BookAgainDoctor {
  id: string
  name: string
  photo: string | null
  specialization: string
  city: string
  state: string
  fees: number
  experience: string
}

export async function getBookAgain(): Promise<BookAgainDoctor[]> {
  const raw = await fetchJson<{
    doctors: {
      id: string
      name: string
      profileImg: string | null
      doctor: {
        specialization: string | null
        city: string | null
        state: string | null
        fees: number | null
        experience: string | null
      }
    }[]
  }>('/api/patient/book-again', { auth: true })
  // Empty/401-safe: the rail hides when empty (hide-if-empty law).
  return raw.doctors.map((d) => ({
    id: d.id,
    name: d.name,
    photo: d.profileImg && /^https?:\/\//.test(d.profileImg) ? d.profileImg : null,
    specialization: d.doctor?.specialization ?? '',
    city: d.doctor?.city ?? '',
    state: d.doctor?.state ?? '',
    fees: d.doctor?.fees ?? 0,
    experience: d.doctor?.experience ?? '',
  }))
}

/** Lab order tracker row (GET /api/patient/lab-orders). */
export interface LabOrderRow {
  id: string
  orderNo: string
  testName: string
  fee: number
  policy: 'self' | 'rx'
  prepNote: string
  collectionDate: string
  collectionSlot: string
  city: string
  status: string
  statusNote: string
  reportReady: boolean
  labName: string
  labCity: string
}

export async function getLabOrders(): Promise<LabOrderRow[]> {
  const raw = await fetchJson<{
    data: {
      id: string
      orderNo: string
      testName: string
      testFee: number
      bookingPolicy: string
      prepNote: string
      collectionDate: string
      collectionSlot: string
      city: string
      status: string
      statusNote: string | null
      reportUrl: string
      labPartner: { labName: string; city: string } | null
    }[]
  }>('/api/patient/lab-orders', { auth: true })
  return raw.data.map((o) => ({
    id: o.id,
    orderNo: o.orderNo,
    testName: o.testName,
    fee: o.testFee,
    policy: o.bookingPolicy === 'rx' ? 'rx' : 'self',
    prepNote: o.prepNote ?? '',
    collectionDate: o.collectionDate,
    collectionSlot: o.collectionSlot,
    city: o.city,
    status: o.status,
    statusNote: o.statusNote ?? '',
    reportReady: Boolean(o.reportUrl) && o.status === 'Completed',
    labName: o.labPartner?.labName ?? '',
    labCity: o.labPartner?.city ?? '',
  }))
}

/** GET the completed order's report file (Bearer-auth'd proxy — the raw
 *  storage URL never reaches the client; returns the response + content
 *  type so the caller can open/share per platform). */
export async function fetchLabReport(
  orderId: string,
): Promise<{ blob: Blob; contentType: string }> {
  const token = await getStoredToken()
  if (!token) throw new ApiError('server', 'Sign in required', 401)
  const res = await fetch(`${API_BASE}/api/patient/lab-orders/${encodeURIComponent(orderId)}/report`, {
    headers: { Accept: 'application/pdf, image/*, application/octet-stream', Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new ApiError('server', 'Report not available', res.status)
  }
  return { blob: await res.blob(), contentType: res.headers.get('content-type') ?? 'application/octet-stream' }
}

/** Rateable completed visit (GET /api/patient/feedback). */
export interface FeedbackRow {
  id: string
  appointmentNo: string
  doctorName: string
  doctorUserId: string
  disease: string
  date: string
  alreadyRated: boolean
}

export async function getFeedbackList(): Promise<FeedbackRow[]> {
  const raw = await fetchJson<{
    feedback: {
      id: string
      appointmentNo: string
      doctorName: string
      doctorUserId: string
      disease: string | null
      date: string
      alreadyRated: boolean
    }[]
  }>('/api/patient/feedback', { auth: true })
  return raw.feedback.map((f) => ({
    id: f.id,
    appointmentNo: f.appointmentNo,
    doctorName: f.doctorName,
    doctorUserId: f.doctorUserId,
    disease: f.disease ?? '',
    date: f.date,
    alreadyRated: f.alreadyRated,
  }))
}

/** POST /api/patient/feedback — star required, sub-scores optional 0–5,
 *  review + anonymous optional. Server 409 honest answers surface verbatim. */
export async function postRating(body: {
  bookingId: string
  doctorUserId: string
  star: number
  consultationRating?: number
  waitTimeRating?: number
  staffRating?: number
  review?: string
  wouldRecommend?: boolean
  isAnonymous?: boolean
}): Promise<void> {
  await fetchJson('/api/patient/feedback', {
    method: 'POST',
    auth: true,
    body: { ...body, wouldRecommend: body.wouldRecommend ?? true },
  })
}

// ---------------------------------------------------------------------------
// Hospitals (public browse — /api/hospitals*; guest-safe, no auth needed)
// APK-B7. Contract notes (verified on prod): the LIST envelope's data[].id
// is the OWNER user id — the hospital id for detail/dept routes lives at
// data[].hospital.id (mapped below). facilities/gallery arrive as
// JSON-encoded strings ("[]") — parsed defensively. Departments can
// honestly have 0 doctors (doctorCount) — never fabricated.
// ---------------------------------------------------------------------------

export interface HospitalCard {
  id: string
  name: string
  city: string
  state: string
  type: string
  bedCount: number
  departmentCount: number
  doctorCount: number
}

export interface HospitalsPage {
  hospitals: HospitalCard[]
  total: number
}

export async function getHospitals(params: {
  search?: string
  city?: string
  page?: number
  limit?: number
}): Promise<HospitalsPage> {
  const q = new URLSearchParams()
  if (params.search) q.set('search', params.search)
  if (params.city) q.set('city', params.city)
  if (params.page) q.set('page', String(params.page))
  if (params.limit) q.set('limit', String(params.limit))
  const raw = await fetchJson<{
    data: {
      hospital: {
        id: string
        hospitalName: string | null
        city: string | null
        state: string | null
        hospitalType: string | null
        bedCount: number | null
        _count: { departments: number | null; doctorLinks: number | null } | null
      } | null
    }[]
    total: number
  }>(`/api/hospitals?${q.toString()}`)
  return {
    hospitals: raw.data
      .map((row) => {
        const h = row.hospital
        return {
          id: h?.id ?? '',
          name: h?.hospitalName ?? '',
          city: h?.city ?? '',
          state: h?.state ?? '',
          type: h?.hospitalType ?? 'Multi-Specialty',
          bedCount: h?.bedCount ?? 0,
          departmentCount: h?._count?.departments ?? 0,
          doctorCount: h?._count?.doctorLinks ?? 0,
        }
      })
      .filter((h) => h.id !== '' && h.name !== ''),
    total: raw.total,
  }
}

/** JSON-encoded string arrays ("[]") from the monolith → string[] (defensive). */
function parseJsonStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string')
  if (typeof value === 'string' && value.trim() !== '') {
    try {
      const parsed: unknown = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
    } catch {
      return []
    }
  }
  return []
}

export interface HospitalDepartment {
  id: string
  name: string
  description: string
  floorNo: string
  opdRoom: string
  doctorCount: number
}

export interface HospitalProfile {
  id: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  contactNo: string
  website: string
  type: string
  establishedYear: number
  bedCount: number
  accreditation: string
  facilities: string[]
  about: string
  departments: HospitalDepartment[]
  totalDoctors: number
}

export async function getHospitalProfile(id: string): Promise<HospitalProfile> {
  const raw = await fetchJson<{
    id: string
    hospitalName: string | null
    address: string | null
    city: string | null
    state: string | null
    pincode: string | number | null
    contactNo: string | null
    website: string | null
    hospitalType: string | null
    establishedYear: number | null
    bedCount: number | null
    accreditation: string | null
    facilities: unknown
    about: string | null
    departments: {
      id: string
      name: string | null
      description: string | null
      floorNo: string | number | null
      opdRoom: string | number | null
      doctorCount: number | null
    }[]
    totalDoctors: number | null
  }>(`/api/hospitals/${encodeURIComponent(id)}`)
  return {
    id: raw.id,
    name: raw.hospitalName ?? '',
    address: raw.address ?? '',
    city: raw.city ?? '',
    state: raw.state ?? '',
    pincode: raw.pincode === null || raw.pincode === undefined ? '' : String(raw.pincode),
    contactNo: raw.contactNo ?? '',
    website: raw.website ?? '',
    type: raw.hospitalType ?? 'Multi-Specialty',
    establishedYear: raw.establishedYear ?? 0,
    bedCount: raw.bedCount ?? 0,
    accreditation: raw.accreditation ?? '',
    facilities: parseJsonStringArray(raw.facilities),
    about: raw.about ?? '',
    departments: (raw.departments ?? []).map((d) => ({
      id: d.id,
      name: d.name ?? '',
      description: d.description ?? '',
      floorNo: d.floorNo === null || d.floorNo === undefined ? '' : String(d.floorNo),
      opdRoom: d.opdRoom === null || d.opdRoom === undefined ? '' : String(d.opdRoom),
      doctorCount: d.doctorCount ?? 0,
    })),
    totalDoctors: raw.totalDoctors ?? 0,
  }
}

export interface DepartmentDoctor {
  id: string
  name: string
  specialization: string
  designation: string
  fees: number
  isAvailable: boolean
  rating: number
  ratingCount: number
}

export async function getDepartmentDoctors(
  hospitalId: string,
  departmentId: string,
): Promise<DepartmentDoctor[]> {
  const raw = await fetchJson<{
    doctors: {
      id: string
      name: string | null
      specialization: string | null
      designation: string | null
      fees: number | null
      isAvailable: boolean | null
      avgRating: number | null
      totalRatings: number | null
    }[]
  }>(
    `/api/hospitals/${encodeURIComponent(hospitalId)}/departments/${encodeURIComponent(departmentId)}/doctors`,
  )
  return (raw.doctors ?? []).map((d) => ({
    id: d.id,
    name: d.name ?? '',
    specialization: d.specialization ?? '',
    designation: d.designation ?? '',
    fees: d.fees ?? 0,
    isAvailable: d.isAvailable ?? false,
    rating: d.avgRating ?? 0,
    ratingCount: d.totalRatings ?? 0,
  }))
}
