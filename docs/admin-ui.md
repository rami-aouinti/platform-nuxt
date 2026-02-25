# Admin UI base

Cette base unifie le rendu des pages d'administration avec des composants réutilisables et des tokens globaux.

## Composants (`app/components/admin/ui/`)

- `AdminCard` : conteneur principal (header / contenu / actions) pour pages et sections admin.
- `AdminToolbar` : titre + description + zone d'actions (filtres, CTA, badges).
- `AdminBadge` : badge de statut (`success`, `warning`, `error`, `info`, `neutral`).
- `AdminEmptyState` : état vide standardisé (icône, titre, message, actions).
- `AdminErrorState` : état erreur avec bouton de relance optionnel (`@retry`).

## Tokens et conventions globales

Les tokens sont dans `app/assets/styles/global.css` :

- spacing : `--admin-space-1` à `--admin-space-6`
- radius : `--admin-radius-sm/md/lg`
- statuts : `--admin-color-success/warning/error/info`
- typo formulaire :
  - `--admin-text-size-form-label`
  - `--admin-text-size-form-input`
- typo tableau :
  - `--admin-text-size-table-head`
  - `--admin-text-size-table-body`

### Utilitaires de mise en forme

- `.admin-form` : harmonise labels et champs (`v-label`, `v-field`).
- `.admin-table` : normalise les tailles et la hiérarchie du tableau (`v-data-table`).
- `.admin-heading` : convention de titres admin.

## Thèmes light/dark

Les couleurs de statut sont adaptées automatiquement en mode dark (`html.dark`, `.v-theme--dark`).
Aucun changement d'API composant n'est nécessaire entre les thèmes.

## Standards qualité obligatoires (toutes les pages admin)

Chaque nouvelle page/sous-page admin doit respecter ces standards avant merge.

### 1) Densité tableau

- Utiliser `.admin-table` pour garantir une densité homogène entre modules.
- Éviter les cellules multi-lignes par défaut : tronquer + tooltip si besoin.
- Garder des actions de ligne compactes (icône + libellé court si nécessaire).

### 2) Lisibilité mobile

- Vérifier les breakpoints mobile/tablette/desktop (pas de débordement horizontal non géré).
- Prioriser l'information utile : colonnes secondaires masquées ou condensées sur petit écran.
- Conserver des zones cliquables accessibles (taille et espacement suffisants).

### 3) Contraste

- Respecter un contraste lisible pour texte principal, secondaire et badges.
- Vérifier les contrastes en light **et** dark mode.
- Ne jamais s'appuyer uniquement sur la couleur pour transmettre un état (ajouter texte/icône).

### 4) Focus clavier

- Tous les contrôles interactifs doivent être atteignables via `Tab`.
- Le focus visible doit rester apparent sur boutons, liens, champs et actions de tableau.
- Les modales/menus doivent conserver une navigation clavier cohérente (ouverture, fermeture, retour focus).

## Règles de cohérence UI

### Position des actions

- Actions globales de page : en haut à droite de `AdminToolbar`.
- Actions secondaires contextuelles : dans la carte/section concernée.
- Actions destructrices : isolées visuellement et confirmées via dialogue.

### Format des dates

- Format par défaut : `JJ/MM/AAAA`.
- Si l'heure est utile : `JJ/MM/AAAA HH:mm` (timezone cohérente avec le produit).
- Utiliser le même format dans tableaux, détails et exports visuels.

### Badges rôles/statuts

- Tous les rôles/statuts doivent passer par `AdminBadge`.
- Associer un variant stable par type (ex: `success`, `warning`, `error`, `info`, `neutral`).
- Uniformiser libellés et casse (`Actif`, `Suspendu`, etc.) sur toutes les pages.

## States obligatoires par page admin

Chaque page doit implémenter explicitement ces 4 états :

1. `loading` : squelette/spinner + structure de page conservée.
2. `empty` : utiliser `AdminEmptyState` avec message actionnable.
3. `error` : utiliser `AdminErrorState` avec retry si pertinent.
4. `forbidden` : afficher une vue d'accès refusé claire (code 403 + action de retour).

## Checklist QA visuelle rapide (à exécuter à chaque sous-page)

Copier-coller cette checklist dans la description de PR ou dans la review :

- [ ] **Structure**: toolbar, titre, description et actions respectent la hiérarchie admin.
- [ ] **Tableau**: densité cohérente, alignements propres, pas de texte cassé.
- [ ] **Responsive**: rendu validé mobile/tablette/desktop.
- [ ] **Accessibilité**: contraste OK et parcours clavier complet avec focus visible.
- [ ] **Cohérence actions**: position des CTA conforme (global vs contextuel).
- [ ] **Dates**: format homogène (`JJ/MM/AAAA` ou `JJ/MM/AAAA HH:mm`).
- [ ] **Badges**: statuts/rôles via `AdminBadge` et variants cohérents.
- [ ] **States**: `loading`, `empty`, `error`, `forbidden` couverts et testés.

## Utilisation en revue PR (admin)

- Ajouter une section **"QA visuelle admin"** dans chaque PR touchant `app/pages/administration/**`.
- Exiger la checklist complète avant approbation (ou exceptions documentées).
- Si un item est non-applicable, préciser explicitement pourquoi dans la PR.
