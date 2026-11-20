/**
 * AUTH SHEET (APK-B4 — doc 06 S-Profile): the profile tab's sign-in door.
 *
 * Two modes in one sheet (segmented toggle): Sign in · Create account.
 *
 * Laws:
 * - Guest-first stays true: the sheet opens ONLY when the user asks for it
 *   (booking never requires an account — S7 guest flow unchanged).
 * - Minimality: sign-in asks email + password ONLY; create-account asks
 *   name · mobile · email · password — nothing more (no OTP, no referral).
 * - Honest server answers verbatim (Invalid email or password / account
 *   locked / email-already-exists / check-your-email-to-verify) — never a
 *   silent fail; one-tap retry by staying open.
 * - Double-tap guard + loading-in-place (doc 03 §5).
 * - Create-account success does NOT auto-sign-in (email verification may be
 *   required server-side) — the honest message shows, then the sheet offers
 *   the sign-in form with the email prefilled.
 * - Theme-aware from birth (useColors — no light-only styles).
 */

import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { Check } from 'lucide-react-native'
import { radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'
import { ApiError, login, registerPatient, type AuthUser } from '@/lib/api'
import { saveSession } from '@/lib/auth'
import { BottomSheet, GrabHandle } from '@/components/sheets'
import { Chip, PillButton } from '@/components/press'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[6-9]\d{9}$/

export function AuthSheet({
  visible,
  onClose,
  onSignedIn,
}: {
  visible: boolean
  onClose: () => void
  onSignedIn: (user: AuthUser) => void
}) {
  const c = useColors()
  const [mode, setMode] = useState<'signin' | 'register'>('signin')

  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState('')
  const [serverError, setServerError] = useState('')
  /** Create-account's honest success message (server-verbatim). */
  const [registered, setRegistered] = useState('')

  const resetErrors = () => {
    setFieldError('')
    setServerError('')
  }

  const switchMode = (m: 'signin' | 'register') => {
    setMode(m)
    resetErrors()
  }

  const close = () => {
    // Keep half-typed values for a re-open (kind, and cheap) — but never
    // keep a password in state after the sheet closes.
    setPassword('')
    resetErrors()
    onClose()
  }

  const submitSignIn = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setFieldError('Enter a valid email address.')
      return
    }
    if (!password) {
      setFieldError('Enter your password.')
      return
    }
    setSubmitting(true)
    resetErrors()
    try {
      const { user, token } = await login(email.trim(), password)
      await saveSession(token, user)
      setPassword('')
      onSignedIn(user)
    } catch (err) {
      // Honest server answers surface verbatim — lockouts, wrong
      // password, unverified email all arrive as plain messages.
      if (err instanceof ApiError) setServerError(err.message)
      else setServerError('Network problem — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const submitRegister = async () => {
    if (!name.trim()) {
      setFieldError('Please tell us your name.')
      return
    }
    if (!PHONE_RE.test(mobile)) {
      setFieldError('Enter a valid 10-digit Indian mobile number.')
      return
    }
    if (!EMAIL_RE.test(email.trim())) {
      setFieldError('Enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setFieldError('Password must be at least 6 characters.')
      return
    }
    setSubmitting(true)
    resetErrors()
    try {
      const message = await registerPatient({
        name: name.trim(),
        email: email.trim(),
        mobileNo: mobile,
        password,
      })
      // Honest outcome (verbatim): verify-email vs log-in-now. No
      // auto-sign-in — verification state is the server's truth.
      setRegistered(message)
      setPassword('')
    } catch (err) {
      if (err instanceof ApiError) setServerError(err.message)
      else setServerError('Network problem — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet visible={visible} onClose={close} accessibilityLabel="Sign in or create account">
      <GrabHandle />

      {registered ? (
        <View style={styles.registeredWrap}>
          <View style={[styles.registeredIcon, { backgroundColor: c.successSoft }]}>
            <Check size={20} color={c.success} strokeWidth={2.5} />
          </View>
          <Text style={[styles.registeredTitle, { color: c.ink }]}>Account created</Text>
          <Text style={[styles.registeredText, { color: c.body }]}>{registered}</Text>
          <View style={styles.registeredActions}>
            <PillButton
              label="Sign in now"
              variant="primary"
              height={52}
              onPress={() => {
                setRegistered('')
                switchMode('signin')
              }}
            />
            <PillButton label="Close" variant="quiet" onPress={close} />
          </View>
        </View>
      ) : (
        <View>
          <Text style={[styles.title, { color: c.ink }]}>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Text>
          <Text style={[styles.caption, { color: c.body }]}>
            {mode === 'signin'
              ? 'Your bookings and tokens sync to your account.'
              : 'Booking also works as a guest — an account keeps your history in one place.'}
          </Text>

          {/* Mode toggle — two chips, the selected one is ink */}
          <View style={styles.modeRow}>
            <Chip label="Sign in" selected={mode === 'signin'} onPress={() => switchMode('signin')} />
            <Chip label="Create account" selected={mode === 'register'} onPress={() => switchMode('register')} />
          </View>

          {mode === 'register' ? (
            <>
              <Text style={[styles.fieldTitle, { color: c.ink }]}>Full name</Text>
              <TextInput
                value={name}
                onChangeText={(v) => {
                  setName(v)
                  resetErrors()
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
                  resetErrors()
                }}
                placeholder="10-digit Indian mobile"
                placeholderTextColor={c.mute}
                keyboardType="phone-pad"
                maxLength={10}
                autoCorrect={false}
                underlineColorAndroid="transparent"
                accessibilityLabel="Mobile number"
                style={[styles.input, { color: c.ink, borderColor: c.hairline }]}
              />
              <Text style={[styles.fieldCaption, { color: c.mute }]}>
                Your token and booking updates travel to this number.
              </Text>
            </>
          ) : null}

          <Text style={[styles.fieldTitle, { color: c.ink }]}>Email</Text>
          <TextInput
            value={email}
            onChangeText={(v) => {
              setEmail(v.trim())
              resetErrors()
            }}
            placeholder="you@example.com"
            placeholderTextColor={c.mute}
            keyboardType="email-address"
            autoCorrect={false}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            accessibilityLabel="Email address"
            style={[styles.input, { color: c.ink, borderColor: c.hairline }]}
          />

          <Text style={[styles.fieldTitle, { color: c.ink }]}>Password</Text>
          <TextInput
            value={password}
            onChangeText={(v) => {
              setPassword(v)
              resetErrors()
            }}
            placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
            placeholderTextColor={c.mute}
            secureTextEntry
            autoCorrect={false}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            accessibilityLabel="Password"
            style={[styles.input, { color: c.ink, borderColor: c.hairline }]}
          />

          {fieldError ? <Text style={[styles.fieldError, { color: c.error }]}>{fieldError}</Text> : null}

          {serverError ? (
            <View style={[styles.serverErrorCard, { backgroundColor: c.errorSoft }]}>
              <Text style={[styles.serverErrorText, { color: c.error }]}>{serverError}</Text>
            </View>
          ) : null}

          <View style={styles.ctaRow}>
            <PillButton
              label={mode === 'signin' ? 'Sign in' : 'Create account'}
              variant="primary"
              height={52}
              loading={submitting}
              onPress={() => {
                if (submitting) return // double-tap guard
                if (mode === 'signin') void submitSignIn()
                else void submitRegister()
              }}
            />
          </View>
          <Text style={[styles.footnote, { color: c.mute }]}>
            Sessions are 7-day and revocable. Sign out any time from Profile.
          </Text>
        </View>
      )}
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
  modeRow: {
    flexDirection: 'row',
    gap: space.s8,
    marginBottom: space.s16,
    paddingHorizontal: space.s4,
  },
  fieldTitle: {
    ...typo.bodyStrong,
    fontSize: 13,
    marginBottom: space.s8,
    paddingHorizontal: space.s4,
  },
  fieldCaption: {
    ...typo.caption,
    marginTop: space.s4,
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
  fieldError: {
    ...typo.caption,
    marginTop: -space.s4,
    marginBottom: space.s8,
    paddingHorizontal: space.s4,
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
  registeredWrap: {
    alignItems: 'center',
    paddingHorizontal: space.s4,
    paddingBottom: space.s8,
  },
  registeredIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.s12,
  },
  registeredTitle: {
    ...typo.title,
    marginBottom: space.s4,
  },
  registeredText: {
    ...typo.body,
    textAlign: 'center',
    marginBottom: space.s16,
  },
  registeredActions: {
    alignSelf: 'stretch',
    gap: space.s4,
  },
})
