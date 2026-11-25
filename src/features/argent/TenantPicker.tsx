import { StyleSheet, Text, View } from 'react-native';

import { Avatar, Card, StatusBadge } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';
import { formatFCFA } from '@/utils/format';

import { LeaseOption, overallStatus, STATUS_ORDER, unitLabel } from './payment';

interface TenantPickerProps {
  options: LeaseOption[];
  onSelect: (option: LeaseOption) => void;
}

/** Liste des locataires à encaisser, les retards en premier. */
export function TenantPicker({ options, onSelect }: TenantPickerProps) {
  // Trié sur le statut tous mois confondus : un vieux reliquat compte comme un retard.
  const sorted = [...options].sort((a, b) => STATUS_ORDER[overallStatus(a)] - STATUS_ORDER[overallStatus(b)]);
  return (
    <View style={styles.root}>
      <Text style={[typography.caption, styles.muted]}>Choisissez le locataire qui a payé</Text>
      {sorted.map((o) => (
        <Card key={o.lease.id} onPress={() => onSelect(o)} style={styles.row}>
          <Avatar name={o.tenant?.fullName ?? '?'} />
          <View style={styles.text}>
            <Text style={[typography.bodyStrong, { color: colors.text }]}>{o.tenant?.fullName ?? '—'}</Text>
            <Text style={[typography.caption, styles.muted]}>
              {unitLabel(o)} · {o.totalDue > 0 ? `doit ${formatFCFA(o.totalDue)}` : 'à jour'}
            </Text>
          </View>
          <StatusBadge status={overallStatus(o)} />
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1, gap: 2 },
  muted: { color: colors.textMuted },
});
