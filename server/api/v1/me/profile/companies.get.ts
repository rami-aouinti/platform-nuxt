import { proxyAuthApiGet } from '../../../../utils/auth-api-proxy'
import {
  buildProfileResourceCacheKey,
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../../../utils/profile-endpoint-cache'
import { normalizeProfileCollectionPayload } from '../../../../utils/profile-response-normalizers'
import { buildQuerySuffix } from '../../../../utils/query-string'

const COMPANIES_CACHE_KEY = 'profile-companies'

export default defineEventHandler(async (event) => {
  const suffix = buildQuerySuffix(event)
  const cacheKey = buildProfileResourceCacheKey(COMPANIES_CACHE_KEY, suffix)
  const cachedCompanies = await readProfileEndpointCache(event, cacheKey)

  if (cachedCompanies) {
    return cachedCompanies
  }

  const companies = await proxyAuthApiGet(event, `/api/v1/me/profile/companies${suffix}`)
  const normalizedCompanies = normalizeProfileCollectionPayload(companies)

  await writeProfileEndpointCache(event, cacheKey, normalizedCompanies)

  return normalizedCompanies
})
