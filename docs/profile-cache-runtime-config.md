# Profile cache runtime config

Cette note rend explicite l’activation du cache profile (Redis) selon les environnements `dev` / `staging` / `prod`.

## Variables runtime (Nuxt)

Les clés lues par `runtimeConfig` sont :

- `NUXT_PROFILE_ENDPOINT_CACHE_TTL_MS` → `runtimeConfig.profileEndpointCacheTtlMs`
- `NUXT_REDIS_URL` → `runtimeConfig.redisUrl`
- `NUXT_REDIS_HOST` → `runtimeConfig.redisHost`
- `NUXT_REDIS_PORT` → `runtimeConfig.redisPort`
- `NUXT_REDIS_PASSWORD` → `runtimeConfig.redisPassword`

## Mode de connexion Redis

Deux modes sont supportés.

### 1) Mode URL

Configurer `NUXT_REDIS_URL` (ex: `redis://user:pass@host:6379/0`).

- Prioritaire si `NUXT_REDIS_URL` est présent.
- `NUXT_REDIS_HOST/PORT/PASSWORD` peuvent rester vides.

### 2) Mode host/port

Configurer au minimum `NUXT_REDIS_HOST`, avec éventuellement `NUXT_REDIS_PORT` (défaut 6379) et `NUXT_REDIS_PASSWORD`.

- Utilisé si `NUXT_REDIS_URL` est absent.

## TTL recommandé

- Valeur de base: `30000` ms (30s).
- Recommandation:
  - `dev`: 5s à 30s (itérations rapides)
  - `staging`: 15s à 60s
  - `prod`: 30s à 120s selon charge/volumétrie

Le cache est considéré **désactivé** si `NUXT_PROFILE_ENDPOINT_CACHE_TTL_MS` est invalide, manquant ou `<= 0`.

## Fallback quand Redis est indisponible

Si Redis n’est pas joignable/configuré:

- les lectures cache retournent `null` (passage upstream direct),
- les écritures/invalidations sont ignorées,
- l’application continue de fonctionner sans blocage (mode `no-cache`).

## Log startup

Au démarrage serveur, un log explicite est émis:

- activé: `[profile-cache] startup status=enabled ...`
- désactivé: `[profile-cache] startup status=disabled ...`

Ce log indique le mode (`url` / `host-port`), le TTL, et le fallback (`no-cache`).
