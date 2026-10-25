import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Mon espace : pile d'écrans, la barre d'onglets reste visible. */
export default function EspaceLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        headerBackTitle: 'Retour',
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="index" options={{ title: 'Mon espace' }} />
      <Stack.Screen name="relances" options={{ title: 'Relances' }} />
      <Stack.Screen name="automatisations/index" options={{ title: 'Automatisations' }} />
      <Stack.Screen name="automatisations/reglages" options={{ title: 'Réglages' }} />
      <Stack.Screen name="travaux" options={{ title: 'Travaux et dépenses' }} />
      <Stack.Screen name="documents" options={{ title: 'Documents' }} />
      <Stack.Screen name="parametres" options={{ title: 'Paramètres' }} />
    </Stack>
  );
}
