/**
 * Modèle de données partagé de Keur Clair.
 *
 * Conventions :
 * - Les montants sont des entiers en FCFA (pas de centimes).
 * - Les dates sont des chaînes ISO "YYYY-MM-DD" ; les périodes de loyer sont "YYYY-MM".
 * - Les identifiants sont des chaînes (compatibles avec un futur backend).
 *
 * Toute modification de ce fichier impacte les deux parties de l'app : en discuter avant.
 */

export type ID = string;

export type PropertyType = 'immeuble' | 'maison_entiere' | 'maison_chambres' | 'local_commercial';

/** Un bien : immeuble, maison, local… */
export interface Property {
  id: ID;
  name: string; // « Résidence Teranga »
  type: PropertyType;
  address: string; // « Mermoz, Dakar »
}

/** Une unité louable dans un bien : appartement, chambre, boutique… */
export interface Unit {
  id: ID;
  propertyId: ID;
  label: string; // « B1 », « RDC 2 », « Chambre 3 »
  floor?: string; // « Niv. B », « 2e étage »
  description?: string; // « F2 »
  rent: number; // loyer mensuel de référence
}

export interface Tenant {
  id: ID;
  fullName: string;
  phone: string; // format international : +221 77 123 45 67
}

/** Un bail relie un locataire à une unité. */
export interface Lease {
  id: ID;
  unitId: ID;
  tenantId: ID;
  rent: number;
  dueDay: number; // jour du mois où le loyer est dû (1–28)
  startDate: string;
  endDate: string;
}

export type PaymentMethod = 'wave' | 'orange_money' | 'especes' | 'virement';

/**
 * `confirme` : encaissé et vérifié par le propriétaire.
 * `a_verifier` : déclaré par le locataire (Wave / Orange Money), en attente de confirmation.
 */
export type PaymentStatus = 'confirme' | 'a_verifier';

export interface Payment {
  id: ID;
  leaseId: ID;
  period: string; // mois de loyer concerné, "YYYY-MM"
  amount: number;
  method: PaymentMethod;
  reference?: string; // référence de transaction Wave / OM
  status: PaymentStatus;
  paidAt: string;
}

/** Quittance générée pour un paiement confirmé. */
export interface Receipt {
  id: ID;
  paymentId: ID;
  number: string; // « Q-2026-10-0012 »
  issuedAt: string;
}

export type ExpenseCategory = 'travaux' | 'entretien' | 'charges' | 'taxes' | 'autre';

export interface Expense {
  id: ID;
  propertyId: ID;
  unitId?: ID;
  label: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
}

export type InterventionStatus = 'en_cours' | 'termine';

/** Un problème à régler sur un bien : fuite, panne, réparation… */
export interface Intervention {
  id: ID;
  propertyId: ID;
  unitId?: ID;
  label: string;
  reportedByTenantId?: ID; // absent si signalé par le propriétaire
  reportedAt: string;
  estimatedCost?: number;
  status: InterventionStatus;
}

/** Statut d'une unité pour une période donnée (couleurs de la grille des lots). */
export type RentStatus = 'paye' | 'en_retard' | 'a_verifier' | 'a_payer' | 'libre';

/** Ton du message de relance. */
export type ReminderTone = 'amical' | 'ferme' | 'mise_en_demeure';
