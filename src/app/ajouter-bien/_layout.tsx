import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Parcours « Ajouter un bien » (modale) : choix du type, puis formulaire. */
export default function AjouterBienLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="index" options={{ title: 'Ajouter un bien' }} />
      <Stack.Screen name="[type]" options={{ title: 'Nouveau bien' }} />
    </Stack>
  );
}
