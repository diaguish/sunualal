import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Linking, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card } from '@/components/ui';
import { APP_NAME } from '@/constants/app';
import * as api from '@/data/api';
import { PAYMENT_METHOD_LABELS } from '@/domain/rent';
import { whatsappUrl } from '@/features/argent/payment';
import { buildReceiptViews, ofPeriod, receiptPlace, receiptText } from '@/features/argent/receipts';
import { useData } from '@/hooks/use-data';
import { colors, radius, spacing, typography } from '@/theme';
import { formatDate, formatFCFA } from '@/utils/format';

/** Une quittance, telle que le locataire la reçoit. Ouverte depuis Quittances ou « Paiement enregistré ». */
export default function QuittanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: view, loading } = useData(async () => {
    const [receipts, payments, leases, tenants, units, properties] = await Promise.all([
      api.listReceipts(),
      api.listPayments(),
      api.listLeases(),
      api.listTenants(),
      api.listUnits(),
      api.listProperties(),
    ]);
    return buildReceiptViews(receipts, payments, leases, tenants, units, properties).find((v) => v.receipt.id === id);
  }, [id]);

  // Ouverte par un lien direct, il n'y a rien dessous : on revient à l'Accueil.
  const close = () => (router.canGoBack() ? router.back() : router.canDismiss() ? router.dismissAll() : router.replace('/'));

  if (!view) {
    return (
      <SafeAreaView style={styles.root} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Quittance' }} />
        <View style={styles.content}>
          {!loading && <Text style={[typography.body, styles.muted]}>Cette quittance est introuvable.</Text>}
          <Button label="Fermer" variant="secondary" fullWidth onPress={close} />
        </View>
      </SafeAreaView>
    );
  }

  const { receipt, payment, tenant, property } = view;
  const text = receiptText(view);

  const sendWhatsApp = async () => {
    if (!tenant?.phone) return;
    try {
      await Linking.openURL(whatsappUrl(tenant.phone, text));
    } catch {
      Alert.alert('WhatsApp indisponible', 'Impossible d’ouvrir WhatsApp sur cet appareil.');
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <Stack.Screen options={{ title: view.partial ? 'Reçu de paiement' : 'Quittance' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.document}>
          <Text style={[typography.overline, styles.muted]}>
            {view.partial ? 'Reçu de paiement partiel' : 'Quittance de loyer'}
          </Text>
          <Text style={[typography.title, styles.text]}>{receipt.number}</Text>
          <Text style={[typography.caption, styles.muted]}>Émise le {formatDate(receipt.issuedAt, true)}</Text>

          <View style={styles.divider} />

          <Field label="Locataire" value={tenant?.fullName ?? '—'} />
          <Field label="Logement" value={[receiptPlace(view), property?.address].filter(Boolean).join(', ')} />
          <Field label="Période" value={`Loyer ${ofPeriod(payment.period)} · ${formatFCFA(view.lease.rent)}`} />
          <Field
            label="Mode de règlement"
            value={`${PAYMENT_METHOD_LABELS[payment.method]}${payment.reference ? ` · réf. ${payment.reference}` : ''}`}
          />

          <View style={styles.amount}>
            <Text style={[typography.caption, styles.muted]}>Montant reçu le {formatDate(payment.paidAt, true)}</Text>
            <Text style={[typography.display, styles.text]}>{formatFCFA(payment.amount)}</Text>
          </View>

          <Text style={[typography.bodyStrong, { color: view.remaining > 0 ? colors.late : colors.paid }]}>
            {view.remaining > 0
              ? `Reste dû sur ce mois : ${formatFCFA(view.remaining)}`
              : 'Loyer du mois entièrement réglé'}
          </Text>

          <Text style={[typography.caption, styles.muted]}>Document généré par {APP_NAME}.</Text>
        </Card>

        <View style={styles.actions}>
          <Button
            label="Envoyer par WhatsApp"
            icon="logo-whatsapp"
            fullWidth
            disabled={!tenant?.phone}
            onPress={sendWhatsApp}
          />
          <Button
            label="Partager"
            icon="share-outline"
            variant="secondary"
            fullWidth
            onPress={() => Share.share({ title: receipt.number, message: text })}
          />
          <Button label="Fermer" variant="secondary" fullWidth onPress={close} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={[typography.caption, styles.muted]}>{label}</Text>
      <Text style={[typography.body, styles.text]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  document: { gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  divider: { height: 1, backgroundColor: colors.border },
  field: { gap: 2 },
  amount: { backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md, gap: 2 },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
  actions: { gap: spacing.sm },
});
