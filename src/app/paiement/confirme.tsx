import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card } from '@/components/ui';
import { APP_NAME } from '@/constants/app';
import * as api from '@/data/api';
import { PAYMENT_METHOD_LABELS } from '@/domain/rent';
import { buildLeaseOptions, receiptMessage, unitLabel, whatsappUrl } from '@/features/argent/payment';
import { buildReceiptViews } from '@/features/argent/receipts';
import { shareReceiptPdf } from '@/features/argent/share-receipt';
import { useData } from '@/hooks/use-data';
import { colors, spacing, typography } from '@/theme';
import { formatFCFA } from '@/utils/format';

/** Paiement enregistré — récapitulatif et envoi de la quittance. Maquette : « Paiement enregistré ». */
export default function PaiementEnregistreScreen() {
  const { paymentId } = useLocalSearchParams<{ paymentId?: string }>();

  const { data } = useData(async () => {
    const [today, payments, receipts, leases, tenants, units, properties] = await Promise.all([
      api.getToday(),
      api.listPayments(),
      api.listReceipts(),
      api.listLeases(),
      api.listTenants(),
      api.listUnits(),
      api.listProperties(),
    ]);
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return undefined;
    const option = buildLeaseOptions(leases, tenants, units, properties, payments, payment.period, today).find(
      (o) => o.lease.id === payment.leaseId,
    );
    const receipt = receipts.find((r) => r.paymentId === payment.id);
    // Même vue que l'écran Quittances, pour générer le PDF.
    const receiptView = receipt
      ? buildReceiptViews([receipt], payments, leases, tenants, units, properties)[0]
      : undefined;
    return { payment, option, receipt, receiptView };
  }, [paymentId]);
  const [sharing, setSharing] = useState(false);

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

  const { payment, option, receipt, receiptView } = data;
  const tenantName = option?.tenant?.fullName ?? 'le locataire';
  const remaining = option?.remaining ?? 0;
  const message = receiptMessage({
    tenantName,
    amount: payment.amount,
    period: payment.period,
    place: option ? unitLabel(option) : '',
    receiptNumber: receipt?.number,
    remaining,
  });
  const phone = option?.tenant?.phone;

  const sendWhatsApp = async () => {
    if (!phone) return;
    try {
      await Linking.openURL(whatsappUrl(phone, message));
    } catch {
      Alert.alert('WhatsApp indisponible', 'Impossible d’ouvrir WhatsApp sur cet appareil.');
    }
  };

  const sharePdf = async () => {
    if (!receiptView) return;
    setSharing(true);
    try {
      await shareReceiptPdf(receiptView, APP_NAME);
    } catch {
      Alert.alert('PDF indisponible', 'La quittance n’a pas pu être générée. Réessayez.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.check}>
            <Ionicons name="checkmark" size={28} color={colors.paid} />
          </View>
          <Text style={[typography.title, styles.center, styles.text]}>Paiement enregistré</Text>
          <Text style={[typography.body, styles.center, styles.muted]}>
            {formatFCFA(payment.amount)} reçus de {tenantName} ({PAYMENT_METHOD_LABELS[payment.method]}).
            {receipt ? ` La quittance ${receipt.number} est prête.` : ''}
          </Text>
          <Text style={[typography.bodyStrong, styles.center, { color: remaining > 0 ? colors.late : colors.paid }]}>
            {remaining > 0 ? `Reste dû : ${formatFCFA(remaining)}` : 'Loyer du mois soldé'}
          </Text>

          <View style={styles.actions}>
            {receiptView && (
              <Button
                label={sharing ? 'Préparation du PDF…' : 'Partager le PDF'}
                icon="document-outline"
                fullWidth
                disabled={sharing}
                onPress={sharePdf}
              />
            )}
            <Button
              label="Message WhatsApp"
              icon="logo-whatsapp"
              variant={receiptView ? 'secondary' : 'primary'}
              fullWidth
              style={receiptView ? styles.outlined : undefined}
              disabled={!phone}
              onPress={sendWhatsApp}
            />
            {receipt && (
              <Button
                label="Voir la quittance"
                icon="document-text-outline"
                variant="secondary"
                fullWidth
                style={styles.outlined}
                onPress={() => router.push({ pathname: '/paiement/quittance/[id]', params: { id: receipt.id } })}
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
  actions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.sm },
  // Les boutons blancs ont besoin d'un contour sur une carte blanche.
  outlined: { borderWidth: 1, borderColor: colors.border },
});
