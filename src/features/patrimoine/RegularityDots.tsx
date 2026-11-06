import { StyleSheet, Text, View } from 'react-native';

import type { RentPunctuality } from '@/domain/rent';
import { colors, spacing, typography } from '@/theme';
import { formatDate, formatPeriod } from '@/utils/format';

/** Un mois où le loyer était dû : les mois d'avant l'arrivée du locataire ne sont pas affichés. */
export interface MonthRegularity {
  period: string;
  punctuality: Exclude<RentPunctuality, 'hors_bail'>;
}

const PUNCTUALITY: Record<MonthRegularity['punctuality'], { color: string; label: string }> = {
  a_temps: { color: colors.paid, label: 'payé à temps' },
  en_retard: { color: colors.toVerify, label: 'payé en retard' },
  impaye: { color: colors.late, label: 'impayé' },
};

/** « 2026-05 » → « mai ». */
const shortMonth = (period: string) => formatDate(`${period}-01`).split(' ')[1];

/** Un point par mois : vert si payé à temps, orange si payé en retard, rouge si impayé. */
export function RegularityDots({ months }: { months: MonthRegularity[] }) {
  return (
    <View style={styles.root}>
      <Text style={[typography.overline, styles.muted]}>
        {months.length > 1 ? `Régularité sur les ${months.length} derniers mois` : 'Régularité sur le dernier mois'}
      </Text>
      <View style={styles.row}>
        {months.map(({ period, punctuality }) => (
          <View
            key={period}
            style={styles.month}
            accessible
            accessibilityLabel={`${formatPeriod(period)} : ${PUNCTUALITY[punctuality].label}`}>
            <View style={[styles.dot, { backgroundColor: PUNCTUALITY[punctuality].color }]} />
            <Text style={[typography.caption, styles.muted]}>{shortMonth(period)}</Text>
          </View>
        ))}
      </View>
      <Text style={[typography.caption, styles.muted]}>
        Vert : payé à temps · Orange : payé en retard · Rouge : impayé
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.lg },
  month: { alignItems: 'center', gap: spacing.xs },
  dot: { width: 14, height: 14, borderRadius: 7 },
  muted: { color: colors.textMuted },
});
