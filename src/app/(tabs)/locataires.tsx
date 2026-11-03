import { useEffect, useRef, useState } from 'react';
import { ScrollView, ScrollViewInstance, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader, Button, Card, Screen } from '@/components/ui';
import * as api from '@/data/api';
import { AddTenantForm } from '@/features/patrimoine/AddTenantForm';
import { FilterChip } from '@/features/patrimoine/FilterChip';
import { TenantCard } from '@/features/patrimoine/TenantCard';
import { TenantRow } from '@/features/patrimoine/TenantRow';
import { buildTenantEntries, matchesSearch, TenantEntry } from '@/features/patrimoine/tenants';
import { buildUnitViews } from '@/features/patrimoine/units';
import { useReloadOnFocus } from '@/features/patrimoine/use-reload-on-focus';
import { useData } from '@/hooks/use-data';
import { colors, radius, spacing, typography } from '@/theme';

type Filter = 'tous' | 'impayes' | 'fin_de_bail';

const FILTERS: { key: Filter; label: string; matches: (entry: TenantEntry) => boolean }[] = [
  { key: 'tous', label: 'Tous', matches: () => true },
  { key: 'impayes', label: 'Impayés', matches: (entry) => entry.unpaid },
  { key: 'fin_de_bail', label: 'Fin de bail proche', matches: (entry) => entry.endingSoon },
];

/** Locataires — recherche, filtres et fiche du locataire sélectionné. Maquette : « Locataires ». */
export default function LocatairesScreen() {
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
    const views = buildUnitViews(units, leases, tenants, payments, period, today);
    const freeUnits = views
      .filter((view) => view.status === 'libre')
      .map((view) => ({ view, propertyName: properties.find((p) => p.id === view.unit.propertyId)?.name ?? '' }));
    return { today, period, freeUnits, entries: buildTenantEntries(views, properties, today) };
  }, []);
  useReloadOnFocus(reload);

  const [filter, setFilter] = useState<Filter>('tous');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>();
  const [adding, setAdding] = useState(false);

  const scrollRef = useRef<ScrollViewInstance>(null);
  const cardY = useRef(0);
  const justAddedId = useRef<string>(undefined);

  const activeFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const visible = data?.entries.filter((e) => activeFilter.matches(e) && matchesSearch(e, query.trim()));
  // Le premier locataire de la liste est sélectionné d'office, comme sur la maquette.
  const selected = visible?.find((e) => e.lease.id === selectedId) ?? visible?.[0];

  const select = (entry: TenantEntry) => {
    setSelectedId(entry.lease.id);
    // La fiche est sous la liste : on l'amène à l'écran, sinon rien ne semble se passer.
    scrollRef.current?.scrollTo({ y: cardY.current, animated: true });
  };

  const addTenant = async (
    tenantInput: Parameters<typeof api.createTenant>[0],
    leaseInput: Omit<Parameters<typeof api.createLease>[0], 'tenantId'>,
  ) => {
    const tenant = await api.createTenant(tenantInput);
    const lease = await api.createLease({ ...leaseInput, tenantId: tenant.id });
    // Filtres retirés pour être sûr de voir le nouveau locataire, dont la fiche s'affiche une fois la liste rechargée.
    setFilter('tous');
    setQuery('');
    setSelectedId(lease.id);
    justAddedId.current = lease.id;
    setAdding(false);
    reload();
  };

  const selectedLeaseId = selected?.lease.id;
  useEffect(() => {
    if (!selectedLeaseId || selectedLeaseId !== justAddedId.current) return;
    justAddedId.current = undefined;
    // On laisse d'abord le formulaire finir de se fermer et la fiche prendre sa place sous la liste.
    const timer = setTimeout(() => scrollRef.current?.scrollTo({ y: cardY.current, animated: true }), 350);
    return () => clearTimeout(timer);
  }, [selectedLeaseId]);

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader notificationCount={6} />

        <View>
          <Text style={[typography.title, styles.text]}>Locataires</Text>
          <Text style={[typography.caption, styles.muted]}>Contacts, baux et situation de chacun</Text>
        </View>

        <Button label="Ajouter un locataire" icon="add" onPress={() => setAdding(true)} />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un locataire, un lot…"
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
          returnKeyType="search"
          style={[typography.body, styles.search]}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map((f) => (
            <FilterChip
              key={f.key}
              label={`${f.label} ${data?.entries.filter(f.matches).length ?? ''}`.trim()}
              active={f.key === filter}
              onPress={() => setFilter(f.key)}
            />
          ))}
        </ScrollView>

        {visible && (
          <Card>
            {visible.map((entry) => (
              <TenantRow
                key={entry.lease.id}
                entry={entry}
                selected={entry.lease.id === selected?.lease.id}
                onPress={() => select(entry)}
              />
            ))}
            {visible.length === 0 && <Text style={[typography.body, styles.muted]}>Aucun locataire trouvé.</Text>}
          </Card>
        )}

        {data && selected && (
          <View onLayout={(e) => (cardY.current = e.nativeEvent.layout.y)}>
            <TenantCard entry={selected} period={data.period} />
          </View>
        )}
      </ScrollView>

      {data && (
        <AddTenantForm
          visible={adding}
          today={data.today}
          freeUnits={data.freeUnits}
          onClose={() => setAdding(false)}
          onSubmit={addTenant}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  content: { padding: spacing.lg, gap: spacing.md },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
  search: {
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  chips: { gap: spacing.sm },
});
