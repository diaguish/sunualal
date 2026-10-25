import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/theme';

/**
 * Navigation racine.
 * - (tabs) : les 4 onglets + Mon espace
 * - ajouter-bien, paiement, notifications : écrans qui s'ouvrent par-dessus (modales)
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ajouter-bien" options={{ presentation: 'modal' }} />
        <Stack.Screen name="paiement" options={{ presentation: 'modal' }} />
        <Stack.Screen
          name="notifications"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Notifications',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
          }}
        />
      </Stack>
    </>
  );
}
