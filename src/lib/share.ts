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
