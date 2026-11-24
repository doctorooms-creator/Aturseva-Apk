/**
 * V4 HOME · ZONE 3 — SEARCH (doc 21): the white crown. 392×38 r22 white
 * fill + #EDEDED hairline 0.7 + the v4 soft shadow. Search icon left 17,
 * mic right (17.5 insets), placeholder 12.6 #606063. A doorway, not an
 * input (S3 law): the tap walks into /search where the suggest machinery
 * lives — the home never hosts the keyboard.
 */

import { Pressable, StyleSheet, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useV4, v4t, v4c, v4Shadow } from '@/components/home4/v4'
import { FigIcon } from '@/components/home4/figma'

export function Home4Search() {
  const s = useV4()
  const router = useRouter()
  return (
    <Pressable
      onPress={() => void router.push('/search')}
      accessibilityRole="search"
      accessibilityLabel="Search doctors, hospitals, tests, symptoms"
      hitSlop={{ top: 3, bottom: 3 }}
      style={({ pressed }) => [
        styles.field,
        {
          height: 38 * s,
          borderRadius: 22 * s,
          marginHorizontal: 17 * s,
          paddingHorizontal: 17.5 * s,
          gap: 11.5 * s,
          borderWidth: Math.max(0.5, 0.7 * s),
        },
        v4Shadow,
        pressed && styles.pressed,
      ]}
    >
      <FigIcon name="search" s={s} />
      <Text
        style={[v4t('searchPlaceholder', s), styles.ph, { color: v4c.gray2 }]}
        numberOfLines={1}
        maxFontSizeMultiplier={1.2}
      >
        Search doctors, hospitals, tests, symptoms…
      </Text>
      <FigIcon name="mic" s={s} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: v4c.white,
    borderColor: v4c.strokeSearch,
  },
  ph: {
    flex: 1,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
})
