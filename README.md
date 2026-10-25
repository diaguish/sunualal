# Keur Clair — gestion locative

> **« Keur Clair » est un nom provisoire**, le nom définitif n'est pas encore choisi.
> Pour renommer : changer `expo.name` dans `app.json` (c'est ce qui s'affiche dans l'app et sous l'icône).
> Les identifiants techniques (`slug`, `scheme`, `bundleIdentifier`, `package`) se changent aussi dans `app.json`,
> au plus tard avant la première publication sur les stores.

Application mobile (iPhone + Android) de gestion locative pensée pour le Sénégal :
loyers en FCFA, Wave / Orange Money, immeubles, maisons en chambres, relances et quittances.

- **Maquette** : [Figma — Keur Clair, maquette mobile](https://www.figma.com/design/Sabc3X4Tyoo6HS6p7Fu8gV/Keur-Clair-%E2%80%93-Maquette-mobile)
- **Stack** : [Expo](https://docs.expo.dev) SDK 58 · React Native · TypeScript · Expo Router

---

## 1. Démarrer

Prérequis : Node.js 20+ et l'app **Expo Go** sur votre téléphone (App Store / Play Store).

```bash
git clone https://github.com/diaguish/sunualal.git
cd sunualal
npm install
npm start
```

Scannez le QR code affiché :
- **iPhone** : avec l'appareil photo ;
- **Android** : depuis l'app Expo Go.

L'app se recharge à chaque sauvegarde. Autres options : `npm run web` (navigateur), `npm run ios` (simulateur, Mac uniquement), `npm run android` (émulateur).

### Avant chaque commit

```bash
npm run typecheck   # erreurs TypeScript
npm run lint        # règles de code
```

Les deux doivent passer sans erreur.

---

## 2. Organisation du code

```
src/
├── app/                  ← ÉCRANS (chaque fichier = une route Expo Router)
│   ├── _layout.tsx         navigation racine (onglets + modales)
│   ├── (tabs)/             les 4 onglets du bas
│   │   ├── index.tsx         Accueil
│   │   ├── immeubles.tsx     Immeubles
│   │   ├── locataires.tsx    Locataires
│   │   ├── argent/           Argent + sous-onglets (paiements, reliquats, quittances, mobile-money)
│   │   └── espace/           Mon espace (relances, automatisations, travaux, documents, paramètres)
│   ├── ajouter-bien/       modale « Ajouter un bien » (type → formulaire)
│   ├── paiement/           modale « Encaisser » (saisie → paiement enregistré)
│   └── notifications.tsx   modale Notifications
│
├── features/             ← composants propres à une partie de l'app
│   ├── patrimoine/         (Personne A)
│   └── argent/             (Personne B)
│
├── components/ui/        ← composants partagés : Card, Button, StatusBadge, StatCard, AppHeader…
├── theme/                ← couleurs, espacements, typographie (relevés sur la maquette)
├── types/models.ts       ← modèle de données : Property, Unit, Tenant, Lease, Payment…
├── domain/rent.ts        ← règles métier : statut d'un loyer, reliquat, jours de retard
├── data/
│   ├── api.ts              SEUL point d'accès aux données pour les écrans
│   └── mock.ts             données fictives tirées de la maquette
├── hooks/use-data.ts     ← charger une donnée de l'API dans un écran
└── utils/format.ts       ← formatFCFA, formatDate, initials…
```

### Les règles qui gardent la base stable

1. **Les écrans ne lisent jamais `mock.ts` directement** : toujours `import * as api from '@/data/api'`.
   Le jour où on branche un vrai serveur, seul `api.ts` change.
2. **Pas de couleur ni de taille en dur** : utiliser `colors`, `spacing`, `radius`, `typography` de `@/theme`.
3. **Montants = entiers en FCFA**, affichés avec `formatAmount` / `formatFCFA` (`3 290 000 FCFA`).
4. **Dates = chaînes ISO** `"2026-10-14"`, périodes de loyer = `"2026-10"`.
5. **Imports avec l'alias `@/`** (`@/components/ui`, `@/theme`), jamais de `../../..`.
6. **La logique métier va dans `src/domain/`**, pas dans les écrans (ex. « ce loyer est-il en retard ? »).

L'écran **Accueil** (`src/app/(tabs)/index.tsx`) sert d'exemple : il combine API, règles métier et composants partagés.
Les autres écrans affichent pour l'instant une carte « À implémenter » avec le nom du cadre Figma correspondant.

---

## 3. Répartition du travail

| | **Personne A — Patrimoine** | **Personne B — Argent** |
|---|---|---|
| Écrans | Accueil · Immeubles · Locataires · Ajouter un bien · Travaux et dépenses · Documents | Argent (Paiements, Reliquats, Quittances, Mobile Money) · Saisir un paiement · Paiement enregistré · Relances · Automatisations · Notifications |
| Dossiers | `src/app/(tabs)/index.tsx`, `immeubles.tsx`, `locataires.tsx`, `src/app/ajouter-bien/`, `espace/travaux.tsx`, `espace/documents.tsx`, `src/features/patrimoine/` | `src/app/(tabs)/argent/`, `src/app/paiement/`, `espace/relances.tsx`, `espace/automatisations/`, `notifications.tsx`, `src/features/argent/` |

**Zone commune** (à modifier seulement après en avoir parlé à deux, dans une PR dédiée) :
`src/theme/`, `src/components/ui/`, `src/types/`, `src/domain/`, `src/data/`, les fichiers `_layout.tsx`, `package.json`, `app.json`.

> Besoin d'un nouveau composant partagé ou d'un champ dans un type ? Ouvrez une petite PR rien que pour ça,
> faites-la relire, fusionnez-la, puis continuez votre écran. Ça évite les conflits.

`espace/parametres.tsx` est à prendre par la première personne disponible.

---

## 4. Travailler avec Git

- `main` doit **toujours** démarrer sans erreur. On ne pousse jamais directement dessus.
- Une branche par tâche : `feat/immeubles-grille-lots`, `feat/argent-reliquats`, `fix/format-montant`.
- Petites Pull Requests, relues par l'autre personne avant fusion.
- Avant de commencer la journée : `git checkout main && git pull`, puis `git checkout -b feat/...`.
- Ajouter une librairie : **`npx expo install <paquet>`** (pas `npm install`), pour avoir une version compatible avec Expo.

---

## 5. Publier sur l'App Store et le Play Store

Les builds se font dans le cloud avec **EAS** (pas besoin de Mac, mais le Mac reste utile pour le simulateur iPhone) :

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform all
```

Il faudra un compte **Apple Developer** (99 $/an) et un compte **Google Play Console** (25 $, une fois).
Les identifiants provisoires sont `sn.keurclair.app` (iOS et Android, dans `app.json`) — à remplacer selon le nom définitif avant la première publication, ils ne pourront plus changer ensuite.

---

## 6. Ce qui reste à décider ensemble

- **Backend** : Django (que vous connaissez) ou Supabase / Firebase. Seul `src/data/api.ts` sera concerné.
- **Connexion** : numéro de téléphone + code SMS ? e-mail ?
- **Envoi des relances** : WhatsApp, SMS ?
- **Paiements Wave / Orange Money** : saisie manuelle d'abord, intégration des API ensuite ?
