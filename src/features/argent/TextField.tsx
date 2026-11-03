import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

/** Champ de formulaire avec libellé au-dessus et message d'erreur en dessous. */
export function TextField({ label, error, style, ...input }: TextFieldProps) {
  return (
    <View style={styles.root}>
      <Text style={[typography.caption, styles.label]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[typography.body, styles.input, !!error && styles.inputError, style]}
        {...input}
      />
      {error && <Text style={[typography.caption, styles.error]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.xs },
  label: { color: colors.text, fontWeight: '600' },
  input: {
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputError: { borderColor: colors.late },
  error: { color: colors.late },
});
