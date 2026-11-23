/**
 * V3 TYPE RAMP (Home V3.1 · P2 foundations): the Geist/GeistMono preset
 * ladder the rebuilt home consumes. Every preset carries its own
 * fontFamily — the ramp is weight-per-face (the @expo-google-fonts
 * convention: each family string already encodes its weight, e.g.
 * "Geist_600SemiBold" — verified against the package README + the
 * useFonts map-key law; the SAME string registers on web via FontFace,
 * so no Platform.select is needed).
 *
 * Laws:
 * - The faces are loaded by the ROOT font gate (src/app/_layout.tsx
 *   useFonts) — the splash stays up until they are resident, so these
 *   presets never paint in the system fallback.
 * - Money/queue/time figures go through the GeistMono tabular presets
 *   (metricNum / nextTime / labPrice) — the doc 03 tabular law.
 * - Sizes are intentionally fine-grained (8.5–23) per the approved V3
 *   design spec; do NOT round them to the P0 type scale.
 */

import type { TextStyle } from 'react-native'

/** Geist sans faces (family string = the useFonts map key). */
const G400 = 'Geist_400Regular'
const G500 = 'Geist_500Medium'
const G600 = 'Geist_600SemiBold'
const G700 = 'Geist_700Bold'
/** Geist Mono faces — metrics, tokens, prices. */
const M600 = 'GeistMono_600SemiBold'
const M700 = 'GeistMono_700Bold'

/** Tabular figure variant — every mono preset carries it. */
const TABULAR: TextStyle['fontVariant'] = ['tabular-nums']

export const v3 = {
  /** App wordmark (top-left of the home). */
  wordmark: {
    fontFamily: G700, fontSize: 17, lineHeight: 22, fontWeight: '700' as const, letterSpacing: -0.4,
  },
  /** Location line under the wordmark. */
  location: { fontFamily: G500, fontSize: 11.5, lineHeight: 16, fontWeight: '500' as const },
  /** Hero card headline. */
  heroTitle: {
    fontFamily: G700, fontSize: 23, lineHeight: 28, fontWeight: '700' as const, letterSpacing: -0.5,
  },
  /** Hero card supporting line. */
  heroSub: { fontFamily: G400, fontSize: 10, lineHeight: 15, fontWeight: '400' as const },
  /** Section headings ("Consult a doctor"). */
  sectionTitle: {
    fontFamily: G700, fontSize: 13.5, lineHeight: 18, fontWeight: '700' as const, letterSpacing: -0.2,
  },
  /** Section "View all" action. */
  viewAll: { fontFamily: G500, fontSize: 10.5, lineHeight: 14, fontWeight: '500' as const },
  /** Consultation tile title ("Instant video"). */
  tileTitle: { fontFamily: G600, fontSize: 12.5, lineHeight: 16, fontWeight: '600' as const },
  /** Consultation tile sub-line. */
  tileSub: { fontFamily: G400, fontSize: 8.5, lineHeight: 12, fontWeight: '400' as const },
  /** Promo banner lead-in ("Aturseva Plus"). */
  promoLead: { fontFamily: G500, fontSize: 11.5, lineHeight: 16, fontWeight: '500' as const },
  /** Promo banner headline. */
  promoTitle: { fontFamily: G700, fontSize: 15, lineHeight: 20, fontWeight: '700' as const },
  /** Small chip inside cards (queue chip, discount chip). */
  chip: { fontFamily: G500, fontSize: 9, lineHeight: 12, fontWeight: '500' as const },
  /** Appointment row name. */
  apptName: { fontFamily: G600, fontSize: 10.5, lineHeight: 14, fontWeight: '600' as const },
  /** Appointment row sub-line. */
  apptSub: { fontFamily: G400, fontSize: 8.5, lineHeight: 12, fontWeight: '400' as const },
  /** Live queue chip ("12 in queue"). */
  liveQueue: { fontFamily: G600, fontSize: 8.5, lineHeight: 11, fontWeight: '600' as const },
  /** Big metric figure (token number) — mono, tabular. */
  metricNum: {
    fontFamily: M700, fontSize: 15, lineHeight: 18, fontWeight: '700' as const, fontVariant: TABULAR,
  },
  /** Metric caption under the figure. */
  metricLabel: { fontFamily: G500, fontSize: 8, lineHeight: 11, fontWeight: '500' as const },
  /** Labs strip package title. */
  stripTitle: { fontFamily: G700, fontSize: 11.5, lineHeight: 15, fontWeight: '700' as const },
  /** Labs strip package sub-line. */
  stripSub: { fontFamily: G400, fontSize: 8.5, lineHeight: 12, fontWeight: '400' as const },
  /** Horizontal filter chip ("All", "Available today"). */
  chipFilter: { fontFamily: G600, fontSize: 10, lineHeight: 13, fontWeight: '600' as const },
  /** Doctor card name. */
  docName: { fontFamily: G600, fontSize: 10.5, lineHeight: 14, fontWeight: '600' as const },
  /** Doctor card sub-line (specialty). */
  docSub: { fontFamily: G400, fontSize: 8.5, lineHeight: 12, fontWeight: '400' as const },
  /** Doctor card rating figure. */
  docRating: { fontFamily: G500, fontSize: 8.5, lineHeight: 11, fontWeight: '500' as const },
  /** Next-visit mini card label. */
  nextLabel: { fontFamily: G500, fontSize: 8, lineHeight: 10, fontWeight: '500' as const },
  /** Next-visit day figure. */
  nextDay: { fontFamily: G600, fontSize: 9, lineHeight: 12, fontWeight: '600' as const },
  /** Next-visit time figure — mono, tabular. */
  nextTime: {
    fontFamily: M600, fontSize: 9, lineHeight: 12, fontWeight: '600' as const, fontVariant: TABULAR,
  },
  /** Speciality wordmark label. */
  specLabel: { fontFamily: G600, fontSize: 9, lineHeight: 12, fontWeight: '600' as const },
  /** Hospital row name. */
  hosName: { fontFamily: G600, fontSize: 10.5, lineHeight: 14, fontWeight: '600' as const },
  /** Hospital row sub-line. */
  hosSub: { fontFamily: G400, fontSize: 8.5, lineHeight: 12, fontWeight: '400' as const },
  /** Lab row name. */
  labName: { fontFamily: G600, fontSize: 10.5, lineHeight: 13, fontWeight: '600' as const },
  /** Lab row sub-line. */
  labSub: { fontFamily: G400, fontSize: 8, lineHeight: 11, fontWeight: '400' as const },
  /** Lab price figure — mono, tabular. */
  labPrice: {
    fontFamily: M700, fontSize: 10.5, lineHeight: 14, fontWeight: '700' as const, fontVariant: TABULAR,
  },
  /** Generic fine caption (footnotes, disclaimers). */
  caption: { fontFamily: G400, fontSize: 8, lineHeight: 11, fontWeight: '400' as const },
  /** Mint/insurance card title. */
  mintTitle: { fontFamily: G700, fontSize: 12.5, lineHeight: 16, fontWeight: '700' as const },
  /** Mint/insurance card sub-line. */
  mintSub: { fontFamily: G400, fontSize: 8.5, lineHeight: 12, fontWeight: '400' as const },
  /** Tool tile title ("Reminders"). */
  toolTitle: { fontFamily: G600, fontSize: 9.5, lineHeight: 13, fontWeight: '600' as const },
  /** Tool tile sub-line. */
  toolSub: { fontFamily: G400, fontSize: 8, lineHeight: 11, fontWeight: '400' as const },
  /** Trust billboard title. */
  trustTitle: { fontFamily: G700, fontSize: 12, lineHeight: 16, fontWeight: '700' as const },
  /** Trust billboard sub-line. */
  trustSub: { fontFamily: G400, fontSize: 8.5, lineHeight: 12, fontWeight: '400' as const },
  /** Floating nav pill label. */
  navLabel: { fontFamily: G600, fontSize: 9, lineHeight: 12, fontWeight: '600' as const },
}
