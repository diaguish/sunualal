import { router } from 'expo-router';

import { Button, PlaceholderScreen } from '@/components/ui';

/** Maquettes : « Immeubles — résidence Teranga », « lot en retard », « lot libre ». */
export default function ImmeublesScreen() {
  return (
    <PlaceholderScreen title="Immeubles" figmaFrame="Immeubles — résidence Teranga" owner="Patrimoine">
      <Button label="Ajouter" icon="add" onPress={() => router.push('/ajouter-bien')} />
    </PlaceholderScreen>
  );
}
