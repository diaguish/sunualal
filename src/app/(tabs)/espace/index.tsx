import Ionicons from '@expo/vector-icons/Ionicons';
import { Href, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Screen } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';

const ENTRIES: { title: string; subtitle: string; href: Href }[] = [
  { title: 'Relances', subtitle: 'Messages prêts à envoyer', href: '/espace/relances' },
  { title: 'Automatisations', subtitle: 'Rappels, liens et quittances', href: '/espace/automatisations' },
  { title: 'Travaux et dépenses', subtitle: 'Suivre ce que coûtent vos biens', href: '/espace/travaux' },
  { title: 'Documents', subtitle: 'Baux, états des lieux, reçus', href: '/espace/documents' },
  { title: 'Paramètres', subtitle: 'Compte, modes de paiement, messages', href: '/espace/parametres' },
];

/** Maquette : « Mon espace ». */
export default function MonEspaceScreen() {
  return (
    <Screen edges={[]}>
      {ENTRIES.map((entry) => (
        <Card key={entry.title} onPress={() => router.push(entry.href)} style={styles.row}>
          <View style={styles.text}>
            <Text style={[typography.bodyStrong, { color: colors.text }]}>{entry.title}</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{entry.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { flex: 1, gap: spacing.xs },
});
