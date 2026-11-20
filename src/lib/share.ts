/**
 * ATURSEVA APP — share helpers (S5 share card, doc 06 S5 §7).
 * The card is plain text (name + spec + fee + city + web deep-link) —
 * zero login, zero dependencies. WhatsApp deep-link via wa.me works
 * on both native (app) and web (web.whatsapp) with one URL shape.
 */

import * as Linking from 'expo-linking'

/** Builds the S5 text card — every line optional-safe, fee always present. */
export function buildShareCard(d: {
  name: string
  specialization: string
  fees: number
  city: string
  id: string
  webBase?: string
}): string {
  const base = d.webBase ?? 'https://doctorooms-hms.vercel.app'
  const lines = [`${d.name}${d.specialization ? ` — ${d.specialization}` : ''}`]
  lines.push(`₹${d.fees.toLocaleString('en-IN')} per visit`)
  if (d.city) lines.push(`· ${d.city}`)
  lines.push(`Book on Aturseva: ${base}/doctors/${d.id}`)
  return lines.join('\n')
}

/** Opens the WhatsApp share (text card). Never throws — a failed open is swallowed. */
export async function openWhatsApp(text: string): Promise<void> {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`
  try {
    await Linking.openURL(url)
  } catch {
    // Web fallback (some browsers block cross-app opens):
    if (typeof window !== 'undefined') {
      try {
        window.open(url, '_blank', 'noopener')
      } catch {
        // swallow — share is best-effort by law (S8 fallback is P0 of B3)
      }
    }
  }
}

/** B3 (S8) — the token share card. Plain text, zero login, deep link to
 *  the booking (the token page IS the door — same law as the web's /b
 *  short link). Every line optional-safe; the token number leads. */
export function buildTokenShareCard(t: {
  tokenNumber: string
  patientName: string
  doctorName: string
  hospitalName: string
  dateLabel: string
  timeSlot: string
  bookingId: string
  webBase?: string
}): string {
  const base = t.webBase ?? 'https://doctorooms-hms.vercel.app'
  const lines: string[] = []
  if (t.tokenNumber) lines.push(`Token ${t.tokenNumber}`)
  if (t.doctorName) lines.push(`${t.doctorName}${t.hospitalName ? ` · ${t.hospitalName}` : ''}`)
  lines.push(`${t.dateLabel}${t.timeSlot ? ` · ${t.timeSlot}` : ''}`)
  if (t.patientName) lines.push(t.patientName)
  lines.push(`View on Aturseva: ${base}/b/${t.bookingId}`)
  return lines.join('\n')
}
