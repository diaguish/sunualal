import type { Lease, Tenant } from '@/types/models';

/** Ce que l'utilisateur saisit, tel quel (tout en texte). */
export interface TenantFormValues {
  fullName: string;
  phone: string;
  unitId: string | undefined;
  rent: string;
  dueDay: string;
  startDate: string; // « 14/10/2026 »
  endDate: string;
}

export type TenantFormErrors = Partial<Record<keyof TenantFormValues, string>>;

/** « 2026-10-14 » → « 14/10/2026 ». */
export function isoToInput(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** « 14/10/2026 » → « 2026-10-14 » ; `undefined` si la date n'existe pas (31/02, texte…). */
export function inputToIso(text: string): string | undefined {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  if (!match) return undefined;
  const [day, month, year] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const exists = date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return exists ? date.toISOString().slice(0, 10) : undefined;
}

/**
 * Montant saisi → entier en FCFA, en ne gardant que les chiffres.
 * « 150 000 », « 150.000 » et « 150,000 » donnent tous 150000 (et non 150) ; 0 si aucun chiffre.
 */
export function parseAmountInput(text: string): number {
  const digits = text.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

/** Bail de deux ans par défaut : début le 14/10/2026 → fin le 13/10/2028. */
export function defaultEndDate(startIso: string): string {
  const [y, m, d] = startIso.split('-').map(Number);
  return new Date(Date.UTC(y + 2, m - 1, d - 1)).toISOString().slice(0, 10);
}

/** « 77 123 45 67 » → « +221 77 123 45 67 » ; `undefined` si ce n'est pas un numéro sénégalais. */
export function formatPhone(text: string): string | undefined {
  const digits = text.replace(/\D/g, '').replace(/^(00)?221/, '');
  const match = /^(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(digits);
  return match ? `+221 ${match.slice(1).join(' ')}` : undefined;
}

/** Vérifie la saisie : soit les erreurs à afficher, soit le locataire et le bail à créer. */
export function parseTenantForm(
  values: TenantFormValues,
):
  | { errors: TenantFormErrors }
  | { tenant: Omit<Tenant, 'id'>; lease: Omit<Lease, 'id' | 'tenantId'> } {
  const errors: TenantFormErrors = {};

  const fullName = values.fullName.trim().replace(/\s+/g, ' ');
  if (!fullName) errors.fullName = 'Indiquez le nom du locataire.';

  const phone = formatPhone(values.phone);
  if (!phone) errors.phone = 'Numéro à 9 chiffres attendu, ex. 77 123 45 67.';

  if (!values.unitId) errors.unitId = 'Choisissez le lot loué.';

  const rent = parseAmountInput(values.rent);
  if (!Number.isInteger(rent) || rent <= 0) errors.rent = 'Indiquez le loyer en FCFA, sans centimes.';

  const dueDay = Number(values.dueDay);
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) errors.dueDay = 'Entre 1 et 28.';

  const startDate = inputToIso(values.startDate);
  if (!startDate) errors.startDate = 'Date attendue : JJ/MM/AAAA.';

  const endDate = inputToIso(values.endDate);
  if (!endDate) errors.endDate = 'Date attendue : JJ/MM/AAAA.';
  else if (startDate && endDate <= startDate) errors.endDate = 'La fin doit être après le début.';

  if (Object.keys(errors).length > 0 || !phone || !values.unitId || !startDate || !endDate) return { errors };
  return {
    tenant: { fullName, phone },
    lease: { unitId: values.unitId, rent, dueDay, startDate, endDate },
  };
}
