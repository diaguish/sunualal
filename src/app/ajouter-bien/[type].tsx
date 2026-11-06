import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Screen } from '@/components/ui';
import * as api from '@/data/api';
import { FormField } from '@/features/patrimoine/FormField';
import {
  parsePropertyForm,
  PROPERTY_FORMS,
  PropertyFormErrors,
  PropertyFormValues,
} from '@/features/patrimoine/property-form';
import { colors, spacing, typography } from '@/theme';
import type { PropertyType } from '@/types/models';

/** Formulaire adapté à chaque type de bien. Maquette : « Ajouter un bien — maison en chambres ». */
export default function FormulaireBienScreen() {
  const { type } = useLocalSearchParams<{ type: PropertyType }>();
  const form = PROPERTY_FORMS[type];

  const [values, setValues] = useState<PropertyFormValues>({ name: '', address: '', count: '', rent: '' });
  const [errors, setErrors] = useState<PropertyFormErrors>({});
  const [saveError, setSaveError] = useState<string>();
  const [saving, setSaving] = useState(false);

  // Adresse saisie à la main avec un type inconnu : `form` est alors vide.
  if (!form) {
    return (
      <Screen edges={['bottom']}>
        <Text style={[typography.body, styles.text]}>Ce type de bien n’existe pas.</Text>
        <Button label="Retour" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const set = (key: keyof PropertyFormValues) => (text: string) => {
    setValues((v) => ({ ...v, [key]: text }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async () => {
    const parsed = parsePropertyForm(type, values);
    if ('errors' in parsed) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    setSaveError(undefined);
    setSaving(true);
    try {
      const property = await api.createProperty(parsed.property, parsed.unitLabels, parsed.rent);
      // Ferme tout le parcours et montre le nouveau bien.
      router.dismissTo({ pathname: '/immeubles', params: { bien: property.id } });
    } catch {
      setSaveError("Le bien n'a pas pu être enregistré. Réessayez.");
      setSaving(false);
    }
  };

  return (
    <Screen scroll={false} edges={['bottom']} contentStyle={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}>
        <Text style={[typography.title, styles.text]}>{form.title}</Text>

        <FormField
          label={form.nameLabel}
          value={values.name}
          onChangeText={set('name')}
          placeholder={form.namePlaceholder}
          autoCapitalize="words"
          error={errors.name}
        />
        <FormField
          label="Adresse"
          value={values.address}
          onChangeText={set('address')}
          placeholder="Mermoz, Dakar"
          autoCapitalize="words"
          error={errors.address}
        />
        {form.countLabel && (
          <FormField
            label={form.countLabel}
            value={values.count}
            onChangeText={set('count')}
            placeholder="6"
            keyboardType="number-pad"
            error={errors.count}
          />
        )}
        <FormField
          label={form.rentLabel}
          value={values.rent}
          onChangeText={set('rent')}
          placeholder="150000"
          keyboardType="number-pad"
          error={errors.rent}
        />

        {saveError && <Text style={[typography.body, styles.error]}>{saveError}</Text>}
        <View style={styles.actions}>
          <Button label="Annuler" variant="secondary" style={styles.action} onPress={() => router.back()} />
          <Button
            label={form.submitLabel}
            style={styles.submit}
            disabled={saving}
            onPress={submit}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  content: { padding: spacing.lg, gap: spacing.lg },
  text: { color: colors.text },
  error: { color: colors.late },
  actions: { flexDirection: 'row', gap: spacing.md },
  action: { alignSelf: 'auto' },
  submit: { flex: 1, alignSelf: 'auto' },
});
