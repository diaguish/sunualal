import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { A4, receiptFileName, receiptHtml } from './receipt-pdf';
import type { ReceiptView } from './receipts';

/**
 * Génère la quittance en PDF et ouvre le menu de partage (WhatsApp, Fichiers, e-mail…).
 * Dans un navigateur, où l'on ne peut pas partager un fichier, ouvre la fenêtre d'impression
 * (« Enregistrer en PDF »).
 */
export async function shareReceiptPdf(view: ReceiptView, appName: string): Promise<void> {
  const html = receiptHtml(view, appName);
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }

  const { uri } = await Print.printToFileAsync({ html, ...A4 });
  // expo-print donne un nom au hasard ; le locataire doit recevoir « Quittance-Q-2026-10-0003.pdf ».
  const named = new File(Paths.cache, receiptFileName(view));
  if (named.exists) named.delete();
  await new File(uri).move(named);

  await Sharing.shareAsync(named.uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: `Quittance ${view.receipt.number}`,
  });
}
