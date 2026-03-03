# Profile cache invalidation matrix (mutations)

Cette matrice décrit les invalidations à exécuter après succès upstream pour les mutations profile/admin liées aux utilisateurs, rôles et groupes.

## Ressources transverses invalidées

Chaque mutation ci-dessous invalide :

- les scopes ciblés existants (`userId`, `roleId`, `groupId`) ;
- les ressources transverses suivantes :
  - `profile`, `me-profile`, `v1-profile`, `v1-me-profile`
  - `profile-groups`, `me-profile-groups`, `v1-profile-groups`, `v1-me-profile-groups`
  - `profile-roles`, `me-profile-roles`, `v1-profile-roles`, `v1-me-profile-roles`
  - `profile-companies`
  - `profile-friends`, `profile-friends-requests-received`, `profile-friends-requests-sent`
  - `profile-applications`, `profile-application`

## Matrice mutation → scopes invalidés

| Mutation handler | Scope ciblé |
| --- | --- |
| `POST /api/user` | `userId` (via header `x-user-id`) |
| `PUT/PATCH/DELETE /api/user/:id` | `userId` (`:id`) |
| `POST /api/role` | `roleId` (via header `x-role-id`) |
| `PATCH/DELETE /api/role/:role` | `roleId` (`:role`) |
| `POST /api/user_group` | `groupId` (via header `x-group-id`) |
| `PUT/PATCH/DELETE /api/user_group/:id` | `groupId` (`:id`) |
