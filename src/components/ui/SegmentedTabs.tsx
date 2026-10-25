import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export interface Segment<K extends string> {
  key: K;
  label: string;
}

interface SegmentedTabsProps<K extends string> {
  segments: Segment<K>[];
  active: K;
  onChange: (key: K) => void;
}

/** Barre d'onglets en pilule (Paiements / Reliquats / Quittances / Mobile Money). */
export function SegmentedTabs<K extends string>({ segments, active, onChange }: SegmentedTabsProps<K>) {
  return (
    <View style={styles.container}>
      {segments.map((s) => {
        const selected = s.key === active;
        return (
          <Pressable
            key={s.key}
            onPress={() => onChange(s.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && styles.selected]}>
            <Text
              numberOfLines={1}
              style={[typography.caption, styles.label, { color: selected ? colors.textOnPrimary : colors.text }]}>
              {s.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    padding: spacing.xs,
  },
  segment: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.pill, alignItems: 'center' },
  selected: { backgroundColor: colors.primary },
  label: { fontWeight: '600' },
});
