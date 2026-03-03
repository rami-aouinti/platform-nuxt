import type { H3Event } from 'h3'

import {
  buildProfileCacheKey,
  getProfileCache,
  invalidateProfileCacheResources,
  invalidateProfileCacheScopes,
  setProfileCache,
} from './cache/profile-cache'

const PROFILE_CACHE_TTL_MS = 30_000
export const LONG_LIVED_PROFILE_CACHE_TTL_MS = 2 * 60 * 60 * 1000

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

function getCacheTtlMs(event: H3Event, overrideTtlMs?: number): number {
  if (Number.isFinite(overrideTtlMs) && Number(overrideTtlMs) > 0) {
    return Number(overrideTtlMs)
  }

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
  options?: { ttlMs?: number },
): Promise<void> {
  const ttlMs = getCacheTtlMs(event, options?.ttlMs)
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



const SOCIAL_DATA_MUTATION_RESOURCE_PREFIXES = [
  'profile-friends',
  'profile-friends-requests-received',
  'profile-friends-requests-sent',
  'v1-me-chat',
  'v1-me-notifications',
  'v1-me-notifications-unread-count',
  'v1-me-notification',
] as const

export async function invalidateSocialDataCaches(
  event: H3Event,
  scopes: { userId?: string, roleId?: string, groupId?: string } = {},
): Promise<void> {
  await invalidateProfileCacheResources(event, {
    resources: [...SOCIAL_DATA_MUTATION_RESOURCE_PREFIXES],
    scopes,
  })
}

const PROFILE_MUTATION_RESOURCE_PREFIXES = [
  'profile',
  'me-profile',
  'v1-profile',
  'v1-me-profile',
  'profile-groups',
  'me-profile-groups',
  'v1-profile-groups',
  'v1-me-profile-groups',
  'profile-roles',
  'me-profile-roles',
  'v1-profile-roles',
  'v1-me-profile-roles',
  'profile-companies',
  'profile-friends',
  'profile-friends-requests-received',
  'profile-friends-requests-sent',
  'profile-applications',
  'profile-application',
] as const

export async function invalidateProfileMutationCaches(
  event: H3Event,
  scopes: { userId?: string, roleId?: string, groupId?: string },
): Promise<void> {
  await invalidateProfileCacheScopes(event, scopes)

  await invalidateProfileCacheResources(event, {
    resources: [...PROFILE_MUTATION_RESOURCE_PREFIXES],
    scopes,
  })
}
