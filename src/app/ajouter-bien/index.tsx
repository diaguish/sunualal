import { router } from 'expo-router';
import { Text } from 'react-native';

import { Card, Screen } from '@/components/ui';
import { colors, typography } from '@/theme';
import type { PropertyType } from '@/types/models';

const TYPES: { type: PropertyType; title: string; subtitle: string }[] = [
  { type: 'immeuble', title: 'Immeuble', subtitle: 'Plusieurs appartements, sur un ou plusieurs niveaux' },
  { type: 'maison_entiere', title: 'Maison entière', subtitle: 'Un seul locataire pour toute la maison' },
  { type: 'maison_chambres', title: 'Maison en chambres', subtitle: 'Chaque chambre ou studio a son locataire' },
  { type: 'local_commercial', title: 'Local commercial', subtitle: 'Boutique, magasin, bureau, entrepôt' },
];

/** Maquette : « Ajouter un bien — type ». À finaliser · Patrimoine. */
export default function ChoisirTypeScreen() {
  return (
    <Screen edges={['bottom']}>
      <Text style={[typography.title, { color: colors.text }]}>Qu’est-ce que vous louez ?</Text>
      {TYPES.map((t) => (
        <Card key={t.type} onPress={() => router.push({ pathname: '/ajouter-bien/[type]', params: { type: t.type } })}>
          <Text style={[typography.bodyStrong, { color: colors.text }]}>{t.title}</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>{t.subtitle}</Text>
        </Card>
      ))}
    </Screen>
  );
}
