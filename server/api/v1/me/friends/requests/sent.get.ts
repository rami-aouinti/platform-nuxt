import { proxyAuthApiGet } from '../../../../../utils/auth-api-proxy'
import {
  buildProfileResourceCacheKey,
  LONG_LIVED_PROFILE_CACHE_TTL_MS,
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../../../../utils/profile-endpoint-cache'
import { normalizeProfileCollectionPayload } from '../../../../../utils/profile-response-normalizers'
import { buildQuerySuffix } from '../../../../../utils/query-string'

const SENT_FRIEND_REQUESTS_CACHE_KEY = 'profile-friends-requests-sent'

export default defineEventHandler(async (event) => {
  const suffix = buildQuerySuffix(event)
  const cacheKey = buildProfileResourceCacheKey(SENT_FRIEND_REQUESTS_CACHE_KEY, suffix)
  const cachedRequests = await readProfileEndpointCache(event, cacheKey)

  if (cachedRequests) {
    return cachedRequests
  }

  const requests = await proxyAuthApiGet(event, `/api/v1/me/friends/requests/sent${suffix}`)
  const normalizedRequests = normalizeProfileCollectionPayload(requests)

  await writeProfileEndpointCache(event, cacheKey, normalizedRequests, {
    ttlMs: LONG_LIVED_PROFILE_CACHE_TTL_MS,
  })

  return normalizedRequests
})
