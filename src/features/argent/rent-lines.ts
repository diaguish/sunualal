import { PAYMENT_METHOD_LABELS, RENT_STATUS_LABELS } from '@/domain/rent';
import type { Payment, RentStatus } from '@/types/models';

import { LeaseOption, unitLabel } from './payment';

/** Une ligne de l'écran Paiements : un loyer du mois avec ses règlements. */
export interface RentLine extends LeaseOption {
  /** Dernier règlement confirmé du mois. */
  lastPayment?: Payment;
  /** Paiement mobile money déclaré par le locataire, en attente de confirmation. */
  pendingPayment?: Payment;
}

export function buildRentLines(options: LeaseOption[], payments: Payment[], period: string): RentLine[] {
  return options.map((option) => {
    const own = payments
      .filter((p) => p.leaseId === option.lease.id && p.period === period)
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
    return {
      ...option,
      lastPayment: own.find((p) => p.status === 'confirme'),
      pendingPayment: own.find((p) => p.status === 'a_verifier'),
    };
  });
}

export type PaymentFilter = 'tous' | Exclude<RentStatus, 'libre'>;

/** Filtres de la maquette. « Non payé » : échéance pas encore passée. */
export const PAYMENT_FILTERS: { key: PaymentFilter; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'paye', label: 'Payé' },
  { key: 'en_retard', label: 'En retard' },
  { key: 'a_verifier', label: 'À vérifier' },
  { key: 'a_payer', label: 'Non payé' },
];

export const matchesFilter = (line: RentLine, filter: PaymentFilter) => filter === 'tous' || line.status === filter;

/** Répartition de l'argent attendu ce mois-ci, pour la barre « en un coup d'œil ». */
export interface MonthOverview {
  received: number;
  toVerify: number;
  late: number;
  upcoming: number;
}

export function buildOverview(lines: RentLine[]): MonthOverview {
  return lines.reduce(
    (o, line) => {
      const pending = line.pendingPayment?.amount ?? 0;
      o.received += line.paid;
      o.toVerify += Math.min(pending, line.remaining);
      if (line.status === 'en_retard') o.late += line.remaining;
      else o.upcoming += Math.max(0, line.remaining - pending);
      return o;
    },
    { received: 0, toVerify: 0, late: 0, upcoming: 0 },
  );
}

/** Export texte (CSV, séparateur « ; » pour Excel en français) des loyers du mois. */
export function exportCsv(lines: RentLine[]): string {
  const header = 'Locataire;Bien et lot;Loyer;Payé;Reste dû;Statut;Mode';
  const rows = lines.map((l) =>
    [
      l.tenant?.fullName ?? '',
      unitLabel(l),
      l.lease.rent,
      l.paid,
      l.remaining,
      RENT_STATUS_LABELS[l.status],
      l.lastPayment ? PAYMENT_METHOD_LABELS[l.lastPayment.method] : '',
    ].join(';'),
  );
  return [header, ...rows].join('\n');
}
