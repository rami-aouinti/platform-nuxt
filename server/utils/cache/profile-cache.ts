import type { H3Event } from 'h3'
import { createHash } from 'node:crypto'
import Redis from 'ioredis'
import { resolveAuthorizationHeader } from '../authorization'

type ProfileCacheValue = {
  payload: unknown
}

type RedisConnectionOptions = {
  url?: string
  host?: string
  port?: number
  password?: string
}

type CacheScope = {
  userId?: string | null
  companyId?: string | null
  roleId?: string | null
  groupId?: string | null
  authHash?: string | null
}

type ProfileCacheNamespace = 'profile' | 'auth' | 'admin'

type ProfileCacheRuntimeStatus = {
  enabled: boolean
  mode: 'url' | 'host-port' | 'disabled'
  ttlMs: number
  fallbackBehavior: 'no-cache'
  reason?: string
}

const KEY_SCHEMA_VERSION = 'v1'

let redisClient: Redis | null = null
let redisUnavailable = false

const cacheMetrics = {
  hit: 0,
  miss: 0,
  error: 0,
}

function normalizeScopeValue(value: string | null | undefined): string {
  if (!value || typeof value !== 'string') {
    return 'unknown'
  }

  return value.trim() || 'unknown'
}

function getCacheScope(event: H3Event): CacheScope {
  const authorization = resolveAuthorizationHeader(event) ?? 'anonymous'
  const authHash = createHash('sha256').update(authorization).digest('hex')

  return {
    userId: getHeader(event, 'x-user-id') ?? null,
    companyId: getHeader(event, 'x-company-id') ?? null,
    roleId: getHeader(event, 'x-role-id') ?? null,
    groupId: getHeader(event, 'x-group-id') ?? null,
    authHash,
  }
}

function logCacheMetric(type: keyof typeof cacheMetrics, details: string) {
  cacheMetrics[type] += 1
  const prefix = '[profile-cache]'

  if (type === 'error') {
    console.error(`${prefix} metric=${type} count=${cacheMetrics[type]} ${details}`)
    return
  }

  console.info(`${prefix} metric=${type} count=${cacheMetrics[type]} ${details}`)
}

export function resolveProfileCacheRuntimeStatus(config: {
  profileEndpointCacheTtlMs?: number | string
  redisUrl?: string
  redisHost?: string
}): ProfileCacheRuntimeStatus {
  const ttlMs = Number(config.profileEndpointCacheTtlMs)
  const hasValidTtl = Number.isFinite(ttlMs) && ttlMs > 0
  const hasRedisUrl = Boolean(config.redisUrl?.trim())
  const hasRedisHost = Boolean(config.redisHost?.trim())

  if (!hasValidTtl) {
    return {
      enabled: false,
      mode: 'disabled',
      ttlMs,
      fallbackBehavior: 'no-cache',
      reason: 'ttl_non_positive_or_invalid',
    }
  }

  if (hasRedisUrl) {
    return { enabled: true, mode: 'url', ttlMs, fallbackBehavior: 'no-cache' }
  }

  if (hasRedisHost) {
    return { enabled: true, mode: 'host-port', ttlMs, fallbackBehavior: 'no-cache' }
  }

  return {
    enabled: false,
    mode: 'disabled',
    ttlMs,
    fallbackBehavior: 'no-cache',
    reason: 'missing_redis_connection',
  }
}

function resolveRedisOptions(event: H3Event): RedisConnectionOptions {
  const config = useRuntimeConfig(event)

  return {
    url: config.redisUrl,
    host: config.redisHost || undefined,
    port: config.redisPort ? Number(config.redisPort) : undefined,
    password: config.redisPassword || undefined,
  }
}

function getRedisClient(event: H3Event): Redis | null {
  if (redisUnavailable) {
    return null
  }

  if (redisClient) {
    return redisClient
  }

  const { url, host, port, password } = resolveRedisOptions(event)
  const resolvedPort =
    Number.isFinite(port ?? NaN) && (port ?? 0) > 0 ? (port as number) : 6379

  if (!url && !host) {
    redisUnavailable = true
    return null
  }

  try {
    redisClient = url
      ? new Redis(url)
      : new Redis({
          host,
          port: resolvedPort,
          password: password || undefined,
        })

    redisClient.on('error', (error) => {
      logCacheMetric('error', `redis client error=${String(error)}`)
    })

    return redisClient
  } catch (error) {
    logCacheMetric('error', `redis client init failed=${String(error)}`)
    redisUnavailable = true
    return null
  }
}

export function buildScopedCacheKey(
  event: H3Event,
  namespace: ProfileCacheNamespace,
  key: string,
): string {
  const scope = getCacheScope(event)

  return [
    namespace,
    KEY_SCHEMA_VERSION,
    `auth:${normalizeScopeValue(scope.authHash)}`,
    `user:${normalizeScopeValue(scope.userId)}`,
    `company:${normalizeScopeValue(scope.companyId)}`,
    `role:${normalizeScopeValue(scope.roleId)}`,
    `group:${normalizeScopeValue(scope.groupId)}`,
    `resource:${normalizeScopeValue(key)}`,
  ].join(':')
}

export function buildProfileCacheKey(event: H3Event, key: string): string {
  return buildScopedCacheKey(event, 'profile', key)
}

export async function getProfileCache(
  event: H3Event,
  key: string,
): Promise<unknown | null> {
  const client = getRedisClient(event)

  if (!client) {
    return null
  }

  try {
    const value = await client.get(key)

    if (!value) {
      logCacheMetric('miss', `key=${key}`)
      return null
    }

    const parsed = JSON.parse(value) as ProfileCacheValue

    if (!parsed || typeof parsed !== 'object' || !('payload' in parsed)) {
      logCacheMetric('miss', `key=${key} reason=invalid_payload`)
      return null
    }

    logCacheMetric('hit', `key=${key}`)
    return parsed.payload
  } catch (error) {
    logCacheMetric('error', `op=get key=${key} error=${String(error)}`)
    return null
  }
}

export async function setProfileCache(
  event: H3Event,
  key: string,
  payload: unknown,
  ttlMs: number,
): Promise<void> {
  const client = getRedisClient(event)

  if (!client) {
    return
  }

  try {
    const serialized = JSON.stringify({ payload } satisfies ProfileCacheValue)
    await client.set(key, serialized, 'PX', Math.max(1, ttlMs))
  } catch (error) {
    logCacheMetric('error', `op=set key=${key} error=${String(error)}`)
  }
}

export async function delProfileCache(
  event: H3Event,
  key: string,
): Promise<void> {
  const client = getRedisClient(event)

  if (!client) {
    return
  }

  try {
    await client.del(key)
  } catch (error) {
    logCacheMetric('error', `op=del key=${key} error=${String(error)}`)
  }
}

async function deleteByPattern(client: Redis, pattern: string): Promise<number> {
  const matches: string[] = []
  let cursor = '0'

  do {
    const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 200)
    cursor = nextCursor
    matches.push(...keys)
  } while (cursor !== '0')

  if (matches.length === 0) {
    return 0
  }

  return await client.del(...matches)
}

export async function invalidateProfileCacheScopes(
  event: H3Event,
  scopes: { userId?: string, roleId?: string, groupId?: string },
): Promise<void> {
  const client = getRedisClient(event)

  if (!client) {
    return
  }

  const patterns = [
    scopes.userId ? `profile:${KEY_SCHEMA_VERSION}:*:user:${normalizeScopeValue(scopes.userId)}:*` : null,
    scopes.roleId ? `profile:${KEY_SCHEMA_VERSION}:*:role:${normalizeScopeValue(scopes.roleId)}:*` : null,
    scopes.groupId ? `profile:${KEY_SCHEMA_VERSION}:*:group:${normalizeScopeValue(scopes.groupId)}:*` : null,
  ].filter((p): p is string => Boolean(p))

  try {
    for (const pattern of patterns) {
      const deleted = await deleteByPattern(client, pattern)
      console.info(`[profile-cache] invalidation pattern=${pattern} deleted=${deleted}`)
    }
  } catch (error) {
    logCacheMetric('error', `op=invalidate error=${String(error)}`)
  }
}

export async function invalidateProfileCacheResources(
  event: H3Event,
  options: {
    resources: string[]
    scopes?: {
      userId?: string
      roleId?: string
      groupId?: string
    }
  },
): Promise<void> {
  const client = getRedisClient(event)

  if (!client) {
    return
  }

  const resources = [...new Set(options.resources.map(resource => resource.trim()).filter(Boolean))]

  if (resources.length === 0) {
    return
  }

  const userScope = options.scopes?.userId
    ? `user:${normalizeScopeValue(options.scopes.userId)}`
    : 'user:*'
  const roleScope = options.scopes?.roleId
    ? `role:${normalizeScopeValue(options.scopes.roleId)}`
    : 'role:*'
  const groupScope = options.scopes?.groupId
    ? `group:${normalizeScopeValue(options.scopes.groupId)}`
    : 'group:*'

  const patterns = resources.map(resource =>
    `profile:${KEY_SCHEMA_VERSION}:*:${userScope}:*:${roleScope}:${groupScope}:resource:${resource}*`,
  )

  try {
    for (const pattern of patterns) {
      const deleted = await deleteByPattern(client, pattern)
      console.info(`[profile-cache] invalidation pattern=${pattern} deleted=${deleted}`)
    }
  } catch (error) {
    logCacheMetric('error', `op=invalidate_resources error=${String(error)}`)
  }
}
