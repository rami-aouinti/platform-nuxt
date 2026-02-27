import type { H3Event } from 'h3'

const PROFILE_CACHE_TTL_MS = 30_000

type CacheEntry = {
  expiresAt: number
  payload: unknown
}

const endpointCache = new Map<string, CacheEntry>()

function getCacheTtlMs(event: H3Event): number {
  const ttl = Number(useRuntimeConfig(event).profileEndpointCacheTtlMs)

  if (!Number.isFinite(ttl) || ttl <= 0) {
    return PROFILE_CACHE_TTL_MS
  }

  return ttl
}

function buildCacheKey(event: H3Event, key: string) {
  const authorization = getHeader(event, 'authorization') ?? ''
  return `${authorization}::${key}`
}

export function readProfileEndpointCache(event: H3Event, key: string): unknown | null {
  const cacheKey = buildCacheKey(event, key)
  const cached = endpointCache.get(cacheKey)

  if (!cached) {
    return null
  }

  if (cached.expiresAt < Date.now()) {
    endpointCache.delete(cacheKey)
    return null
  }

  return cached.payload
}

export function writeProfileEndpointCache(event: H3Event, key: string, payload: unknown) {
  const ttlMs = getCacheTtlMs(event)
  const cacheKey = buildCacheKey(event, key)

  endpointCache.set(cacheKey, {
    expiresAt: Date.now() + ttlMs,
    payload,
  })
}
