/**
 * ATURSEVA — SYMPTOM-LANGUAGE SEARCH DICTIONARY (GO batch-19, doc 21
 * research-answer Q3 opener: "patient problems ki bhasha me search").
 *
 * THE GAP this closes (worklog 2026-12-05 ground truth): /api/doctors
 * `search` matched ONLY `User.name` — a patient who typed "fever",
 * "knee pain", "haddi ka doctor" got ZERO results, because patients
 * search in PROBLEM language, doctors are filed under SPECIALTY
 * language. This dictionary is the honest bridge between the two.
 *
 * LAWS (house, unchanged):
 * - HONEST MATCH: every keyword maps to specialties we can name back
 *   to the patient — the listing SHOWS the mapping ("fever → General
 *   Physician · Pediatrician"). Silent expansion = silent lying (doc 21
 *   §8 visible-context law) — so every consumer surfaces what matched.
 * - ADDITIVE: name search still works exactly as before (OR, not
 *   replace); an empty/miss query behaves identically to today.
 * - ZERO DDL: Doctor.specialization values already live everywhere;
 *   this is a pure query-layer expansion.
 * - SINGLE SOURCE: specialty values derive from the /specialties
 *   registry (prod count-verified synonyms) + a few honest extra
 *   spellings; displayNames come from the same registry.
 *
 * Pure TypeScript, no server or client deps — importable from API
 * routes, server components and client components alike.
 */

import { SPECIALTIES } from './specialties'

export interface SymptomSpecialty {
  /** Registry slug — identity + link key. */
  slug: string
  /** The word patients know ("Cardiologist"). */
  displayName: string
  /** Exact Doctor.specialization DB values this symptom maps to. */
  values: string[]
}

export interface SymptomMatch {
  /** The patient's own words that matched (deduped, lowercase). */
  terms: string[]
  /** The specialties those words map to (registry order). */
  specialties: SymptomSpecialty[]
}

/**
 * Extra Doctor.specialization spellings beyond the registry synonyms —
 * seed cohorts and sandbox fixtures carry variants ("Orthopedic
 * Surgeon") the prod-verified registry doesn't list. `in` queries simply
 * won't match values that don't exist — extras are harmless by design.
 */
const EXTRA_VALUES: Record<string, string[]> = {
  orthopedist: ['Orthopedic Surgeon', 'Orthopaedics', 'Orthopaedic Surgeon', 'Orthopedist'],
  pediatrician: ['Paediatrician', 'Paediatrics'],
  dermatologist: ['Skin Specialist'],
  gynecologist: ['Gynaecologist', 'Gynaecology', 'OB-GYN'],
  ophthalmologist: ['Eye Specialist'],
  psychiatrist: ['Psychiatry'],
}

/**
 * Patient-language keywords (English + Hinglish roman, lowercase).
 * Single words match by token equality (or prefix, when ≥4 chars);
 * multi-word phrases match inside the full normalized query.
 * Deliberately NO bare "pain"/"dard" (ambiguous across 6 specialties)
 * — only specific phrases carry those.
 */
const KEYWORDS: Record<string, string[]> = {
  'general-physician': [
    'fever', 'bukhar', 'cough', 'khansi', 'cold', 'zukam', 'flu',
    'weakness', 'tiredness', 'fatigue', 'checkup', 'check-up',
    'physician', 'general medicine',
  ],
  pediatrician: [
    'child', 'bacha', 'bachcha', 'baccha', 'baby', 'kid', 'kids',
    'vaccination', 'vaccine', 'growth', 'feeding', 'pediatric',
    'child specialist',
  ],
  dermatologist: [
    'skin', 'twacha', 'acne', 'pimple', 'pimples', 'rash', 'fungal',
    'itching', 'khujli', 'hair fall', 'hairfall', 'eczema',
    'pigmentation', 'dark spots', 'skin allergy',
  ],
  cardiologist: [
    'heart', 'dil', 'chest', 'chest pain', 'seene me dard',
    'breathlessness', 'palpitations', 'blood pressure', 'bp',
    'high bp', 'swelling in legs', 'dizziness', 'chakkar', 'cardio',
  ],
  neurologist: [
    'headache', 'sar dard', 'migraine', 'numbness', 'tingling',
    'seizure', 'fits', 'jhatke', 'memory', 'stroke', 'paralysis',
    'neuro', 'one-sided weakness',
  ],
  ophthalmologist: [
    'eye', 'eyes', 'aankh', 'ankh', 'vision', 'eyesight',
    'blurred vision', 'chashma', 'squint', 'watering in eyes', 'red eye',
  ],
  orthopedist: [
    'bone', 'bones', 'haddi', 'knee', 'knee pain', 'ghutna',
    'back pain', 'backache', 'peeth dard', 'neck pain', 'joint',
    'joints', 'fracture', 'broken bone', 'sports injury', 'ortho',
    'orthopedic',
  ],
  ent: [
    'ear', 'ear pain', 'kaan', 'kan', 'throat', 'gala', 'gale me dard',
    'nose', 'naak', 'sinus', 'snoring', 'kharaate', 'hearing loss',
    'vertigo',
  ],
  gastroenterologist: [
    'acidity', 'gas', 'pet dard', 'stomach', 'stomach pain',
    'stomach ache', 'abdominal pain', 'bloating', 'constipation',
    'kabz', 'loose motions', 'dast', 'indigestion', 'jaundice',
    'piliya', 'vomiting', 'ulti', 'nausea', 'gastro', 'pait',
  ],
  gynecologist: [
    'period', 'periods', 'period pain', 'irregular periods', 'mahwari',
    'pregnancy', 'pregnant', 'delivery', 'white discharge', 'menopause',
    'fertility', 'gyne', 'gynec',
  ],
  urologist: [
    'urine', 'urination', 'peshab', 'burning', 'kidney', 'pathri',
    'stone', 'blood in urine', 'prostate', 'uro',
  ],
  psychiatrist: [
    'anxiety', 'stress', 'depression', 'low mood', 'mood', 'panic',
    'sleep problem', 'sleep', 'neend', 'insomnia', 'concentration',
    'mental', 'tension',
  ],
}

/** Normalize a raw query: lowercase, collapse whitespace. */
function normalize(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Match a patient query against the symptom dictionary.
 * Returns null when nothing matches (the caller's existing
 * behavior — name search — stays exactly as it was).
 */
export function matchSymptom(rawQuery: string): SymptomMatch | null {
  const q = normalize(rawQuery)
  if (!q) return null
  const tokens = q.split(/[^a-z0-9]+/).filter(Boolean)
  if (tokens.length === 0) return null

  const terms: string[] = []
  const matchedSlugs: string[] = []

  for (const [slug, words] of Object.entries(KEYWORDS)) {
    for (const w of words) {
      const hit = w.includes(' ')
        ? q.includes(w) // phrase: inside the whole query
        : tokens.includes(w) || // short word: exact token
          (w.length >= 4 && tokens.some((t) => t.startsWith(w))) // long word: token prefix
      if (!hit) continue
      if (!terms.includes(w)) terms.push(w)
      if (!matchedSlugs.includes(slug)) matchedSlugs.push(slug)
    }
  }
  if (matchedSlugs.length === 0) return null

  const specialties: SymptomSpecialty[] = []
  for (const slug of matchedSlugs) {
    const entry = SPECIALTIES.find((e) => e.slug === slug)
    if (!entry) continue // registry drift guard — never invent a specialty
    specialties.push({
      slug,
      displayName: entry.displayName,
      values: [...entry.synonyms, ...(EXTRA_VALUES[slug] ?? [])],
    })
  }
  if (specialties.length === 0) return null
  return { terms, specialties }
}
