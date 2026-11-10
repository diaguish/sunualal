import { daysLate, dueDate } from '@/domain/rent';
import type { Payment } from '@/types/models';
import { formatDate, formatFCFA, formatPeriod } from '@/utils/format';

import { LeaseOption, unitLabel } from './payment';

export const isMobileMoney = (p: Payment) => p.method === 'wave' || p.method === 'orange_money';

/** Les chiffres de la maquette pour un mois de loyer. */
export interface MobileMoneySummary {
  wave: { amount: number; count: number };
  orangeMoney: { amount: number; count: number };
  /** Paiements déclarés par les locataires, pas encore confirmés. */
  toConfirm: { amount: number; count: number };
  /** Part du mobile money dans l'argent confirmé du mois, en %. */
  share: number;
}

export function summarizeMobileMoney(payments: Payment[], period: string): MobileMoneySummary {
  const ofMonth = payments.filter((p) => p.period === period);
  const confirmed = ofMonth.filter((p) => p.status === 'confirme');
  const total = (list: Payment[]) => ({ amount: list.reduce((s, p) => s + p.amount, 0), count: list.length });
  const wave = total(confirmed.filter((p) => p.method === 'wave'));
  const orangeMoney = total(confirmed.filter((p) => p.method === 'orange_money'));
  const received = total(confirmed).amount;
  return {
    wave,
    orangeMoney,
    toConfirm: total(ofMonth.filter((p) => p.status === 'a_verifier' && isMobileMoney(p))),
    share: received > 0 ? Math.round(((wave.amount + orangeMoney.amount) / received) * 100) : 0,
  };
}

/** Un paiement mobile money du mois avec le locataire concerné. */
export interface MobileMoneyPayment {
  payment: Payment;
  option?: LeaseOption;
}

export function listMobileMoneyPayments(
  payments: Payment[],
  options: LeaseOption[],
  period: string,
): MobileMoneyPayment[] {
  return payments
    .filter((p) => p.period === period && isMobileMoney(p))
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
    .map((payment) => ({ payment, option: options.find((o) => o.lease.id === payment.leaseId) }));
}

/** Locataires à qui demander le loyer : reste dû, et aucun paiement déclaré en attente. */
export const requestCandidates = (options: LeaseOption[]) =>
  options.filter((o) => o.remaining > 0 && (o.status === 'en_retard' || o.status === 'a_payer') && o.tenant?.phone);

/** « d’octobre 2026 », « de septembre 2026 » */
const ofPeriod = (period: string) => {
  const label = formatPeriod(period);
  return `${/^[aeiou]/i.test(label) ? 'd’' : 'de '}${label}`;
};

/** Message de demande de paiement, poli et factuel ; le ton ferme est réservé aux Relances. */
export function paymentRequestMessage(option: LeaseOption, period: string, today: string): string {
  const firstName = option.tenant?.fullName.split(' ')[0] ?? '';
  const due = dueDate(option.lease, period);
  const late = daysLate(option.lease, period, today);
  const place = `${ofPeriod(period)} (${unitLabel(option)})`;
  return [
    `Bonjour ${firstName},`,
    option.paid > 0
      ? `Il reste ${formatFCFA(option.remaining)} à régler sur votre loyer ${place}.`
      : `Votre loyer ${place} de ${formatFCFA(option.remaining)} est à régler.`,
    // formatDate se termine déjà par un point (« 5 oct. ») : pas de point en plus.
    late > 0 ? `L’échéance était le ${formatDate(due)}` : `L’échéance est le ${formatDate(due)}`,
    'Vous pouvez payer par Wave ou Orange Money, puis m’envoyer la référence de la transaction ici.',
    'Merci !',
  ].join('\n');
}
