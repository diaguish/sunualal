/**
 * Palette Keur Clair, relevée sur la maquette Figma.
 * Ne jamais écrire une couleur en dur dans un écran : toujours passer par `colors`.
 */
export const colors = {
  // Marque
  primary: '#1B3D2C', // vert foncé : en-tête Accueil, boutons principaux, titres
  primarySoft: '#E3EDE6', // fond vert pâle (grille des lots, avatars)
  accent: '#D9BE86', // doré : bouton « Encaisser », onglet actif, barre de progression
  accentSoft: '#F4E9D2', // fond doré pâle (pastilles de date, avatars)

  // Surfaces
  background: '#EEECE3', // fond crème des écrans
  surface: '#FFFFFF', // cartes
  border: '#E2DED3',

  // Texte
  text: '#1B3D2C',
  textMuted: '#6E7570',
  textOnPrimary: '#FFFFFF',

  // Statuts de loyer
  paid: '#2E7D57',
  late: '#C0392B',
  lateSoft: '#FBE3E1',
  toVerify: '#D4A62A',
  toVerifySoft: '#FBF1D9',
  toPay: '#C9C9C4',
  free: '#9AA19C',

  badge: '#C0392B', // pastille rouge de notification
} as const;

export type ColorName = keyof typeof colors;
