import type { H3Event } from 'h3'

import {
  buildProfileCacheKey,
  getProfileCache,
  invalidateProfileCacheScopes,
  setProfileCache,
} from './cache/profile-cache'

const PROFILE_CACHE_TTL_MS = 30_000

function normalizeQuerySuffix(querySuffix?: string): string {
  if (!querySuffix) {
    return ''
  }

  const rawQuery = querySuffix.startsWith('?') ? querySuffix.slice(1) : querySuffix

  if (!rawQuery) {
    return ''
  }

  const sortedEntries = [...new URLSearchParams(rawQuery).entries()].sort(
    ([leftKey, leftValue], [rightKey, rightValue]) => {
      if (leftKey === rightKey) {
        return leftValue.localeCompare(rightValue)
      }

      return leftKey.localeCompare(rightKey)
    },
  )

  if (sortedEntries.length === 0) {
    return ''
  }

  const normalized = new URLSearchParams()

  for (const [key, value] of sortedEntries) {
    normalized.append(key, value)
  }

  const suffix = normalized.toString()
  return suffix ? `?${suffix}` : ''
}

export function buildProfileResourceCacheKey(resource: string, querySuffix?: string): string {
  const normalizedSuffix = normalizeQuerySuffix(querySuffix)

  return normalizedSuffix ? `${resource}${normalizedSuffix}` : resource
}

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

export async function invalidateProfileCacheForUser(
  event: H3Event,
  userId: string,
): Promise<void> {
  await invalidateProfileCacheScopes(event, { userId })
}

export async function invalidateProfileCacheForRole(
  event: H3Event,
  roleId: string,
): Promise<void> {
  await invalidateProfileCacheScopes(event, { roleId })
}

export async function invalidateProfileCacheForGroup(
  event: H3Event,
  groupId: string,
): Promise<void> {
  await invalidateProfileCacheScopes(event, { groupId })
}
