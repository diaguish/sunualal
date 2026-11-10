import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen, StatCard } from '@/components/ui';
import * as api from '@/data/api';
import { buildArrears } from '@/features/argent/arrears';
import { ArrearsRow } from '@/features/argent/ArrearsRow';
import { useReloadOnFocus } from '@/features/patrimoine/use-reload-on-focus';
import { useData } from '@/hooks/use-data';
import { colors, typography } from '@/theme';
import { formatPeriod } from '@/utils/format';

/** Reliquats — tout ce qui reste dû, mois précédents compris. Maquette : « Argent — reliquats ». */
export default function ReliquatsScreen() {
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
    return { period, ...buildArrears(leases, tenants, units, properties, payments, period, today) };
  }, []);
  // Revient de « Saisir un paiement » : les reliquats doivent être à jour.
  useReloadOnFocus(reload);

  const month = data ? formatPeriod(data.period).replace(/ \d{4}$/, '') : '';
  const s = data?.summary;

  return (
    <Screen edges={[]}>
      <View>
        <Text style={[typography.title, styles.text]}>Reliquats</Text>
        <Text style={[typography.caption, styles.muted]}>Ce qui reste dû sur chaque loyer, jusqu’au dernier FCFA</Text>
      </View>

      <Button label="Saisir un paiement" icon="add" onPress={() => router.push('/paiement/nouveau')} />

      {s && (
        <>
          <StatCard
            label="Total des reliquats"
            value={s.total}
            caption={plural(s.tenants, 'locataire concerné', 'locataires concernés')}
            tone="danger"
          />
          <StatCard
            label={`Loyers ${/^[aeiou]/i.test(month) ? 'd’' : 'de '}${month} non soldés`}
            value={s.current.amount}
            caption={plural(s.current.count, 'loyer échu', 'loyers échus')}
          />
          <StatCard
            label="Mois précédents"
            value={s.previous.amount}
            caption={plural(s.previous.count, 'reliquat ancien', 'reliquats anciens')}
          />
          <StatCard label="Plus ancien reliquat" value={s.oldestDays > 0 ? `${s.oldestDays} jours` : '—'} />

          <Card>
            <Text style={[typography.heading, styles.text]}>Par locataire</Text>
            {data.lines.map((line) => (
              <ArrearsRow
                key={line.lease.id}
                line={line}
                onCollect={(period) =>
                  router.push({ pathname: '/paiement/nouveau', params: { leaseId: line.lease.id, period } })
                }
              />
            ))}
            {data.lines.length === 0 && (
              <Text style={[typography.body, styles.muted]}>Aucun reliquat : tous les loyers échus sont soldés.</Text>
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

const plural = (count: number, one: string, many: string) => `${count} ${count > 1 ? many : one}`;

const styles = StyleSheet.create({
  text: { color: colors.text },
  muted: { color: colors.textMuted },
});
