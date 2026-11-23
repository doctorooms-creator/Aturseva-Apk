/**
 * V3 HOME · SEARCH CROWN (Home V3.1 · P3): the one crown of the home —
 * a 56px pill that LOOKS like an input but is a doorway (S3 law: the
 * home never hosts the keyboard; the tap walks into /search where the
 * suggest machinery lives). White card + hairline ring + the soft V3
 * shadow; the mic is the affordance pair, not a live control.
 */

import { Pressable, StyleSheet, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { Mic, Search } from 'lucide-react-native'
import { useColors } from '@/lib/theme'

export function HomeSearch() {
  const c = useColors()
  const router = useRouter()
  return (
    <Pressable
      onPress={() => void router.push('/search')}
      accessibilityRole="button"
      accessibilityLabel="Search doctors, hospitals, tests, symptoms"
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.canvas, borderColor: c.hairline2 },
        pressed && styles.pressed,
      ]}
    >
      <Search size={18} color={c.mute2} strokeWidth={2} />
      {/* Spec'd 12/400 placeholder voice — the one non-preset line, same
          Geist face the ramp loads. */}
      <Text style={[styles.placeholder, { color: c.mute2 }]} numberOfLines={1}>
        Search doctors, hospitals, tests, symptoms…
      </Text>
      <Mic size={18} color={c.mute2} strokeWidth={2} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  placeholder: {
    flex: 1,
    fontFamily: 'Geist_400Regular',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
