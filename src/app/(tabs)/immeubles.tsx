import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader, Button, Card, Screen } from '@/components/ui';
import * as api from '@/data/api';
import { paidAmount } from '@/domain/rent';
import { FilterChip } from '@/features/patrimoine/FilterChip';
import { PropertyStats } from '@/features/patrimoine/PropertyStats';
import { UnitGrid } from '@/features/patrimoine/UnitGrid';
import { UnitSheet } from '@/features/patrimoine/UnitSheet';
import { buildUnitViews, UnitView } from '@/features/patrimoine/units';
import { useReloadOnFocus } from '@/features/patrimoine/use-reload-on-focus';
import { useData } from '@/hooks/use-data';
import { colors, spacing, typography } from '@/theme';

/**
 * Immeubles — un bien à la fois, choisi dans les pastilles du haut.
 * Maquettes : « Immeubles — résidence Teranga », « lot en retard », « lot libre ».
 */
export default function ImmeublesScreen() {
  const { data, reload } = useData(async () => {
    const [today, period, properties, units, leases, tenants, payments] = await Promise.all([
      api.getToday(),
      api.getCurrentPeriod(),
      api.listProperties(),
      api.listUnits(),
      api.listLeases(),
      api.listTenants(),
      api.listPayments(),
    ]);
    return { period, properties, views: buildUnitViews(units, leases, tenants, payments, period, today), payments };
  }, []);
  useReloadOnFocus(reload);

  // Le bien affiché est dans l'adresse : Accueil et les pastilles passent par le même chemin.
  const { bien } = useLocalSearchParams<{ bien?: string }>();
  const [openUnit, setOpenUnit] = useState<UnitView>();

  const property = data?.properties.find((p) => p.id === bien) ?? data?.properties[0];
  const views = data && property ? data.views.filter((v) => v.unit.propertyId === property.id) : [];
  const leases = views.flatMap((v) => (v.lease ? [v.lease] : []));
  const expected = leases.reduce((sum, l) => sum + l.rent, 0);
  const received = data ? leases.reduce((sum, l) => sum + paidAmount(l.id, data.period, data.payments), 0) : 0;

  return (
    <Screen>
      <AppHeader notificationCount={6} />

      <View style={styles.titleRow}>
        <Text style={[typography.title, styles.text]}>Immeubles</Text>
        <Button label="Ajouter" icon="add" onPress={() => router.push('/ajouter-bien')} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {data?.properties.map((p) => (
          <FilterChip key={p.id} label={p.name} active={p.id === property?.id} onPress={() => router.setParams({ bien: p.id })} />
        ))}
      </ScrollView>

      {property && data && (
        <>
          <View>
            <Text style={[typography.title, styles.text]}>{property.name}</Text>
            <Text style={[typography.caption, styles.muted]}>{property.address}</Text>
          </View>

          <PropertyStats received={received} expected={expected} rented={leases.length} total={views.length} />

          <Card>
            <Text style={[typography.caption, styles.muted]}>Touchez un appartement</Text>
            <UnitGrid units={views} onSelect={setOpenUnit} />
          </Card>

          <UnitSheet property={property} period={data.period} view={openUnit} onClose={() => setOpenUnit(undefined)} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
  chips: { gap: spacing.sm },
});
