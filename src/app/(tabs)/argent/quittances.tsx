import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen, StatCard } from '@/components/ui';
import * as api from '@/data/api';
import { ReceiptRow } from '@/features/argent/ReceiptRow';
import { buildReceiptViews, ofPeriod, summarizeReceipts } from '@/features/argent/receipts';
import { useReloadOnFocus } from '@/features/patrimoine/use-reload-on-focus';
import { useData } from '@/hooks/use-data';
import { colors, typography } from '@/theme';

/** Quittances — les preuves de paiement du mois. Maquette : « Argent — quittances ». */
export default function QuittancesScreen() {
  const { data, reload } = useData(async () => {
    const [period, receipts, payments, leases, tenants, units, properties] = await Promise.all([
      api.getCurrentPeriod(),
      api.listReceipts(),
      api.listPayments(),
      api.listLeases(),
      api.listTenants(),
      api.listUnits(),
      api.listProperties(),
    ]);
    const views = buildReceiptViews(receipts, payments, leases, tenants, units, properties);
    // Les chiffres portent sur le mois en cours ; la liste montre aussi les reliquats réglés des mois passés.
    const ofMonth = views.filter((v) => v.payment.period === period);
    return { period, views, summary: summarizeReceipts(ofMonth) };
  }, []);
  // Une quittance vient d'être émise depuis « Saisir un paiement » : la liste doit la montrer.
  useReloadOnFocus(reload);

  const s = data?.summary;

  return (
    <Screen edges={[]}>
      <View>
        <Text style={[typography.title, styles.text]}>Quittances</Text>
        <Text style={[typography.caption, styles.muted]}>
          Chaque encaissement génère une preuve, avec sa référence, à envoyer au locataire
        </Text>
      </View>

      <Button label="Saisir un paiement" icon="add" onPress={() => router.push('/paiement/nouveau')} />

      {data && s && (
        <>
          <StatCard label="Documents émis" value={String(s.count)} caption={`Loyers ${ofPeriod(data.period)}`} />
          <StatCard label="Montant quittancé" value={s.amount} />
          <StatCard
            label="Reçus partiels"
            value={String(s.partialCount)}
            caption="Paiement qui ne couvre pas tout le loyer"
          />
          <StatCard label="Payés par mobile money" value={s.mobileMoneyAmount} caption="Wave et Orange Money" />

          <Card>
            <Text style={[typography.heading, styles.text]}>Toutes les quittances</Text>
            {data.views.map((view) => (
              <ReceiptRow
                key={view.receipt.id}
                view={view}
                onPress={() =>
                  router.push({ pathname: '/paiement/quittance/[id]', params: { id: view.receipt.id } })
                }
              />
            ))}
            {data.views.length === 0 && (
              <Text style={[typography.body, styles.muted]}>Aucune quittance pour le moment.</Text>
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
});
