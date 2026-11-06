import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RENT_STATUS_COLORS, StatusBadge } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';

import type { PropertySummary } from './dashboard';
import { groupByFloor } from './units';

/** Carte « Mes immeubles » : mini façade colorée et situation du bien. Ouvre le bien sur Immeubles. */
export function PropertyCard({ summary }: { summary: PropertySummary }) {
  const { property, views, rented, unpaid } = summary;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/immeubles', params: { bien: property.id } })}
      accessibilityRole="button"
      accessibilityLabel={`Voir ${property.name}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.facade}>
        {groupByFloor(views).map(({ key, units }) => (
          <View key={key} style={styles.floor}>
            {units.map(({ unit, status }) => (
              <View
                key={unit.id}
                style={[
                  styles.lot,
                  status === 'libre' ? styles.lotFree : { backgroundColor: RENT_STATUS_COLORS[status] },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <Text style={[typography.bodyStrong, styles.name]} numberOfLines={1}>
        {property.name}
      </Text>
      <Text style={[typography.caption, styles.muted]}>
        {rented} sur {views.length} loués
      </Text>
      {unpaid > 0 ? (
        <StatusBadge status="en_retard" label={`${unpaid} impayé${unpaid > 1 ? 's' : ''}`} />
      ) : (
        <StatusBadge status="paye" label="À jour" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  pressed: { opacity: 0.8 },
  facade: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  floor: { flexDirection: 'row', gap: spacing.xs },
  lot: { flex: 1, height: 12, borderRadius: 3 },
  lotFree: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.free },
  name: { color: colors.text },
  muted: { color: colors.textMuted },
});
