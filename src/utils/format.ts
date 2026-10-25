/**
 * Formate un montant entier en FCFA avec des espaces comme séparateurs de milliers.
 * formatAmount(3290000) → "3 290 000"
 */
export function formatAmount(amount: number): string {
  // Implémentation manuelle : Intl n'est pas fiable sur tous les moteurs JS mobiles.
  const sign = amount < 0 ? '-' : '';
  const digits = Math.round(Math.abs(amount)).toString();
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** formatFCFA(150000) → "150 000 FCFA" */
export function formatFCFA(amount: number): string {
  return `${formatAmount(amount)} FCFA`;
}

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const MONTHS_LONG = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** Date ISO (YYYY-MM-DD) → "10 oct." ou "30 nov. 2026" avec `withYear`. */
export function formatDate(iso: string, withYear = false): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}${withYear ? ` ${y}` : ''}`;
}

/** Période (YYYY-MM) → "octobre 2026". */
export function formatPeriod(period: string): string {
  const [y, m] = period.split('-').map(Number);
  return `${MONTHS_LONG[m - 1]} ${y}`;
}

/** "Awa Ndiaye" → "AN" */
export function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
