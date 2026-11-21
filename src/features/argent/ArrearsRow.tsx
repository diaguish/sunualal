import { StyleSheet, Text, View } from 'react-native';

import { Avatar, Button } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import { formatAmount } from '@/utils/format';

import type { ArrearsLine } from './arrears';
import { monthLabel } from './payment';

interface ArrearsRowProps {
  line: ArrearsLine;
  /** Ouvre « Saisir un paiement » pour ce locataire : l'argent règle ses mois les plus anciens d'abord. */
  onCollect: () => void;
}

/** Un locataire, ses reliquats mois par mois, et un seul bouton pour encaisser. */
export function ArrearsRow({ line, onCollect }: ArrearsRowProps) {
  const name = line.tenant?.fullName ?? '—';
  const place = [line.property?.name, line.unit?.label].filter(Boolean).join(' · ');
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Avatar name={name} />
        <View style={styles.text}>
          <Text style={[typography.bodyStrong, styles.title]}>{name}</Text>
          <Text style={[typography.caption, styles.muted]}>{place}</Text>
        </View>
        <Text style={[typography.bodyStrong, styles.total]}>{formatAmount(line.total)}</Text>
      </View>
      {line.months.map((m) => (
        <View key={m.period} style={styles.month}>
          <Text style={[typography.caption, styles.title]}>
            {monthLabel(m.period)} · J+{m.days}
          </Text>
          <Text style={[typography.caption, styles.amount]}>{formatAmount(m.amount)} FCFA</Text>
        </View>
      ))}
      <Button label="Encaisser" icon="add" variant="secondary" style={styles.collect} onPress={onCollect} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm, paddingVertical: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1, gap: 2 },
  title: { color: colors.text },
  muted: { color: colors.textMuted },
  total: { color: colors.late },
  month: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.lateSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  amount: { color: colors.late, fontWeight: '600' },
  collect: { borderWidth: 1, borderColor: colors.border },
});
