/**
 * V4 HOME · ZONE 6 — GUEST STATE (Law 3: every state is a layout): when the
 * appointment card's honesty law hides it (guest / no active booking /
 * error), the zone renders THIS instead of a hole — a slim white card in
 * the design's own language (r16, hairline #F3F3F3, the v4 soft shadow)
 * that turns the reclaimed space into the next best action: find a doctor.
 *
 * Copy law: honest, no fake urgency — the sub states what the app does,
 * the card routes to /search where discovery lives.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useV4, v4t, v4c, v4Shadow } from '@/components/home4/v4'
import { FigIcon } from '@/components/home4/figma'

export function Home4GuestCta() {
  const s = useV4()
  const router = useRouter()
  return (
    <Pressable
      onPress={() => void router.push('/search')}
      accessibilityRole="button"
      accessibilityLabel="Book your first visit — find a doctor and get a live token"
      style={({ pressed }) => [
        styles.card,
        {
          minHeight: 72 * s,
          borderRadius: 16 * s,
          marginHorizontal: 19 * s,
          marginTop: 14 * s,
          borderWidth: Math.max(0.5, 0.6 * s),
          paddingHorizontal: 14 * s,
          paddingVertical: 12 * s,
        },
        v4Shadow,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWell, { width: 38 * s, height: 38 * s, borderRadius: 12 * s }]}>
        <FigIcon name="calendar" s={s} />
      </View>
      <View style={{ flex: 1, minWidth: 0, marginLeft: 12 * s, gap: 2 * s }}>
        <Text
          style={[v4t('apptName', s), { color: v4c.ink }]}
          numberOfLines={1}
          maxFontSizeMultiplier={1.25}
        >
          Book your first visit
        </Text>
        <Text
          style={[v4t('apptSub', s), { color: v4c.gray1 }]}
          numberOfLines={2}
          maxFontSizeMultiplier={1.35}
        >
          Find a doctor near you and get a live token — no waiting room.
        </Text>
      </View>
      <View style={[styles.chev, { width: 23 * s, height: 23 * s, borderRadius: 12 * s }]}>
        <FigIcon name="appt-chevron" s={s} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: v4c.white,
    borderColor: v4c.strokeAppt,
  },
  /** A soft neutral well behind the icon — the appointment avatar's
   *  initials-on-soft language, no new art. */
  iconWell: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F6F6',
  },
  chev: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
})
