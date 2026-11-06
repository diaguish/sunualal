import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

/**
 * Recharge les données à chaque retour sur l'écran.
 * Les onglets restent montés : sans ça, un locataire ajouté n'apparaîtrait pas sur Accueil et Immeubles.
 */
export function useReloadOnFocus(reload: () => void) {
  useFocusEffect(
    // `reload` est recréé à chaque rendu : on garde le premier, sinon l'effet tournerait en boucle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useCallback(() => reload(), []),
  );
}
