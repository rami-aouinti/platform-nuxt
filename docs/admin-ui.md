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
