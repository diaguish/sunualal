import type { Lease, Payment, PaymentMethod, RentStatus } from '@/types/models';

/** Libellés affichés pour chaque statut de loyer. */
export const RENT_STATUS_LABELS: Record<RentStatus, string> = {
  paye: 'Payé',
  en_retard: 'En retard',
  a_verifier: 'À vérifier',
  a_payer: 'À payer',
  libre: 'Libre',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  wave: 'Wave',
  orange_money: 'Orange Money',
  especes: 'Espèces',
  virement: 'Virement',
};

/** Date d'échéance ISO d'un bail pour une période "YYYY-MM". */
export function dueDate(lease: Lease, period: string): string {
  return `${period}-${String(lease.dueDay).padStart(2, '0')}`;
}

/** Somme confirmée versée sur un bail pour une période. */
export function paidAmount(leaseId: string, period: string, payments: Payment[]): number {
  return payments
    .filter((p) => p.leaseId === leaseId && p.period === period && p.status === 'confirme')
    .reduce((sum, p) => sum + p.amount, 0);
}

/** Reste dû (reliquat) sur un bail pour une période. Jamais négatif. */
export function remainingAmount(lease: Lease, period: string, payments: Payment[]): number {
  return Math.max(0, lease.rent - paidAmount(lease.id, period, payments));
}

/**
 * Règle métier centrale (voir maquette « Paiements ») :
 * - payé si le loyer est entièrement confirmé ;
 * - à vérifier si un paiement mobile money est déclaré mais pas confirmé ;
 * - en retard si la date d'échéance est passée ;
 * - à payer sinon.
 * Une unité sans bail est « libre » (géré par l'appelant).
 */
export function rentStatus(lease: Lease, period: string, payments: Payment[], today: string): RentStatus {
  if (remainingAmount(lease, period, payments) === 0) return 'paye';
  const pending = payments.some(
    (p) => p.leaseId === lease.id && p.period === period && p.status === 'a_verifier',
  );
  if (pending) return 'a_verifier';
  return today > dueDate(lease, period) ? 'en_retard' : 'a_payer';
}

/** Nombre de jours de retard (J+n) ; 0 si pas encore échu. */
export function daysLate(lease: Lease, period: string, today: string): number {
  const ms = Date.parse(today) - Date.parse(dueDate(lease, period));
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/** Comment un loyer passé a été payé. `hors_bail` : le bail a commencé après l'échéance de ce mois. */
export type RentPunctuality = 'a_temps' | 'en_retard' | 'impaye' | 'hors_bail';

/** Regarde à quelle date le loyer du mois a été entièrement réglé (règlements confirmés seulement). */
export function rentPunctuality(lease: Lease, period: string, payments: Payment[]): RentPunctuality {
  const due = dueDate(lease, period);
  if (lease.startDate > due) return 'hors_bail';
  const confirmed = payments
    .filter((p) => p.leaseId === lease.id && p.period === period && p.status === 'confirme')
    .sort((a, b) => a.paidAt.localeCompare(b.paidAt));
  let total = 0;
  for (const payment of confirmed) {
    total += payment.amount;
    if (total >= lease.rent) return payment.paidAt > due ? 'en_retard' : 'a_temps';
  }
  return 'impaye';
}

/** Les `count` mois précédant `period`, du plus ancien au plus récent : ("2026-10", 2) → ["2026-08", "2026-09"]. */
export function previousPeriods(period: string, count: number): string[] {
  const [year, month] = period.split('-').map(Number);
  return Array.from({ length: count }, (_, i) =>
    new Date(Date.UTC(year, month - 1 - count + i, 1)).toISOString().slice(0, 7),
  );
}

// ——— Imputation des paiements ———
//
// Règle : un argent reçu règle toujours le mois dû le plus ancien d'abord.
// Un mois ne peut donc pas être payé tant qu'un mois plus ancien reste impayé :
// les impayés s'accumulent à la suite, sur les derniers mois.

/**
 * Mois suivis par l'app, du plus ancien au plus récent, jusqu'à `period` inclus.
 * On part du premier mois où un paiement a été enregistré : avant, on ne sait pas ce qui a été payé.
 */
export function trackedPeriods(payments: Payment[], period: string): string[] {
  const first = payments.reduce((min, p) => (p.period < min ? p.period : min), period);
  const [fy, fm] = first.split('-').map(Number);
  const [y, m] = period.split('-').map(Number);
  return [...previousPeriods(period, (y - fy) * 12 + (m - fm)), period];
}

/** Un mois de loyer pas encore entièrement réglé. */
export interface OutstandingMonth {
  period: string;
  remaining: number;
}

/**
 * Ce qui reste dû sur un bail, mois par mois, du plus ancien au plus récent.
 * Le mois en cours est inclus même avant son échéance (on peut payer d'avance).
 * Les mois hors du bail sont ignorés.
 */
export function outstandingMonths(lease: Lease, payments: Payment[], periods: string[]): OutstandingMonth[] {
  return periods.flatMap((period) => {
    const due = dueDate(lease, period);
    if (lease.startDate > due || lease.endDate < due) return [];
    const remaining = remainingAmount(lease, period, payments);
    return remaining > 0 ? [{ period, remaining }] : [];
  });
}

/**
 * Répartit un montant reçu sur les mois dus, le plus ancien d'abord.
 * Ce qui dépasse le total dû est renvoyé dans `excess` (à l'appelant de le refuser).
 */
export function allocateOldestFirst(
  months: OutstandingMonth[],
  amount: number,
): { allocations: { period: string; amount: number }[]; excess: number } {
  let left = amount;
  const allocations = months.flatMap(({ period, remaining }) => {
    if (left <= 0) return [];
    const part = Math.min(left, remaining);
    left -= part;
    return [{ period, amount: part }];
  });
  return { allocations, excess: left };
}
