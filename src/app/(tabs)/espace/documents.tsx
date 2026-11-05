import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen } from '@/components/ui';
import * as api from '@/data/api';
import { useReloadOnFocus } from '@/features/patrimoine/use-reload-on-focus';
import { useData } from '@/hooks/use-data';
import { colors, radius, spacing, typography } from '@/theme';
import { formatDate } from '@/utils/format';

const RECENT_RECEIPTS = 4;

/** Registre des dernières quittances. Maquette : « Documents ». */
export default function DocumentsScreen() {
  const { data: receipts, reload } = useData(async () => {
    const [receiptList, payments, leases, units, properties] = await Promise.all([
      api.listReceipts(),
      api.listPayments(),
      api.listLeases(),
      api.listUnits(),
      api.listProperties(),
    ]);
    return [...receiptList]
      .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
      .slice(0, RECENT_RECEIPTS)
      .map((receipt) => {
        const lease = leases.find((l) => l.id === payments.find((p) => p.id === receipt.paymentId)?.leaseId);
        const unit = units.find((u) => u.id === lease?.unitId);
        const property = properties.find((p) => p.id === unit?.propertyId);
        return { receipt, place: [property?.name, unit?.label].filter(Boolean).join(' · ') };
      });
  }, []);
  useReloadOnFocus(reload);

  return (
    <Screen edges={[]}>
      <Text style={[typography.caption, styles.muted]}>Quittances et pièces des dossiers locataires</Text>

      <Card style={styles.card}>
        <Text style={[typography.heading, styles.text]}>Registre des quittances</Text>
        <Button
          label="Ouvrir toutes les quittances"
          variant="secondary"
          style={styles.outlined}
          onPress={() => router.push('/argent/quittances')}
        />
        {receipts?.map(({ receipt, place }) => (
          <View key={receipt.id} style={styles.row}>
            <Text style={[typography.bodyStrong, styles.text]}>{receipt.number}</Text>
            <Text style={[typography.caption, styles.muted]}>{place}</Text>
            <Text style={[typography.caption, styles.muted]}>{formatDate(receipt.issuedAt)}</Text>
          </View>
        ))}
        {receipts?.length === 0 && <Text style={[typography.body, styles.muted]}>Aucune quittance pour le moment.</Text>}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
  outlined: { borderWidth: 1, borderColor: colors.border },
  row: { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md, gap: 2 },
});
