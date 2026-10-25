import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/theme';
import { initials } from '@/utils/format';

interface AvatarProps {
  name: string;
  size?: number;
  tone?: 'green' | 'gold' | 'dark';
}

/** Cercle avec les initiales (« AN » pour Awa Ndiaye). */
export function Avatar({ name, size = 36, tone = 'green' }: AvatarProps) {
  const palette = TONES[tone];
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: palette.bg }]}>
      <Text style={[typography.caption, styles.text, { color: palette.fg }]}>{initials(name)}</Text>
    </View>
  );
}

const TONES = {
  green: { bg: colors.primarySoft, fg: colors.primary },
  gold: { bg: colors.accentSoft, fg: colors.primary },
  dark: { bg: colors.primary, fg: colors.textOnPrimary },
};

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '700' },
});
