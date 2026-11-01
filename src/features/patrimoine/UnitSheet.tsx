import { router } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, RENT_STATUS_COLORS } from '@/components/ui';
import { dueDate } from '@/domain/rent';
import { colors, radius, spacing, typography } from '@/theme';
import type { Property } from '@/types/models';
import { formatAmount, formatDate, formatFCFA } from '@/utils/format';

import type { UnitView } from './units';

interface UnitSheetProps {
  property: Property;
  period: string;
  /** Lot affiché ; `undefined` ferme la fiche. */
  view: UnitView | undefined;
  onClose: () => void;
}

/** Fiche d'un lot, ouverte depuis la grille : locataire, situation du loyer et actions. */
export function UnitSheet({ property, period, view, onClose }: UnitSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={!!view} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
      {view && (
        <View style={[styles.sheet, { paddingBottom: spacing.xl + insets.bottom }]}>
          <View style={styles.handle} />
          <UnitSheetContent property={property} period={period} view={view} onClose={onClose} />
        </View>
      )}
    </Modal>
  );
}

function UnitSheetContent({ property, period, view, onClose }: UnitSheetProps & { view: UnitView }) {
  const { unit, status, lease, tenant } = view;
  const free = status === 'libre';
  const unitName = [unit.description, unit.label].filter(Boolean).join(' ');
  const rent = lease?.rent ?? unit.rent;

  const go = (href: Parameters<typeof router.push>[0]) => {
    onClose();
    router.push(href);
  };

  return (
    <>
      <View style={styles.header}>
        <View style={[styles.tile, free ? styles.tileFree : { backgroundColor: RENT_STATUS_COLORS[status] }]}>
          <Text style={[typography.bodyStrong, free ? styles.muted : styles.onColor]}>{unit.label}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[typography.title, styles.title]} numberOfLines={1}>
            {free ? 'Lot libre' : (tenant?.fullName ?? '—')}
          </Text>
          <Text style={[typography.caption, styles.muted]}>
            {property.name} · {unitName} · {formatAmount(rent)} / mois
          </Text>
        </View>
      </View>

      <View style={[styles.banner, BANNER_STYLES[status]]}>
        <Text style={[typography.bodyStrong, { color: BANNER_STYLES[status].color }]}>
          {situation(view, period, rent)}
        </Text>
      </View>

      {free ? (
        // L'écran « Louer un lot » n'existe pas encore : la gestion des baux passe par Locataires.
        <Button label="Louer ce lot" fullWidth onPress={() => go('/locataires')} />
      ) : (
        <View style={styles.actions}>
          {status !== 'paye' && (
            <Button label="Relancer" style={styles.action} onPress={() => go('/espace/relances')} />
          )}
          <Button
            label="Encaisser"
            variant="accent"
            style={styles.action}
            onPress={() => go({ pathname: '/paiement/nouveau', params: { leaseId: lease?.id } })}
          />
        </View>
      )}
    </>
  );
}

/** Phrase de la bannière : « Doit 250 000 FCFA · en retard de 9 jours ». */
function situation({ status, remaining, late, lease }: UnitView, period: string, rent: number): string {
  switch (status) {
    case 'libre':
      return `Lot libre · ${formatAmount(rent)} / mois`;
    case 'paye':
      return 'Loyer du mois payé';
    case 'a_verifier':
      return `Paiement déclaré · à vérifier`;
    case 'en_retard':
      return `Doit ${formatFCFA(remaining)} · en retard de ${late} jour${late > 1 ? 's' : ''}`;
    case 'a_payer':
      return `Doit ${formatFCFA(remaining)} · échéance le ${lease ? formatDate(dueDate(lease, period)) : '—'}`;
  }
}

const BANNER_STYLES = {
  paye: { backgroundColor: colors.primarySoft, color: colors.paid },
  en_retard: { backgroundColor: colors.lateSoft, color: colors.late },
  a_verifier: { backgroundColor: colors.toVerifySoft, color: colors.toVerify },
  a_payer: { backgroundColor: colors.background, color: colors.text },
  libre: { backgroundColor: colors.background, color: colors.text },
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerText: { flex: 1, gap: 2 },
  tile: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  tileFree: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.free },
  title: { color: colors.text, fontSize: 22 },
  onColor: { color: colors.textOnPrimary },
  muted: { color: colors.textMuted },
  banner: { borderRadius: radius.md, padding: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md },
  action: { flex: 1, alignSelf: 'auto' },
});
