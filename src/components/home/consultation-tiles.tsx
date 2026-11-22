/**
 * Z3 · CONSULTATION TILES (doc 17 PART 4, D6 ruling): two iconographic
 * entry tiles — the home's doorways. NO photography on tiles (we have no
 * real tile art; fabricating "doctor photos" for tiles breaks the honesty
 * law — curated faces are for doctor identities only).
 *
 * Tile A "Talk to a doctor" → the S4 listing (zero-thinking path).
 * Tile B "Lab tests at home" → LINKING HANDOFF to aturseva.com/labs
 * (the labs-booking ruling: labs bookings live on the website — B14
 * pattern, external door opens honestly labeled "on aturseva.com").
 *
 * Surface: white card on the cream home canvas (the website's own
 * page-grammar: cream page, white cards) + aquaSoft icon circles with
 * tealText icons (AA family).
 */

import { type ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import * as Linking from 'expo-linking'
import { Stethoscope, TestTubes } from 'lucide-react-native'
import { elevation, radius, space, TOUCH, type as typo } from '@/lib/tokens'
import { useColors } from '@/lib/theme'

export const LABS_WEB_URL = 'https://aturseva.com/labs'

export function ConsultationTiles({ onFindDoctor }: { onFindDoctor: () => void }) {
  const c = useColors()
  return (
    <View style={styles.row}>
      <Tile
        icon={<Stethoscope size={22} color={c.tealText} strokeWidth={2} />}
        title="Talk to a doctor"
        caption="Book in 3 taps"
        onPress={onFindDoctor}
      />
      <Tile
        icon={<TestTubes size={22} color={c.tealText} strokeWidth={2} />}
        title="Lab tests at home"
        caption="on aturseva.com"
        onPress={() => {
          void Linking.openURL(LABS_WEB_URL).catch(() => {})
        }}
      />
    </View>
  )
}

function Tile({
  icon,
  title,
  caption,
  onPress,
}: {
  icon: ReactNode
  title: string
  caption: string
  onPress: () => void
}) {
  const c = useColors()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title} — ${caption}`}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: c.canvas, borderColor: c.hairline },
        elevation.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: c.aquaSoft }]}>{icon}</View>
      <Text style={[styles.title, { color: c.ink }]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.caption, { color: c.mute }]} numberOfLines={1}>
        {caption}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.s12,
    paddingHorizontal: space.s16,
    minHeight: TOUCH,
  },
  tile: {
    flex: 1,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.s16,
    gap: space.s8,
    alignItems: 'flex-start',
    minHeight: TOUCH,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typo.bodyStrong,
  },
  caption: {
    ...typo.caption,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.88,
  },
})
