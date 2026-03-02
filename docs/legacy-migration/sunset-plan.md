# Plan de suppression finale de `app/pages/legacy/**`

## Déclencheur

La suppression finale démarre lorsque le KPI CI `legacy-pages-remaining` atteint **0**.

## Étapes

1. Vérifier que `app/pages/legacy/**/*.vue` ne contient plus de pages.
2. Vérifier que `app/utils/legacy-migration/validatedRedirects.ts` est vide (plus de redirections nécessaires).
3. Supprimer le dossier `app/pages/legacy`.
4. Supprimer le middleware `server/middleware/legacy-redirect.ts`.
5. Supprimer les scripts KPI/check migration dédiés au legacy.
6. Mettre à jour la documentation migration (`docs/legacy-migration/*`) avec un statut "terminé".

## Critères de sortie

- KPI CI à 0 sur la branche principale.
- Aucun lien interne vers `/legacy/**`.
- Aucun test e2e/nuxt n'utilise encore des routes legacy.

## Avancement des suppressions

- Lot 2026-03-02: 7 pages legacy supprimées après migration + validation UX + redirection (`Dashboard`, `Pages`, `Ecommerce`, `Applications`, `Tables`, `Layout`, `Components`).
