import Ionicons from '@expo/vector-icons/Ionicons';
import { Href, router } from 'expo-router';
import { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader, Card, SectionHeader } from '@/components/ui';
import * as api from '@/data/api';
import { paidAmount } from '@/domain/rent';
import { useData } from '@/hooks/use-data';
import { colors, radius, spacing, typography } from '@/theme';
import { formatAmount, formatPeriod } from '@/utils/format';

/**
 * Accueil — tableau de bord.
 * Écran d'exemple : montre comment combiner API, règles métier et composants partagés.
 * Maquette : « Accueil — tableau de bord » et « Accueil — activité et échéances ».
 */
export default function AccueilScreen() {
  const { data } = useData(async () => {
    const [period, leases, payments] = await Promise.all([api.getCurrentPeriod(), api.listLeases(), api.listPayments()]);
    const expected = leases.reduce((sum, l) => sum + l.rent, 0);
    const received = leases.reduce((sum, l) => sum + paidAmount(l.id, period, payments), 0);
    return { period, expected, received };
  }, []);

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
            <QuickAction label="Relancer" icon="arrow-redo-outline" href="/espace/relances" />
            <QuickAction label="Vérifier" icon="checkmark" href="/argent" />
            <QuickAction label="Dépense" icon="cash-outline" href="/espace/travaux" />
          </View>

          <SectionHeader title="Mes immeubles" actionLabel="Tout voir" onAction={() => router.push('/immeubles')} />
          <Card>
            <Text style={[typography.caption, styles.muted]}>À implémenter · Patrimoine — cartes des immeubles</Text>
          </Card>

          <SectionHeader title="Activité" actionLabel="Tout voir" onAction={() => router.push('/argent')} />
          <Card>
            <Text style={[typography.caption, styles.muted]}>À implémenter · Patrimoine — derniers paiements</Text>
          </Card>

          <SectionHeader title="Prochaines échéances" />
          <Card>
            <Text style={[typography.caption, styles.muted]}>À implémenter · Patrimoine — loyers et fins de bail</Text>
          </Card>
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
}: {
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  href: Href;
  highlighted?: boolean;
}) {
  return (
    <Pressable style={styles.action} onPress={() => router.push(href)}>
      <View style={[styles.actionIcon, highlighted && { backgroundColor: colors.accent }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
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
  muted: { color: colors.textMuted },
});
