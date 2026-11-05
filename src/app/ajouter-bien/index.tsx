import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Screen } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import type { PropertyType } from '@/types/models';

const TYPES: {
  type: PropertyType;
  title: string;
  subtitle: string;
  icon: ComponentProps<typeof Ionicons>['name'];
}[] = [
  {
    type: 'immeuble',
    title: 'Immeuble',
    subtitle: 'Plusieurs appartements, sur un ou plusieurs niveaux',
    icon: 'business-outline',
  },
  {
    type: 'maison_entiere',
    title: 'Maison entière',
    subtitle: 'Un seul locataire pour toute la maison',
    icon: 'home-outline',
  },
  {
    type: 'maison_chambres',
    title: 'Maison en chambres',
    subtitle: 'Chaque chambre ou studio a son locataire',
    icon: 'bed-outline',
  },
  {
    type: 'local_commercial',
    title: 'Local commercial',
    subtitle: 'Boutique, magasin, bureau, entrepôt',
    icon: 'storefront-outline',
  },
];

/** Maquette : « Ajouter un bien — type ». */
export default function ChoisirTypeScreen() {
  return (
    <Screen edges={['bottom']}>
      <Text style={[typography.title, styles.title]}>Qu’est-ce que vous louez ?</Text>
      {TYPES.map((t) => (
        <Card key={t.type} onPress={() => router.push({ pathname: '/ajouter-bien/[type]', params: { type: t.type } })}>
          <View style={styles.row}>
            <View style={styles.icon}>
              <Ionicons name={t.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.text}>
              <Text style={[typography.bodyStrong, styles.title]}>{t.title}</Text>
              <Text style={[typography.caption, styles.subtitle]}>{t.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text },
  subtitle: { color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
});
