import { createError, defineEventHandler, getRouterParam } from 'h3'
import { proxyAuthApiGet } from '../../../../../utils/auth-api-proxy'
import {
  LONG_LIVED_PROFILE_CACHE_TTL_MS,
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../../../../utils/profile-endpoint-cache'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid notification parameter.',
      message: 'Notification identifier is required.',
    })
  }

  const cacheKey = `v1-me-notification-${id}`
  const cachedNotification = await readProfileEndpointCache(event, cacheKey)

  if (cachedNotification) {
    return cachedNotification
  }

  const notification = await proxyAuthApiGet(
    event,
    `/api/v1/me/notifications/${encodeURIComponent(id)}`,
  )

  await writeProfileEndpointCache(event, cacheKey, notification, {
    ttlMs: LONG_LIVED_PROFILE_CACHE_TTL_MS,
  })

  return notification
})
