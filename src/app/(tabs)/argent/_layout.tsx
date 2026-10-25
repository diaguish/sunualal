import { Href, router, Slot, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader, Segment, SegmentedTabs } from '@/components/ui';
import { colors, spacing } from '@/theme';

type ArgentTab = 'paiements' | 'reliquats' | 'quittances' | 'mobile-money';

const SEGMENTS: Segment<ArgentTab>[] = [
  { key: 'paiements', label: 'Paiements' },
  { key: 'reliquats', label: 'Reliquats' },
  { key: 'quittances', label: 'Quittances' },
  { key: 'mobile-money', label: 'Mobile Money' },
];

const ROUTES: Record<ArgentTab, Href> = {
  paiements: '/argent',
  reliquats: '/argent/reliquats',
  quittances: '/argent/quittances',
  'mobile-money': '/argent/mobile-money',
};

/** Onglet Argent : en-tête commun + sous-onglets, chaque sous-onglet est sa propre route. */
export default function ArgentLayout() {
  const pathname = usePathname();
  const active = SEGMENTS.find((s) => pathname === ROUTES[s.key])?.key ?? 'paiements';

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.header}>
        <AppHeader notificationCount={6} />
        <SegmentedTabs segments={SEGMENTS} active={active} onChange={(key) => router.replace(ROUTES[key])} />
      </View>
      <Slot />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.lg },
});
