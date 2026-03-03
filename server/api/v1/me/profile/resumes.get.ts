import { proxyAuthApiGet } from '../../../../utils/auth-api-proxy'
import {
  buildProfileResourceCacheKey,
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../../../utils/profile-endpoint-cache'
import { normalizeProfileCollectionPayload } from '../../../../utils/profile-response-normalizers'
import { buildQuerySuffix } from '../../../../utils/query-string'

const RESUMES_CACHE_KEY = 'profile-resumes'

export default defineEventHandler(async (event) => {
  const suffix = buildQuerySuffix(event)
  const cacheKey = buildProfileResourceCacheKey(RESUMES_CACHE_KEY, suffix)
  const cachedResumes = await readProfileEndpointCache(event, cacheKey)

  if (cachedResumes) {
    return cachedResumes
  }

  const resumes = await proxyAuthApiGet(event, `/api/v1/me/profile/resumes${suffix}`)
  const normalizedResumes = normalizeProfileCollectionPayload(resumes)

  await writeProfileEndpointCache(event, cacheKey, normalizedResumes)

  return normalizedResumes
})
