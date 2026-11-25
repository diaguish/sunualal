import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card } from '@/components/ui';
import { APP_NAME } from '@/constants/app';
import * as api from '@/data/api';
import { PAYMENT_METHOD_LABELS, remainingAmount } from '@/domain/rent';
import { buildLeaseOptions, monthLabel, receiptMessage, unitLabel, whatsappUrl } from '@/features/argent/payment';
import { buildReceiptViews, ReceiptView } from '@/features/argent/receipts';
import { shareReceiptPdf } from '@/features/argent/share-receipt';
import { useData } from '@/hooks/use-data';
import { colors, radius, spacing, typography } from '@/theme';
import { formatAmount, formatFCFA } from '@/utils/format';

/**
 * Paiement enregistré — récapitulatif et envoi des quittances. Maquette : « Paiement enregistré ».
 * Un paiement peut régler plusieurs mois (le plus ancien d'abord) : une quittance par mois touché.
 */
export default function PaiementEnregistreScreen() {
  const { paymentIds } = useLocalSearchParams<{ paymentIds?: string }>();

  const { data } = useData(async () => {
    const ids = (paymentIds ?? '').split(',').filter(Boolean);
    const [today, period, payments, receipts, leases, tenants, units, properties] = await Promise.all([
      api.getToday(),
      api.getCurrentPeriod(),
      api.listPayments(),
      api.listReceipts(),
      api.listLeases(),
      api.listTenants(),
      api.listUnits(),
      api.listProperties(),
    ]);
    const parts = payments.filter((p) => ids.includes(p.id)).sort((a, b) => a.period.localeCompare(b.period));
    const lease = leases.find((l) => l.id === parts[0]?.leaseId);
    if (!lease) return undefined;
    const option = buildLeaseOptions([lease], tenants, units, properties, payments, period, today)[0];
    const views = buildReceiptViews(
      receipts.filter((r) => ids.includes(r.paymentId)),
      payments,
      leases,
      tenants,
      units,
      properties,
    ).sort((a, b) => a.payment.period.localeCompare(b.payment.period));
    return {
      option,
      method: parts[0].method,
      total: parts.reduce((sum, p) => sum + p.amount, 0),
      parts: parts.map((p) => ({
        period: p.period,
        amount: p.amount,
        remainingAfter: remainingAmount(lease, p.period, payments),
        view: views.find((v) => v.payment.id === p.id),
      })),
    };
  }, [paymentIds]);
  const [sharingId, setSharingId] = useState<string>();

  // Ouvert par un lien direct, il n'y a rien dessous à révéler : on revient à l'Accueil.
  const finish = () => (router.canDismiss() ? router.dismissAll() : router.replace('/'));

  if (!data) {
    return (
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <View style={styles.content}>
          <Button label="Terminer" variant="secondary" fullWidth onPress={finish} />
        </View>
      </SafeAreaView>
    );
  }

  const { option, parts, total, method } = data;
  const tenantName = option.tenant?.fullName ?? 'le locataire';
  const phone = option.tenant?.phone;
  const views = parts.flatMap((p) => (p.view ? [p.view] : []));
  const message = receiptMessage({
    tenantName,
    amount: total,
    place: unitLabel(option),
    parts: parts.map((p) => ({ ...p, receiptNumber: p.view?.receipt.number })),
    totalDueAfter: option.totalDue,
  });

  const sendWhatsApp = async () => {
    if (!phone) return;
    try {
      await Linking.openURL(whatsappUrl(phone, message));
    } catch {
      Alert.alert('WhatsApp indisponible', 'Impossible d’ouvrir WhatsApp sur cet appareil.');
    }
  };

  const sharePdf = async (view: ReceiptView) => {
    setSharingId(view.receipt.id);
    try {
      await shareReceiptPdf(view, APP_NAME);
    } catch {
      Alert.alert('PDF indisponible', 'La quittance n’a pas pu être générée. Réessayez.');
    } finally {
      setSharingId(undefined);
    }
  };

  const openReceipt = (view: ReceiptView) =>
    router.push({ pathname: '/paiement/quittance/[id]', params: { id: view.receipt.id } });

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.check}>
            <Ionicons name="checkmark" size={28} color={colors.paid} />
          </View>
          <Text style={[typography.title, styles.center, styles.text]}>Paiement enregistré</Text>
          <Text style={[typography.body, styles.center, styles.muted]}>
            {formatFCFA(total)} reçus de {tenantName} ({PAYMENT_METHOD_LABELS[method]}).
          </Text>

          <View style={styles.parts}>
            {parts.map((p) => (
              // Ligne et icône de partage côte à côte : un bouton ne peut pas en contenir un autre.
              <View key={p.period} style={styles.part}>
                <Pressable
                  onPress={p.view ? () => openReceipt(p.view!) : undefined}
                  accessibilityRole={p.view ? 'button' : undefined}
                  style={({ pressed }) => [styles.partMain, pressed && styles.pressed]}>
                  <View style={styles.partText}>
                    <Text style={[typography.bodyStrong, styles.text]}>
                      {monthLabel(p.period)} · {formatAmount(p.amount)}
                    </Text>
                    <Text style={[typography.caption, styles.muted]}>
                      {p.view ? `${p.view.partial ? 'Reçu d’acompte' : 'Quittance'} ${p.view.receipt.number}` : ''}
                    </Text>
                  </View>
                  <Text
                    style={[typography.caption, styles.state, { color: p.remainingAfter > 0 ? colors.late : colors.paid }]}>
                    {p.remainingAfter > 0 ? `reste ${formatAmount(p.remainingAfter)}` : 'soldé'}
                  </Text>
                </Pressable>
                {views.length > 1 && p.view && (
                  <Pressable
                    onPress={() => sharePdf(p.view!)}
                    disabled={!!sharingId}
                    accessibilityRole="button"
                    accessibilityLabel={`Partager le PDF de ${monthLabel(p.period)}`}
                    hitSlop={8}>
                    <Ionicons name="share-outline" size={20} color={colors.primary} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>

          <Text
            style={[typography.bodyStrong, styles.center, { color: option.totalDue > 0 ? colors.late : colors.paid }]}>
            {option.totalDue > 0 ? `Reste dû au total : ${formatFCFA(option.totalDue)}` : 'Tout est réglé'}
          </Text>

          <View style={styles.actions}>
            {views.length === 1 && (
              <Button
                label={sharingId ? 'Préparation du PDF…' : 'Partager le PDF'}
                icon="document-outline"
                fullWidth
                disabled={!!sharingId}
                onPress={() => sharePdf(views[0])}
              />
            )}
            {views.length > 1 && (
              <Text style={[typography.caption, styles.center, styles.muted]}>
                Une quittance par mois réglé : partagez chaque PDF avec l’icône à droite du mois.
              </Text>
            )}
            <Button
              label="Message WhatsApp"
              icon="logo-whatsapp"
              variant={views.length === 1 ? 'secondary' : 'primary'}
              fullWidth
              style={views.length === 1 ? styles.outlined : undefined}
              disabled={!phone}
              onPress={sendWhatsApp}
            />
            {views.length === 1 && (
              <Button
                label="Voir la quittance"
                icon="document-text-outline"
                variant="secondary"
                fullWidth
                style={styles.outlined}
                onPress={() => openReceipt(views[0])}
              />
            )}
            <Button label="Terminer" variant="secondary" fullWidth style={styles.outlined} onPress={finish} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, flexGrow: 1, justifyContent: 'center' },
  card: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  check: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
  parts: { alignSelf: 'stretch', gap: spacing.sm },
  part: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  partMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pressed: { opacity: 0.7 },
  partText: { flex: 1, gap: 2 },
  state: { fontWeight: '600' },
  actions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.sm },
  // Les boutons blancs ont besoin d'un contour sur une carte blanche.
  outlined: { borderWidth: 1, borderColor: colors.border },
});
