import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RENT_STATUS_COLORS } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';

import type { PaymentFilter } from './rent-lines';

interface StatusFilterProps {
  filters: { key: PaymentFilter; label: string; count: number }[];
  value: PaymentFilter;
  onChange: (key: PaymentFilter) => void;
}

/** Pastilles « Tous 17 · Payé 11 · En retard 3… », bordées de la couleur du statut. */
export function StatusFilter({ filters, value, onChange }: StatusFilterProps) {
  return (
    <View style={styles.row}>
      {filters.map((f) => {
        const selected = f.key === value;
        const color = f.key === 'tous' || f.key === 'a_payer' ? colors.text : RENT_STATUS_COLORS[f.key];
        return (
          <Pressable
            key={f.key}
            onPress={() => onChange(f.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.chip, { borderColor: selected ? colors.primary : color }, selected && styles.selected]}>
            <Text style={[typography.caption, styles.label, { color: selected ? colors.textOnPrimary : color }]}>
              {f.label} {f.count}
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
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.primary },
  label: { fontWeight: '600' },
});
