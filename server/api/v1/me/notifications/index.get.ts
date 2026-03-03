import { proxyAuthApiGet } from '../../../../utils/auth-api-proxy'
import {
  buildProfileResourceCacheKey,
  LONG_LIVED_PROFILE_CACHE_TTL_MS,
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../../../utils/profile-endpoint-cache'
import { buildQuerySuffix } from '../../../../utils/query-string'

const NOTIFICATIONS_CACHE_KEY = 'v1-me-notifications'

export default defineEventHandler(async (event) => {
  const suffix = buildQuerySuffix(event)
  const cacheKey = buildProfileResourceCacheKey(NOTIFICATIONS_CACHE_KEY, suffix)
  const cachedNotifications = await readProfileEndpointCache(event, cacheKey)

  if (cachedNotifications) {
    return cachedNotifications
  }

  const notifications = await proxyAuthApiGet(event, `/api/v1/me/notifications${suffix}`)

  await writeProfileEndpointCache(event, cacheKey, notifications, {
    ttlMs: LONG_LIVED_PROFILE_CACHE_TTL_MS,
  })

  return notifications
})
