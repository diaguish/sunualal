import { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TextInput } from 'react-native';

import { Button, Card, Screen } from '@/components/ui';
import * as api from '@/data/api';
import { buildArrears } from '@/features/argent/arrears';
import { whatsappUrl } from '@/features/argent/payment';
import { LateTenantRow } from '@/features/espace/LateTenantRow';
import { buildReminders, REMINDER_STEP_LABELS, reminderMessage, reminderSummary } from '@/features/espace/reminders';
import { ToneChips } from '@/features/espace/ToneChips';
import { useReloadOnFocus } from '@/features/patrimoine/use-reload-on-focus';
import { useData } from '@/hooks/use-data';
import { colors, radius, spacing, typography } from '@/theme';
import type { ReminderTone } from '@/types/models';

/** Loyers en retard et message de relance prêt à envoyer par WhatsApp. Maquette : « Relances ». */
export default function RelancesScreen() {
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
    const { lines } = buildArrears(leases, tenants, units, properties, payments, period, today);
    return buildReminders(lines);
  }, []);
  // Revient d'un encaissement : un locataire qui a payé ne doit plus apparaître.
  useReloadOnFocus(reload);

  const [selectedId, setSelectedId] = useState<string>();
  const [chosenTone, setChosenTone] = useState<ReminderTone>();
  // `undefined` = texte généré ; il est remplacé dès qu'on change de locataire ou de ton.
  const [editedText, setEditedText] = useState<string>();

  const reminders = data ?? [];
  const selected = reminders.find((r) => r.line.lease.id === selectedId) ?? reminders[0];
  const tone = chosenTone ?? selected?.suggested ?? 'amical';
  const text = editedText ?? (selected ? reminderMessage(selected, tone) : '');
  const phone = selected?.line.tenant?.phone;

  const select = (leaseId: string) => {
    setSelectedId(leaseId);
    setChosenTone(undefined);
    setEditedText(undefined);
  };

  const changeTone = (next: ReminderTone) => {
    setChosenTone(next);
    setEditedText(undefined);
  };

  const send = async () => {
    if (!phone) return;
    try {
      await Linking.openURL(whatsappUrl(phone, text.trim()));
    } catch {
      Alert.alert('WhatsApp indisponible', 'Impossible d’ouvrir WhatsApp sur cet appareil.');
    }
  };

  return (
    <Screen edges={[]}>
      <Text style={[typography.caption, styles.muted]}>Loyers en retard, avec un message prêt à envoyer</Text>

      {data && (
        <Card style={styles.card}>
          <Text style={[typography.overline, styles.muted]}>En retard · {reminders.length}</Text>
          {reminders.map((r) => (
            <LateTenantRow
              key={r.line.lease.id}
              reminder={r}
              selected={r === selected}
              onPress={() => select(r.line.lease.id)}
            />
          ))}
          {reminders.length === 0 && (
            <Text style={[typography.body, styles.muted]}>Aucun loyer en retard. Personne à relancer.</Text>
          )}
        </Card>
      )}

      {selected && (
        <Card style={styles.card}>
          <Text style={[typography.overline, styles.muted]}>Message à envoyer</Text>
          <Text style={[typography.heading, styles.text]}>{selected.line.tenant?.fullName ?? '—'}</Text>
          <Text style={[typography.caption, styles.muted]}>{reminderSummary(selected)}</Text>

          <ToneChips value={tone} onChange={changeTone} />
          <Text style={[typography.caption, styles.muted]}>
            Palier conseillé pour {selected.days} {selected.days > 1 ? 'jours' : 'jour'} de retard :{' '}
            {REMINDER_STEP_LABELS[selected.suggested]}
          </Text>

          <Text style={[typography.caption, styles.label]}>Texte du message (modifiable)</Text>
          <TextInput
            value={text}
            onChangeText={setEditedText}
            multiline
            textAlignVertical="top"
            accessibilityLabel="Texte du message"
            style={[typography.body, styles.message]}
          />

          <Button
            label="Envoyer sur WhatsApp"
            icon="logo-whatsapp"
            fullWidth
            disabled={!phone || text.trim().length === 0}
            onPress={send}
          />
          {!phone && (
            <Text style={[typography.caption, styles.muted]}>Pas de numéro de téléphone pour ce locataire.</Text>
          )}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  text: { color: colors.text },
  muted: { color: colors.textMuted },
  label: { color: colors.text, fontWeight: '600' },
  message: {
    color: colors.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
