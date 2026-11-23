/**
 * V3 HOME · HEALTH TOOLS (Home V3.1 · P4): "Health Tools" — three soft
 * cards: Symptoms Checker (→ /search, the problem-first doorway), Upload
 * Reports (→ /reports, the records hub), Family Profiles (→ website
 * handoff — the web doorway per the spec).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { CalendarCheck2, FileUp, ShieldPlus, type LucideIcon } from 'lucide-react-native'
import { useColors } from '@/lib/theme'
import { v3 } from '@/components/home3d/v3-type'
import { Section } from '@/components/home3d/section'

const WEB_URL = 'https://aturseva.com'

interface HealthTool {
  key: string
  icon: LucideIcon
  title: string
  sub: string
  onPress: () => void
}

export function HealthTools() {
  const c = useColors()
  const router = useRouter()
  const tools: HealthTool[] = [
    {
      key: 'symptoms',
      icon: CalendarCheck2,
      title: 'Symptoms Checker',
      sub: 'Understand your symptoms',
      onPress: () => void router.push('/search'),
    },
    {
      key: 'reports',
      icon: FileUp,
      title: 'Upload Reports',
      sub: 'Store & access anytime',
      onPress: () => void router.push('/reports'),
    },
    {
      key: 'family',
      icon: ShieldPlus,
      title: 'Family Profiles',
      sub: 'Manage care for loved ones',
      onPress: () => void Linking.openURL(WEB_URL).catch(() => {}),
    },
  ]
  return (
    <Section title="Health Tools">
      <View style={styles.row}>
        {tools.map((t) => (
          <Pressable
            key={t.key}
            onPress={t.onPress}
            accessibilityRole="button"
            accessibilityLabel={`${t.title} — ${t.sub}`}
            style={({ pressed }) => [styles.card, { backgroundColor: c.cardSoft }, pressed && styles.pressed]}
          >
            <View style={[styles.iconCircle, { backgroundColor: c.canvas }]}>
              <t.icon size={20} color={c.ink} strokeWidth={2} />
            </View>
            <Text style={[v3.toolTitle, { color: c.ink }]} numberOfLines={2}>
              {t.title}
            </Text>
            <Text style={[v3.toolSub, { color: c.mute2 }]} numberOfLines={2}>
              {t.sub}
            </Text>
          </Pressable>
        ))}
      </View>
    </Section>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    height: 120,
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
