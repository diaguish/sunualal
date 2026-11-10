import { daysLate, dueDate, previousPeriods, remainingAmount } from '@/domain/rent';
import type { Lease, Payment, Property, Tenant, Unit } from '@/types/models';

/** Un mois de loyer échu et pas entièrement payé. */
export interface ArrearsMonth {
  period: string;
  amount: number; // reste dû sur ce mois
  days: number; // jours depuis l'échéance
}

/** Les reliquats d'un locataire, du plus ancien au plus récent. */
export interface ArrearsLine {
  lease: Lease;
  tenant?: Tenant;
  unit?: Unit;
  property?: Property;
  months: ArrearsMonth[];
  total: number;
}

export interface ArrearsSummary {
  total: number;
  tenants: number;
  /** Loyers du mois en cours, échéance passée, pas soldés. */
  current: { amount: number; count: number };
  /** Reliquats des mois précédents. */
  previous: { amount: number; count: number };
  /** Jours depuis l'échéance du plus ancien reliquat ; 0 s'il n'y en a pas. */
  oldestDays: number;
}

/** Nombre de mois de `from` à `to` inclus : ("2026-05", "2026-10") → 6. */
function monthSpan(from: string, to: string): number {
  const [fy, fm] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  return (ty - fy) * 12 + (tm - fm) + 1;
}

/**
 * Tout ce qui reste dû, mois par mois, jusqu'au mois en cours.
 *
 * On ne remonte pas avant le premier mois où l'app a enregistré un paiement :
 * avant, on ne sait pas ce qui a été payé, et tout apparaîtrait à tort comme impayé.
 * Un mois n'est compté qu'une fois son échéance passée, et seulement pendant le bail.
 * Les montants déclarés par le locataire et pas encore vérifiés sont déduits.
 */
export function buildArrears(
  leases: Lease[],
  tenants: Tenant[],
  units: Unit[],
  properties: Property[],
  payments: Payment[],
  period: string,
  today: string,
): { lines: ArrearsLine[]; summary: ArrearsSummary } {
  const firstTracked = payments.reduce((min, p) => (p.period < min ? p.period : min), period);
  const periods = [...previousPeriods(period, monthSpan(firstTracked, period) - 1), period];

  const lines = leases
    .map((lease): ArrearsLine => {
      const months = periods.flatMap((p) => {
        const due = dueDate(lease, p);
        // Mois hors du bail, ou échéance pas encore passée : rien n'est dû.
        if (lease.startDate > due || lease.endDate < due || today <= due) return [];
        // Un paiement mobile money déclaré n'est pas un reliquat : il est « à vérifier » (écran Paiements).
        const declared = payments
          .filter((pay) => pay.leaseId === lease.id && pay.period === p && pay.status === 'a_verifier')
          .reduce((sum, pay) => sum + pay.amount, 0);
        const amount = Math.max(0, remainingAmount(lease, p, payments) - declared);
        return amount > 0 ? [{ period: p, amount, days: daysLate(lease, p, today) }] : [];
      });
      const unit = units.find((u) => u.id === lease.unitId);
      return {
        lease,
        tenant: tenants.find((t) => t.id === lease.tenantId),
        unit,
        property: properties.find((pr) => pr.id === unit?.propertyId),
        months,
        total: months.reduce((sum, m) => sum + m.amount, 0),
      };
    })
    .filter((line) => line.total > 0)
    // Les dettes les plus anciennes d'abord : ce sont les plus urgentes à régler.
    .sort((a, b) => b.months[0].days - a.months[0].days || b.total - a.total);

  const all = lines.flatMap((l) => l.months);
  const current = all.filter((m) => m.period === period);
  const previous = all.filter((m) => m.period !== period);
  const sum = (months: ArrearsMonth[]) => months.reduce((s, m) => s + m.amount, 0);

  return {
    lines,
    summary: {
      total: sum(all),
      tenants: lines.length,
      current: { amount: sum(current), count: current.length },
      previous: { amount: sum(previous), count: previous.length },
      oldestDays: all.reduce((max, m) => Math.max(max, m.days), 0),
    },
  };
}
