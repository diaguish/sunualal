import { daysLate, dueDate, remainingAmount, rentStatus } from '@/domain/rent';
import type { Lease, Payment, RentStatus, Tenant, Unit } from '@/types/models';

/** Une unité avec tout ce qu'il faut pour l'afficher dans la grille et sa fiche. */
export interface UnitView {
  unit: Unit;
  status: RentStatus;
  lease?: Lease;
  tenant?: Tenant;
  /** Reste dû sur la période (0 si payé ou libre). */
  remaining: number;
  /** Jours de retard (J+n) ; 0 si pas en retard. */
  late: number;
}

/** Associe chaque unité à son bail, son locataire et son statut de loyer. Une unité sans bail est « libre ». */
export function buildUnitViews(
  units: Unit[],
  leases: Lease[],
  tenants: Tenant[],
  payments: Payment[],
  period: string,
  today: string,
): UnitView[] {
  return units.map((unit) => {
    const lease = leases.find((l) => l.unitId === unit.id);
    if (!lease) return { unit, status: 'libre', remaining: 0, late: 0 };
    const computed = rentStatus(lease, period, payments, today);
    // Bail signé après l'échéance du mois : ce locataire n'est pas en retard, son premier loyer reste à venir.
    const status = computed === 'en_retard' && lease.startDate > dueDate(lease, period) ? 'a_payer' : computed;
    return {
      unit,
      status,
      lease,
      tenant: tenants.find((t) => t.id === lease.tenantId),
      remaining: remainingAmount(lease, period, payments),
      late: status === 'en_retard' ? daysLate(lease, period, today) : 0,
    };
  });
}

/**
 * Regroupe les unités par étage, du plus haut au plus bas (comme une façade d'immeuble).
 * Les unités sont saisies du rez-de-chaussée vers le haut : l'ordre d'apparition des étages est donc inversé.
 */
export function groupByFloor(views: UnitView[]): { floor: string; units: UnitView[] }[] {
  const floors: { floor: string; units: UnitView[] }[] = [];
  views.forEach((view) => {
    const floor = view.unit.floor ?? '';
    const row = floors.find((f) => f.floor === floor);
    if (row) row.units.push(view);
    else floors.push({ floor, units: [view] });
  });
  return floors.reverse();
}
