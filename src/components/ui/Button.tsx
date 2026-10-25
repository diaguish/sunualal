import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type Variant = 'primary' | 'accent' | 'secondary';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

/**
 * - primary : vert foncé (« Saisir un paiement »)
 * - accent : doré (« Ajouter un bien »)
 * - secondary : blanc (« Exporter », « Locataires »)
 */
export function Button({ label, onPress, variant = 'primary', icon, disabled, fullWidth, style }: ButtonProps) {
  const palette = VARIANTS[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.background },
        fullWidth && styles.fullWidth,
        (pressed || disabled) && styles.dimmed,
        style,
      ]}>
      {icon && <Ionicons name={icon} size={16} color={palette.text} />}
      <Text style={[typography.bodyStrong, { color: palette.text }]}>{label}</Text>
    </Pressable>
  );
}

const VARIANTS: Record<Variant, { background: string; text: string }> = {
  primary: { background: colors.primary, text: colors.textOnPrimary },
  accent: { background: colors.accent, text: colors.primary },
  secondary: { background: colors.surface, text: colors.primary },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  fullWidth: { alignSelf: 'stretch' },
  dimmed: { opacity: 0.6 },
});
