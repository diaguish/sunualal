import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import { formatAmount, formatPeriod } from '@/utils/format';

import type { ArrearsLine } from './arrears';

interface ArrearsRowProps {
  line: ArrearsLine;
  /** Ouvre « Saisir un paiement » pour un mois donné. */
  onCollect: (period: string) => void;
}

/** Un locataire et ses reliquats, un bouton par mois à régler. */
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
        <Pressable
          key={m.period}
          onPress={() => onCollect(m.period)}
          accessibilityRole="button"
          accessibilityLabel={`Encaisser le reliquat de ${formatPeriod(m.period)}`}
          style={({ pressed }) => [styles.month, pressed && styles.pressed]}>
          <Text style={[typography.caption, styles.title]}>
            {capitalize(formatPeriod(m.period))} · J+{m.days}
          </Text>
          <Text style={[typography.caption, styles.amount]}>{formatAmount(m.amount)} FCFA ›</Text>
        </Pressable>
      ))}
    </View>
  );
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

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
  pressed: { opacity: 0.7 },
  amount: { color: colors.late, fontWeight: '600' },
});
