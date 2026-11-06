import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';
import type { Expense, ExpenseCategory, Property, Unit } from '@/types/models';

import { CATEGORY_LABELS, ExpenseFormErrors, ExpenseFormValues, parseExpenseForm } from './expense-form';
import { FilterChip } from './FilterChip';
import { FormField } from './FormField';
import { isoToInput } from './tenant-form';

interface AddExpenseFormProps {
  visible: boolean;
  today: string;
  properties: Property[];
  units: Unit[];
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, 'id'>) => Promise<void>;
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ExpenseCategory[];

/** Fenêtre « Ajouter une dépense » : description, catégorie, bien concerné, montant et date. */
export function AddExpenseForm({ visible, ...props }: AddExpenseFormProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={props.onClose}>
      {/* Monté seulement à l'ouverture : le formulaire repart vide à chaque fois. */}
      {visible && <FormContent {...props} />}
    </Modal>
  );
}

function FormContent({ today, properties, units, onClose, onSubmit }: Omit<AddExpenseFormProps, 'visible'>) {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<ExpenseFormValues>({
    label: '',
    category: undefined,
    propertyId: undefined,
    unitId: undefined,
    amount: '',
    date: isoToInput(today),
  });
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [saveError, setSaveError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const change = (partial: Partial<ExpenseFormValues>) => {
    setValues((v) => ({ ...v, ...partial }));
    setErrors((e) => {
      const next = { ...e };
      (Object.keys(partial) as (keyof ExpenseFormValues)[]).forEach((key) => delete next[key]);
      return next;
    });
  };

  const submit = async () => {
    const parsed = parseExpenseForm(values);
    if ('errors' in parsed) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    setSaveError(undefined);
    setSaving(true);
    try {
      await onSubmit(parsed.expense);
    } catch {
      setSaveError("La dépense n'a pas pu être enregistrée. Réessayez.");
      setSaving(false);
    }
  };

  const propertyUnits = units.filter((u) => u.propertyId === values.propertyId);

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: spacing.lg + (Platform.OS === 'ios' ? 0 : insets.top) }]}>
        <Text style={[typography.heading, styles.text]}>Ajouter une dépense</Text>
        <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
          <Text style={[typography.bodyStrong, styles.text]}>Annuler</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing.xl + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <FormField
          label="Description"
          value={values.label}
          onChangeText={(label) => change({ label })}
          placeholder="Peinture de la chambre"
          autoCapitalize="sentences"
          error={errors.label}
        />

        <View style={styles.group}>
          <Text style={[typography.caption, styles.label]}>Catégorie</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((category) => (
              <FilterChip
                key={category}
                label={CATEGORY_LABELS[category]}
                active={values.category === category}
                onPress={() => change({ category })}
              />
            ))}
          </View>
          {errors.category && <Text style={[typography.caption, styles.error]}>{errors.category}</Text>}
        </View>

        <View style={styles.group}>
          <Text style={[typography.caption, styles.label]}>Bien concerné</Text>
          <View style={styles.chips}>
            {properties.map((property) => (
              <FilterChip
                key={property.id}
                label={property.name}
                active={values.propertyId === property.id}
                onPress={() => change({ propertyId: property.id, unitId: undefined })}
              />
            ))}
          </View>
          {errors.propertyId && <Text style={[typography.caption, styles.error]}>{errors.propertyId}</Text>}
        </View>

        {propertyUnits.length > 1 && (
          <View style={styles.group}>
            <Text style={[typography.caption, styles.label]}>Lot concerné</Text>
            <View style={styles.chips}>
              <FilterChip label="Tout le bien" active={!values.unitId} onPress={() => change({ unitId: undefined })} />
              {propertyUnits.map((unit) => (
                <FilterChip
                  key={unit.id}
                  label={unit.label}
                  active={values.unitId === unit.id}
                  onPress={() => change({ unitId: unit.id })}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.row}>
          <FormField
            label="Montant (FCFA)"
            value={values.amount}
            onChangeText={(amount) => change({ amount })}
            placeholder="25000"
            keyboardType="number-pad"
            error={errors.amount}
          />
          <FormField
            label="Date"
            value={values.date}
            onChangeText={(date) => change({ date })}
            placeholder="JJ/MM/AAAA"
            keyboardType="numbers-and-punctuation"
            error={errors.date}
          />
        </View>

        {saveError && <Text style={[typography.body, styles.error]}>{saveError}</Text>}
        <Button label="Enregistrer la dépense" fullWidth disabled={saving} onPress={submit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  content: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.lg },
  text: { color: colors.text },
  group: { gap: spacing.xs },
  label: { color: colors.text, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  error: { color: colors.late },
});
