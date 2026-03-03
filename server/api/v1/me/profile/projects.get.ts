import { proxyAuthApiGet } from '../../../../utils/auth-api-proxy'
import {
  buildProfileResourceCacheKey,
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../../../utils/profile-endpoint-cache'
import { normalizeProfileCollectionPayload } from '../../../../utils/profile-response-normalizers'
import { buildQuerySuffix } from '../../../../utils/query-string'

const PROJECTS_CACHE_KEY = 'profile-projects'

export default defineEventHandler(async (event) => {
  const suffix = buildQuerySuffix(event)
  const cacheKey = buildProfileResourceCacheKey(PROJECTS_CACHE_KEY, suffix)
  const cachedProjects = await readProfileEndpointCache(event, cacheKey)

  if (cachedProjects) {
    return cachedProjects
  }

  const projects = await proxyAuthApiGet(event, `/api/v1/me/profile/projects${suffix}`)
  const normalizedProjects = normalizeProfileCollectionPayload(projects)

  await writeProfileEndpointCache(event, cacheKey, normalizedProjects)

  return normalizedProjects
})
