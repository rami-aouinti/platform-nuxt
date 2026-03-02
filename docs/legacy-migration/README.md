# Legacy migration components

Namespace cible: `app/components/legacy-migration/`.

Objectif: extraire les briques récurrentes du dossier `app/pages/legacy` (tables, métriques/charts, wrappers de layout, formulaires, notifications/timeline) pour migrer page par page avec moins de markup inline.


## Gouvernance migration

- Checklist de parité: `docs/legacy-migration/parity-checklist.md`
- Plan de suppression finale: `docs/legacy-migration/sunset-plan.md`
- Manifest des redirections validées: `app/utils/legacy-migration/validatedRedirects.ts`
- KPI CI pages restantes: `pnpm run legacy:pages:kpi`


## Journal des lots

- 2026-03-02: clôture des lots courts `LOT-DASH-01`, `LOT-PAGES-01`, `LOT-ECOM-01`, `LOT-APPS-01`, `LOT-TABLES-01`, `LOT-LAYOUT-01`, `LOT-COMP-01` avec création des routes cibles Nuxt 4, activation des redirections validées et suppression des pages legacy correspondantes.
