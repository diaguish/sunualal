import { StyleSheet, Text, View } from 'react-native';

import { RENT_STATUS_LABELS } from '@/domain/rent';
import { colors, radius, spacing, typography } from '@/theme';
import type { RentStatus } from '@/types/models';

/** Couleur associée à chaque statut : grille des lots, filtres, badges. */
export const RENT_STATUS_COLORS: Record<RentStatus, string> = {
  paye: colors.paid,
  en_retard: colors.late,
  a_verifier: colors.toVerify,
  a_payer: colors.toPay,
  libre: colors.free,
};

interface StatusBadgeProps {
  status: RentStatus;
  /** Remplace le libellé par défaut, ex. « 2 impayés ». */
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const color = RENT_STATUS_COLORS[status];
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[typography.caption, styles.text, { color }]}>{label ?? RENT_STATUS_LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: { fontWeight: '600' },
});
