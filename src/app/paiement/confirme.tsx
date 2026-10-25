import { router } from 'expo-router';

import { Button, PlaceholderScreen } from '@/components/ui';

/** Maquette : « Paiement enregistré ». */
export default function PaiementEnregistreScreen() {
  return (
    <PlaceholderScreen title="Paiement enregistré" figmaFrame="Paiement enregistré" owner="Argent" edges={['bottom']}>
      <Button label="Terminer" fullWidth onPress={() => router.dismissAll()} />
    </PlaceholderScreen>
  );
}
