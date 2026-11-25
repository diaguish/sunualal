import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { ReminderTone } from '@/types/models';

import { REMINDER_TONE_LABELS } from './reminders';

const TONES = Object.keys(REMINDER_TONE_LABELS) as ReminderTone[];

interface ToneChipsProps {
  value: ReminderTone;
  onChange: (tone: ReminderTone) => void;
}

/** Choix du ton du message : Amical, Ferme, Mise en demeure. */
export function ToneChips({ value, onChange }: ToneChipsProps) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {TONES.map((tone) => {
        const selected = tone === value;
        return (
          <Pressable
            key={tone}
            onPress={() => onChange(tone)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.chip, selected && styles.selected]}>
            <Text style={[typography.caption, styles.label, selected && styles.selectedLabel]}>
              {REMINDER_TONE_LABELS[tone]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { color: colors.text, fontWeight: '600' },
  selectedLabel: { color: colors.textOnPrimary },
});
