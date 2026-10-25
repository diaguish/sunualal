import { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { Edge } from 'react-native-safe-area-context';

import { colors, typography } from '@/theme';

import { Card } from './Card';
import { Screen } from './Screen';

interface PlaceholderScreenProps {
  title: string;
  /** Nom du cadre dans la maquette Figma, pour retrouver l'écran à implémenter. */
  figmaFrame: string;
  owner: 'Patrimoine' | 'Argent' | 'Commun';
  edges?: Edge[];
  children?: ReactNode;
}

/**
 * Écran temporaire : à remplacer par la vraie implémentation.
 * Permet d'avoir toute la navigation fonctionnelle dès le départ.
 */
export function PlaceholderScreen({ title, figmaFrame, owner, edges, children }: PlaceholderScreenProps) {
  return (
    <Screen edges={edges}>
      <Text style={[typography.title, styles.title]}>{title}</Text>
      <Card>
        <Text style={[typography.overline, styles.muted]}>À implémenter · {owner}</Text>
        <Text style={typography.body}>Maquette Figma : « {figmaFrame} »</Text>
      </Card>
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text },
  muted: { color: colors.textMuted },
});
