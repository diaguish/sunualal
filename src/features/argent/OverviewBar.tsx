import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';
import { formatAmount } from '@/utils/format';

import type { MonthOverview } from './rent-lines';

const SEGMENTS: { key: keyof MonthOverview; label: string; color: string }[] = [
  { key: 'received', label: 'Encaissé', color: colors.paid },
  { key: 'toVerify', label: 'À vérifier', color: colors.toVerify },
  { key: 'late', label: 'En retard', color: colors.late },
  { key: 'upcoming', label: 'À venir', color: colors.toPay },
];

/** Barre empilée « Octobre en un coup d'œil » et montant encaissé. */
export function OverviewBar({ overview }: { overview: MonthOverview }) {
  const total = SEGMENTS.reduce((sum, s) => sum + overview[s.key], 0);
  return (
    <View style={styles.root}>
      <View style={styles.bar}>
        {total > 0 &&
          SEGMENTS.map((s) =>
            overview[s.key] > 0 ? <View key={s.key} style={{ flex: overview[s.key], backgroundColor: s.color }} /> : null,
          )}
      </View>
      <View style={styles.legend}>
        {SEGMENTS.map((s) => (
          <View key={s.key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <Text style={[typography.caption, styles.muted]}>
              {s.label} {formatAmount(overview[s.key])}
            </Text>
          </View>
        ))}
      </View>
      <View>
        <Text style={[typography.caption, styles.muted]}>Encaissé</Text>
        <View style={styles.amount}>
          <Text style={[typography.title, styles.text]}>{formatAmount(overview.received)}</Text>
          <Text style={[typography.caption, styles.muted]}>FCFA</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  bar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.border },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  amount: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
});
