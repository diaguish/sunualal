import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader, Button, Card, Screen } from '@/components/ui';
import * as api from '@/data/api';
import { AddTenantForm } from '@/features/patrimoine/AddTenantForm';
import { FilterChip } from '@/features/patrimoine/FilterChip';
import { TenantRow } from '@/features/patrimoine/TenantRow';
import { TenantSheet } from '@/features/patrimoine/TenantSheet';
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

/** Locataires — recherche, filtres ; toucher un locataire ouvre sa fiche dans une fenêtre qui monte. Maquette : « Locataires ». */
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
    return { today, period, freeUnits, entries: buildTenantEntries(views, properties, payments, period, today) };
  }, []);
  useReloadOnFocus(reload);

  const [filter, setFilter] = useState<Filter>('tous');
  const [query, setQuery] = useState('');
  // Bail dont la fiche est ouverte (fenêtre qui monte) ; aucune fiche ouverte d'office.
  const [openId, setOpenId] = useState<string>();
  const [adding, setAdding] = useState(false);

  // Locataire qui vient d'être ajouté : sa fiche s'ouvre dès qu'il apparaît dans la liste rechargée.
  const [justAddedId, setJustAddedId] = useState<string>();

  const activeFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const visible = data?.entries.filter((e) => activeFilter.matches(e) && matchesSearch(e, query.trim()));
  const opened = data?.entries.find((e) => e.lease.id === openId);

  const addTenant = async (
    tenantInput: Parameters<typeof api.createTenant>[0],
    leaseInput: Omit<Parameters<typeof api.createLease>[0], 'tenantId'>,
  ) => {
    const tenant = await api.createTenant(tenantInput);
    const lease = await api.createLease({ ...leaseInput, tenantId: tenant.id });
    // Filtres retirés pour être sûr de voir le nouveau locataire, dont la fiche s'ouvre une fois la liste rechargée.
    setFilter('tous');
    setQuery('');
    setJustAddedId(lease.id);
    setAdding(false);
    reload();
  };

  const addedLoaded = !!justAddedId && !!data?.entries.some((e) => e.lease.id === justAddedId);
  useEffect(() => {
    if (!addedLoaded || !justAddedId) return;
    // Sur iPhone, une fenêtre ne peut pas s'ouvrir pendant que le formulaire se ferme : on attend la fin de l'animation.
    const timer = setTimeout(() => {
      setOpenId(justAddedId);
      setJustAddedId(undefined);
    }, 600);
    return () => clearTimeout(timer);
  }, [addedLoaded, justAddedId]);

  return (
    <Screen>
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
              selected={entry.lease.id === openId}
              onPress={() => setOpenId(entry.lease.id)}
            />
          ))}
          {visible.length === 0 && <Text style={[typography.body, styles.muted]}>Aucun locataire trouvé.</Text>}
        </Card>
      )}

      {data && <TenantSheet entry={opened} period={data.period} onClose={() => setOpenId(undefined)} />}

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
