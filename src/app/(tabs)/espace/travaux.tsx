import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen, StatCard } from '@/components/ui';
import * as api from '@/data/api';
import { AddExpenseForm } from '@/features/patrimoine/AddExpenseForm';
import { CATEGORY_LABELS } from '@/features/patrimoine/expense-form';
import { InterventionRow } from '@/features/patrimoine/InterventionRow';
import { useReloadOnFocus } from '@/features/patrimoine/use-reload-on-focus';
import { useData } from '@/hooks/use-data';
import { colors, spacing, typography } from '@/theme';
import type { Expense, ID } from '@/types/models';
import { formatDate, formatFCFA, formatPeriod } from '@/utils/format';

/** Dépenses du mois, résultat net et interventions à suivre. Maquette : « Travaux et dépenses ». */
export default function TravauxScreen() {
  const { data, reload } = useData(async () => {
    const [today, period, expenses, interventions, payments, properties, units, tenants] = await Promise.all([
      api.getToday(),
      api.getCurrentPeriod(),
      api.listExpenses(),
      api.listInterventions(),
      api.listPayments(),
      api.listProperties(),
      api.listUnits(),
      api.listTenants(),
    ]);
    const placeOf = (propertyId: ID, unitId?: ID) =>
      [properties.find((p) => p.id === propertyId)?.name, units.find((u) => u.id === unitId)?.label].filter(Boolean);

    const spent = expenses.filter((e) => e.date.startsWith(period)).reduce((sum, e) => sum + e.amount, 0);
    const received = payments
      .filter((p) => p.period === period && p.status === 'confirme')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      today,
      period,
      properties,
      units,
      spent,
      net: received - spent,
      openCount: interventions.filter((i) => i.status === 'en_cours').length,
      // Celles qui restent à traiter d'abord, puis les plus récentes.
      interventions: [...interventions]
        .sort((a, b) => a.status.localeCompare(b.status) || b.reportedAt.localeCompare(a.reportedAt))
        .map((intervention) => {
          const tenant = tenants.find((t) => t.id === intervention.reportedByTenantId);
          const detail = [
            ...placeOf(intervention.propertyId, intervention.unitId),
            tenant
              ? `Signalé par ${tenant.fullName} le ${formatDate(intervention.reportedAt)}`
              : `Signalé le ${formatDate(intervention.reportedAt)}`,
            intervention.estimatedCost ? `estimé ${formatFCFA(intervention.estimatedCost)}` : undefined,
          ]
            .filter(Boolean)
            .join(' · ');
          return { intervention, detail };
        }),
      expenses: [...expenses]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((expense) => ({
          expense,
          detail: [
            ...placeOf(expense.propertyId, expense.unitId),
            CATEGORY_LABELS[expense.category],
            formatDate(expense.date),
          ].join(' · '),
        })),
    };
  }, []);
  useReloadOnFocus(reload);

  const [adding, setAdding] = useState(false);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    await api.createExpense(expense);
    setAdding(false);
    reload();
  };

  const complete = async (id: ID) => {
    await api.completeIntervention(id);
    reload();
  };

  return (
    <Screen edges={[]}>
      <Text style={[typography.caption, styles.muted]}>Interventions à suivre et charges du mois</Text>

      <Button label="Ajouter une dépense" icon="add" onPress={() => setAdding(true)} />

      {data && (
        <>
          <StatCard label="Dépenses du mois" value={data.spent} caption={formatPeriod(data.period)} />
          <StatCard label="Interventions ouvertes" value={String(data.openCount)} />
          <StatCard label="Résultat net du mois" value={data.net} caption="Encaissé moins dépenses" />

          <Card style={styles.card}>
            <Text style={[typography.heading, styles.text]}>Interventions</Text>
            {data.interventions.map(({ intervention, detail }) => (
              <InterventionRow
                key={intervention.id}
                intervention={intervention}
                detail={detail}
                onComplete={() => complete(intervention.id)}
              />
            ))}
            {data.interventions.length === 0 && (
              <Text style={[typography.body, styles.muted]}>Aucune intervention pour le moment.</Text>
            )}
          </Card>

          <Card>
            <Text style={[typography.heading, styles.text]}>Dernières dépenses</Text>
            {data.expenses.map(({ expense, detail }) => (
              <View key={expense.id} style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={[typography.bodyStrong, styles.text]}>{expense.label}</Text>
                  <Text style={[typography.caption, styles.muted]}>{detail}</Text>
                </View>
                <Text style={[typography.bodyStrong, styles.text]}>{formatFCFA(expense.amount)}</Text>
              </View>
            ))}
            {data.expenses.length === 0 && (
              <Text style={[typography.body, styles.muted]}>Aucune dépense enregistrée.</Text>
            )}
          </Card>

          <AddExpenseForm
            visible={adding}
            today={data.today}
            properties={data.properties}
            units={data.units}
            onClose={() => setAdding(false)}
            onSubmit={addExpense}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  rowText: { flex: 1, gap: 2 },
});
