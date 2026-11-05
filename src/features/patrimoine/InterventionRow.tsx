import { StyleSheet, Text, View } from 'react-native';

import { Button, StatusBadge } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import type { Intervention } from '@/types/models';

interface InterventionRowProps {
  intervention: Intervention;
  detail: string; // « Résidence Teranga · B1 · Signalé par Awa Ndiaye le 7 oct. · estimé 25 000 FCFA »
  onComplete: () => void;
}

/** Une intervention : ce qu'il faut faire, où, et son état. */
export function InterventionRow({ intervention, detail, onComplete }: InterventionRowProps) {
  const open = intervention.status === 'en_cours';
  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={[typography.bodyStrong, styles.title]}>{intervention.label}</Text>
        <StatusBadge status={open ? 'a_verifier' : 'paye'} label={open ? 'En cours' : 'Terminé'} />
      </View>
      <Text style={[typography.caption, styles.muted]}>{detail}</Text>
      {open && <Button label="Marquer terminé" variant="secondary" style={styles.button} onPress={onComplete} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  title: { flex: 1, color: colors.text },
  muted: { color: colors.textMuted },
  button: { borderWidth: 1, borderColor: colors.border },
});
