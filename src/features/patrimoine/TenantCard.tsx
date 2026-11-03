import { router } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Avatar, Button, Card, StatusBadge } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import { formatDate, formatFCFA, formatPeriod } from '@/utils/format';

import { RegularityDots } from './RegularityDots';
import { situationText } from './RentSituation';
import type { TenantEntry } from './tenants';

/** « 2025-02-01 » → « févr. 2025 ». */
const monthAndYear = (iso: string) => formatDate(iso, true).split(' ').slice(1).join(' ');

/** Fiche du locataire sélectionné, sous la liste : contact, bail et loyer du mois. */
export function TenantCard({ entry, period }: { entry: TenantEntry; period: string }) {
  const { tenant, lease, view, propertyName } = entry;
  const phoneDigits = tenant.phone.replace(/\D/g, '');

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Avatar name={tenant.fullName} size={48} tone="dark" />
        <View style={styles.headerText}>
          <Text style={[typography.title, styles.name]} numberOfLines={1}>
            {tenant.fullName}
          </Text>
          <Text style={[typography.caption, styles.muted]}>
            {propertyName} · {view.unit.label}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          label="WhatsApp"
          icon="logo-whatsapp"
          onPress={() => Linking.openURL(`https://wa.me/${phoneDigits}`)}
        />
        <Button
          label="Appeler"
          icon="call-outline"
          variant="secondary"
          style={styles.outlined}
          onPress={() => Linking.openURL(`tel:+${phoneDigits}`)}
        />
        <Button
          label="Saisir un paiement"
          variant="secondary"
          style={styles.outlined}
          onPress={() => router.push({ pathname: '/paiement/nouveau', params: { leaseId: lease.id } })}
        />
      </View>

      <View style={styles.details}>
        <Detail label="Téléphone" value={tenant.phone} />
        <Detail label="Loyer" value={formatFCFA(lease.rent)} />
        <Detail label="Échéance" value={`Le ${lease.dueDay} du mois`} />
        <Detail label="Dans le bien depuis" value={monthAndYear(lease.startDate)} />
        <Detail label="Fin de bail" value={formatDate(lease.endDate, true)} />
      </View>

      <View style={styles.month}>
        <View style={styles.monthText}>
          <Text style={[typography.overline, styles.muted]}>{formatPeriod(period)}</Text>
          <Text style={[typography.bodyStrong, styles.name]}>{situationText(view, period)}</Text>
        </View>
        <StatusBadge status={view.status} label={view.status === 'paye' ? 'À jour' : undefined} />
      </View>

      <RegularityDots months={entry.regularity} />
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={[typography.overline, styles.muted]}>{label}</Text>
      <Text style={[typography.bodyStrong, styles.name]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerText: { flex: 1, gap: 2 },
  name: { color: colors.text },
  muted: { color: colors.textMuted },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  outlined: { borderWidth: 1, borderColor: colors.border },
  details: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md },
  detail: { width: '50%', gap: 2, paddingRight: spacing.sm },
  month: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  monthText: { flex: 1, gap: 2 },
});
