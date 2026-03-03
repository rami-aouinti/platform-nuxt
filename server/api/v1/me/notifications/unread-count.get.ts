import { proxyAuthApiGet } from '../../../../utils/auth-api-proxy'
import {
  LONG_LIVED_PROFILE_CACHE_TTL_MS,
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../../../utils/profile-endpoint-cache'

const NOTIFICATIONS_UNREAD_COUNT_CACHE_KEY = 'v1-me-notifications-unread-count'

export default defineEventHandler(async (event) => {
  const cachedUnreadCount = await readProfileEndpointCache(
    event,
    NOTIFICATIONS_UNREAD_COUNT_CACHE_KEY,
  )

  if (cachedUnreadCount) {
    return cachedUnreadCount
  }

  const unreadCount = await proxyAuthApiGet(event, '/api/v1/me/notifications/unread-count')

  await writeProfileEndpointCache(event, NOTIFICATIONS_UNREAD_COUNT_CACHE_KEY, unreadCount, {
    ttlMs: LONG_LIVED_PROFILE_CACHE_TTL_MS,
  })

  return unreadCount
})
