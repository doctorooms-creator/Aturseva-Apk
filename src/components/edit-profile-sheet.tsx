/**
 * EDIT PROFILE SHEET (APK-B9 — the B5-era deferred item, now real):
 * the profile tab's account-card edit door.
 *
 * Laws:
 * - Full-triple PUT: name · mobileNo · gender are ALWAYS sent together
 *   (the monolith's route defaults a missing gender to 'Male' and an
 *   omitted mobile to '' — a partial body would silently rewrite both;
 *   the adapter documents the trap, this sheet is the disciplined caller).
 * - Minimality: exactly the three editable fields the API owns. Email is
 *   identity — read-only (shown as the quiet anchor line, never editable).
 * - The mobile caption states the identity law where it matters: bookings
 *   resolve patients BY MOBILE (B8 discovery) — the number is not cosmetic.
 * - Empty mobile = an explicit clear (server stores ''), said out loud in
 *   the caption, never silent.
 * - Honest server answers verbatim ("Name is required") + one-tap retry by
 *   staying open; double-tap guard + loading-in-place (doc 03 §5).
 * - Saved → parent owns the follow-through: setUser card, persist the
 *   snapshot, close — one callback, no shared state.
 * - Theme-aware from birth (useColors — no light-only styles).
 */

import { useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { ApiError, updatePatientProfile, type AuthUser, type Gender } from '@/lib/api'
import { BottomSheet, GrabHandle } from '@/components/sheets'
import { Chip, PillButton } from '@/components/press'

const PHONE_RE = /^[6-9]\d{9}$/

const GENDERS: Gender[] = ['Male', 'Female', 'Other']

/** Normalizes whatever /me or the snapshot holds into the sheet's
 *  vocabulary — null/unknown genders degrade to no selection (the
 *  user picks; we never push 'Male' silently, the server's default
 *  stays the server's business, not ours). */
function pickGender(g: string | null): Gender | null {
  return GENDERS.includes(g as Gender) ? (g as Gender) : null
}

export function EditProfileSheet({
  visible,
  user,
  onClose,
  onSaved,
}: {
  visible: boolean
  user: AuthUser
  onClose: () => void
  onSaved: (user: AuthUser) => void
}) {
  const c = useColors()

  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [gender, setGender] = useState<Gender | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState('')
  const [serverError, setServerError] = useState('')

  // Re-seed from the live user every time the sheet opens — edits from a
  // previous open are never kept half-typed across opens (password-grade
  // freshness for identity fields; the cheap kindness of AuthSheet's
  // half-typed retention does not apply to an identity the server owns).
  // Microtask barrier: the async read never flips state synchronously
  // inside the effect body (cascading-render law — same as profile boot).
  useEffect(() => {
    if (!visible) return
    void (async () => {
      await null
      setName(user.name ?? '')
      setMobile(user.mobile ?? '')
      setGender(pickGender(user.gender))
      setFieldError('')
      setServerError('')
    })()
  }, [visible, user])

  const submit = async () => {
    if (submitting) return // double-tap guard
    if (!name.trim()) {
      setFieldError('Please tell us your name.')
      return
    }
    if (mobile && !PHONE_RE.test(mobile)) {
      setFieldError('Enter a valid 10-digit Indian mobile number — or clear the field.')
      return
    }
    if (!gender) {
      setFieldError('Please pick one — Male, Female or Other.')
      return
    }
    setSubmitting(true)
    setFieldError('')
    setServerError('')
    try {
      const saved = await updatePatientProfile({
        name: name.trim(),
        mobileNo: mobile,
        gender,
      })
      onSaved(saved)
    } catch (err) {
      if (err instanceof ApiError) setServerError(err.message)
      else setServerError('Network problem — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Edit profile">
      <GrabHandle />
      <Text style={[styles.title, { color: c.ink }]}>Edit profile</Text>
      <Text style={[styles.caption, { color: c.body }]} numberOfLines={1}>
        {user.email}
      </Text>

      <Text style={[styles.fieldTitle, { color: c.ink }]}>Full name</Text>
      <TextInput
        value={name}
        onChangeText={(v) => {
          setName(v)
          setFieldError('')
          setServerError('')
        }}
        placeholder="Your name"
        placeholderTextColor={c.mute}
        autoCorrect={false}
        autoCapitalize="words"
        underlineColorAndroid="transparent"
        accessibilityLabel="Full name"
        style={[styles.input, { color: c.ink, borderColor: c.hairline }]}
      />

      <Text style={[styles.fieldTitle, { color: c.ink }]}>Mobile number</Text>
      <TextInput
        value={mobile}
        onChangeText={(v) => {
          setMobile(v.replace(/\D/g, '').slice(0, 10))
          setFieldError('')
          setServerError('')
        }}
        placeholder="10-digit Indian mobile"
        placeholderTextColor={c.mute}
        keyboardType="phone-pad"
        maxLength={10}
        autoCorrect={false}
        underlineColorAndroid="transparent"
        accessibilityLabel="Mobile number"
        style={[styles.input, styles.numeric, { color: c.ink, borderColor: c.hairline }]}
      />
      <Text style={[styles.fieldCaption, { color: c.mute }]}>
        Bookings find your account by this number. Empty removes it.
      </Text>

      <Text style={[styles.fieldTitle, { color: c.ink }]}>Gender</Text>
      <View style={styles.genderRow}>
        {GENDERS.map((g) => (
          <Chip
            key={g}
            label={g}
            selected={gender === g}
            onPress={() => {
              setGender(g)
              setFieldError('')
            }}
          />
        ))}
      </View>

      {fieldError ? <Text style={[styles.fieldError, { color: c.error }]}>{fieldError}</Text> : null}

      {serverError ? (
        <View style={[styles.serverErrorCard, { backgroundColor: c.errorSoft }]}>
          <Text style={[styles.serverErrorText, { color: c.error }]}>{serverError}</Text>
        </View>
      ) : null}

      <View style={styles.ctaRow}>
        <PillButton
          label="Save changes"
          variant="primary"
          height={52}
          loading={submitting}
          onPress={() => void submit()}
        />
      </View>
      <Text style={[styles.footnote, { color: c.mute }]}>
        Same profile as the web app — saved everywhere at once.
      </Text>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  title: {
    ...typo.title,
    paddingHorizontal: space.s4,
  },
  caption: {
    ...typo.caption,
    marginTop: 2,
    paddingHorizontal: space.s4,
    marginBottom: space.s12,
  },
  fieldTitle: {
    ...typo.bodyStrong,
    fontSize: 13,
    marginBottom: space.s8,
    paddingHorizontal: space.s4,
  },
  fieldCaption: {
    ...typo.caption,
    marginTop: -space.s4,
    marginBottom: space.s8,
    paddingHorizontal: space.s4,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.input,
    minHeight: TOUCH + 8,
    paddingHorizontal: space.s16,
    paddingVertical: space.s8,
    marginBottom: space.s12,
    marginHorizontal: space.s4,
  },
  numeric: {
    fontVariant: ['tabular-nums'],
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.s8,
    marginBottom: space.s12,
    paddingHorizontal: space.s4,
  },
  fieldError: {
    ...typo.caption,
    marginBottom: space.s8,
    paddingHorizontal: space.s4,
    fontWeight: '600',
  },
  serverErrorCard: {
    borderRadius: radius.card,
    padding: space.s12,
    marginBottom: space.s12,
    marginHorizontal: space.s4,
  },
  serverErrorText: {
    ...typo.body,
    fontWeight: '500',
  },
  ctaRow: {
    marginTop: space.s8,
  },
  footnote: {
    ...typo.caption,
    textAlign: 'center',
    marginTop: space.s12,
  },
})
