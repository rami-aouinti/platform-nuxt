import { proxyAuthApiGet } from '../../../../utils/auth-api-proxy'
import {
  buildProfileResourceCacheKey,
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../../../utils/profile-endpoint-cache'
import { normalizeProfileCollectionPayload } from '../../../../utils/profile-response-normalizers'
import { buildQuerySuffix } from '../../../../utils/query-string'

const CONFIGURATIONS_CACHE_KEY = 'profile-configurations'

export default defineEventHandler(async (event) => {
  const suffix = buildQuerySuffix(event)
  const cacheKey = buildProfileResourceCacheKey(CONFIGURATIONS_CACHE_KEY, suffix)
  const cachedConfigurations = await readProfileEndpointCache(event, cacheKey)

  if (cachedConfigurations) {
    return cachedConfigurations
  }

  const configurations = await proxyAuthApiGet(event, `/api/v1/me/profile/configurations${suffix}`)
  const normalizedConfigurations = normalizeProfileCollectionPayload(configurations)

  await writeProfileEndpointCache(event, cacheKey, normalizedConfigurations)

  return normalizedConfigurations
})
