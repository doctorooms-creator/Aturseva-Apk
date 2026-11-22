/**
 * ATURSEVA APP — Doctor Photo Provisioning (H1 port of the website's
 * src/lib/website/doctor-photo.ts, owner directive 2026-11-16 → app
 * directive 2026-11-22 docs 16/17).
 *
 * The app shows a curated Indian doctor portrait until the doctor uploads
 * their real photo via the HMS profile upload (User.profileImg) — the
 * moment a real photo exists it wins automatically. Presentation-only,
 * zero writes to the HMS (zero-touch law).
 *
 * Assignment is DETERMINISTIC (id-hash → stable face per doctor) and
 * GENDER-AWARE (API gender first, Indian-name inference second, mixed
 * pool last). Faces are the WEBSITE's own VLM-QA'd set (2026-11-15) —
 * served from the same origin the app already talks to (verified 200,
 * image/jpeg). No binaries bundle into the OTA payload.
 *
 * Honesty law: curated faces are placeholders, never "the doctor's real
 * photo" — surfaces that show them carry the "Representative photo"
 * label (alt/caption). Returns SITE-RELATIVE paths; the API adapter
 * resolves them against API_BASE (this module stays dependency-free —
 * api.ts never imports back, no cycle).
 */

const FACE_DIR = '/website/photos/faces'

export const MALE_FACES = [
  'face-m1',
  'face-m2',
  'face-m3',
  'face-m4',
  // face-m5 REMOVED app-side (H1 VLM catch): the asset carries a ~4%
  // black letterbox bar at the bottom (measured rows 460–479 avg 0–20
  // luminance) — invisible at the website's 48px avatars, visible at the
  // app's 96px profile hero. Re-add when the web-repo asset is fixed
  // (source fix = separate web GO; 10 clean faces remain, deterministic
  // assignment stays stable per doctor id).
] as const

export const FEMALE_FACES = [
  'face-f1',
  'face-f2',
  'face-f3',
  'face-f4',
  'face-f5',
  'face-f6',
] as const

/* ------------------------------------------------------------------ */
/* Gender inference from Indian given names.                           */
/* Curated against the live network's actual doctor names (90 rows) +  */
/* common Indian given names. Suffix rules handle Gujarati/Hindi       */
/* conventions (-ben, -bhai, -kumari, -devi). Unknown → null → mixed.  */
/* ------------------------------------------------------------------ */

const FEMALE_GIVEN_NAMES = new Set([
  'aarti', 'aditi', 'alpana', 'amrita', 'anita', 'anjali', 'ananya', 'asha',
  'asmita', 'bhavna', 'chhaya', 'deepa', 'deepti', 'dhara', 'divya', 'gauri',
  'gayatri', 'geeta', 'hetal', 'isha', 'jigna', 'kajal', 'kamla',
  'kanchan', 'kavita', 'kavitha', 'kinnari', 'kiran', 'kinjal', 'komal',
  'kruti', 'lalita', 'madhuri', 'meera', 'mridula', 'neelam', 'neha', 'nidhi',
  'nisha', 'nirali', 'nita', 'pallavi', 'parul', 'payal', 'poonam', 'pooja',
  'prachi', 'priti', 'priya', 'priyanka', 'radha', 'ragini', 'rekha', 'ria',
  'riddhi', 'ritu', 'sadhana', 'sangeeta', 'sanskriti', 'savitri', 'seema',
  'shailja', 'shalini', 'shikha', 'shraddha', 'shruti', 'simran', 'sneha',
  'sonal', 'snehal', 'subhadra', 'suman', 'sumanlata', 'sunita', 'supriya',
  'swara', 'swati', 'tanvi', 'tara', 'tejal', 'usha', 'vanita', 'vaishali',
  'vidhi', 'vidya', 'vijaya', 'yamini', 'zeel',
])

const MALE_GIVEN_NAMES = new Set([
  'aaditya', 'abhay', 'abhishek', 'aditya', 'akhil', 'amit', 'amol', 'amrish',
  'anand', 'ankit', 'anil', 'anshuman', 'anupam', 'arjav', 'arnav', 'arun',
  'arvind', 'ashish', 'ashok', 'atul', 'avinash', 'badri', 'bhargav',
  'bharat', 'chandrashekhar', 'chirag', 'darshan', 'dattatray', 'deepak',
  'devang', 'devendra', 'dhruv', 'dinesh', 'gagan', 'gaurav', 'girish',
  'giriraj', 'harsh', 'harshad', 'hitesh', 'ishan', 'jagdish', 'jatin',
  'jay', 'jayesh', 'jignesh', 'kalpesh', 'kapil', 'kartik', 'kaushik',
  'keyur', 'kiranbhai', 'krunal', 'kunal', 'laukik', 'madhav', 'mahesh',
  'manan', 'manish', 'mayank', 'mihir', 'milind', 'mohan', 'mukesh',
  'narendra', 'navin', 'nilesh', 'nirav', 'nitin', 'nimesh', 'om', 'parth',
  'paresh', 'piyush', 'prabal', 'prakash', 'pranav', 'prasad', 'pratap',
  'prathamesh', 'praveen', 'pravin', 'prem', 'rahul', 'raj', 'rajan',
  'rajat', 'rajendra', 'rajesh', 'rajiv', 'rakesh', 'rakshit', 'raman',
  'ranjan', 'ratan', 'ravindra', 'rishi', 'rohit', 'ronak', 'sachin',
  'sagar', 'samir', 'sandip', 'sanket', 'sanjay', 'sarthak', 'shankar',
  'shantanu', 'shailesh', 'shashank', 'shravan', 'shyam', 'siddharth',
  'soham', 'sridhar', 'srinivas', 'subhash', 'sudarshan', 'sudhir', 'sujay',
  'sukesh', 'sumit', 'sunil', 'suresh', 'surya', 'swapnil', 'tarun',
  'tejas', 'tushar', 'udit', 'ujjal', 'umang', 'urvish', 'utsav', 'vamshi',
  'varun', 'vasudev', 'vedant', 'vibhav', 'vikas', 'vikram', 'vimal',
  'vinay', 'vinod', 'vishal', 'vishnu', 'vivek', 'yash', 'yogesh', 'yugal',
])

const FEMALE_SUFFIXES = ['ben', 'kumari', 'devi', 'bahu']
const MALE_SUFFIXES = ['bhai', 'bhaiya', 'kumar', 'prasad', 'dada']

function tokensOf(name: string): string[] {
  return name
    .replace(/^dr\.?\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
}

/**
 * Infer 'M' | 'F' | null from an Indian doctor name.
 * Order: curated given-name set (first matching token) → Gujarati/Hindi
 * suffix rules → null (unknown).
 */
export function inferGenderFromName(name: string): 'M' | 'F' | null {
  if (!name) return null
  const tokens = tokensOf(name)
  if (tokens.length === 0) return null

  // 1) given-name dictionary (strongest signal)
  for (const t of tokens.slice(0, 2)) {
    if (FEMALE_GIVEN_NAMES.has(t)) return 'F'
    if (MALE_GIVEN_NAMES.has(t)) return 'M'
  }

  // 2) suffix conventions (last token)
  const last = tokens[tokens.length - 1]
  for (const s of FEMALE_SUFFIXES) if (last === s) return 'F'
  for (const s of MALE_SUFFIXES) if (last === s) return 'M'

  return null
}

/** Normalize API gender values ('Male'/'Female'/'male'/'F'…) to 'M'/'F'. */
export function normalizeGender(raw: string | null | undefined): 'M' | 'F' | null {
  if (!raw) return null
  const g = raw.trim().toLowerCase()
  if (g === 'male' || g === 'm') return 'M'
  if (g === 'female' || g === 'f') return 'F'
  return null
}

/* ------------------------------------------------------------------ */
/* Deterministic face assignment                                       */
/* ------------------------------------------------------------------ */

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/**
 * Resolve the photo to display for a doctor:
 *   1. real HMS photo (profileImg present and not the default placeholder)
 *   2. curated Indian doctor portrait — deterministic per doctor id
 *      (gender-aware; unknown gender → mixed pool)
 *
 * Returns `{ src, curated: true }` for the curated layer, `{ src, curated:
 * false }` for a real HMS photo, or null when nothing applies (caller falls
 * back to initials). `src` is SITE-RELATIVE (or the doctor's own absolute
 * URL) — the API adapter resolves it against API_BASE.
 */
export function doctorPhoto(args: {
  id: string
  name: string
  profileImg?: string | null
  gender?: string | null
}): { src: string; curated: boolean } | null {
  const real = args.profileImg?.trim()
  if (real && real !== 'default.png') {
    return {
      src: real.startsWith('http') ? real : `/${real.replace(/^\//, '')}`,
      curated: false,
    }
  }

  const gender = normalizeGender(args.gender) ?? inferGenderFromName(args.name)
  const pool =
    gender === 'F'
      ? FEMALE_FACES
      : gender === 'M'
        ? MALE_FACES
        : [...MALE_FACES, ...FEMALE_FACES]
  const face = pool[hashId(args.id) % pool.length]
  return { src: `${FACE_DIR}/${face}.jpg`, curated: true }
}

/** Alt text for the doctor's displayed photo (curated or real). */
export function photoAlt(name: string, curated: boolean): string {
  return curated
    ? `Representative photo — ${name} updates their own photo soon`
    : `Photo of ${name}`
}
