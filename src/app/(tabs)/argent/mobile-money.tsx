import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen, StatCard } from '@/components/ui';
import * as api from '@/data/api';
import {
  listMobileMoneyPayments,
  paymentRequestMessage,
  requestCandidates,
  summarizeMobileMoney,
} from '@/features/argent/mobile-money';
import { MobileMoneyRow } from '@/features/argent/MobileMoneyRow';
import { buildLeaseOptions, LeaseOption, whatsappUrl } from '@/features/argent/payment';
import { RequestRow } from '@/features/argent/RequestRow';
import { useReloadOnFocus } from '@/features/patrimoine/use-reload-on-focus';
import { useData } from '@/hooks/use-data';
import { colors, typography } from '@/theme';

/**
 * Mobile Money — recevoir et demander les paiements Wave / Orange Money.
 * Maquette : « Argent — mobile money ». Le rapprochement (confirmer / refuser) viendra ensuite.
 */
export default function MobileMoneyScreen() {
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
    const options = buildLeaseOptions(leases, tenants, units, properties, payments, period, today);
    return {
      today,
      period,
      summary: summarizeMobileMoney(payments, period),
      received: listMobileMoneyPayments(payments, options, period),
      candidates: requestCandidates(options),
    };
  }, []);
  // Revient de « Saisir un paiement » : chiffres et liste à jour.
  useReloadOnFocus(reload);

  // Demandes ouvertes dans WhatsApp pendant cette session (non conservé au redémarrage).
  const [requested, setRequested] = useState<string[]>([]);

  const request = async (option: LeaseOption) => {
    if (!data || !option.tenant) return;
    try {
      await Linking.openURL(whatsappUrl(option.tenant.phone, paymentRequestMessage(option, data.period, data.today)));
      setRequested((ids) => (ids.includes(option.lease.id) ? ids : [...ids, option.lease.id]));
    } catch {
      Alert.alert('WhatsApp indisponible', 'Impossible d’ouvrir WhatsApp sur cet appareil.');
    }
  };

  const remaining = data?.candidates.filter((o) => !requested.includes(o.lease.id)) ?? [];
  const next = remaining[0];
  const s = data?.summary;

  return (
    <Screen edges={[]}>
      <View>
        <Text style={[typography.title, styles.text]}>Mobile Money</Text>
        <Text style={[typography.caption, styles.muted]}>
          Wave et Orange Money : demandez, recevez et rapprochez vos paiements
        </Text>
      </View>

      <Button label="Enregistrer un paiement reçu" icon="add" onPress={() => router.push('/paiement/nouveau')} />

      {data && s && (
        <>
          <StatCard label="Wave" value={s.wave.amount} caption={plural(s.wave.count, 'paiement', 'paiements')} />
          <StatCard
            label="Orange Money"
            value={s.orangeMoney.amount}
            caption={plural(s.orangeMoney.count, 'paiement', 'paiements')}
          />
          <StatCard
            label="À confirmer"
            value={s.toConfirm.amount}
            caption={plural(s.toConfirm.count, 'déclaration', 'déclarations')}
          />
          <StatCard label="Part du mobile money" value={`${s.share} %`} caption="Des loyers encaissés ce mois-ci" />

          <Card>
            <Text style={[typography.heading, styles.text]}>Demander le loyer</Text>
            <Text style={[typography.caption, styles.muted]}>
              Ouvre WhatsApp avec le message prêt pour chaque locataire qui n’a pas encore payé : il ne reste qu’à
              appuyer sur Envoyer.
            </Text>
            {next ? (
              <Button
                label={`Demander à tous · ${next.tenant?.fullName} (${requested.length + 1}/${data.candidates.length})`}
                icon="logo-whatsapp"
                variant="accent"
                fullWidth
                onPress={() => request(next)}
              />
            ) : (
              data.candidates.length > 0 && (
                <Text style={[typography.bodyStrong, { color: colors.paid }]}>
                  Toutes les demandes ont été ouvertes dans WhatsApp.
                </Text>
              )
            )}
            {data.candidates.map((option) => (
              <RequestRow
                key={option.lease.id}
                option={option}
                requested={requested.includes(option.lease.id)}
                onRequest={() => request(option)}
              />
            ))}
            {data.candidates.length === 0 && (
              <Text style={[typography.body, styles.muted]}>Tout le monde a payé ou déclaré son paiement.</Text>
            )}
          </Card>

          <Card>
            <Text style={[typography.heading, styles.text]}>Reçus ce mois-ci</Text>
            {data.received.map((item) => (
              <MobileMoneyRow key={item.payment.id} item={item} />
            ))}
            {data.received.length === 0 && (
              <Text style={[typography.body, styles.muted]}>Aucun paiement Wave ou Orange Money ce mois-ci.</Text>
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
