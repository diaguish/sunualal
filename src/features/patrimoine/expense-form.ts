import type { Expense, ExpenseCategory } from '@/types/models';

import { inputToIso } from './tenant-form';

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  travaux: 'Travaux',
  entretien: 'Entretien',
  charges: 'Charges',
  taxes: 'Taxes',
  autre: 'Autre',
};

/** Ce que l'utilisateur saisit, tel quel. */
export interface ExpenseFormValues {
  label: string;
  category: ExpenseCategory | undefined;
  propertyId: string | undefined;
  /** Vide : la dépense concerne tout le bien. */
  unitId: string | undefined;
  amount: string;
  date: string; // « 14/10/2026 »
}

export type ExpenseFormErrors = Partial<Record<keyof ExpenseFormValues, string>>;

/** Vérifie la saisie : soit les erreurs à afficher, soit la dépense à créer. */
export function parseExpenseForm(values: ExpenseFormValues): { errors: ExpenseFormErrors } | { expense: Omit<Expense, 'id'> } {
  const errors: ExpenseFormErrors = {};

  const label = values.label.trim().replace(/\s+/g, ' ');
  if (!label) errors.label = 'Décrivez la dépense.';
  if (!values.category) errors.category = 'Choisissez une catégorie.';
  if (!values.propertyId) errors.propertyId = 'Choisissez le bien concerné.';

  const amount = Number(values.amount.replace(/\s/g, ''));
  if (!Number.isInteger(amount) || amount <= 0) errors.amount = 'Indiquez le montant en FCFA, sans centimes.';

  const date = inputToIso(values.date);
  if (!date) errors.date = 'Date attendue : JJ/MM/AAAA.';

  if (Object.keys(errors).length > 0 || !values.category || !values.propertyId || !date) return { errors };
  return {
    expense: {
      label,
      category: values.category,
      propertyId: values.propertyId,
      ...(values.unitId ? { unitId: values.unitId } : {}),
      amount,
      date,
    },
  };
}
