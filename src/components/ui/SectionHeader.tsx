import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string; // « Tout voir »
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={[typography.heading, styles.title]}>{title}</Text>
      {actionLabel && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={[typography.caption, styles.action]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.text },
  action: { color: colors.text, fontWeight: '500' },
});
