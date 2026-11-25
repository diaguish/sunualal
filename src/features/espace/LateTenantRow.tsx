import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import { formatFCFA } from '@/utils/format';

import { Reminder, reminderPlace } from './reminders';

interface LateTenantRowProps {
  reminder: Reminder;
  selected: boolean;
  onPress: () => void;
}

/** Un locataire en retard : nom, lot, reste dû et pastille J+n. Maquette : « Relances », bloc « En retard ». */
export function LateTenantRow({ reminder, selected, onPress }: LateTenantRowProps) {
  const name = reminder.line.tenant?.fullName ?? '—';
  // Pastille dorée tant qu'une relance amicale suffit, rouge au-delà.
  const mild = reminder.suggested === 'amical';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${name}, ${reminder.days} jours de retard`}
      style={({ pressed }) => [styles.root, selected && styles.selected, pressed && styles.pressed]}>
      <View style={styles.text}>
        <Text style={[typography.bodyStrong, styles.name]}>{name}</Text>
        <Text style={[typography.caption, styles.muted]}>{reminderPlace(reminder)}</Text>
        <Text style={[typography.caption, styles.amount]}>Reste {formatFCFA(reminder.line.total)}</Text>
      </View>
      <View style={[styles.pill, mild ? styles.pillMild : styles.pillLate]}>
        <Text style={[typography.caption, styles.pillText, { color: mild ? colors.text : colors.late }]}>
          J+{reminder.days}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.background,
  },
  selected: { backgroundColor: colors.primarySoft, borderColor: colors.paid },
  pressed: { opacity: 0.7 },
  text: { flex: 1, gap: 2 },
  name: { color: colors.text },
  muted: { color: colors.textMuted },
  amount: { color: colors.late, fontWeight: '700' },
  pill: { borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  pillMild: { backgroundColor: colors.accentSoft },
  pillLate: { backgroundColor: colors.lateSoft },
  pillText: { fontWeight: '600' },
});
