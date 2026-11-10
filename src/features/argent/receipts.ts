import { PAYMENT_METHOD_LABELS, remainingAmount } from '@/domain/rent';
import type { Lease, Payment, Property, Receipt, Tenant, Unit } from '@/types/models';
import { formatDate, formatFCFA, formatPeriod } from '@/utils/format';

/** Une quittance avec tout ce qu'il faut pour l'afficher et la partager. */
export interface ReceiptView {
  receipt: Receipt;
  payment: Payment;
  lease: Lease;
  tenant?: Tenant;
  unit?: Unit;
  property?: Property;
  /** Après ce paiement, le loyer du mois n'est toujours pas soldé : c'est un reçu, pas une quittance. */
  partial: boolean;
  /** Ce qui reste dû aujourd'hui sur ce mois de loyer. */
  remaining: number;
}

export function buildReceiptViews(
  receipts: Receipt[],
  payments: Payment[],
  leases: Lease[],
  tenants: Tenant[],
  units: Unit[],
  properties: Property[],
): ReceiptView[] {
  return receipts
    .flatMap((receipt) => {
      const payment = payments.find((p) => p.id === receipt.paymentId);
      const lease = leases.find((l) => l.id === payment?.leaseId);
      if (!payment || !lease) return [];
      const unit = units.find((u) => u.id === lease.unitId);
      // Cumul des règlements confirmés du mois jusqu'à celui-ci inclus (les paiements sont enregistrés dans l'ordre).
      const sameMonth = payments.filter(
        (p) => p.leaseId === lease.id && p.period === payment.period && p.status === 'confirme',
      );
      const paidSoFar = sameMonth
        .slice(0, sameMonth.indexOf(payment) + 1)
        .reduce((sum, p) => sum + p.amount, 0);
      return [
        {
          receipt,
          payment,
          lease,
          tenant: tenants.find((t) => t.id === lease.tenantId),
          unit,
          property: properties.find((p) => p.id === unit?.propertyId),
          partial: paidSoFar < lease.rent,
          remaining: remainingAmount(lease, payment.period, payments),
        },
      ];
    })
    .sort((a, b) => b.receipt.issuedAt.localeCompare(a.receipt.issuedAt) || b.receipt.number.localeCompare(a.receipt.number));
}

/** Les chiffres de la maquette, pour les quittances d'un mois de loyer. */
export interface ReceiptsSummary {
  count: number;
  amount: number;
  partialCount: number;
  mobileMoneyAmount: number;
}

export function summarizeReceipts(views: ReceiptView[]): ReceiptsSummary {
  return {
    count: views.length,
    amount: views.reduce((sum, v) => sum + v.payment.amount, 0),
    partialCount: views.filter((v) => v.partial).length,
    mobileMoneyAmount: views
      .filter((v) => v.payment.method === 'wave' || v.payment.method === 'orange_money')
      .reduce((sum, v) => sum + v.payment.amount, 0),
  };
}

/** « Immeuble Baobab · 1A » */
export const receiptPlace = (view: ReceiptView) => [view.property?.name, view.unit?.label].filter(Boolean).join(' · ');

/** « de septembre 2026 », « d’octobre 2026 » */
export const ofPeriod = (period: string) => {
  const label = formatPeriod(period);
  return `${/^[aeiou]/i.test(label) ? 'd’' : 'de '}${label}`;
};

/** Texte de la quittance, pour l'envoyer par WhatsApp ou l'enregistrer. */
export function receiptText(view: ReceiptView): string {
  const { receipt, payment, tenant, property } = view;
  const title = view.partial ? 'REÇU DE PAIEMENT PARTIEL' : 'QUITTANCE DE LOYER';
  return [
    `${title} n° ${receipt.number}`,
    `Locataire : ${tenant?.fullName ?? '—'}`,
    `Logement : ${receiptPlace(view)}${property?.address ? `, ${property.address}` : ''}`,
    `Loyer ${ofPeriod(payment.period)} : ${formatFCFA(view.lease.rent)}`,
    `Montant reçu : ${formatFCFA(payment.amount)} le ${formatDate(payment.paidAt, true)}`,
    `Mode de règlement : ${PAYMENT_METHOD_LABELS[payment.method]}${payment.reference ? ` (réf. ${payment.reference})` : ''}`,
    view.remaining > 0 ? `Reste dû sur ce mois : ${formatFCFA(view.remaining)}` : 'Loyer du mois entièrement réglé.',
  ].join('\n');
}
