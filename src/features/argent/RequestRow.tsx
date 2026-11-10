import { StyleSheet, Text, View } from 'react-native';

import { Avatar, Button, StatusBadge } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';
import { formatAmount } from '@/utils/format';

import { LeaseOption, unitLabel } from './payment';

interface RequestRowProps {
  option: LeaseOption;
  /** Une demande a déjà été ouverte dans WhatsApp pendant cette session. */
  requested: boolean;
  onRequest: () => void;
}

/** Un locataire qui n'a pas encore payé, avec le bouton « Demander » par WhatsApp. */
export function RequestRow({ option, requested, onRequest }: RequestRowProps) {
  const name = option.tenant?.fullName ?? '—';
  return (
    <View style={styles.row}>
      <Avatar name={name} />
      <View style={styles.text}>
        <Text style={[typography.bodyStrong, styles.title]}>{name}</Text>
        <Text style={[typography.caption, styles.muted]}>
          {unitLabel(option)} · {formatAmount(option.remaining)}
        </Text>
        <StatusBadge status={option.status} />
      </View>
      <Button
        label={requested ? 'Demandé ✓' : 'Demander'}
        icon={requested ? undefined : 'logo-whatsapp'}
        variant={requested ? 'secondary' : 'primary'}
        style={requested ? styles.done : undefined}
        onPress={onRequest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  text: { flex: 1, gap: spacing.xs },
  title: { color: colors.text },
  muted: { color: colors.textMuted },
  done: { borderWidth: 1, borderColor: colors.border },
});
