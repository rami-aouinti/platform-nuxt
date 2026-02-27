# Modèle cible des stores CRM

Ce document décrit la convention standard pour tous les stores CRM (`companies`, `projects`, `tasks`, `taskRequests`, `sprints`).

## 1) Naming & découpage

- **Composable API dédié par entité**: `app/composables/api/use<EntityPlural>Api.ts`
  - Exemples: `useCompaniesApi`, `useProjectsApi`, `useTasksApi`.
- **Store Pinia dédié par entité**: `app/stores/<entity>.ts`
  - Le store ne parle qu’au composable API de son entité.
- **Pattern partagé**: `app/stores/_entity.ts`
  - Helpers pour query paginée, merge d’une row, snapshot/rollback optimiste.

## 2) Structure d’état standard

Chaque store CRM expose la même structure de base:

- `rows`: liste courante des entités.
- `item`: entité courante (détail), ou `null`.
- `loading`: booléen global des opérations de lecture/écriture.
- `error`: dernier message d’erreur UI.
- `pagination`: `{ page, perPage, total }`.
- `sort`: `{ field, direction } | null`.
- `search`: chaîne de recherche.

## 3) Actions standard

Chaque store CRM doit fournir:

- `fetchRows(options?)`
- `fetchItem(id)`
- `create(payload)`
- `update(id, payload)`
- `patch(id, payload)`
- `remove(id)`
- `setPage(page)`
- `setPerPage(perPage)`
- `setSort(field, direction)`
- `setSearch(value)`

Actions métier additionnelles (ex: workflow tasks) restent autorisées, mais doivent réutiliser le pattern partagé (snapshot/rollback, merge, erreurs).

## 4) Conventions de flux de données

Flux attendu: **UI -> Store -> API -> Store -> UI**

1. **UI** déclenche une action de store.
2. **Store**:
   - initialise `loading`/`error`.
   - applique un update optimiste si nécessaire.
   - appelle le composable API.
3. **API composable** fait la requête HTTP et normalise la réponse si besoin.
4. **Store** merge la donnée serveur (`mergeEntityRow`) puis synchronise la liste (`refreshRowsSafe`).
5. En erreur, **Store** rollback via snapshot (`restoreEntitySnapshot`) et notifie (`Notify.error`).

## 5) Pagination / merge / rollback

Le fichier `app/stores/_entity.ts` centralise:

- `createEntityQuery(...)`: construit la query paginée standard.
- `mergeEntityRow(...)`: remplace/insère une row et synchronise `item`.
- `createEntitySnapshot(...)` + `restoreEntitySnapshot(...)`: rollback pour opérations optimistes.
- `toUiErrorMessage(...)`: normalisation des erreurs orientée UI.

## 6) Règles d’évolution

- Toute nouvelle entité CRM doit commencer par son composable API dans `app/composables/api/`.
- Tout nouveau store CRM doit reprendre **exactement** la structure d’état et d’actions standard.
- Les exceptions de format backend (ex: `Sprint[]` vs payload paginé) doivent être absorbées côté API/store, sans casser le contrat de store.
