import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  /** Désactiver le défilement (listes FlatList, écrans plein cadre). */
  scroll?: boolean;
  /** Bords protégés par la safe area. Par défaut : haut seulement (la tab bar gère le bas). */
  edges?: Edge[];
  contentStyle?: ViewStyle;
}

/** Conteneur standard d'un écran : fond crème, safe area et marges. */
export function Screen({ children, scroll = true, edges = ['top'], contentStyle }: ScreenProps) {
  return (
    <SafeAreaView style={styles.root} edges={edges}>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, contentStyle]} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  fill: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },
});
