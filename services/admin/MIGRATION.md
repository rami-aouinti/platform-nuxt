# Migration admin services: chemins legacy → arborescence officielle

## Arborescence officielle

Tous les imports doivent pointer vers:

- `services/admin/<resource>/index.ts`
- `services/admin/shared/index.ts`

## Aliases legacy à supprimer

Ces aliases sont **dépréciés et à supprimer**.

- `services/admin/_shared` → remplacer par `services/admin/shared/index`
- `services/admin/pagination` → remplacer par `services/admin/pagination/index`
- `services/admin/apiKeys.shared` → remplacer par `services/admin/api-keys/shared`
- `services/admin/apiKeys.v1` → remplacer par `services/admin/api-keys/v1`
- `services/admin/apiKeys.v2` → remplacer par `services/admin/api-keys/v2`
- `services/admin/userGroups` → remplacer par `services/admin/user-groups/index`
- `services/admin/candidates` → remplacer par `services/admin/candidates/index`
- `services/admin/companies` → remplacer par `services/admin/companies/index`
- `services/admin/job-applications` → remplacer par `services/admin/job-applications/index`
- `services/admin/job-offers` → remplacer par `services/admin/job-offers/index`
- `services/admin/notifications` → remplacer par `services/admin/notifications/index`
- `services/admin/roles` → remplacer par `services/admin/roles/index`
- `services/admin/users` → remplacer par `services/admin/users/index`

## Échéance

- Date cible de suppression définitive des aliases legacy: **2026-06-30**.

## Statut des wrappers legacy

- `services/admin/_shared.ts`: supprimé.
- `services/admin/apiKeys.*`: supprimés.
