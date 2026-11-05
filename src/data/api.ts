import type { ID, Intervention, Lease, Payment, Property, Receipt, Tenant, Unit, Expense } from '@/types/models';

import * as db from './mock';

/**
 * Point d'accès UNIQUE aux données pour les écrans.
 *
 * Aujourd'hui : données fictives en mémoire.
 * Demain : appels au backend (Django, Supabase…) — seul ce fichier changera,
 * les écrans n'ont rien à modifier car toutes les fonctions sont déjà asynchrones.
 */

const delay = <T>(value: T): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), 150));

let nextId = 1000;
const newId = (prefix: string) => `${prefix}-${nextId++}`;

// ——— Contexte ———

export const getToday = () => delay(db.MOCK_TODAY);
export const getCurrentPeriod = () => delay(db.MOCK_PERIOD);

// ——— Patrimoine : biens, unités, locataires, baux ———

export const listProperties = (): Promise<Property[]> => delay(db.properties);
export const getProperty = (id: ID): Promise<Property | undefined> => delay(db.properties.find((p) => p.id === id));
export const listUnits = (propertyId?: ID): Promise<Unit[]> =>
  delay(propertyId ? db.units.filter((u) => u.propertyId === propertyId) : db.units);

export const listTenants = (): Promise<Tenant[]> => delay(db.tenants);
export const getTenant = (id: ID): Promise<Tenant | undefined> => delay(db.tenants.find((t) => t.id === id));

export const listLeases = (): Promise<Lease[]> => delay(db.leases);

export async function createProperty(input: Omit<Property, 'id'>, unitLabels: string[], rent = 0): Promise<Property> {
  const property: Property = { ...input, id: newId('p') };
  db.properties.push(property);
  unitLabels.forEach((label) => db.units.push({ id: newId('u'), propertyId: property.id, label, rent }));
  return delay(property);
}

export async function createTenant(input: Omit<Tenant, 'id'>): Promise<Tenant> {
  const tenant: Tenant = { ...input, id: newId('t') };
  db.tenants.push(tenant);
  return delay(tenant);
}

export async function createLease(input: Omit<Lease, 'id'>): Promise<Lease> {
  const lease: Lease = { ...input, id: newId('l') };
  db.leases.push(lease);
  return delay(lease);
}

// ——— Argent : paiements, quittances, dépenses ———

export const listPayments = (period?: string): Promise<Payment[]> =>
  delay(period ? db.payments.filter((p) => p.period === period) : db.payments);

export const listReceipts = (): Promise<Receipt[]> => delay(db.receipts);
export const listExpenses = (): Promise<Expense[]> => delay(db.expenses);

export async function createExpense(input: Omit<Expense, 'id'>): Promise<Expense> {
  const expense: Expense = { ...input, id: newId('e') };
  db.expenses.push(expense);
  return delay(expense);
}

// ——— Travaux : interventions ———

export const listInterventions = (): Promise<Intervention[]> => delay(db.interventions);

/** Marque une intervention comme terminée. */
export async function completeIntervention(id: ID): Promise<Intervention | undefined> {
  const intervention = db.interventions.find((i) => i.id === id);
  if (intervention) intervention.status = 'termine';
  return delay(intervention);
}

/** Enregistre un paiement ; génère la quittance s'il est confirmé. */
export async function recordPayment(input: Omit<Payment, 'id'>): Promise<{ payment: Payment; receipt?: Receipt }> {
  const payment: Payment = { ...input, id: newId('pay') };
  db.payments.push(payment);
  let receipt: Receipt | undefined;
  if (payment.status === 'confirme') {
    receipt = { id: newId('r'), paymentId: payment.id, number: `Q-${payment.period}-${nextId}`, issuedAt: payment.paidAt };
    db.receipts.push(receipt);
  }
  return delay({ payment, receipt });
}

/** Confirme un paiement mobile money déclaré par un locataire. */
export async function confirmPayment(paymentId: ID): Promise<Payment | undefined> {
  const payment = db.payments.find((p) => p.id === paymentId);
  if (payment) payment.status = 'confirme';
  return delay(payment);
}
