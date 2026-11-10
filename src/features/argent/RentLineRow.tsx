import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar, Button, StatusBadge } from '@/components/ui';
import { daysLate, dueDate, PAYMENT_METHOD_LABELS } from '@/domain/rent';
import { colors, spacing, typography } from '@/theme';
import { formatAmount, formatDate } from '@/utils/format';

import { unitLabel } from './payment';
import type { RentLine } from './rent-lines';

interface RentLineRowProps {
  line: RentLine;
  period: string;
  today: string;
  /** Ouvre « Saisir un paiement » pour ce bail. */
  onCollect: () => void;
  /** Confirme le paiement mobile money déclaré. */
  onConfirm: () => void;
}

/** Une ligne de loyer : locataire, situation du mois et action possible. */
export function RentLineRow({ line, period, today, onCollect, onConfirm }: RentLineRowProps) {
  const name = line.tenant?.fullName ?? '—';
  // Le bouton « Confirmer » reste hors de la zone touchable : un bouton ne peut pas en contenir un autre.
  return (
    <View style={styles.row}>
      <Pressable
        onPress={line.status === 'paye' ? undefined : onCollect}
        accessibilityRole={line.status === 'paye' ? undefined : 'button'}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}>
        <Avatar name={name} tone={line.status === 'a_verifier' ? 'gold' : 'green'} />
        <View style={styles.text}>
          <Text style={[typography.bodyStrong, styles.title]}>{name}</Text>
          <Text style={[typography.caption, styles.muted]}>{unitLabel(line)}</Text>
          <Text style={[typography.caption, styles.muted]}>{situation(line, period, today)}</Text>
        </View>
        <View style={styles.side}>
          <Text style={[typography.bodyStrong, styles.title]}>{formatAmount(line.lease.rent)}</Text>
          <StatusBadge status={line.status} />
        </View>
      </Pressable>
      {line.pendingPayment && (
        <Button label="Confirmer la réception" icon="checkmark" variant="accent" fullWidth onPress={onConfirm} />
      )}
    </View>
  );
}

/** « Payé · Wave · 5 oct. », « Reste 250 000 · J+9 », « Échéance le 15 oct. »… */
function situation(line: RentLine, period: string, today: string): string {
  const { status, lastPayment, pendingPayment, remaining, paid } = line;
  switch (status) {
    case 'paye':
      return lastPayment
        ? `Payé · ${PAYMENT_METHOD_LABELS[lastPayment.method]} · ${formatDate(lastPayment.paidAt)}`
        : 'Payé';
    case 'a_verifier':
      return pendingPayment
        ? `${formatAmount(pendingPayment.amount)} déclaré · ${PAYMENT_METHOD_LABELS[pendingPayment.method]}`
        : 'Paiement déclaré';
    case 'en_retard':
      return `Reste ${formatAmount(remaining)} · J+${daysLate(line.lease, period, today)}`;
    default:
      return `${paid > 0 ? `Reste ${formatAmount(remaining)} · ` : ''}Échéance le ${formatDate(dueDate(line.lease, period))}`;
  }
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.sm },
  pressed: { opacity: 0.7 },
  main: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1, gap: 2 },
  side: { alignItems: 'flex-end', gap: spacing.xs },
  title: { color: colors.text },
  muted: { color: colors.textMuted },
});
