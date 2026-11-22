/**
 * B7-P2 · DOCTOR TRUST DEPTH (S5 extension — public read-only wrappers).
 *
 * RatingTextureRows: consultation / wait time / staff averages — the
 * OUTPUT side of the B6 rate flow (patients rate these three after a
 * visit; future patients see the texture). Each row renders ONLY when
 * that dimension has real rated data (> 0) — an unrated dimension
 * NEVER renders, never drags a score down (the server's honest-
 * average law, mirrored client-side). Rows are LABELED (VLM law:
 * never a bare number).
 *
 * B15 · CONTENT DEPTH ZONES (the six served-but-dropped contract
 * fields, now rendered — every zone hide-if-empty ABSOLUTE):
 * StarDistributionRows: 1–5★ histogram, only when ≥2 distinct stars
 * have real counts (a single-star histogram just echoes the summary
 * line — redundant noise, suppressed).
 * ReviewRows: the latest patient reviews — star row, text (server caps
 * 240 chars, rendered in full), name honoring the patient's anonymity
 * choice, date. Rendered inside the ratings card.
 * ServicesZone: the doctor's curated services as quiet tags.
 * ProceduresZone: curated surgeries/procedures — name + note + where.
 * AwardsZone: parsed awards (adapter mirrors the website's semantics).
 * RelatedDoctorsZone: same-specialization doctors — cross-navigation
 * to another profile (44px rows, fee right-aligned tabular).
 *
 * DoctorPostsZone: the doctor's published posts — hide-if-empty
 * ABSOLUTE (no posts / fetch error = not even a heading renders).
 * Row = cover thumb (honesty-gated http(s) or none) + title +
 * labeled meta (type · N min read · date) + chevron. Tap opens
 * PostSheet — the task NEVER leaves the screen (doc 04 law 6).
 *
 * PostSheet: the reader. Body arrives as the server's sanitized HTML
 * and is stripped to PLAIN TEXT at the adapter — the app renders
 * text, never web markup. Skeleton while loading, honest error +
 * Try again (secondary zone: failure never blocks the profile).
 */

import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Award, ChevronRight, Star } from 'lucide-react-native'
import { radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { getBlogPost, type DoctorPost, type DoctorRatingTexture, type RelatedDoctor, type DoctorProcedure, type DoctorReview } from '@/lib/api'
import { useQuery } from '@/lib/use-query'
import { Chip } from '@/components/press'
import { BottomSheet, GrabHandle } from '@/components/sheets'
import { SkeletonBlock } from '@/components/skeleton'
import { Avatar } from '@/components/avatar'

// ————— Ratings sub-texture —————

const TEXTURE_ROWS: { key: 'consultation' | 'waitTime' | 'staff'; label: string }[] = [
  { key: 'consultation', label: 'Consultation' },
  { key: 'waitTime', label: 'Wait time' },
  { key: 'staff', label: 'Staff' },
]

export function RatingTextureRows({ texture }: { texture: DoctorRatingTexture }) {
  const c = useColors()
  const rows = TEXTURE_ROWS.filter((r) => texture[r.key] > 0)
  if (rows.length === 0) return null
  return (
    <View style={styles.textureCol}>
      <View style={[styles.textureDivider, { backgroundColor: c.hairline }]} />
      {rows.map((r) => (
        <View key={r.key} style={styles.textureRow}>
          <Text style={[styles.textureLabel, { color: c.body }]}>{r.label}</Text>
          <Text style={[styles.textureScore, { color: c.ink }]}>
            {texture[r.key].toFixed(1)} / 5
          </Text>
        </View>
      ))}
      <Text style={[styles.textureCaption, { color: c.mute }]}>
        Rated by {texture.ratedCount} {texture.ratedCount === 1 ? 'patient' : 'patients'} after their visits
      </Text>
    </View>
  )
}

// ————— B15 · Star histogram —————

/** Only ≥2 distinct nonzero stars render — a single-star histogram
 * echoes the summary line ("4.0 · 1 review") and would be noise. */
export function StarDistributionRows({ dist }: { dist: { star: number; count: number }[] }) {
  const c = useColors()
  if (dist.length < 2) return null
  return (
    <View style={styles.textureCol}>
      <View style={[styles.textureDivider, { backgroundColor: c.hairline }]} />
      {dist.map((row) => (
        <View key={row.star} style={styles.textureRow}>
          <Text style={[styles.textureLabel, { color: c.body }]}>{row.star}★</Text>
          <Text style={[styles.textureScore, { color: c.ink }]}>
            {row.count} {row.count === 1 ? 'rating' : 'ratings'}
          </Text>
        </View>
      ))}
    </View>
  )
}

// ————— B15 · Patient reviews —————

function StarRow({ star }: { star: number }) {
  const c = useColors()
  return (
    <View style={styles.starRow} accessibilityLabel={`${star} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          color={i <= star ? c.ink : c.mute}
          fill={i <= star ? c.ink : 'transparent'}
          strokeWidth={2}
        />
      ))}
    </View>
  )
}

function reviewMeta(r: DoctorReview): string {
  const date = r.createdAt
    ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''
  return [r.patientName, date].filter(Boolean).join(' · ')
}

export function ReviewRows({ reviews }: { reviews: DoctorReview[] }) {
  const c = useColors()
  if (reviews.length === 0) return null
  return (
    <View style={styles.reviewCol}>
      <View style={[styles.textureDivider, { backgroundColor: c.hairline }]} />
      {reviews.map((r) => (
        <View
          key={r.id}
          style={styles.reviewRow}
          accessibilityLabel={`Review by ${r.isAnonymous ? 'an anonymous patient' : r.patientName}: ${r.star} out of 5`}
        >
          <StarRow star={r.star} />
          {r.review ? <Text style={[styles.reviewText, { color: c.body }]}>{r.review}</Text> : null}
          <Text style={[styles.reviewMeta, { color: c.mute }]} numberOfLines={1}>
            {reviewMeta(r)}
          </Text>
        </View>
      ))}
    </View>
  )
}

// ————— B15 · Curated services —————

export function ServicesZone({ services }: { services: string[] }) {
  const c = useColors()
  if (services.length === 0) return null
  return (
    <View>
      <Text style={[styles.zoneTitle, { color: c.ink }]}>Services</Text>
      <View style={styles.tagsWrap}>
        {services.map((s) => (
          <View key={s} style={[styles.tag, { backgroundColor: c.canvasSoft }]}>
            <Text style={[styles.tagText, { color: c.body }]} numberOfLines={1}>
              {s}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// ————— B15 · Surgeries & procedures —————

export function ProceduresZone({ procedures }: { procedures: DoctorProcedure[] }) {
  const c = useColors()
  if (procedures.length === 0) return null
  return (
    <View>
      <Text style={[styles.zoneTitle, { color: c.ink }]}>Surgeries & procedures</Text>
      <View style={[styles.postsCard, { borderColor: c.hairline }]}>
        {procedures.map((p, i) => (
          <View
            key={`${p.name}-${i}`}
            style={[styles.procedureRow, i < procedures.length - 1 ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.hairline } : null]}
          >
            <View style={styles.procedureCol}>
              <Text style={[styles.procedureName, { color: c.ink }]} numberOfLines={2}>
                {p.name}
              </Text>
              {[p.note, p.at ? `at ${p.at}` : ''].filter(Boolean).length > 0 ? (
                <Text style={[styles.procedureMeta, { color: c.mute }]} numberOfLines={2}>
                  {[p.note, p.at ? `at ${p.at}` : ''].filter(Boolean).join(' · ')}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

// ————— B15 · Awards & recognition —————

export function AwardsZone({ awards }: { awards: string[] }) {
  const c = useColors()
  if (awards.length === 0) return null
  return (
    <View>
      <Text style={[styles.zoneTitle, { color: c.ink }]}>Awards & recognition</Text>
      <View style={[styles.postsCard, { borderColor: c.hairline }]}>
        {awards.map((a, i) => (
          <View key={`${a.slice(0, 40)}-${i}`} style={styles.awardRow}>
            <Award size={16} color={c.ink} strokeWidth={2} />
            <Text style={[styles.awardText, { color: c.body }]}>{a}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// ————— B15 · Similar doctors —————

export function RelatedDoctorsZone({
  doctors,
  onOpen,
}: {
  doctors: RelatedDoctor[]
  onOpen: (id: string) => void
}) {
  const c = useColors()
  if (doctors.length === 0) return null
  return (
    <View>
      <Text style={[styles.zoneTitle, { color: c.ink }]}>Similar doctors</Text>
      <View style={[styles.postsCard, { borderColor: c.hairline }]}>
        {doctors.map((d) => (
          <Pressable
            key={d.id}
            onPress={() => onOpen(d.id)}
            accessibilityRole="button"
            accessibilityLabel={`View ${d.name}, ${d.specialization}`}
            style={({ pressed }) => [styles.relatedRow, pressed && { opacity: 0.85 }]}
          >
            {d.photo ? (
              <Image
                source={{ uri: d.photo }}
                style={[styles.relatedPhoto, { backgroundColor: c.canvasSoft }]}
                accessibilityLabel={
                  d.photoRepresentative ? `${d.name} — representative photo` : `${d.name} photo`
                }
              />
            ) : (
              <Avatar name={d.name} size={44} />
            )}
            <View style={styles.relatedCol}>
              <Text style={[styles.relatedName, { color: c.ink }]} numberOfLines={1}>
                {d.name}
              </Text>
              <Text style={[styles.relatedMeta, { color: c.mute }]} numberOfLines={1}>
                {[d.specialization, d.city].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <Text style={[styles.relatedFee, { color: c.ink }]}>₹{d.fees.toLocaleString('en-IN')}</Text>
            <ChevronRight size={18} color={c.mute} strokeWidth={2} />
          </Pressable>
        ))}
      </View>
    </View>
  )
}

// ————— Published posts zone —————

export function DoctorPostsZone({
  posts,
  onOpen,
}: {
  posts: DoctorPost[]
  onOpen: (post: DoctorPost) => void
}) {
  const c = useColors()
  if (posts.length === 0) return null
  return (
    <View>
      <Text style={[styles.zoneTitle, { color: c.ink }]}>Health tips</Text>
      <View style={[styles.postsCard, { borderColor: c.hairline }]}>
        {posts.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => onOpen(p)}
            accessibilityRole="button"
            accessibilityLabel={`Read health tip: ${p.title}`}
            style={({ pressed }) => [styles.postRow, pressed && { opacity: 0.85 }]}
          >
            {p.image ? (
              <Image
                source={{ uri: p.image }}
                style={[styles.postThumb, { backgroundColor: c.canvasSoft }]}
                accessibilityLabel={`Cover image for: ${p.title}`}
              />
            ) : null}
            <View style={styles.postCol}>
              <Text style={[styles.postTitle, { color: c.ink }]} numberOfLines={2}>
                {p.title}
              </Text>
              <Text style={[styles.postMeta, { color: c.mute }]} numberOfLines={1}>
                {postMeta(p)}
              </Text>
            </View>
            <ChevronRight size={18} color={c.mute} strokeWidth={2} />
          </Pressable>
        ))}
      </View>
    </View>
  )
}

function postMeta(p: DoctorPost): string {
  const date = p.createdAt
    ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : ''
  return [p.type, `${p.readMinutes} min read`, date].filter(Boolean).join(' · ')
}

// ————— Post reader sheet —————

export function PostSheet({
  post,
  onClose,
}: {
  post: DoctorPost | null
  onClose: () => void
}) {
  const c = useColors()
  const q = useQuery(
    post ? `blog-post:${post.permalink}` : 'blog-post:none',
    () => getBlogPost(post ? post.permalink : ''),
    { staleTime: 600_000 },
  )
  const detail = q.data

  return (
    <BottomSheet visible={post !== null} onClose={onClose} accessibilityLabel="Read health tip">
      <GrabHandle />
      {post ? (
        <View>
          <Text style={[styles.sheetTitle, { color: c.ink }]} numberOfLines={2}>
            {post.title}
          </Text>
          <Text style={[styles.sheetMeta, { color: c.mute }]} numberOfLines={1}>
            {[
              detail ? detail.authorName : '',
              post.type,
              `${post.readMinutes} min read`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>

          {q.loading && !detail ? (
            <View style={styles.sheetSkeleton}>
              <SkeletonBlock width="90%" height={12} />
              <SkeletonBlock width="100%" height={12} />
              <SkeletonBlock width="70%" height={12} />
              <SkeletonBlock width="85%" height={12} />
              <SkeletonBlock width="50%" height={12} />
              <SkeletonBlock width="95%" height={12} />
            </View>
          ) : detail ? (
            <ScrollView style={styles.sheetTextScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.sheetText, { color: c.body }]}>{detail.text}</Text>
              <View style={styles.sheetDoneRow}>
                <Chip label="Close" onPress={onClose} />
              </View>
            </ScrollView>
          ) : (
            <View style={styles.sheetErrorWrap}>
              <Text style={[styles.sheetErrTitle, { color: c.ink }]}>Could not open this tip.</Text>
              <Text style={[styles.sheetErrCap, { color: c.mute }]}>
                Check your connection and try again.
              </Text>
              <View style={styles.sheetDoneRow}>
                <Chip label="Try again" onPress={q.refresh} />
              </View>
            </View>
          )}
        </View>
      ) : null}
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  textureCol: {
    marginTop: space.s8,
    gap: space.s8,
  },
  textureDivider: {
    height: StyleSheet.hairlineWidth,
  },
  textureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    minHeight: TOUCH - 20,
  },
  textureLabel: {
    ...typo.body,
  },
  textureScore: {
    ...typo.bodyStrong,
    fontVariant: ['tabular-nums'],
  },
  textureCaption: {
    ...typo.caption,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewCol: {
    marginTop: space.s8,
    gap: space.s12,
  },
  reviewRow: {
    gap: 4,
  },
  reviewText: {
    ...typo.body,
  },
  reviewMeta: {
    ...typo.caption,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.s8,
    marginHorizontal: space.s16,
  },
  tag: {
    borderRadius: radius.pill,
    paddingHorizontal: space.s12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  tagText: {
    ...typo.caption,
  },
  procedureRow: {
    padding: space.s8,
    paddingVertical: space.s12,
  },
  procedureCol: {
    gap: 3,
  },
  procedureName: {
    ...typo.body,
    fontWeight: '600',
  },
  procedureMeta: {
    ...typo.caption,
  },
  awardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.s8,
    padding: space.s8,
    paddingVertical: space.s12,
  },
  awardText: {
    ...typo.body,
    flex: 1,
  },
  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    padding: space.s8,
    minHeight: TOUCH,
    borderRadius: radius.input,
  },
  relatedPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  relatedCol: {
    flex: 1,
    gap: 3,
  },
  relatedName: {
    ...typo.body,
    fontWeight: '600',
  },
  relatedMeta: {
    ...typo.caption,
  },
  relatedFee: {
    ...typo.bodyStrong,
    fontVariant: ['tabular-nums'],
  },
  zoneTitle: {
    ...typo.bodyStrong,
    marginHorizontal: space.s16,
    marginTop: space.s24,
    marginBottom: space.s8,
  },
  postsCard: {
    marginHorizontal: space.s16,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.s8,
  },
  postRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    padding: space.s8,
    minHeight: TOUCH,
    borderRadius: radius.input,
  },
  postThumb: {
    width: 56,
    height: 56,
    borderRadius: radius.card,
  },
  postCol: {
    flex: 1,
    gap: 3,
  },
  postTitle: {
    ...typo.body,
    fontWeight: '600',
  },
  postMeta: {
    ...typo.caption,
  },
  sheetTitle: {
    ...typo.title,
    marginBottom: 4,
  },
  sheetMeta: {
    ...typo.caption,
    marginBottom: space.s8,
  },
  sheetSkeleton: {
    marginTop: space.s12,
    gap: space.s8,
  },
  sheetTextScroll: {
    marginTop: space.s8,
    maxHeight: 420,
  },
  sheetText: {
    ...typo.body,
    lineHeight: 24,
  },
  sheetDoneRow: {
    marginTop: space.s16,
    marginBottom: space.s8,
    alignItems: 'center',
  },
  sheetErrorWrap: {
    marginTop: space.s12,
    alignItems: 'center',
    gap: space.s8,
    paddingVertical: space.s12,
  },
  sheetErrTitle: {
    ...typo.bodyStrong,
    textAlign: 'center',
  },
  sheetErrCap: {
    ...typo.caption,
    textAlign: 'center',
  },
})
