import { TextStyle } from 'react-native';

export { colors } from './colors';
export type { ColorName } from './colors';

/** Échelle d'espacement (multiples de 4). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Styles de texte réutilisés dans toute l'app. */
export const typography = {
  display: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5 },
  title: { fontSize: 26, fontWeight: '700' },
  heading: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  bodyStrong: { fontSize: 15, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '400' },
  overline: { fontSize: 11, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase' },
} as const satisfies Record<string, TextStyle>;
