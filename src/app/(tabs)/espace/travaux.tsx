import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen, StatCard } from '@/components/ui';
import * as api from '@/data/api';
import { useReloadOnFocus } from '@/features/patrimoine/use-reload-on-focus';
import { useData } from '@/hooks/use-data';
import { colors, spacing, typography } from '@/theme';
import type { ExpenseCategory } from '@/types/models';
import { formatDate, formatFCFA, formatPeriod } from '@/utils/format';

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  travaux: 'Travaux',
  entretien: 'Entretien',
  charges: 'Charges',
  taxes: 'Taxes',
  autre: 'Autre',
};

/** Dépenses du mois et résultat net. Maquette : « Travaux et dépenses ». */
export default function TravauxScreen() {
  const { data, reload } = useData(async () => {
    const [period, expenses, payments, properties, units] = await Promise.all([
      api.getCurrentPeriod(),
      api.listExpenses(),
      api.listPayments(),
      api.listProperties(),
      api.listUnits(),
    ]);
    const spent = expenses.filter((e) => e.date.startsWith(period)).reduce((sum, e) => sum + e.amount, 0);
    const received = payments
      .filter((p) => p.period === period && p.status === 'confirme')
      .reduce((sum, p) => sum + p.amount, 0);
    const items = [...expenses]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((expense) => {
        const place = [
          properties.find((p) => p.id === expense.propertyId)?.name,
          units.find((u) => u.id === expense.unitId)?.label,
        ].filter(Boolean);
        return { expense, detail: [...place, CATEGORY_LABELS[expense.category], formatDate(expense.date)].join(' · ') };
      });
    return { period, spent, net: received - spent, items };
  }, []);
  useReloadOnFocus(reload);

  return (
    <Screen edges={[]}>
      <Text style={[typography.caption, styles.muted]}>Charges du mois et résultat net</Text>

      {/* Pas encore de formulaire : il faut d'abord ajouter la création de dépense dans `@/data/api` (zone commune). */}
      <Button label="Ajouter une dépense" icon="add" disabled />

      {data && (
        <>
          <StatCard label="Dépenses du mois" value={data.spent} caption={formatPeriod(data.period)} />
          <StatCard label="Résultat net du mois" value={data.net} caption="Encaissé moins dépenses" />

          <Card>
            <Text style={[typography.heading, styles.text]}>Dernières dépenses</Text>
            {data.items.map(({ expense, detail }) => (
              <View key={expense.id} style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={[typography.bodyStrong, styles.text]}>{expense.label}</Text>
                  <Text style={[typography.caption, styles.muted]}>{detail}</Text>
                </View>
                <Text style={[typography.bodyStrong, styles.text]}>{formatFCFA(expense.amount)}</Text>
              </View>
            ))}
            {data.items.length === 0 && (
              <Text style={[typography.body, styles.muted]}>Aucune dépense enregistrée.</Text>
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { color: colors.text },
  muted: { color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  rowText: { flex: 1, gap: 2 },
});
