# Mapping temporaire des endpoints legacy vers nouvelle spec

Ce tableau sert de référence pendant la migration des écrans legacy.

| Domaine          | Endpoint legacy (`/api/v1/...`)         | Nouvel endpoint                      |
| ---------------- | --------------------------------------- | ------------------------------------ |
| Job offers       | `/api/v1/job-offers`                    | `/api/job-offers`                    |
| Job offers       | `/api/v1/job-offers/:id`                | `/api/job-offers/:id`                |
| Job offers       | `/api/v1/job-offers/available`          | `/api/job-offers/available`          |
| Job offers       | `/api/v1/job-offers/my`                 | `/api/job-offers/my`                 |
| Job offers       | `/api/v1/job-offers/:id/apply`          | `/api/job-offers/:id/apply`          |
| Job applications | `/api/v1/job-applications`              | `/api/job-applications`              |
| Job applications | `/api/v1/job-applications/:id`          | `/api/job-applications/:id`          |
| Job applications | `/api/v1/job-applications/:id/accept`   | `/api/job-applications/:id/accept`   |
| Job applications | `/api/v1/job-applications/:id/reject`   | `/api/job-applications/:id/reject`   |
| Job applications | `/api/v1/job-applications/:id/withdraw` | `/api/job-applications/:id/withdraw` |
| Companies        | `/api/v1/companies`                     | `/api/companies`                     |
| Companies        | `/api/v1/companies/:id`                 | `/api/companies/:id`                 |
| Companies        | `/api/v1/companies/:id/members`         | `/api/companies/:id/members`         |
| Notifications    | `/api/v1/notifications`                 | `/api/notifications`                 |
| Notifications    | `/api/v1/notifications/:id`             | `/api/notifications/:id`             |
| Notifications    | `/api/v1/notifications/:id/read`        | `/api/notifications/:id/read`        |
| Notifications    | `/api/v1/notifications/read-all`        | `/api/notifications/read-all`        |
| Notifications    | `/api/v1/notifications/unread-count`    | `/api/notifications/unread-count`    |

## Configuration du préfixe upstream pour les catch-all versionnés

Les routes serveur `server/api/v1/[...path].ts` et `server/api/v2/[...path].ts` utilisent désormais une configuration runtime pour construire le préfixe upstream au lieu d'un hardcode.

Configuration par défaut dans `nuxt.config.ts` :

```ts
runtimeConfig: {
  apiVersionProxy: {
    v1: '/api/v1',
    v2: '/api/v2',
  },
}
```

Exemple de migration backend où le préfixe v1 change :

```ts
runtimeConfig: {
  apiVersionProxy: {
    v1: '/api/api/v1',
    v2: '/api/v2',
  },
}
```

Cette stratégie évite les régressions lors d'un changement de convention de routage upstream (ex. `/api/v1/...` vers `/api/api/v1/...`) sans modifier les handlers catch-all.
