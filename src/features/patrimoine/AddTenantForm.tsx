import { useState } from 'react';
import {
  KeyboardAvoidingView,
  KeyboardTypeOptions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import type { Lease, Tenant } from '@/types/models';

import { FilterChip } from './FilterChip';
import { defaultEndDate, isoToInput, parseTenantForm, TenantFormErrors, TenantFormValues } from './tenant-form';
import type { UnitView } from './units';

interface AddTenantFormProps {
  visible: boolean;
  today: string;
  /** Lots sans bail : les seuls qu'on peut louer. */
  freeUnits: { view: UnitView; propertyName: string }[];
  onClose: () => void;
  onSubmit: (tenant: Omit<Tenant, 'id'>, lease: Omit<Lease, 'id' | 'tenantId'>) => Promise<void>;
}

/** Fenêtre « Ajouter un locataire » : identité, lot loué et conditions du bail. */
export function AddTenantForm({ visible, ...props }: AddTenantFormProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={props.onClose}>
      {/* Monté seulement à l'ouverture : le formulaire repart vide à chaque fois. */}
      {visible && <FormContent {...props} />}
    </Modal>
  );
}

function FormContent({ today, freeUnits, onClose, onSubmit }: Omit<AddTenantFormProps, 'visible'>) {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<TenantFormValues>({
    fullName: '',
    phone: '',
    unitId: undefined,
    rent: '',
    dueDay: '5',
    startDate: isoToInput(today),
    endDate: isoToInput(defaultEndDate(today)),
  });
  const [errors, setErrors] = useState<TenantFormErrors>({});
  const [saveError, setSaveError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const set = (key: keyof TenantFormValues) => (text: string) => {
    setValues((v) => ({ ...v, [key]: text }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Le loyer est pré-rempli avec celui du lot, et reste modifiable.
  const chooseUnit = ({ unit }: UnitView) => {
    setValues((v) => ({ ...v, unitId: unit.id, rent: String(unit.rent) }));
    setErrors((e) => ({ ...e, unitId: undefined, rent: undefined }));
  };

  const submit = async () => {
    const parsed = parseTenantForm(values);
    if ('errors' in parsed) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    setSaveError(undefined);
    setSaving(true);
    try {
      await onSubmit(parsed.tenant, parsed.lease);
    } catch {
      setSaveError("Le locataire n'a pas pu être enregistré. Réessayez.");
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: spacing.lg + (Platform.OS === 'ios' ? 0 : insets.top) }]}>
        <Text style={[typography.heading, styles.text]}>Ajouter un locataire</Text>
        <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
          <Text style={[typography.bodyStrong, styles.text]}>Annuler</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing.xl + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Field
          label="Nom complet"
          value={values.fullName}
          onChangeText={set('fullName')}
          placeholder="Awa Ndiaye"
          autoCapitalize="words"
          error={errors.fullName}
        />
        <Field
          label="Téléphone"
          value={values.phone}
          onChangeText={set('phone')}
          placeholder="77 123 45 67"
          keyboardType="phone-pad"
          error={errors.phone}
        />

        <View style={styles.field}>
          <Text style={[typography.caption, styles.label]}>Lot loué</Text>
          {freeUnits.length === 0 ? (
            <Text style={[typography.body, styles.muted]}>Aucun lot libre pour le moment.</Text>
          ) : (
            <View style={styles.units}>
              {freeUnits.map(({ view, propertyName }) => (
                <FilterChip
                  key={view.unit.id}
                  label={`${propertyName} · ${view.unit.label}`}
                  active={view.unit.id === values.unitId}
                  onPress={() => chooseUnit(view)}
                />
              ))}
            </View>
          )}
          {errors.unitId && <Text style={[typography.caption, styles.error]}>{errors.unitId}</Text>}
        </View>

        <View style={styles.row}>
          <Field
            label="Loyer (FCFA)"
            value={values.rent}
            onChangeText={set('rent')}
            placeholder="150000"
            keyboardType="number-pad"
            error={errors.rent}
          />
          <Field
            label="Jour d'échéance"
            value={values.dueDay}
            onChangeText={set('dueDay')}
            placeholder="5"
            keyboardType="number-pad"
            error={errors.dueDay}
          />
        </View>
        <View style={styles.row}>
          <Field
            label="Début du bail"
            value={values.startDate}
            onChangeText={set('startDate')}
            placeholder="JJ/MM/AAAA"
            keyboardType="numbers-and-punctuation"
            error={errors.startDate}
          />
          <Field
            label="Fin du bail"
            value={values.endDate}
            onChangeText={set('endDate')}
            placeholder="JJ/MM/AAAA"
            keyboardType="numbers-and-punctuation"
            error={errors.endDate}
          />
        </View>

        {saveError && <Text style={[typography.body, styles.error]}>{saveError}</Text>}
        <Button label="Enregistrer le locataire" fullWidth disabled={saving} onPress={submit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'words';
  error?: string;
}

function Field({ label, error, autoCapitalize = 'none', ...input }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={[typography.caption, styles.label]}>{label}</Text>
      <TextInput
        {...input}
        accessibilityLabel={label}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        placeholderTextColor={colors.textMuted}
        style={[typography.body, styles.input, !!error && styles.inputError]}
      />
      {error && <Text style={[typography.caption, styles.error]}>{error}</Text>}
    </View>
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
  muted: { color: colors.textMuted },
  row: { flexDirection: 'row', gap: spacing.md },
  field: { flex: 1, gap: spacing.xs },
  label: { color: colors.text, fontWeight: '600' },
  input: {
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  inputError: { borderColor: colors.late },
  units: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  error: { color: colors.late },
});
