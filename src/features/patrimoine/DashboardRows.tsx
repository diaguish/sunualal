import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import { formatAmount, formatDate } from '@/utils/format';

import type { ActivityItem, DeadlineItem } from './dashboard';

/** « Moussa Diop a payé … +150 000 » ; en doré tant que le paiement n'est pas confirmé. */
export function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <View style={styles.row}>
      <Avatar name={item.tenantName} tone={item.pending ? 'gold' : 'green'} />
      <View style={styles.text}>
        <Text style={[typography.bodyStrong, styles.title]}>
          {item.tenantName} {item.pending ? 'dit avoir payé' : 'a payé'}
        </Text>
        <Text style={[typography.caption, styles.muted]}>{item.detail}</Text>
      </View>
      <Text style={[typography.bodyStrong, { color: item.pending ? colors.toVerify : colors.paid }]}>
        {item.pending ? '' : '+'}
        {formatAmount(item.amount)}
      </Text>
    </View>
  );
}

/** Pastille de date et échéance : « 15 oct. — Loyer de Modou Kane ». */
export function DeadlineRow({ item }: { item: DeadlineItem }) {
  const [day, month] = formatDate(item.date).split(' ');
  return (
    <View style={styles.row}>
      <View style={styles.date}>
        <Text style={[typography.bodyStrong, styles.title]}>{day}</Text>
        <Text style={[typography.caption, styles.muted]}>{month}</Text>
      </View>
      <View style={styles.text}>
        <Text style={[typography.bodyStrong, styles.title]}>{item.title}</Text>
        <Text style={[typography.caption, styles.muted]}>{item.detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  text: { flex: 1, gap: 2 },
  title: { color: colors.text },
  muted: { color: colors.textMuted },
  date: {
    width: 44,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
