import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import { formatDate } from '@/utils/format';

import { remainingLabel, TenantEntry } from './tenants';

interface TenantRowProps {
  entry: TenantEntry;
  /** Vrai quand la fiche de ce locataire est ouverte. */
  selected: boolean;
  onPress: () => void;
}

/** Ligne de la liste des locataires : identité, lot et fin de bail. Ouvre la fiche. */
export function TenantRow({ entry, selected, onPress }: TenantRowProps) {
  const { tenant, lease, view, propertyName, daysLeft, endingSoon } = entry;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Fiche de ${tenant.fullName}`}
      style={({ pressed }) => [styles.row, selected && styles.selected, pressed && styles.pressed]}>
      <Avatar name={tenant.fullName} size={40} />
      <View style={styles.text}>
        <Text style={[typography.bodyStrong, styles.name]} numberOfLines={1}>
          {tenant.fullName}
        </Text>
        <Text style={[typography.caption, styles.muted]} numberOfLines={1}>
          {propertyName} · {view.unit.label}
        </Text>
        <Text style={[typography.caption, styles.name]}>{formatDate(lease.endDate, true)}</Text>
        {endingSoon && <Text style={[typography.caption, styles.warning]}>{remainingLabel(daysLeft)}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: spacing.md,
  },
  selected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  pressed: { opacity: 0.7 },
  text: { flex: 1, gap: 2 },
  name: { color: colors.text },
  muted: { color: colors.textMuted },
  warning: { color: colors.toVerify, fontWeight: '600' },
});
