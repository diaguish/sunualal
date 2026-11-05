import type { Property, PropertyType } from '@/types/models';

const MAX_UNITS = 50;

/** Ce qui change d'un type de bien à l'autre dans le formulaire. */
interface PropertyFormConfig {
  title: string;
  submitLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  /** Question sur le nombre de lots ; absente si le bien se loue d'un seul tenant. */
  countLabel?: string;
  /** Nom des lots : « Chambre » donne « Chambre 1 », « Chambre 2 »… */
  unitName: string;
  rentLabel: string;
}

export const PROPERTY_FORMS: Record<PropertyType, PropertyFormConfig> = {
  immeuble: {
    title: 'Ajouter un immeuble',
    submitLabel: "Ajouter l'immeuble",
    nameLabel: "Nom de l'immeuble",
    namePlaceholder: 'Résidence Teranga',
    countLabel: "Nombre d'appartements",
    unitName: 'Appart',
    rentLabel: 'Loyer par appartement (FCFA)',
  },
  maison_entiere: {
    title: 'Ajouter une maison entière',
    submitLabel: 'Ajouter la maison',
    nameLabel: 'Nom de la maison',
    namePlaceholder: 'Villa Sacré-Cœur',
    unitName: 'Maison',
    rentLabel: 'Loyer de la maison (FCFA)',
  },
  maison_chambres: {
    title: 'Ajouter une maison en chambres',
    submitLabel: 'Ajouter la maison',
    nameLabel: 'Nom de la maison',
    namePlaceholder: 'Maison Liberté 6',
    countLabel: 'Nombre de chambres',
    unitName: 'Chambre',
    rentLabel: 'Loyer par chambre (FCFA)',
  },
  local_commercial: {
    title: 'Ajouter un local commercial',
    submitLabel: 'Ajouter le local',
    nameLabel: 'Nom du local',
    namePlaceholder: 'Boutique Sandaga',
    countLabel: 'Nombre de locaux',
    unitName: 'Local',
    rentLabel: 'Loyer par local (FCFA)',
  },
};

/** Ce que l'utilisateur saisit, tel quel (tout en texte). */
export interface PropertyFormValues {
  name: string;
  address: string;
  count: string;
  rent: string;
}

export type PropertyFormErrors = Partial<Record<keyof PropertyFormValues, string>>;

/** Vérifie la saisie : soit les erreurs à afficher, soit le bien et ses lots à créer. */
export function parsePropertyForm(
  type: PropertyType,
  values: PropertyFormValues,
): { errors: PropertyFormErrors } | { property: Omit<Property, 'id'>; unitLabels: string[]; rent: number } {
  const { countLabel, unitName } = PROPERTY_FORMS[type];
  const errors: PropertyFormErrors = {};
  const clean = (text: string) => text.trim().replace(/\s+/g, ' ');

  const name = clean(values.name);
  if (!name) errors.name = 'Indiquez le nom du bien.';

  const address = clean(values.address);
  if (!address) errors.address = "Indiquez l'adresse du bien.";

  const count = countLabel ? Number(values.count) : 1;
  if (!Number.isInteger(count) || count < 1 || count > MAX_UNITS) errors.count = `Entre 1 et ${MAX_UNITS}.`;

  const rent = Number(values.rent.replace(/\s/g, ''));
  if (!Number.isInteger(rent) || rent <= 0) errors.rent = 'Indiquez le loyer en FCFA, sans centimes.';

  if (Object.keys(errors).length > 0) return { errors };
  const unitLabels = countLabel ? Array.from({ length: count }, (_, i) => `${unitName} ${i + 1}`) : [unitName];
  return { property: { name, address, type }, unitLabels, rent };
}
