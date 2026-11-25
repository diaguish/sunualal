import { dueDate } from '@/domain/rent';
import type { ArrearsLine } from '@/features/argent/arrears';
import { ofPeriod } from '@/features/argent/receipts';
import type { ReminderTone } from '@/types/models';
import { formatDate, formatFCFA } from '@/utils/format';

export const REMINDER_TONE_LABELS: Record<ReminderTone, string> = {
  amical: 'Amical',
  ferme: 'Ferme',
  mise_en_demeure: 'Mise en demeure',
};

/** Nom du palier, tel qu'il apparaît dans les réglages des automatisations. */
export const REMINDER_STEP_LABELS: Record<ReminderTone, string> = {
  amical: 'Relance amicale',
  ferme: 'Relance ferme',
  mise_en_demeure: 'Mise en demeure',
};

/**
 * Jours de retard à partir desquels chaque palier est conseillé.
 * Valeurs du cadre Figma « Automatisations — réglages » ; elles deviendront réglables avec cet écran.
 */
export const REMINDER_THRESHOLDS: Record<ReminderTone, number> = {
  amical: 3,
  ferme: 10,
  mise_en_demeure: 20,
};

/** Palier conseillé pour un nombre de jours de retard (le premier palier en dessous de son seuil). */
export function suggestedTone(days: number): ReminderTone {
  if (days >= REMINDER_THRESHOLDS.mise_en_demeure) return 'mise_en_demeure';
  if (days >= REMINDER_THRESHOLDS.ferme) return 'ferme';
  return 'amical';
}

/** Un locataire en retard, prêt à être relancé. */
export interface Reminder {
  line: ArrearsLine;
  /** Jours de retard du mois le plus ancien encore dû. */
  days: number;
  /** Échéance du mois le plus ancien encore dû (ISO). */
  oldestDue: string;
  suggested: ReminderTone;
}

/** Les relances à faire, le retard le plus ancien d'abord. */
export function buildReminders(lines: ArrearsLine[]): Reminder[] {
  return lines
    .filter((line) => line.months.length > 0)
    .map((line) => {
      const oldest = line.months.reduce((a, b) => (a.period < b.period ? a : b));
      return {
        line,
        days: oldest.days,
        oldestDue: dueDate(line.lease, oldest.period),
        suggested: suggestedTone(oldest.days),
      };
    })
    .sort((a, b) => b.days - a.days);
}

/** « Résidence Teranga · B1 » */
export const reminderPlace = (r: Reminder) =>
  [r.line.property?.name, r.line.unit?.label].filter(Boolean).join(' · ');

/** « Reste dû 250 000 FCFA · 9 jours de retard · échéance le 5 oct. » */
export const reminderSummary = (r: Reminder) =>
  [
    `Reste dû ${formatFCFA(r.line.total)}`,
    `${r.days} ${r.days > 1 ? 'jours' : 'jour'} de retard`,
    `échéance le ${formatDate(r.oldestDue)}`,
  ].join(' · ');

/** « le loyer d’octobre 2026 », « les loyers de septembre 2026 et d’octobre 2026 » */
function monthsPhrase(periods: string[]): string {
  const sorted = [...periods].sort();
  if (sorted.length === 1) return `le loyer ${ofPeriod(sorted[0])}`;
  const parts = sorted.map(ofPeriod);
  return `les loyers ${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1]}`;
}

/** Message de relance prêt à envoyer, selon le ton choisi. */
export function reminderMessage(r: Reminder, tone: ReminderTone): string {
  const fullName = r.line.tenant?.fullName ?? '';
  const firstName = fullName.split(' ')[0];
  const plural = r.line.months.length > 1;
  const months = monthsPhrase(r.line.months.map((m) => m.period));
  const lot = r.line.unit ? ` du lot ${r.line.unit.label}` : '';
  const amount = formatFCFA(r.line.total);

  switch (tone) {
    case 'amical':
      return [
        `Bonjour ${firstName},`,
        `Petit rappel : ${months}${lot} ${plural ? 'ne sont pas encore réglés' : 'n’est pas encore réglé'} (${amount}).`,
        'Merci de faire le nécessaire dès que possible. Bonne journée !',
      ].join(' ');
    case 'ferme':
      return [
        `Bonjour ${firstName},`,
        `malgré mon précédent message, ${months}${lot} ${plural ? 'restent impayés' : 'reste impayé'} (${amount}).`,
        'Merci de régulariser dès que possible.',
      ].join(' ');
    case 'mise_en_demeure':
      return [
        `Bonjour ${fullName},`,
        `malgré mes relances, ${months}${lot} ${plural ? 'restent impayés' : 'reste impayé'}, pour un total de ${amount}.`,
        'Je vous mets en demeure de régler cette somme sous 8 jours à compter de ce message.',
        'À défaut, je me réserve le droit d’engager les démarches prévues par le bail.',
      ].join(' ');
  }
}
