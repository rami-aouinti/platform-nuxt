import { createError, getRouterParam } from 'h3'
import { proxyAuthApiGet } from '../../utils/auth-api-proxy'
import {
  buildProfileResourceCacheKey,
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../utils/profile-endpoint-cache'
import { normalizeProfileCollectionPayload } from '../../utils/profile-response-normalizers'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

const APPLICATION_CACHE_KEY = 'profile-application'

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid job application parameter.',
      message: 'Job application identifier is required.',
    })
  }

  const safeId = encodeURIComponent(id)
  const cacheKey = buildProfileResourceCacheKey(APPLICATION_CACHE_KEY, `id=${safeId}`)
  const cachedApplication = await readProfileEndpointCache(event, cacheKey)

  if (cachedApplication) {
    return cachedApplication
  }

  const application = await proxyAuthApiGet(event, `/api/job-applications/${safeId}`)
  const normalizedApplication = normalizeProfileCollectionPayload(application)

  await writeProfileEndpointCache(event, cacheKey, normalizedApplication)

  return normalizedApplication
})
