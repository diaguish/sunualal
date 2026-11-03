import { dueDate, PAYMENT_METHOD_LABELS } from '@/domain/rent';
import type { Payment, Property } from '@/types/models';
import { formatDate, formatFCFA } from '@/utils/format';

import type { TenantEntry } from './tenants';
import type { UnitView } from './units';

const ACTIVITY_LIMIT = 6;
const DEADLINES_LIMIT = 4;

/** Une carte « Mes immeubles » : le bien, ses lots et le nombre de loyers en retard. */
export interface PropertySummary {
  property: Property;
  views: UnitView[];
  rented: number;
  unpaid: number;
}

export function buildPropertySummaries(properties: Property[], views: UnitView[]): PropertySummary[] {
  return properties.map((property) => {
    const own = views.filter((v) => v.unit.propertyId === property.id);
    return {
      property,
      views: own,
      rented: own.filter((v) => v.status !== 'libre').length,
      unpaid: own.filter((v) => v.status === 'en_retard').length,
    };
  });
}

/** Une ligne « Activité » : un paiement du mois. */
export interface ActivityItem {
  id: string;
  tenantName: string;
  detail: string; // « Immeuble Baobab · 1B · Wave · 5 oct. »
  amount: number;
  /** Déclaré par le locataire, pas encore confirmé. */
  pending: boolean;
}

/** Les paiements du mois, du plus récent au plus ancien. */
export function buildActivity(payments: Payment[], entries: TenantEntry[], period: string): ActivityItem[] {
  return payments
    .filter((p) => p.period === period)
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
    .slice(0, ACTIVITY_LIMIT)
    .flatMap((payment) => {
      const entry = entries.find((e) => e.lease.id === payment.leaseId);
      if (!entry) return [];
      const pending = payment.status === 'a_verifier';
      const place = `${entry.propertyName} · ${entry.view.unit.label} · ${PAYMENT_METHOD_LABELS[payment.method]}`;
      return [
        {
          id: payment.id,
          tenantName: entry.tenant.fullName,
          detail: `${place} · ${pending ? 'à vérifier' : formatDate(payment.paidAt)}`,
          amount: payment.amount,
          pending,
        },
      ];
    });
}

/** Une ligne « Prochaines échéances » : un loyer à venir ou une fin de bail. */
export interface DeadlineItem {
  id: string;
  date: string;
  title: string; // « Loyer de Modou Kane », « Fin de bail : Awa Ndiaye »
  detail: string;
}

/** Les loyers encore attendus ce mois-ci et les fins de bail proches, de la plus proche à la plus lointaine. */
export function buildDeadlines(entries: TenantEntry[], period: string, today: string): DeadlineItem[] {
  const rents = entries.flatMap(({ lease, tenant, view, propertyName }) => {
    const date = dueDate(lease, period);
    if (view.status !== 'a_payer' || date < today) return [];
    return [
      {
        id: `loyer-${lease.id}`,
        date,
        title: `Loyer de ${tenant.fullName}`,
        detail: `${propertyName} · ${view.unit.label} · ${formatFCFA(view.remaining)}`,
      },
    ];
  });
  const leaseEnds = entries
    .filter((e) => e.endingSoon && e.daysLeft >= 0)
    .map(({ lease, tenant, view, propertyName }) => ({
      id: `bail-${lease.id}`,
      date: lease.endDate,
      title: `Fin de bail : ${tenant.fullName}`,
      detail: `${propertyName} · ${view.unit.label}`,
    }));
  return [...rents, ...leaseEnds].sort((a, b) => a.date.localeCompare(b.date)).slice(0, DEADLINES_LIMIT);
}
