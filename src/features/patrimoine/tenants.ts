import type { Lease, Property, Tenant } from '@/types/models';

import type { UnitView } from './units';

/** En dessous de ce nombre de jours, un bail est signalé « fin de bail proche ». */
const LEASE_ENDING_SOON_DAYS = 90;

/** Une ligne de la liste : un locataire avec le lot qu'il occupe. */
export interface TenantEntry {
  tenant: Tenant;
  lease: Lease;
  /** Lot occupé et situation du loyer. */
  view: UnitView;
  propertyName: string;
  /** Loyer en retard sur la période en cours. */
  unpaid: boolean;
  /** Jours restants avant la fin du bail ; négatif si le bail est terminé. */
  daysLeft: number;
  endingSoon: boolean;
}

export function buildTenantEntries(views: UnitView[], properties: Property[], today: string): TenantEntry[] {
  return views.flatMap((view) => {
    const { unit, lease, tenant, status } = view;
    if (!lease || !tenant) return [];
    const daysLeft = Math.ceil((Date.parse(lease.endDate) - Date.parse(today)) / 86_400_000);
    return [
      {
        tenant,
        lease,
        view,
        propertyName: properties.find((p) => p.id === unit.propertyId)?.name ?? '',
        unpaid: status === 'en_retard',
        daysLeft,
        endingSoon: daysLeft <= LEASE_ENDING_SOON_DAYS,
      },
    ];
  });
}

/** « dans 47 jours », ou « Bail terminé » une fois la date passée. */
export function remainingLabel(daysLeft: number): string {
  if (daysLeft < 0) return 'Bail terminé';
  if (daysLeft === 0) return "Se termine aujourd'hui";
  return `dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`;
}

/** Minuscules et sans accents, pour que « mariama ba » trouve « Mariama Bâ ». */
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Recherche sur le nom du locataire, le lot et le bien. */
export function matchesSearch(entry: TenantEntry, query: string): boolean {
  const target = normalize(`${entry.tenant.fullName} ${entry.view.unit.label} ${entry.propertyName}`);
  return normalize(query)
    .split(/\s+/)
    .every((word) => target.includes(word));
}
