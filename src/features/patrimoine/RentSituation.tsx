import { StyleSheet, Text, View } from 'react-native';

import { dueDate } from '@/domain/rent';
import { colors, radius, spacing, typography } from '@/theme';
import { formatAmount, formatDate, formatFCFA } from '@/utils/format';

import type { UnitView } from './units';

/** Où en est le loyer : « Doit 250 000 FCFA · en retard de 9 jours ». */
export function situationText({ status, remaining, late, lease, unit }: UnitView, period: string): string {
  switch (status) {
    case 'libre':
      return `Lot libre · ${formatAmount(unit.rent)} / mois`;
    case 'paye':
      return 'Loyer réglé';
    case 'a_verifier':
      return 'Paiement déclaré · à vérifier';
    case 'en_retard':
      return `Doit ${formatFCFA(remaining)} · en retard de ${late} jour${late > 1 ? 's' : ''}`;
    case 'a_payer':
      return `Doit ${formatFCFA(remaining)} · échéance le ${lease ? formatDate(dueDate(lease, period)) : '—'}`;
  }
}

/** Bannière colorée de la fiche d'un lot. */
export function RentSituation({ view, period }: { view: UnitView; period: string }) {
  const palette = PALETTES[view.status];
  return (
    <View style={[styles.banner, { backgroundColor: palette.background }]}>
      <Text style={[typography.bodyStrong, { color: palette.text }]}>{situationText(view, period)}</Text>
    </View>
  );
}

const PALETTES = {
  paye: { background: colors.primarySoft, text: colors.paid },
  en_retard: { background: colors.lateSoft, text: colors.late },
  a_verifier: { background: colors.toVerifySoft, text: colors.toVerify },
  a_payer: { background: colors.background, text: colors.text },
  libre: { background: colors.background, text: colors.text },
};

const styles = StyleSheet.create({
  banner: { borderRadius: radius.md, padding: spacing.md },
});
