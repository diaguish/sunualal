import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui';
import { PAYMENT_METHOD_LABELS } from '@/domain/rent';
import { colors, radius, spacing, typography } from '@/theme';
import { formatAmount, formatDate } from '@/utils/format';

import type { MobileMoneyPayment } from './mobile-money';
import { unitLabel } from './payment';

/** Un paiement Wave / Orange Money : opérateur, référence, montant ; en doré s'il reste à confirmer. */
export function MobileMoneyRow({ item }: { item: MobileMoneyPayment }) {
  const { payment, option } = item;
  const pending = payment.status === 'a_verifier';
  const name = option?.tenant?.fullName ?? '—';
  return (
    <View style={styles.row}>
      <Avatar name={name} tone={pending ? 'gold' : 'green'} />
      <View style={styles.text}>
        <Text style={[typography.bodyStrong, styles.title]}>{name}</Text>
        <Text style={[typography.caption, styles.muted]}>{option ? unitLabel(option) : ''}</Text>
        <View style={styles.meta}>
          <View style={[styles.operator, payment.method === 'wave' ? styles.wave : styles.orange]}>
            <Text style={[typography.caption, styles.operatorText]}>{PAYMENT_METHOD_LABELS[payment.method]}</Text>
          </View>
          <Text style={[typography.caption, styles.muted]}>
            {payment.reference ? `Réf. ${payment.reference}` : 'Sans référence'} · {formatDate(payment.paidAt)}
          </Text>
        </View>
      </View>
      <View style={styles.side}>
        <Text style={[typography.bodyStrong, { color: pending ? colors.toVerify : colors.paid }]}>
          {formatAmount(payment.amount)}
        </Text>
        {pending && <Text style={[typography.caption, { color: colors.toVerify }]}>À confirmer</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  text: { flex: 1, gap: 2 },
  title: { color: colors.text },
  muted: { color: colors.textMuted },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  operator: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 1 },
  // Couleurs d'opérateur dérivées du thème : bleu Wave et orange Orange Money ne sont pas dans la palette.
  wave: { backgroundColor: colors.primarySoft },
  orange: { backgroundColor: colors.accentSoft },
  operatorText: { color: colors.text, fontWeight: '600' },
  side: { alignItems: 'flex-end', gap: 2 },
});
