import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PAYMENT_METHOD_LABELS } from '@/domain/rent';
import { colors, radius, spacing, typography } from '@/theme';
import { formatAmount, formatDate } from '@/utils/format';

import { receiptPlace, ReceiptView } from './receipts';

/** Une quittance dans la liste : numéro, locataire, montant ; « partiel » si le loyer n'est pas soldé. */
export function ReceiptRow({ view, onPress }: { view: ReceiptView; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Quittance ${view.receipt.number}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.icon}>
        <Ionicons name="document-text-outline" size={18} color={colors.primary} />
      </View>
      <View style={styles.text}>
        <Text style={[typography.bodyStrong, styles.title]}>{view.tenant?.fullName ?? '—'}</Text>
        <Text style={[typography.caption, styles.muted]}>
          {view.receipt.number} · {receiptPlace(view)}
        </Text>
        <Text style={[typography.caption, styles.muted]}>
          {PAYMENT_METHOD_LABELS[view.payment.method]} · {formatDate(view.receipt.issuedAt)}
          {view.partial ? ' · partiel' : ''}
        </Text>
      </View>
      <Text style={[typography.bodyStrong, { color: view.partial ? colors.toVerify : colors.paid }]}>
        {formatAmount(view.payment.amount)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  pressed: { opacity: 0.7 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  title: { color: colors.text },
  muted: { color: colors.textMuted },
});
