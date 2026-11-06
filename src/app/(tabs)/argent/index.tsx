import { router } from 'expo-router';
import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen } from '@/components/ui';
import * as api from '@/data/api';
import { OverviewBar } from '@/features/argent/OverviewBar';
import { buildLeaseOptions } from '@/features/argent/payment';
import { RentLineRow } from '@/features/argent/RentLineRow';
import {
  buildOverview,
  buildRentLines,
  exportCsv,
  matchesFilter,
  PAYMENT_FILTERS,
  PaymentFilter,
} from '@/features/argent/rent-lines';
import { StatusFilter } from '@/features/argent/StatusFilter';
import { useReloadOnFocus } from '@/features/patrimoine/use-reload-on-focus';
import { useData } from '@/hooks/use-data';
import { colors, spacing, typography } from '@/theme';
import { formatPeriod } from '@/utils/format';

/**
 * Paiements — les loyers du mois, filtrés par statut.
 * Maquette : « Argent — paiements » (la liste sous les filtres n'y figure pas : elle donne un sens aux filtres).
 */
export default function PaiementsScreen() {
  const { data, reload } = useData(async () => {
    const [today, period, leases, tenants, units, properties, payments] = await Promise.all([
      api.getToday(),
      api.getCurrentPeriod(),
      api.listLeases(),
      api.listTenants(),
      api.listUnits(),
      api.listProperties(),
      api.listPayments(),
    ]);
    const options = buildLeaseOptions(leases, tenants, units, properties, payments, period, today);
    return { today, period, lines: buildRentLines(options, payments, period) };
  }, []);
  // Revient de « Saisir un paiement » : les montants doivent être à jour.
  useReloadOnFocus(reload);

  const [filter, setFilter] = useState<PaymentFilter>('tous');

  const lines = data?.lines ?? [];
  const visible = lines.filter((l) => matchesFilter(l, filter));
  const filters = PAYMENT_FILTERS.map((f) => ({ ...f, count: lines.filter((l) => matchesFilter(l, f.key)).length }));
  const month = data ? formatPeriod(data.period) : '';

  const confirm = async (paymentId: string) => {
    await api.confirmPayment(paymentId);
    reload();
  };

  const exportMonth = () =>
    Share.share({ title: `Loyers de ${month}`, message: exportCsv(lines) });

  return (
    <Screen edges={[]}>
      <View>
        <Text style={[typography.title, styles.text]}>Paiements</Text>
        <Text style={[typography.caption, styles.muted]}>
          {data ? `Loyers ${/^[aeiou]/i.test(month) ? 'd’' : 'de '}${month} · ${lines.length} locataires` : ' '}
        </Text>
      </View>

      <View style={styles.buttons}>
        <Button label="Exporter" icon="arrow-down" variant="secondary" disabled={!data} onPress={exportMonth} />
        <Button label="Saisir un paiement" icon="add" onPress={() => router.push('/paiement/nouveau')} />
      </View>

      <Card>
        <Text style={[typography.heading, styles.text]}>Statut</Text>
        <StatusFilter filters={filters} value={filter} onChange={setFilter} />
        <Text style={[typography.caption, styles.muted]}>
          Une fois la date d’échéance passée, le statut passe automatiquement en retard. Un paiement Wave ou Orange
          Money déclaré par le locataire reste « À vérifier » jusqu’à ce que vous le confirmiez.
        </Text>
      </Card>

      {data && (
        <Card>
          <Text style={[typography.heading, styles.text]}>
            {month.charAt(0).toUpperCase() + month.slice(1).replace(/ \d{4}$/, '')} en un coup d’œil
          </Text>
          <OverviewBar overview={buildOverview(lines)} />
        </Card>
      )}

      {data && (
        <Card>
          {visible.map((line) => (
            <RentLineRow
              key={line.lease.id}
              line={line}
              period={data.period}
              today={data.today}
              onCollect={() => router.push({ pathname: '/paiement/nouveau', params: { leaseId: line.lease.id } })}
              onConfirm={() => line.pendingPayment && confirm(line.pendingPayment.id)}
            />
          ))}
          {visible.length === 0 && <Text style={[typography.body, styles.muted]}>Aucun loyer dans ce statut.</Text>}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { color: colors.text },
  muted: { color: colors.textMuted },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
