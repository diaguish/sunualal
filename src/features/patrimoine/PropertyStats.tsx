import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import { formatAmount } from '@/utils/format';

interface PropertyStatsProps {
  received: number;
  expected: number;
  rented: number;
  total: number;
}

/** Trois chiffres clés d'un bien : reçu, attendu, lots loués. */
export function PropertyStats({ received, expected, rented, total }: PropertyStatsProps) {
  return (
    <View style={styles.row}>
      <Stat label="Reçu" value={formatAmount(received)} highlight />
      <Stat label="Attendu" value={formatAmount(expected)} />
      <Stat label="Loués" value={`${rented}/${total}`} />
    </View>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[typography.overline, styles.label]}>{label}</Text>
      <Text style={[typography.heading, { color: highlight ? colors.paid : colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 2,
  },
  label: { color: colors.textMuted, fontSize: 9 },
});
