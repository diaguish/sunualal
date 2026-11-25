import {
  OutstandingMonth,
  outstandingMonths,
  paidAmount,
  remainingAmount,
  rentStatus,
  trackedPeriods,
} from '@/domain/rent';
import type { Lease, Payment, Property, RentStatus, Tenant, Unit } from '@/types/models';
import { formatFCFA, formatPeriod } from '@/utils/format';

/** Un bail avec tout ce qu'il faut pour encaisser : le loyer du mois et tout ce qui reste dû. */
export interface LeaseOption {
  lease: Lease;
  tenant?: Tenant;
  unit?: Unit;
  property?: Property;
  /** Payé / reste dû sur le mois `period` seulement. */
  paid: number;
  remaining: number;
  status: RentStatus;
  /** Tous les mois pas encore soldés, du plus ancien au plus récent (mois en cours inclus). */
  owed: OutstandingMonth[];
  /** Total dû, tous mois confondus : c'est ce qu'un paiement vient régler, le plus ancien d'abord. */
  totalDue: number;
}

/** « Ousmane Gueye · Immeuble Baobab » */
export function leaseLabel(option: LeaseOption): string {
  return [option.tenant?.fullName ?? 'Locataire inconnu', option.property?.name].filter(Boolean).join(' · ');
}

/** « Immeuble Baobab · 1A » */
export function unitLabel(option: LeaseOption): string {
  return [option.property?.name, option.unit?.label].filter(Boolean).join(' · ');
}

export const STATUS_ORDER: Record<RentStatus, number> = { en_retard: 0, a_payer: 1, a_verifier: 2, paye: 3, libre: 4 };

/** Baux de la période, ceux qui doivent de l'argent en premier (retards d'abord). */
export function buildLeaseOptions(
  leases: Lease[],
  tenants: Tenant[],
  units: Unit[],
  properties: Property[],
  payments: Payment[],
  period: string,
  today: string,
): LeaseOption[] {
  const periods = trackedPeriods(payments, period);
  return leases
    .map((lease) => {
      const unit = units.find((u) => u.id === lease.unitId);
      const owed = outstandingMonths(lease, payments, periods);
      return {
        lease,
        tenant: tenants.find((t) => t.id === lease.tenantId),
        unit,
        property: properties.find((p) => p.id === unit?.propertyId),
        paid: paidAmount(lease.id, period, payments),
        remaining: remainingAmount(lease, period, payments),
        status: rentStatus(lease, period, payments, today),
        owed,
        totalDue: owed.reduce((sum, m) => sum + m.remaining, 0),
      };
    })
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}

/**
 * Statut à afficher pour un locataire, tous mois confondus : le mois en cours peut être payé
 * alors qu'un mois plus ancien (donc échu) reste dû — il est alors en retard.
 */
export const overallStatus = (option: LeaseOption): RentStatus =>
  option.status === 'paye' && option.totalDue > 0 ? 'en_retard' : option.status;

/** Saisie libre → montant entier : « 150 000 », « 150000 » ou « 150.000 » donnent 150000. */
export function parseAmount(text: string): number {
  const digits = text.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

/** « septembre 2026 » → « Septembre 2026 » */
export const monthLabel = (period: string) => {
  const label = formatPeriod(period);
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/** Une part d'un paiement, imputée sur un mois de loyer. */
export interface AllocatedPart {
  period: string;
  amount: number;
  /** Reste dû sur ce mois après le paiement. */
  remainingAfter: number;
  receiptNumber?: string;
}

/** Message de confirmation envoyé au locataire, mois par mois. */
export function receiptMessage(params: {
  tenantName: string;
  amount: number;
  place: string;
  parts: AllocatedPart[];
  /** Total encore dû après ce paiement, tous mois confondus. */
  totalDueAfter: number;
}): string {
  const firstName = params.tenantName.split(' ')[0];
  const lines = [
    `Bonjour ${firstName},`,
    `Nous confirmons la réception de ${formatFCFA(params.amount)} pour votre loyer (${params.place}) :`,
    ...params.parts.map(
      (p) =>
        `- ${monthLabel(p.period)} : ${formatFCFA(p.amount)}${p.remainingAfter > 0 ? ` (reste ${formatFCFA(p.remainingAfter)})` : ' (soldé)'}${p.receiptNumber ? `, quittance n° ${p.receiptNumber}` : ''}`,
    ),
    params.totalDueAfter > 0 ? `Reste dû au total : ${formatFCFA(params.totalDueAfter)}.` : 'Tout est réglé. Merci !',
  ];
  return lines.join('\n');
}

/** Lien WhatsApp vers le numéro du locataire, message pré-rempli. */
export function whatsappUrl(phone: string, message: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}
