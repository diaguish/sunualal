import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_NAME } from '@/constants/app';
import { colors, radius, spacing, typography } from '@/theme';

import { Avatar } from './Avatar';

interface AppHeaderProps {
  /** `dark` : sur fond vert (Accueil). `light` : sur fond crème (autres onglets). */
  variant?: 'light' | 'dark';
  subtitle?: string; // « GESTION LOCATIVE »
  notificationCount?: number;
  userName?: string;
}

/** En-tête de l'app : logo, nom, cloche des notifications, avatar vers Mon espace. */
export function AppHeader({ variant = 'light', subtitle, notificationCount = 0, userName = 'Mon Profil' }: AppHeaderProps) {
  const dark = variant === 'dark';
  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Ionicons name="home-outline" size={16} color={colors.primary} />
        </View>
        <View>
          <Text style={[typography.heading, { color: dark ? colors.textOnPrimary : colors.text }]}>{APP_NAME}</Text>
          {subtitle && <Text style={[typography.overline, { color: colors.accent, fontSize: 9 }]}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push('/notifications')}
          accessibilityLabel="Notifications"
          style={[styles.bell, { backgroundColor: dark ? 'rgba(255,255,255,0.1)' : colors.surface }]}>
          <Ionicons name="notifications-outline" size={18} color={dark ? colors.textOnPrimary : colors.primary} />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </Pressable>
        <Pressable onPress={() => router.push('/espace')} accessibilityLabel="Mon espace">
          <Avatar name={userName} size={38} tone={dark ? 'gold' : 'dark'} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logo: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  bell: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.badge,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.textOnPrimary, fontSize: 10, fontWeight: '700' },
});
