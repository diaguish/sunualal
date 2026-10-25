import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/ui';
import type { PropertyType } from '@/types/models';

/** Maquette : « Ajouter un bien — maison en chambres » (formulaire adapté à chaque type). */
export default function FormulaireBienScreen() {
  const { type } = useLocalSearchParams<{ type: PropertyType }>();
  return (
    <PlaceholderScreen
      title={`Formulaire : ${type}`}
      figmaFrame="Ajouter un bien — maison en chambres"
      owner="Patrimoine"
      edges={['bottom']}
    />
  );
}
