import { router } from 'expo-router';

import { Button, PlaceholderScreen } from '@/components/ui';

/** Maquette : « Argent — paiements ». */
export default function PaiementsScreen() {
  return (
    <PlaceholderScreen title="Paiements" figmaFrame="Argent — paiements" owner="Argent" edges={[]}>
      <Button label="Saisir un paiement" icon="add" onPress={() => router.push('/paiement/nouveau')} />
    </PlaceholderScreen>
  );
}
