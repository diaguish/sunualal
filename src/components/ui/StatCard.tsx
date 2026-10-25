import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';
import { formatAmount } from '@/utils/format';

import { Card } from './Card';

interface StatCardProps {
  label: string; // « TOTAL DES RELIQUATS »
  value: number | string; // un nombre est formaté et suivi de « FCFA »
  caption?: string; // « 5 locataires concernés »
  tone?: 'default' | 'danger';
}

/** Carte chiffre clé des écrans Argent (Reliquats, Quittances, Mobile Money). */
export function StatCard({ label, value, caption, tone = 'default' }: StatCardProps) {
  const color = tone === 'danger' ? colors.late : colors.primary;
  const isAmount = typeof value === 'number';
  return (
    <Card>
      <Text style={[typography.overline, { color: tone === 'danger' ? colors.late : colors.textMuted }]}>{label}</Text>
      <View style={styles.row}>
        <Text style={[typography.title, { color }]}>{isAmount ? formatAmount(value) : value}</Text>
        {isAmount && <Text style={[typography.caption, styles.unit]}>FCFA</Text>}
      </View>
      {caption && <Text style={[typography.caption, styles.muted]}>{caption}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  unit: { color: colors.textMuted, fontWeight: '600' },
  muted: { color: colors.textMuted },
});
