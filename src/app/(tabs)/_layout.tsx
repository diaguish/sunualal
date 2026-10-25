import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { ComponentProps } from 'react';
import { ColorValue } from 'react-native';

import { colors } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const icon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue | null; size: number }) {
    return <Ionicons name={name} size={size} color={typeof color === 'string' ? color : undefined} />;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: icon('home-outline') }} />
      <Tabs.Screen name="immeubles" options={{ title: 'Immeubles', tabBarIcon: icon('business-outline') }} />
      <Tabs.Screen name="locataires" options={{ title: 'Locataires', tabBarIcon: icon('people-outline') }} />
      <Tabs.Screen name="argent" options={{ title: 'Argent', tabBarIcon: icon('wallet-outline') }} />
      {/* Mon espace : accessible depuis l'avatar, pas d'onglet dédié.
          Ne pas utiliser `href: null` : avec Expo Router 58 la route devient inaccessible. */}
      <Tabs.Screen name="espace" options={{ title: 'Mon espace', tabBarItemStyle: { display: 'none' } }} />
    </Tabs>
  );
}
