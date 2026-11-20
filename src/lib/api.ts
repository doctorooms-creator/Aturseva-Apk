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

const rawBase = process.env.EXPO_PUBLIC_API_BASE
export const API_BASE =
  rawBase === '' ? '' : (rawBase ?? 'https://doctorooms-hms.vercel.app').replace(/\/+$/, '')

const TIMEOUT_MS = 8000
const RETRY_DELAY_MS = 500

export type ApiErrorKind = 'timeout' | 'network' | 'server' | 'parse'

export class ApiError extends Error {
  kind: ApiErrorKind
  status?: number
  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`
  const attempt = async (): Promise<T> => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      if (!res.ok) {
        throw new ApiError('server', `Server declined the request (HTTP ${res.status})`, res.status)
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
