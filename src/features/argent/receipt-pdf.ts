import { colors } from '@/theme';
import { PAYMENT_METHOD_LABELS } from '@/domain/rent';
import { formatDate, formatFCFA } from '@/utils/format';

import { ofPeriod, receiptPlace, ReceiptView } from './receipts';

/** Format A4 en points (72 par pouce), la taille par défaut d'expo-print étant le format US Letter. */
export const A4 = { width: 595, height: 842 };

/** Nom du fichier partagé : « Quittance-Q-2026-10-0003.pdf ». */
export const receiptFileName = (view: ReceiptView) =>
  `${view.partial ? 'Recu' : 'Quittance'}-${view.receipt.number.replace(/[^\w-]/g, '')}.pdf`;

/** Les noms et adresses viennent de la saisie : on les échappe avant de les mettre dans le HTML. */
const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Page HTML de la quittance, convertie en PDF par expo-print.
 * Un paiement qui ne solde pas le mois donne un « reçu d'acompte », qui ne vaut pas quittance.
 */
export function receiptHtml(view: ReceiptView, appName: string): string {
  const { receipt, payment, lease, tenant, property } = view;
  const tenantName = escape(tenant?.fullName ?? '—');
  const place = escape([receiptPlace(view), property?.address].filter(Boolean).join(', '));
  const period = ofPeriod(payment.period);
  const method = `${PAYMENT_METHOD_LABELS[payment.method]}${payment.reference ? ` · réf. ${escape(payment.reference)}` : ''}`;

  const statement = view.partial
    ? `Le bailleur reconnaît avoir reçu de <b>${tenantName}</b> la somme de <b>${formatFCFA(payment.amount)}</b>
       à titre d’acompte sur le loyer ${period} du logement ci-dessus.
       Ce reçu ne vaut pas quittance : il reste <b>${formatFCFA(view.remaining)}</b> à régler sur ce mois.`
    : `Le bailleur reconnaît avoir reçu de <b>${tenantName}</b> la somme de <b>${formatFCFA(payment.amount)}</b>
       au titre du loyer ${period} du logement ci-dessus, et lui en donne quittance, sous réserve de tous ses droits.`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=${A4.width}, initial-scale=1" />
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px 52px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
         color: ${colors.text}; font-size: 13px; line-height: 1.5; }
  .top { display: flex; justify-content: space-between; align-items: flex-start;
         border-bottom: 3px solid ${colors.primary}; padding-bottom: 16px; }
  .brand { font-size: 18px; font-weight: 700; color: ${colors.primary}; }
  .kind { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: ${colors.textMuted}; }
  .number { font-size: 22px; font-weight: 700; margin-top: 4px; }
  .right { text-align: right; }
  table { width: 100%; border-collapse: collapse; margin-top: 24px; }
  td { padding: 8px 0; border-bottom: 1px solid ${colors.border}; vertical-align: top; }
  td.label { width: 38%; color: ${colors.textMuted}; }
  .amount { margin-top: 28px; background: ${colors.primarySoft}; border-radius: 8px; padding: 18px 20px; }
  .amount .value { font-size: 28px; font-weight: 700; color: ${colors.primary}; }
  .rest { margin-top: 10px; font-weight: 700; color: ${view.remaining > 0 ? colors.late : colors.paid}; }
  .statement { margin-top: 28px; }
  .sign { margin-top: 40px; display: flex; justify-content: space-between; }
  .sign div { width: 45%; border-top: 1px solid ${colors.border}; padding-top: 8px; color: ${colors.textMuted}; }
  .foot { margin-top: 32px; font-size: 10px; color: ${colors.textMuted}; }
</style>
</head>
<body>
  <div class="top">
    <div>
      <div class="brand">${escape(appName)}</div>
      <div class="kind">${view.partial ? 'Reçu d’acompte' : 'Quittance de loyer'}</div>
      <div class="number">${escape(receipt.number)}</div>
    </div>
    <div class="right">Émise le<br /><b>${formatDate(receipt.issuedAt, true)}</b></div>
  </div>

  <table>
    <tr><td class="label">Locataire</td><td>${tenantName}</td></tr>
    <tr><td class="label">Logement</td><td>${place}</td></tr>
    <tr><td class="label">Période</td><td>Loyer ${period}</td></tr>
    <tr><td class="label">Loyer mensuel</td><td>${formatFCFA(lease.rent)}</td></tr>
    <tr><td class="label">Date du paiement</td><td>${formatDate(payment.paidAt, true)}</td></tr>
    <tr><td class="label">Mode de règlement</td><td>${method}</td></tr>
  </table>

  <div class="amount">
    <div class="kind">Montant reçu</div>
    <div class="value">${formatFCFA(payment.amount)}</div>
    <div class="rest">${view.remaining > 0 ? `Reste dû sur ce mois : ${formatFCFA(view.remaining)}` : 'Loyer du mois entièrement réglé'}</div>
  </div>

  <p class="statement">${statement}</p>

  <div class="sign">
    <div>Le bailleur</div>
    <div>Fait le ${formatDate(receipt.issuedAt, true)}</div>
  </div>

  <p class="foot">Document généré par ${escape(appName)}. À conserver.</p>
</body>
</html>`;
}
