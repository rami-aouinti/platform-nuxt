import { proxyAuthApiGet } from '../../utils/auth-api-proxy'
import {
  buildProfileResourceCacheKey,
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../utils/profile-endpoint-cache'
import { normalizeProfileCollectionPayload } from '../../utils/profile-response-normalizers'
import { buildQuerySuffix } from '../../utils/query-string'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

const APPLICATIONS_CACHE_KEY = 'profile-applications'

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)

  const suffix = buildQuerySuffix(event)
  const cacheKey = buildProfileResourceCacheKey(APPLICATIONS_CACHE_KEY, suffix)
  const cachedApplications = await readProfileEndpointCache(event, cacheKey)

  if (cachedApplications) {
    return cachedApplications
  }

  const applications = await proxyAuthApiGet(event, `/api/job-applications${suffix}`)
  const normalizedApplications = normalizeProfileCollectionPayload(applications)

  await writeProfileEndpointCache(event, cacheKey, normalizedApplications)

  return normalizedApplications
})
