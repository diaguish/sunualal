import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'words' | 'sentences';
  error?: string;
}

/** Champ de formulaire : libellé au-dessus, message d'erreur en dessous. */
export function FormField({ label, error, autoCapitalize = 'none', ...input }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={[typography.caption, styles.label]}>{label}</Text>
      <TextInput
        {...input}
        accessibilityLabel={label}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        placeholderTextColor={colors.textMuted}
        style={[typography.body, styles.input, !!error && styles.inputError]}
      />
      {error && <Text style={[typography.caption, styles.error]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { flex: 1, gap: spacing.xs },
  label: { color: colors.text, fontWeight: '600' },
  input: {
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  inputError: { borderColor: colors.late },
  error: { color: colors.late },
});
