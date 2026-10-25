import Constants from 'expo-constants';

/**
 * Nom de l'app affiché à l'écran, lu depuis `app.json` (`expo.name`).
 * Nom provisoire : pour renommer l'app, modifier uniquement `app.json`.
 */
export const APP_NAME = Constants.expoConfig?.name ?? 'Keur Clair';
