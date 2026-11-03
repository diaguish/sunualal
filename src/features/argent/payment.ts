import { paidAmount, remainingAmount, rentStatus } from '@/domain/rent';
import type { Lease, Payment, Property, RentStatus, Tenant, Unit } from '@/types/models';
import { formatFCFA, formatPeriod } from '@/utils/format';

/** Un bail avec tout ce qu'il faut pour encaisser son loyer du mois. */
export interface LeaseOption {
  lease: Lease;
  tenant?: Tenant;
  unit?: Unit;
  property?: Property;
  paid: number;
  remaining: number;
  status: RentStatus;
}

/** « Ousmane Gueye · Immeuble Baobab » */
export function leaseLabel(option: LeaseOption): string {
  return [option.tenant?.fullName ?? 'Locataire inconnu', option.property?.name].filter(Boolean).join(' · ');
}

/** « Immeuble Baobab · 1A » */
export function unitLabel(option: LeaseOption): string {
  return [option.property?.name, option.unit?.label].filter(Boolean).join(' · ');
}

const STATUS_ORDER: Record<RentStatus, number> = { en_retard: 0, a_payer: 1, a_verifier: 2, paye: 3, libre: 4 };

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
  return leases
    .map((lease) => {
      const unit = units.find((u) => u.id === lease.unitId);
      return {
        lease,
        tenant: tenants.find((t) => t.id === lease.tenantId),
        unit,
        property: properties.find((p) => p.id === unit?.propertyId),
        paid: paidAmount(lease.id, period, payments),
        remaining: remainingAmount(lease, period, payments),
        status: rentStatus(lease, period, payments, today),
      };
    })
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}

/** Saisie libre → montant entier : « 150 000 », « 150000 » ou « 150.000 » donnent 150000. */
export function parseAmount(text: string): number {
  const digits = text.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

/** Message de confirmation envoyé au locataire. */
export function receiptMessage(params: {
  tenantName: string;
  amount: number;
  period: string;
  place: string;
  receiptNumber?: string;
  remaining: number;
}): string {
  const firstName = params.tenantName.split(' ')[0];
  const lines = [
    `Bonjour ${firstName},`,
    `Nous confirmons la réception de ${formatFCFA(params.amount)} pour le loyer de ${formatPeriod(params.period)} (${params.place}).`,
  ];
  if (params.receiptNumber) lines.push(`Quittance n° ${params.receiptNumber}.`);
  lines.push(params.remaining > 0 ? `Reste dû : ${formatFCFA(params.remaining)}.` : 'Votre loyer du mois est soldé. Merci !');
  return lines.join('\n');
}

/** Lien WhatsApp vers le numéro du locataire, message pré-rempli. */
export function whatsappUrl(phone: string, message: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}
