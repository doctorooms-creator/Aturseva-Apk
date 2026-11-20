/**
 * ATURSEVA WEBSITE V2 — specialty SEO registry (Part 4 P4-C13, W4 opener).
 *
 * /specialties/[slug] template × 12 from docs/specialty-packs/
 * 01-DOCTOR-TAXONOMY.md. Programmatic discipline (P4-C13 law): only
 * specialties with ≥1 real doctor get a live page — the page itself
 * 404s (notFound) when its live count is zero, and sitemap.ts only
 * lists the registry (all 12 carried ≥2 real doctors on prod when this
 * was authored — S-02 no-thin-pages discipline).
 *
 * synonyms = the exact `Doctor.specialization` values that map to this
 * page (the DB has both "-ist" and "-ology" spellings from the seed
 * cohorts; every value was count-verified against prod on 2026-11-27).
 * symptoms / procedures are PATIENT-LANGUAGE display content — the
 * procedure grid is explicitly DEMO-labeled in the UI (no clinical
 * promise). FAQs are honest, generic product answers — never invented
 * fees or numbers (L-09/L-11 laws; counts render live from the DB).
 */

export interface SpecialtyExpectStep {
  title: string
  text: string
}

export interface SpecialtyFaq {
  q: string
  a: string
}

export interface SpecialtyEntry {
  /** URL slug — /specialties/{slug} (patient search term, kebab). */
  slug: string
  /** Display name — the word patients search ("Cardiologist"). */
  displayName: string
  /** Exact Doctor.specialization DB values that belong to this page. */
  synonyms: string[]
  /** Meta description (honest, count-free — counts render live). */
  description: string
  /** "Does this sound like you?" chips — display-only, patient words. */
  symptoms: string[]
  /** "What to expect at your visit" — 3 steps, product-honest. */
  expect: SpecialtyExpectStep[]
  /** DEMO-labeled representative procedures (the doctor decides). */
  procedures: string[]
  /** Specialty FAQ (FAQPage JSON-LD — Google rich results). */
  faqs: SpecialtyFaq[]
  /** Rail photo (reuses the /doctors specialty photo set). */
  photo: string
  photoAlt: string
  /** Related specialty slugs (cross-links — internal link equity). */
  related: string[]
}

const EXPECT_SHARED_2 = {
  title: 'Vitals recorded, exam done',
  text: 'Your blood pressure, temperature, and findings go into your chart — you keep the whole history.',
}
const EXPECT_SHARED_3 = {
  title: 'Prescription typed & saved',
  text: 'You get a clear digital prescription (printed if you want it) — and the pharmacy reads it without guessing.',
}

const FAQ_FEE = {
  q: 'Are consultation fees shown before I book?',
  a: 'Yes — every doctor card on Aturseva carries the doctor’s own consultation fee. No hidden charges, no “contact us for pricing”.',
}
const FAQ_BOOK = {
  q: 'How do I book?',
  a: 'Two taps — pick a slot, confirm. Your booking gets a live token: number, live queue position, and a per-visit WhatsApp status. No hotline calls.',
}

export const SPECIALTIES: SpecialtyEntry[] = [
  {
    slug: 'general-physician',
    displayName: 'General Physician',
    synonyms: ['General Physician', 'General Medicine'],
    description:
      'Fever, cough, weakness, stomach trouble — book a General Physician near you on Aturseva: real fees, live queues, token on WhatsApp.',
    symptoms: [
      'Fever',
      'Cough & cold',
      'Tiredness & weakness',
      'Stomach problems',
      'Body & joint aches',
      'Yearly check-up',
    ],
    expect: [
      {
        title: 'You describe, the doctor listens',
        text: 'Tell your symptoms in your own words — no forms fighting you, no queue-jostle at a counter.',
      },
      EXPECT_SHARED_2,
      EXPECT_SHARED_3,
    ],
    procedures: [
      'Full-body health check-up',
      'Fever & infection panel',
      'Blood pressure review',
      'Diabetes screening',
      'Thyroid screening',
      'Vaccination review',
    ],
    faqs: [
      {
        q: 'When should I see a General Physician instead of a specialist?',
        a: 'Start here for fever, cough, weakness, stomach problems, aches, or a check-up — a GP resolves most of it and refers you to the right specialist only when one is truly needed.',
      },
      FAQ_FEE,
      FAQ_BOOK,
    ],
    photo: '/website/photos/offering-doctor-f.jpg',
    photoAlt: 'Doctor with a stethoscope in a consultation room',
    related: ['pediatrician', 'cardiologist', 'gastroenterologist'],
  },
  {
    slug: 'pediatrician',
    displayName: 'Pediatrician',
    synonyms: ['Pediatrician', 'Pediatrics'],
    description:
      'Child fever, vaccinations, growth checks — book a Pediatrician near you on Aturseva: real fees, live queues, token on WhatsApp.',
    symptoms: [
      'Fever in a child',
      'Cough & cold',
      'Feeding concerns',
      'Growth & weight',
      'Vaccination due',
      'Skin rash',
    ],
    expect: [
      {
        title: 'You describe, the doctor examines',
        text: 'Symptoms first in your own words — the child is examined gently, and growth notes go into the chart.',
      },
      EXPECT_SHARED_2,
      EXPECT_SHARED_3,
    ],
    procedures: [
      'Well-baby visit',
      'Vaccination schedule',
      'Growth & development review',
      'Fever panel',
      'Allergy assessment',
      'Nutrition review',
    ],
    faqs: [
      {
        q: 'Can I book a vaccination visit online?',
        a: 'Yes — pick a slot like any visit. Bring the immunization card; the doctor reviews the schedule and the chart keeps the history.',
      },
      FAQ_FEE,
      FAQ_BOOK,
    ],
    photo: '/website/photos/spec-pedia.jpg',
    photoAlt: 'Doctor examining a young patient',
    related: ['general-physician', 'dermatologist'],
  },
  {
    slug: 'dermatologist',
    displayName: 'Dermatologist',
    synonyms: ['Dermatologist', 'Dermatology'],
    description:
      'Acne, hair fall, rash, pigmentation — book a Dermatologist near you on Aturseva: real fees, live queues, token on WhatsApp.',
    symptoms: [
      'Acne & pimples',
      'Rash',
      'Hair fall',
      'Fungal infection',
      'Pigmentation',
      'Eczema',
    ],
    expect: [
      {
        title: 'The doctor sees the skin, not just the story',
        text: 'Photos of affected areas help before the visit — the prescription is typed with exact application instructions.',
      },
      EXPECT_SHARED_2,
      EXPECT_SHARED_3,
    ],
    procedures: [
      'Acne assessment',
      'Fungal & infection panel',
      'Hair-fall review',
      'Allergy patch review',
      'Pigmentation consult',
      'Eczema management',
    ],
    faqs: [
      {
        q: 'Will the prescription cover exact usage instructions?',
        a: 'Yes — typed, with exact morning/evening and apply-how instructions, saved to your profile. No half-readable slips.',
      },
      FAQ_FEE,
      FAQ_BOOK,
    ],
    photo: '/website/photos/spec-skin.jpg',
    photoAlt: 'Dermatologist examining a patient’s skin',
    related: ['general-physician', 'pediatrician'],
  },
  {
    slug: 'cardiologist',
    displayName: 'Cardiologist',
    synonyms: ['Cardiologist', 'Cardiology'],
    description:
      'Chest pain, palpitations, blood pressure — book a Cardiologist near you on Aturseva: real fees, live queues, token on WhatsApp.',
    symptoms: [
      'Chest pain',
      'Breathlessness',
      'Palpitations',
      'High blood pressure',
      'Swelling in legs',
      'Dizziness',
    ],
    expect: [
      {
        title: 'History first — family, BP, stress',
        text: 'The doctor takes a proper heart history before anything else; your vitals and past reports go into the chart.',
      },
      EXPECT_SHARED_2,
      {
        title: 'Tests ordered, prescription typed',
        text: 'ECG or lab tests if needed go straight to your order list; the prescription is typed and saved — the pharmacy reads it without guessing.',
      },
    ],
    procedures: [
      'Heart-risk review',
      'ECG',
      'Lipid (cholesterol) panel',
      'Blood pressure management',
      'Diabetes & heart review',
      'Treadmill test review',
    ],
    faqs: [
      {
        q: 'What should I bring to a first cardiology visit?',
        a: 'Any old ECGs, reports, and your medicine list if you take BP or diabetes medicines — they go into your chart so nothing repeats.',
      },
      FAQ_FEE,
      FAQ_BOOK,
    ],
    photo: '/website/photos/spec-cardio.jpg',
    photoAlt: 'Doctor checking a patient’s heart with a stethoscope',
    related: ['general-physician', 'neurologist'],
  },
  {
    slug: 'neurologist',
    displayName: 'Neurologist',
    synonyms: ['Neurologist', 'Neurology'],
    description:
      'Headaches, numbness, tingling, fits — book a Neurologist near you on Aturseva: real fees, live queues, token on WhatsApp.',
    symptoms: [
      'Headaches',
      'Numbness',
      'Tingling',
      'Fits / seizure',
      'Memory concerns',
      'One-sided weakness',
    ],
    expect: [
      {
        title: 'A careful history — pattern by pattern',
        text: 'When it started, how often, what triggers — the doctor maps it before exam or tests.',
      },
      EXPECT_SHARED_2,
      EXPECT_SHARED_3,
    ],
    procedures: [
      'Headache pattern review',
      'Seizure assessment',
      'Nerve examination',
      'Memory review',
      'Stroke follow-up',
      'Sleep & migraine review',
    ],
    faqs: [
      {
        q: 'Do I need a brain scan before the visit?',
        a: 'Usually no — the doctor first takes a history and examines, then orders a scan only if it changes the plan. You save the unnecessary one.',
      },
      FAQ_FEE,
      FAQ_BOOK,
    ],
    photo: '/website/photos/spec-neuro.jpg',
    photoAlt: 'Technician reviewing MRI scans',
    related: ['psychiatrist', 'general-physician'],
  },
  {
    slug: 'ophthalmologist',
    displayName: 'Ophthalmologist',
    synonyms: ['Ophthalmologist', 'Ophthalmology'],
    description:
      'Blurred vision, eye pain, redness — book an Ophthalmologist near you on Aturseva: real fees, live queues, token on WhatsApp.',
    symptoms: [
      'Blurred vision',
      'Eye pain',
      'Redness',
      'Watering',
      'Night vision',
      'Squint',
    ],
    expect: [
      {
        title: 'Vision checked properly',
        text: 'Chart reading, pressure check, and a lamp exam — the sequence is standard and the doctor explains each step.',
      },
      EXPECT_SHARED_2,
      EXPECT_SHARED_3,
    ],
    procedures: [
      'Refraction (vision) test',
      'Cataract assessment',
      'Eye pressure check',
      'Diabetic eye review',
      'Squint assessment',
      'Dry-eye consult',
    ],
    faqs: [
      {
        q: 'Can I get a prescription for glasses from the visit?',
        a: 'Yes — the refraction result and any prescription are typed and saved to your profile, printable anytime.',
      },
      FAQ_FEE,
      FAQ_BOOK,
    ],
    photo: '/website/photos/spec-eye.jpg',
    photoAlt: 'Eye examination equipment in a clinic',
    related: ['general-physician', 'neurologist'],
  },
  {
    slug: 'orthopedist',
    displayName: 'Orthopedist',
    synonyms: ['Orthopedics'],
    description:
      'Knee pain, back pain, joint injury — book an Orthopedist near you on Aturseva: real fees, live queues, token on WhatsApp.',
    symptoms: [
      'Knee pain',
      'Back pain',
      'Neck pain',
      'Joint swelling',
      'Sports injury',
      'Fracture follow-up',
    ],
    expect: [
      {
        title: 'Movement examined, not guessed',
        text: 'The doctor checks the joint’s range and gait — old X-rays you bring go straight into the chart.',
      },
      EXPECT_SHARED_2,
      EXPECT_SHARED_3,
    ],
    procedures: [
      'Joint & mobility review',
      'X-ray ordering',
      'Fracture follow-up',
      'Physiotherapy plan',
      'Arthritis management',
      'Sports injury assessment',
    ],
    faqs: [
      {
        q: 'Will I be pushed toward surgery?',
        a: 'No — most ortho problems resolve with medicine, physiotherapy, and time. Surgery is advised only when it is genuinely the better path, and the decision stays yours.',
      },
      FAQ_FEE,
      FAQ_BOOK,
    ],
    photo: '/website/photos/spec-ortho.jpg',
    photoAlt: 'Physiotherapist examining a patient’s knee',
    related: ['general-physician', 'neurologist'],
  },
  {
    slug: 'ent',
    displayName: 'ENT',
    synonyms: ['ENT', 'ENT Specialist'],
    description:
      'Ear pain, sore throat, blocked nose — book an ENT doctor near you on Aturseva: real fees, live queues, token on WhatsApp.',
    symptoms: [
      'Ear pain',
      'Sore throat',
      'Blocked nose',
      'Sinus headache',
      'Snoring',
      'Hearing loss',
    ],
    expect: [
      {
        title: 'Ear, nose, throat — looked properly',
        text: 'Headlight exam of ear canal and throat — the small, uncomfortable queues of an ENT clinic are skipped entirely.',
      },
      EXPECT_SHARED_2,
      EXPECT_SHARED_3,
    ],
    procedures: [
      'Ear wax & pain review',
      'Throat examination',
      'Sinus assessment',
      'Nasal endoscopy review',
      'Hearing test',
      'Snoring & sleep review',
    ],
    faqs: [
      {
        q: 'My child has recurrent ear pain — is this the right doctor?',
        a: 'Yes — recurrent ear pain in children is a core ENT problem. Bring the child’s history of episodes; the chart keeps the pattern.',
      },
      FAQ_FEE,
      FAQ_BOOK,
    ],
    photo: '/website/photos/spec-ent.jpg',
    photoAlt: 'Doctor performing an ear examination',
    related: ['pediatrician', 'general-physician'],
  },
  {
    slug: 'gastroenterologist',
    displayName: 'Gastroenterologist',
    synonyms: ['Gastroenterologist', 'Gastroenterology'],
    description:
      'Acidity, abdominal pain, bloating, jaundice — book a Gastroenterologist near you on Aturseva: real fees, live queues, token on WhatsApp.',
    symptoms: [
      'Acidity',
      'Abdominal pain',
      'Bloating',
      'Constipation',
      'Loose motions',
      'Jaundice',
    ],
    expect: [
      {
        title: 'Diet and pattern history',
        text: 'What you eat, when it hurts, how long — the doctor maps the pattern before ordering anything.',
      },
      EXPECT_SHARED_2,
      EXPECT_SHARED_3,
    ],
    procedures: [
      'Liver function panel',
      'Acidity & reflux assessment',
      'Ulcer review',
      'Hepatitis screening',
      'Endoscopy consult',
      'IBS management',
    ],
    faqs: [
      {
        q: 'Will I need a scope test at the first visit?',
        a: 'Not usually — most acidity and bowel problems start with medicine and a diet plan. A scope is advised only when the history says it will change the plan.',
      },
      FAQ_FEE,
      FAQ_BOOK,
    ],
    photo: '/website/photos/offering-lab.jpg',
    photoAlt: 'Laboratory test samples for digestive health',
    related: ['general-physician', 'urologist'],
  },
  {
    slug: 'gynecologist',
    displayName: 'Gynecologist',
    synonyms: ['Gynecologist', 'Gynecology'],
    description:
      'Period problems, pregnancy care, fertility questions — book a Gynecologist near you on Aturseva: real fees, live queues, token on WhatsApp.',
    symptoms: [
      'Irregular periods',
      'Period pain',
      'Pregnancy care',
      'White discharge',
      'Menopause',
      'Fertility questions',
    ],
    expect: [
      {
        title: 'A private, unhurried history',
        text: 'Cycle history, symptoms, and concerns — taken properly, without the corridor-audience of a busy OPD.',
      },
      EXPECT_SHARED_2,
      EXPECT_SHARED_3,
    ],
    procedures: [
      'Cycle review',
      'Antenatal (pregnancy) check-up',
      'Ultrasound review',
      'PCOS assessment',
      'Menopause consult',
      'Fertility consult',
    ],
    faqs: [
      {
        q: 'Is the booking and token private?',
        a: 'Yes — your booking, history, and token stay in your account. The WhatsApp status goes only to your own number.',
      },
      FAQ_FEE,
      FAQ_BOOK,
    ],
    photo: '/website/photos/spec-gyn.jpg',
    photoAlt: 'Two women in a doctor’s consultation room',
    related: ['general-physician', 'pediatrician'],
  },
  {
    slug: 'urologist',
    displayName: 'Urologist',
    synonyms: ['Urologist', 'Urology'],
    description:
      'Burning urination, kidney stone, urinary issues — book a Urologist near you on Aturseva: real fees, live queues, token on WhatsApp.',
    symptoms: [
      'Burning urination',
      'Kidney stone',
      'Blood in urine',
      'Urine urgency',
      'Prostate concerns',
      'Male fertility',
    ],
    expect: [
      {
        title: 'Symptom pattern mapped',
        text: 'When it burns, how often, stone history — the doctor maps it before any scan.',
      },
      EXPECT_SHARED_2,
      EXPECT_SHARED_3,
    ],
    procedures: [
      'Kidney stone assessment',
      'Urine infection panel',
      'Prostate review',
      'Ultrasound review',
      'Urinary flow review',
      'Male fertility consult',
    ],
    faqs: [
      {
        q: 'I had a kidney stone before — is this page for me?',
        a: 'Yes — stone recurrence is a core urology problem. Bring your old ultrasound or CT films; they go into your chart for comparison.',
      },
      FAQ_FEE,
      FAQ_BOOK,
    ],
    photo: '/website/photos/offering-surgeon.jpg',
    photoAlt: 'Surgeon reviewing a patient’s case',
    related: ['gastroenterologist', 'general-physician'],
  },
  {
    slug: 'psychiatrist',
    displayName: 'Psychiatrist',
    synonyms: ['Psychiatrist'],
    description:
      'Low mood, anxiety, sleep problems, stress — book a Psychiatrist near you on Aturseva: real fees, live queues, token on WhatsApp.',
    symptoms: [
      'Low mood',
      'Anxiety',
      'Sleep problems',
      'Stress',
      'Panic attacks',
      'Concentration',
    ],
    expect: [
      {
        title: 'A calm, private conversation',
        text: 'You talk first — the doctor listens properly before any questionnaire or medicine.',
      },
      {
        title: 'A plan you understand',
        text: 'Medicine (if needed), sleep, and follow-up — written clearly, explained in your language.',
      },
      {
        title: 'Follow-ups that actually happen',
        text: 'The recall system gently brings you back on schedule — mental-health follow-ups are the whole game.',
      },
    ],
    procedures: [
      'Mood & anxiety assessment',
      'Sleep disorder review',
      'Stress management plan',
      'Medicine review',
      'Follow-up scheduling',
      'Counseling referral',
    ],
    faqs: [
      {
        q: 'Is my mental-health record private?',
        a: 'Yes — your history and prescriptions stay in your account. Nothing is shared with anyone, and the visit record is yours to export.',
      },
      FAQ_FEE,
      FAQ_BOOK,
    ],
    photo: '/website/photos/spec-psych.jpg',
    photoAlt: 'Calm consultation session between two people',
    related: ['neurologist', 'general-physician'],
  },
]

/** Lookup by slug — null when unknown (caller notFound()s). */
export function specialtyBySlug(slug: string): SpecialtyEntry | null {
  const s = decodeURIComponent(slug).toLowerCase().trim()
  return SPECIALTIES.find((e) => e.slug === s) ?? null
}

/** Find the registry entry a DB specialization value belongs to —
 * case-insensitive match on the synonyms (rail tiles use this). */
export function specialtyBySynonym(value: string): SpecialtyEntry | null {
  const v = value.toLowerCase().trim()
  if (!v) return null
  return SPECIALTIES.find((e) => e.synonyms.some((s) => s.toLowerCase() === v)) ?? null
}

/** Listing link for a specialty — comma-joined synonyms so the
 * /doctors listing shows every matching doctor (the API treats a
 * comma-separated specialization as an IN query since P4-C13). */
export function specialtyListingHref(entry: SpecialtyEntry): string {
  return `/doctors?specialization=${encodeURIComponent(entry.synonyms.join(','))}`
}
