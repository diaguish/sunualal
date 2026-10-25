import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Parcours « Encaisser » (modale) : saisie du paiement, puis confirmation avec quittance. */
export default function PaiementLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="nouveau" options={{ title: 'Saisir un paiement' }} />
      <Stack.Screen name="confirme" options={{ title: 'Paiement enregistré', headerBackVisible: false }} />
    </Stack>
  );
}
