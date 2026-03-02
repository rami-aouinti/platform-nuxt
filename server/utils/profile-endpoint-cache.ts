import type { H3Event } from 'h3'

import {
  buildProfileCacheKey,
  getProfileCache,
  setProfileCache,
} from './cache/profile-cache'

const PROFILE_CACHE_TTL_MS = 30_000

function getCacheTtlMs(event: H3Event): number {
  const ttl = Number(useRuntimeConfig(event).profileEndpointCacheTtlMs)

  if (!Number.isFinite(ttl) || ttl <= 0) {
    return PROFILE_CACHE_TTL_MS
  }

  return ttl
}

export async function readProfileEndpointCache(
  event: H3Event,
  key: string,
): Promise<unknown | null> {
  const cacheKey = buildProfileCacheKey(event, key)
  return getProfileCache(event, cacheKey)
}

export async function writeProfileEndpointCache(
  event: H3Event,
  key: string,
  payload: unknown,
): Promise<void> {
  const ttlMs = getCacheTtlMs(event)
  const cacheKey = buildProfileCacheKey(event, key)

  await setProfileCache(event, cacheKey, payload, ttlMs)
}
