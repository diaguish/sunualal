import { Href, router } from 'expo-router';
import { useRef } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/theme';

import { TenantCard } from './TenantCard';
import type { TenantEntry } from './tenants';

interface TenantSheetProps {
  /** Locataire affiché ; `undefined` ferme la fiche. */
  entry: TenantEntry | undefined;
  period: string;
  onClose: () => void;
}

/** Fiche du locataire, dans une fenêtre qui monte (même présentation que « Ajouter un locataire »). */
export function TenantSheet({ entry, period, onClose }: TenantSheetProps) {
  const insets = useSafeAreaInsets();
  // Écran à ouvrir une fois la fiche fermée : sur iPhone, on ne peut pas ouvrir une fenêtre par-dessus celle-ci.
  const pendingHref = useRef<Href>(undefined);

  const openAfterClose = (href: Href) => {
    if (Platform.OS === 'ios') {
      pendingHref.current = href;
      onClose();
    } else {
      onClose();
      router.push(href);
    }
  };

  return (
    <Modal
      visible={!!entry}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      onDismiss={() => {
        const href = pendingHref.current;
        pendingHref.current = undefined;
        if (href) router.push(href);
      }}>
      {entry && (
        <View style={styles.root}>
          <View style={[styles.header, { paddingTop: spacing.lg + (Platform.OS === 'ios' ? 0 : insets.top) }]}>
            <Text style={[typography.heading, styles.text]}>Fiche locataire</Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
              <Text style={[typography.bodyStrong, styles.text]}>Fermer</Text>
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: spacing.xl + insets.bottom }]}
            showsVerticalScrollIndicator={false}>
            <TenantCard
              entry={entry}
              period={period}
              onCollect={() => openAfterClose({ pathname: '/paiement/nouveau', params: { leaseId: entry.lease.id } })}
            />
          </ScrollView>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  content: { padding: spacing.lg, paddingTop: spacing.sm },
  text: { color: colors.text },
});
