import { StyleSheet, Text, View } from 'react-native';

import type { RentPunctuality } from '@/domain/rent';
import { colors, spacing, typography } from '@/theme';
import { formatDate, formatPeriod } from '@/utils/format';

export interface MonthRegularity {
  period: string;
  punctuality: RentPunctuality;
}

const PUNCTUALITY: Record<RentPunctuality, { color: string; label: string }> = {
  a_temps: { color: colors.paid, label: 'payé à temps' },
  en_retard: { color: colors.toVerify, label: 'payé en retard' },
  impaye: { color: colors.late, label: 'impayé' },
  hors_bail: { color: colors.toPay, label: 'pas encore dans le bien' },
};

/** « 2026-05 » → « mai ». */
const shortMonth = (period: string) => formatDate(`${period}-01`).split(' ')[1];

/** Un point par mois : vert si payé à temps, orange si payé en retard, rouge si impayé. */
export function RegularityDots({ months }: { months: MonthRegularity[] }) {
  const hasGrey = months.some((m) => m.punctuality === 'hors_bail');
  return (
    <View style={styles.root}>
      <Text style={[typography.overline, styles.muted]}>Régularité sur les {months.length} derniers mois</Text>
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
        {hasGrey && ' · Gris : pas encore dans le bien'}
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
