import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RENT_STATUS_COLORS } from '@/components/ui';
import { RENT_STATUS_LABELS } from '@/domain/rent';
import { colors, radius, spacing, typography } from '@/theme';
import type { RentStatus } from '@/types/models';

import { groupByFloor, UnitView } from './units';

interface UnitGridProps {
  units: UnitView[];
  onSelect: (unit: UnitView) => void;
}

const LEGEND: RentStatus[] = ['paye', 'en_retard', 'a_verifier', 'a_payer', 'libre'];

/** Façade de l'immeuble : une ligne par étage, une case colorée par lot selon le statut du loyer. */
export function UnitGrid({ units, onSelect }: UnitGridProps) {
  const floors = groupByFloor(units);
  return (
    <View style={styles.root}>
      <View style={styles.building}>
        <View style={styles.roof} />
        {floors.map(({ floor, units: row }) => (
          <View key={floor} style={styles.floor}>
            {floor !== '' && <Text style={[typography.caption, styles.floorLabel]}>{floor}</Text>}
            {row.map((view) => (
              <UnitTile key={view.unit.id} view={view} onPress={() => onSelect(view)} />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        {LEGEND.map((status) => (
          <View key={status} style={styles.legendItem}>
            <View style={[styles.dot, dotStyle(status)]} />
            <Text style={[typography.caption, styles.muted]}>{RENT_STATUS_LABELS[status]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function UnitTile({ view, onPress }: { view: UnitView; onPress: () => void }) {
  const free = view.status === 'libre';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${view.unit.label}, ${RENT_STATUS_LABELS[view.status]}`}
      style={({ pressed }) => [
        styles.tile,
        free ? styles.tileFree : { backgroundColor: RENT_STATUS_COLORS[view.status] },
        pressed && styles.pressed,
      ]}>
      <Text style={[typography.bodyStrong, free ? styles.muted : styles.tileText]}>{view.unit.label}</Text>
    </Pressable>
  );
}

const dotStyle = (status: RentStatus) =>
  status === 'libre' ? styles.dotFree : { backgroundColor: RENT_STATUS_COLORS[status] };

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  building: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  roof: { height: 8, borderRadius: 2, backgroundColor: colors.toPay, marginBottom: spacing.xs },
  floor: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  floorLabel: { color: colors.textMuted, width: 44 },
  tile: {
    flex: 1,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileFree: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.free },
  tileText: { color: colors.textOnPrimary },
  pressed: { opacity: 0.7 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotFree: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.free },
  muted: { color: colors.textMuted },
});
