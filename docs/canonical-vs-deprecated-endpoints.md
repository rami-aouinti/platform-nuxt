# Canonical vs Deprecated endpoint matrix

This matrix centralizes upstream endpoint policy used by Nuxt server proxies.

## Deprecation strategy

- Canonical endpoint is attempted first.
- Deprecated aliases are kept as fallback during the warning window.
- If an alias is used (canonical endpoint returned 404 and alias succeeded), the server logs a warning (`[api-deprecation]`).
- After the removal date, aliases should be removed from `server/utils/api-canonical-map.ts`.

## Current matrix

| Resource key | Canonical endpoint | Deprecated aliases (fallback order) | Warn until | Remove after |
| --- | --- | --- | --- | --- |
| `profile` | `/api/v1/me/profile` | `/api/v1/profile`, `/api/profile` | 2026-06-30 | 2026-07-01 |
| `profileRoles` | `/api/v1/me/profile/roles` | `/api/v1/profile/roles`, `/api/profile/roles` | 2026-06-30 | 2026-07-01 |
| `profileGroups` | `/api/v1/me/profile/groups` | `/api/v1/profile/groups`, `/api/profile/groups` | 2026-06-30 | 2026-07-01 |

## Source of truth

- Runtime registry: `server/utils/api-canonical-map.ts`
- Resolver and deprecation logs: `server/utils/canonical-endpoint-resolver.ts`
