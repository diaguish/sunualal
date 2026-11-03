import type { Expense, Lease, Payment, Property, Receipt, Tenant, Unit } from '@/types/models';

/**
 * Données fictives reprises de la maquette Figma.
 * Elles ne sont lues QUE par `src/data/api.ts` — les écrans passent toujours par l'API.
 */

/** Date « du jour » figée pour que les statuts correspondent à la maquette. */
export const MOCK_TODAY = '2026-10-14';
export const MOCK_PERIOD = '2026-10';

export const properties: Property[] = [
  { id: 'p-teranga', name: 'Résidence Teranga', type: 'immeuble', address: 'Mermoz, Dakar' },
  { id: 'p-baobab', name: 'Immeuble Baobab', type: 'immeuble', address: 'Sacré-Cœur, Dakar' },
  { id: 'p-villa', name: 'Villa Sacré-Cœur 3', type: 'maison_entiere', address: 'Sacré-Cœur 3, Dakar' },
];

export const units: Unit[] = [
  { id: 'u-a1', propertyId: 'p-teranga', label: 'A1', floor: 'Niv. A', description: 'F2', rent: 150_000 },
  { id: 'u-a2', propertyId: 'p-teranga', label: 'A2', floor: 'Niv. A', description: 'F2', rent: 150_000 },
  { id: 'u-b1', propertyId: 'p-teranga', label: 'B1', floor: 'Niv. B', description: 'F2', rent: 250_000 },
  { id: 'u-b2', propertyId: 'p-teranga', label: 'B2', floor: 'Niv. B', description: 'F2', rent: 250_000 },
  { id: 'u-c1', propertyId: 'p-teranga', label: 'C1', floor: 'Niv. C', description: 'F3', rent: 150_000 },
  { id: 'u-c2', propertyId: 'p-teranga', label: 'C2', floor: 'Niv. C', description: 'F3', rent: 150_000 },

  { id: 'u-rdc1', propertyId: 'p-baobab', label: 'RDC 1', floor: 'RDC', rent: 120_000 },
  { id: 'u-rdc2', propertyId: 'p-baobab', label: 'RDC 2', floor: 'RDC', rent: 120_000 },
  { id: 'u-1a', propertyId: 'p-baobab', label: '1A', floor: '1er étage', rent: 150_000 },
  { id: 'u-1b', propertyId: 'p-baobab', label: '1B', floor: '1er étage', rent: 200_000 },
  { id: 'u-2a', propertyId: 'p-baobab', label: '2A', floor: '2e étage', rent: 150_000 },
  { id: 'u-2b', propertyId: 'p-baobab', label: '2B', floor: '2e étage', rent: 150_000 },
  { id: 'u-3a', propertyId: 'p-baobab', label: '3A', floor: '3e étage', rent: 150_000 },
  { id: 'u-3b', propertyId: 'p-baobab', label: '3B', floor: '3e étage', rent: 150_000 },

  { id: 'u-villa', propertyId: 'p-villa', label: 'Villa', rent: 600_000 },
];

export const tenants: Tenant[] = [
  { id: 't-moussa', fullName: 'Moussa Diop', phone: '+221 77 100 00 01' },
  { id: 't-fatou', fullName: 'Fatou Sow', phone: '+221 77 100 00 02' },
  { id: 't-awa', fullName: 'Awa Ndiaye', phone: '+221 77 100 00 03' },
  { id: 't-ibrahima', fullName: 'Ibrahima Fall', phone: '+221 77 100 00 04' },
  { id: 't-khady', fullName: 'Khady Thiam', phone: '+221 77 100 00 05' },
  { id: 't-seynabou', fullName: 'Seynabou Mbaye', phone: '+221 77 100 00 06' },
  { id: 't-modou', fullName: 'Modou Kane', phone: '+221 77 100 00 07' },
  { id: 't-ousmane', fullName: 'Ousmane Gueye', phone: '+221 77 100 00 08' },
  { id: 't-mariama', fullName: 'Mariama Bâ', phone: '+221 77 100 00 09' },
  { id: 't-astou', fullName: 'Astou Lô', phone: '+221 77 100 00 10' },
  { id: 't-cheikh', fullName: 'Cheikh Sarr', phone: '+221 77 100 00 11' },
  { id: 't-pape', fullName: 'Pape Samba Ndoye', phone: '+221 77 100 00 12' },
  { id: 't-alioune', fullName: 'Alioune Cissé', phone: '+221 77 100 00 13' },
];

export const leases: Lease[] = [
  { id: 'l-a1', unitId: 'u-a1', tenantId: 't-moussa', rent: 150_000, dueDay: 5, startDate: '2025-02-01', endDate: '2027-01-31' },
  { id: 'l-a2', unitId: 'u-a2', tenantId: 't-fatou', rent: 150_000, dueDay: 5, startDate: '2025-06-01', endDate: '2027-05-31' },
  { id: 'l-b1', unitId: 'u-b1', tenantId: 't-awa', rent: 250_000, dueDay: 5, startDate: '2024-12-01', endDate: '2026-11-30' },
  { id: 'l-b2', unitId: 'u-b2', tenantId: 't-ibrahima', rent: 250_000, dueDay: 10, startDate: '2025-03-01', endDate: '2027-02-28' },
  { id: 'l-c1', unitId: 'u-c1', tenantId: 't-khady', rent: 150_000, dueDay: 5, startDate: '2025-09-01', endDate: '2027-08-31' },

  { id: 'l-rdc1', unitId: 'u-rdc1', tenantId: 't-seynabou', rent: 120_000, dueDay: 10, startDate: '2025-01-01', endDate: '2026-12-31' },
  { id: 'l-rdc2', unitId: 'u-rdc2', tenantId: 't-modou', rent: 120_000, dueDay: 15, startDate: '2025-04-01', endDate: '2027-03-31' },
  { id: 'l-1a', unitId: 'u-1a', tenantId: 't-ousmane', rent: 150_000, dueDay: 5, startDate: '2025-05-01', endDate: '2027-04-30' },
  { id: 'l-1b', unitId: 'u-1b', tenantId: 't-mariama', rent: 200_000, dueDay: 5, startDate: '2025-01-01', endDate: '2026-12-31' },
  { id: 'l-2a', unitId: 'u-2a', tenantId: 't-astou', rent: 150_000, dueDay: 25, startDate: '2025-07-01', endDate: '2027-06-30' },
  { id: 'l-2b', unitId: 'u-2b', tenantId: 't-cheikh', rent: 150_000, dueDay: 5, startDate: '2025-08-01', endDate: '2027-07-31' },
  { id: 'l-3a', unitId: 'u-3a', tenantId: 't-pape', rent: 150_000, dueDay: 5, startDate: '2025-10-01', endDate: '2027-09-30' },

  { id: 'l-villa', unitId: 'u-villa', tenantId: 't-alioune', rent: 600_000, dueDay: 5, startDate: '2024-10-01', endDate: '2027-09-30' },
];

export const payments: Payment[] = [
  { id: 'pay-1', leaseId: 'l-a1', period: '2026-10', amount: 150_000, method: 'wave', status: 'confirme', paidAt: '2026-10-03' },
  { id: 'pay-2', leaseId: 'l-a2', period: '2026-10', amount: 150_000, method: 'orange_money', status: 'confirme', paidAt: '2026-10-04' },
  { id: 'pay-3', leaseId: 'l-b2', period: '2026-10', amount: 100_000, method: 'especes', status: 'confirme', paidAt: '2026-10-09' },
  { id: 'pay-4', leaseId: 'l-c1', period: '2026-10', amount: 150_000, method: 'wave', status: 'confirme', paidAt: '2026-10-09' },
  { id: 'pay-5', leaseId: 'l-rdc1', period: '2026-10', amount: 120_000, method: 'wave', status: 'confirme', paidAt: '2026-10-10' },
  { id: 'pay-6', leaseId: 'l-1b', period: '2026-10', amount: 200_000, method: 'wave', reference: 'WV-8F3K2A', status: 'confirme', paidAt: '2026-10-05' },
  { id: 'pay-7', leaseId: 'l-2b', period: '2026-10', amount: 150_000, method: 'orange_money', status: 'confirme', paidAt: '2026-10-05' },
  { id: 'pay-8', leaseId: 'l-3a', period: '2026-10', amount: 150_000, method: 'wave', status: 'a_verifier', paidAt: '2026-10-13' },
  { id: 'pay-9', leaseId: 'l-villa', period: '2026-10', amount: 600_000, method: 'virement', status: 'confirme', paidAt: '2026-10-05' },
];

export const receipts: Receipt[] = payments
  .filter((p) => p.status === 'confirme')
  .map((p, i) => ({
    id: `r-${p.id}`,
    paymentId: p.id,
    number: `Q-2026-10-${String(i + 1).padStart(4, '0')}`,
    issuedAt: p.paidAt,
  }));

/** Mois précédents : payés à temps sauf les exceptions ci-dessous (points de régularité de la fiche locataire). */
const HISTORY_PERIODS = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
const HISTORY_EXCEPTIONS: Record<string, Record<string, 'en_retard' | 'impaye'>> = {
  'l-b1': { '2026-08': 'en_retard', '2026-09': 'impaye' },
  'l-b2': { '2026-07': 'en_retard' },
  'l-rdc2': { '2026-05': 'en_retard' },
  'l-1a': { '2026-06': 'impaye', '2026-09': 'en_retard' },
  'l-2a': { '2026-08': 'en_retard' },
};

// Ajouté après `receipts` : les quittances fictives restent celles d'octobre.
leases.forEach((lease) => {
  HISTORY_PERIODS.forEach((period) => {
    const exception = HISTORY_EXCEPTIONS[lease.id]?.[period];
    if (exception === 'impaye') return;
    const day = lease.dueDay + (exception === 'en_retard' ? 3 : -1);
    payments.push({
      id: `pay-${lease.id}-${period}`,
      leaseId: lease.id,
      period,
      amount: lease.rent,
      method: 'wave',
      status: 'confirme',
      paidAt: `${period}-${String(day).padStart(2, '0')}`,
    });
  });
});

export const expenses: Expense[] = [
  { id: 'e-1', propertyId: 'p-teranga', unitId: 'u-c2', label: 'Peinture C2', category: 'travaux', amount: 180_000, date: '2026-10-02' },
  { id: 'e-2', propertyId: 'p-baobab', label: 'Vidange fosse septique', category: 'entretien', amount: 45_000, date: '2026-09-21' },
];
