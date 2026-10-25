import { router } from 'expo-router';

import { Button, PlaceholderScreen } from '@/components/ui';

/** Maquette : « Saisir un paiement ». */
export default function SaisirPaiementScreen() {
  return (
    <PlaceholderScreen title="Saisir un paiement" figmaFrame="Saisir un paiement" owner="Argent" edges={['bottom']}>
      <Button
        label="Enregistrer et envoyer la quittance"
        fullWidth
        onPress={() => router.replace('/paiement/confirme')}
      />
    </PlaceholderScreen>
  );
}
