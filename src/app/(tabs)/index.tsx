import Ionicons from '@expo/vector-icons/Ionicons';
import { Href, router } from 'expo-router';
import { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader, Button, Card, SectionHeader } from '@/components/ui';
import * as api from '@/data/api';
import { paidAmount } from '@/domain/rent';
import { buildActivity, buildDeadlines, buildPropertySummaries } from '@/features/patrimoine/dashboard';
import { ActivityRow, DeadlineRow } from '@/features/patrimoine/DashboardRows';
import { PropertyCard } from '@/features/patrimoine/PropertyCard';
import { buildTenantEntries } from '@/features/patrimoine/tenants';
import { buildUnitViews } from '@/features/patrimoine/units';
import { useReloadOnFocus } from '@/features/patrimoine/use-reload-on-focus';
import { useData } from '@/hooks/use-data';
import { colors, radius, spacing, typography } from '@/theme';
import { formatAmount, formatPeriod } from '@/utils/format';

/**
 * Accueil — tableau de bord.
 * Écran d'exemple : montre comment combiner API, règles métier et composants partagés.
 * Maquette : « Accueil — tableau de bord » et « Accueil — activité et échéances ».
 */
export default function AccueilScreen() {
  const { data, reload } = useData(async () => {
    const [today, period, properties, units, leases, tenants, payments] = await Promise.all([
      api.getToday(),
      api.getCurrentPeriod(),
      api.listProperties(),
      api.listUnits(),
      api.listLeases(),
      api.listTenants(),
      api.listPayments(),
    ]);
    const expected = leases.reduce((sum, l) => sum + l.rent, 0);
    const received = leases.reduce((sum, l) => sum + paidAmount(l.id, period, payments), 0);
    const views = buildUnitViews(units, leases, tenants, payments, period, today);
    const entries = buildTenantEntries(views, properties, payments, period, today);
    return {
      period,
      expected,
      received,
      lateCount: views.filter((v) => v.status === 'en_retard').length,
      toVerifyCount: views.filter((v) => v.status === 'a_verifier').length,
      summaries: buildPropertySummaries(properties, views),
      activity: buildActivity(payments, entries, period),
      deadlines: buildDeadlines(entries, period, today),
    };
  }, []);
  useReloadOnFocus(reload);

  const progress = data && data.expected > 0 ? data.received / data.expected : 0;

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={['top']} style={styles.hero}>
          <AppHeader variant="dark" subtitle="Gestion locative" notificationCount={6} />
          <Text style={[typography.overline, styles.heroMuted]}>
            Tableau de bord · {data ? formatPeriod(data.period) : '…'}
          </Text>
          <Text style={[typography.title, styles.heroText]}>Bonjour !</Text>
          <Text style={[typography.caption, styles.heroMuted]}>Loyers reçus ce mois-ci</Text>
          <View style={styles.amountRow}>
            <Text style={[typography.display, styles.heroText]}>{data ? formatAmount(data.received) : '—'}</Text>
            <Text style={[typography.bodyStrong, styles.unit]}>FCFA</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          {data && (
            <View style={styles.amountRow}>
              <Text style={[typography.caption, styles.heroMuted]}>sur {formatAmount(data.expected)} attendus</Text>
              <Text style={[typography.caption, styles.heroText, styles.missing]}>
                Il manque {formatAmount(data.expected - data.received)}
              </Text>
            </View>
          )}
        </SafeAreaView>

        <View style={styles.body}>
          <View style={styles.actions}>
            <QuickAction label="Encaisser" icon="add" href="/paiement/nouveau" highlighted />
            <QuickAction label="Relancer" icon="arrow-redo-outline" href="/espace/relances" count={data?.lateCount} />
            <QuickAction label="Vérifier" icon="checkmark" href="/argent" count={data?.toVerifyCount} />
            <QuickAction label="Dépense" icon="cash-outline" href="/espace/travaux" />
          </View>

          <SectionHeader title="Mes immeubles" actionLabel="Tout voir" onAction={() => router.push('/immeubles')} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cardsScroll}
            contentContainerStyle={styles.cards}>
            {data?.summaries.map((summary) => (
              <PropertyCard key={summary.property.id} summary={summary} />
            ))}
          </ScrollView>

          <SectionHeader title="Activité" actionLabel="Tout voir" onAction={() => router.push('/argent')} />
          <Card>
            {data?.activity.map((item) => <ActivityRow key={item.id} item={item} />)}
            {data?.activity.length === 0 && (
              <Text style={[typography.body, styles.muted]}>Aucun paiement ce mois-ci.</Text>
            )}
          </Card>

          <SectionHeader title="Prochaines échéances" />
          <Card>
            {data?.deadlines.map((item) => <DeadlineRow key={item.id} item={item} />)}
            {data?.deadlines.length === 0 && (
              <Text style={[typography.body, styles.muted]}>Aucune échéance à venir.</Text>
            )}
          </Card>

          <View style={styles.footer}>
            <Button
              label="Ajouter un bien"
              icon="add"
              variant="accent"
              style={styles.footerButton}
              onPress={() => router.push('/ajouter-bien')}
            />
            <Button
              label="Locataires"
              icon="people-outline"
              variant="secondary"
              style={styles.footerButton}
              onPress={() => router.push('/locataires')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function QuickAction({
  label,
  icon,
  href,
  highlighted,
  count = 0,
}: {
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  href: Href;
  highlighted?: boolean;
  /** Nombre de choses à traiter, affiché en pastille rouge. */
  count?: number;
}) {
  return (
    <Pressable style={styles.action} onPress={() => router.push(href)}>
      <View style={[styles.actionIcon, highlighted && { backgroundColor: colors.accent }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </View>
      <Text style={[typography.caption, styles.actionLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    gap: spacing.sm,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroText: { color: colors.textOnPrimary },
  heroMuted: { color: 'rgba(255,255,255,0.75)' },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  unit: { color: colors.accent, marginRight: 'auto' },
  missing: { fontWeight: '600' },
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accent },
  body: { padding: spacing.lg, gap: spacing.md },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  action: { alignItems: 'center', gap: spacing.xs, width: 72 },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { color: colors.text, fontWeight: '500' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.badge,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.textOnPrimary, fontSize: 11, fontWeight: '700' },
  // Les cartes défilent jusqu'au bord de l'écran, au-delà de la marge de la page.
  cardsScroll: { marginHorizontal: -spacing.lg },
  cards: { paddingHorizontal: spacing.lg, gap: spacing.md },
  footer: { flexDirection: 'row', gap: spacing.md },
  footerButton: { flex: 1, alignSelf: 'auto' },
  muted: { color: colors.textMuted },
});
