import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card } from '@/components/ui';
import * as api from '@/data/api';
import { allocateOldestFirst, PAYMENT_METHOD_LABELS } from '@/domain/rent';
import { ChoiceChips } from '@/features/argent/ChoiceChips';
import { buildLeaseOptions, leaseLabel, monthLabel, parseAmount } from '@/features/argent/payment';
import { TenantPicker } from '@/features/argent/TenantPicker';
import { TextField } from '@/features/argent/TextField';
import { useData } from '@/hooks/use-data';
import { colors, radius, spacing, typography } from '@/theme';
import type { PaymentMethod } from '@/types/models';
import { formatAmount, formatFCFA } from '@/utils/format';

const METHODS = (Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((key) => ({
  key,
  label: PAYMENT_METHOD_LABELS[key],
}));

/**
 * Saisir un paiement — le propriétaire enregistre de l'argent reçu d'un locataire.
 * Ouvert depuis Accueil (« Encaisser »), Argent, Reliquats ou la fiche d'un lot avec `leaseId` pré-rempli.
 * Règle : l'argent règle les mois dus les plus anciens d'abord (`recordLeasePayment`) ; l'écran montre la répartition.
 * Maquette : « Saisir un paiement ».
 */
export default function SaisirPaiementScreen() {
  const params = useLocalSearchParams<{ leaseId?: string }>();

  const { data } = useData(async () => {
    const [today, period, leases, tenants, units, properties, payments] = await Promise.all([
      api.getToday(),
      api.getCurrentPeriod(),
      api.listLeases(),
      api.listTenants(),
      api.listUnits(),
      api.listProperties(),
      api.listPayments(),
    ]);
    return { today, options: buildLeaseOptions(leases, tenants, units, properties, payments, period, today) };
  }, []);

  const [leaseId, setLeaseId] = useState(params.leaseId);
  // `undefined` = montant par défaut (tout ce qui est dû) tant que l'utilisateur n'a rien saisi.
  const [amountText, setAmountText] = useState<string>();
  const [method, setMethod] = useState<PaymentMethod>('wave');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const option = data?.options.find((o) => o.lease.id === leaseId);

  if (!data) return <SafeAreaView style={styles.root} edges={['bottom']} />;

  if (!option) {
    return (
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <TenantPicker
            options={data.options}
            onSelect={(o) => {
              setLeaseId(o.lease.id);
              setAmountText(undefined);
            }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const amount = amountText === undefined ? option.totalDue : parseAmount(amountText);
  const tooMuch = amount > option.totalDue;
  const canSubmit = amount > 0 && !tooMuch && !submitting;
  // Aperçu de l'imputation : le même calcul que l'API fera à l'enregistrement.
  const { allocations } = allocateOldestFirst(option.owed, tooMuch ? option.totalDue : amount);

  const submit = async () => {
    setSubmitting(true);
    try {
      const { payments } = await api.recordLeasePayment({
        leaseId: option.lease.id,
        amount,
        method,
        reference: reference.trim() || undefined,
        paidAt: data.today,
      });
      router.replace({ pathname: '/paiement/confirme', params: { paymentIds: payments.map((p) => p.id).join(',') } });
    } catch {
      setSubmitting(false);
      Alert.alert('Paiement non enregistré', 'Une erreur est survenue. Réessayez.');
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <Text style={[typography.caption, styles.label]}>Locataire</Text>
            <Pressable onPress={() => setLeaseId(undefined)} style={styles.select} accessibilityRole="button">
              <Text style={[typography.body, styles.text]} numberOfLines={1}>
                {leaseLabel(option)}
              </Text>
              <Text style={[typography.caption, styles.change]}>Changer</Text>
            </Pressable>
          </View>

          <View style={styles.summary}>
            <SummaryBox label="Loyer" value={option.lease.rent} />
            <SummaryBox label="Payé ce mois" value={option.paid} />
            <SummaryBox label="Total dû" value={option.totalDue} danger={option.totalDue > 0} />
          </View>

          {option.owed.length > 1 && (
            <Card style={styles.owed}>
              <Text style={[typography.caption, styles.label]}>Dû mois par mois</Text>
              {option.owed.map((m) => (
                <View key={m.period} style={styles.line}>
                  <Text style={[typography.body, styles.text]}>{monthLabel(m.period)}</Text>
                  <Text style={[typography.bodyStrong, { color: colors.late }]}>{formatFCFA(m.remaining)}</Text>
                </View>
              ))}
            </Card>
          )}

          {option.status === 'a_verifier' && (
            <Card style={styles.notice}>
              <Text style={[typography.caption, { color: colors.toVerify }]}>
                Un paiement mobile money déclaré par ce locataire attend votre vérification (onglet Argent).
              </Text>
            </Card>
          )}

          {option.totalDue === 0 ? (
            <Card>
              <Text style={[typography.bodyStrong, { color: colors.paid }]}>
                Ce locataire est à jour : il ne doit rien pour le moment.
              </Text>
            </Card>
          ) : (
            <>
              <TextField
                label="Montant reçu (FCFA)"
                value={amountText ?? String(option.totalDue)}
                onChangeText={setAmountText}
                keyboardType="number-pad"
                error={tooMuch ? `Le montant dépasse ce que le locataire doit (${formatFCFA(option.totalDue)}).` : undefined}
              />
              {amount !== option.totalDue && (
                <Pressable
                  onPress={() => setAmountText(String(option.totalDue))}
                  style={styles.settle}
                  accessibilityRole="button">
                  <Text style={[typography.caption, styles.label]}>Tout régler</Text>
                </Pressable>
              )}

              <View style={styles.field}>
                <Text style={[typography.caption, styles.label]}>Mode de règlement</Text>
                <ChoiceChips options={METHODS} value={method} onChange={setMethod} />
              </View>

              {method !== 'especes' && (
                <TextField
                  label="Référence de la transaction (facultatif)"
                  value={reference}
                  onChangeText={setReference}
                  placeholder="Ex. WV-8F3K2A"
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              )}

              {allocations.length > 0 && (
                <View style={styles.preview}>
                  <Text style={[typography.caption, styles.label]}>Ce paiement règle, le plus ancien d’abord</Text>
                  {allocations.map((a) => {
                    const left = (option.owed.find((m) => m.period === a.period)?.remaining ?? 0) - a.amount;
                    return (
                      <View key={a.period} style={styles.line}>
                        <Text style={[typography.body, styles.text]}>
                          {monthLabel(a.period)} · {formatAmount(a.amount)}
                        </Text>
                        <Text style={[typography.caption, { color: left > 0 ? colors.late : colors.paid, fontWeight: '600' }]}>
                          {left > 0 ? `reste ${formatAmount(left)}` : 'soldé'}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <View style={styles.reliquat}>
                <Text style={[typography.caption, styles.label]}>Reste dû après ce paiement</Text>
                <Text style={[typography.heading, styles.text]}>
                  {formatFCFA(Math.max(0, option.totalDue - amount))}
                </Text>
              </View>

              <Button
                label={submitting ? 'Enregistrement…' : 'Enregistrer et envoyer la quittance'}
                fullWidth
                disabled={!canSubmit}
                onPress={submit}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SummaryBox({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <View style={[styles.box, danger && styles.boxDanger]}>
      <Text style={[typography.overline, { color: danger ? colors.late : colors.textMuted }]}>{label}</Text>
      <Text style={[typography.bodyStrong, { color: danger ? colors.late : colors.text }]}>{formatAmount(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  field: { gap: spacing.xs },
  label: { color: colors.text, fontWeight: '600' },
  text: { color: colors.text },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  change: { marginLeft: 'auto', color: colors.textMuted, fontWeight: '600' },
  summary: { flexDirection: 'row', gap: spacing.sm },
  box: { flex: 1, backgroundColor: colors.border, borderRadius: radius.md, padding: spacing.md, gap: 2 },
  boxDanger: { backgroundColor: colors.lateSoft },
  owed: { gap: spacing.xs },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notice: { backgroundColor: colors.toVerifySoft },
  settle: {
    alignSelf: 'flex-start',
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: -spacing.sm,
  },
  preview: { backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  reliquat: { backgroundColor: colors.border, borderRadius: radius.md, padding: spacing.md, gap: 2 },
});
