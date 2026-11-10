import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card } from '@/components/ui';
import * as api from '@/data/api';
import { PAYMENT_METHOD_LABELS } from '@/domain/rent';
import { ChoiceChips } from '@/features/argent/ChoiceChips';
import { buildLeaseOptions, leaseLabel, parseAmount } from '@/features/argent/payment';
import { TenantPicker } from '@/features/argent/TenantPicker';
import { TextField } from '@/features/argent/TextField';
import { useData } from '@/hooks/use-data';
import { colors, radius, spacing, typography } from '@/theme';
import type { PaymentMethod } from '@/types/models';
import { formatAmount, formatFCFA, formatPeriod } from '@/utils/format';

const METHODS = (Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((key) => ({
  key,
  label: PAYMENT_METHOD_LABELS[key],
}));

/**
 * Saisir un paiement — le propriétaire enregistre un loyer reçu.
 * Ouvert depuis Accueil (« Encaisser »), Argent, ou la fiche d'un lot avec `leaseId` pré-rempli.
 * `period` (« 2026-09 ») permet de régler un reliquat d'un mois précédent, depuis l'écran Reliquats.
 * Maquette : « Saisir un paiement ».
 */
export default function SaisirPaiementScreen() {
  const params = useLocalSearchParams<{ leaseId?: string; period?: string }>();

  const { data } = useData(async () => {
    const [today, currentPeriod, leases, tenants, units, properties, payments] = await Promise.all([
      api.getToday(),
      api.getCurrentPeriod(),
      api.listLeases(),
      api.listTenants(),
      api.listUnits(),
      api.listProperties(),
      api.listPayments(),
    ]);
    // Un mois passé est accepté ; une valeur invalide ou future retombe sur le mois en cours.
    const requested = params.period;
    const period =
      requested && /^\d{4}-\d{2}$/.test(requested) && requested <= currentPeriod ? requested : currentPeriod;
    return {
      today,
      period,
      isPastMonth: period !== currentPeriod,
      options: buildLeaseOptions(leases, tenants, units, properties, payments, period, today),
    };
  }, [params.period]);

  const [leaseId, setLeaseId] = useState(params.leaseId);
  // `undefined` = montant par défaut (le reste dû) tant que l'utilisateur n'a rien saisi.
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

  const amount = amountText === undefined ? option.remaining : parseAmount(amountText);
  const tooMuch = amount > option.remaining;
  const canSubmit = amount > 0 && !tooMuch && !submitting;

  const submit = async () => {
    setSubmitting(true);
    try {
      const { payment } = await api.recordPayment({
        leaseId: option.lease.id,
        period: data.period,
        amount,
        method,
        reference: reference.trim() || undefined,
        status: 'confirme',
        paidAt: data.today,
      });
      router.replace({ pathname: '/paiement/confirme', params: { paymentId: payment.id } });
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

          {data.isPastMonth && (
            <Card style={styles.pastMonth}>
              <Text style={[typography.bodyStrong, { color: colors.late }]}>
                Reliquat du loyer {/^[aeiou]/i.test(formatPeriod(data.period)) ? 'd’' : 'de '}
                {formatPeriod(data.period)}
              </Text>
            </Card>
          )}

          <View style={styles.summary}>
            <SummaryBox label="Loyer" value={option.lease.rent} />
            <SummaryBox label="Déjà payé" value={option.paid} />
            <SummaryBox label="Reste dû" value={option.remaining} danger={option.remaining > 0} />
          </View>

          {option.status === 'a_verifier' && (
            <Card style={styles.notice}>
              <Text style={[typography.caption, { color: colors.toVerify }]}>
                Un paiement mobile money déclaré par ce locataire attend votre vérification (onglet Argent).
              </Text>
            </Card>
          )}

          {option.remaining === 0 ? (
            <Card>
              <Text style={[typography.bodyStrong, { color: colors.paid }]}>Le loyer de ce mois est déjà soldé.</Text>
            </Card>
          ) : (
            <>
              <TextField
                label="Montant reçu (FCFA)"
                value={amountText ?? String(option.remaining)}
                onChangeText={setAmountText}
                keyboardType="number-pad"
                error={tooMuch ? `Le montant dépasse le reste dû (${formatFCFA(option.remaining)}).` : undefined}
              />
              {amount !== option.remaining && (
                <Pressable
                  onPress={() => setAmountText(String(option.remaining))}
                  style={styles.settle}
                  accessibilityRole="button">
                  <Text style={[typography.caption, styles.label]}>Solder le reste</Text>
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

              <View style={styles.reliquat}>
                <Text style={[typography.caption, styles.label]}>Reliquat après ce paiement</Text>
                <Text style={[typography.heading, styles.text]}>
                  {formatFCFA(Math.max(0, option.remaining - amount))}
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
  notice: { backgroundColor: colors.toVerifySoft },
  pastMonth: { backgroundColor: colors.lateSoft },
  settle: {
    alignSelf: 'flex-start',
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: -spacing.sm,
  },
  reliquat: { backgroundColor: colors.border, borderRadius: radius.md, padding: spacing.md, gap: 2 },
});
