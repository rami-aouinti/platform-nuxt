import { proxyAuthApiGet } from '../../../../utils/auth-api-proxy'
import {
  buildProfileResourceCacheKey,
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../../../utils/profile-endpoint-cache'
import { normalizeProfileCollectionPayload } from '../../../../utils/profile-response-normalizers'
import { buildQuerySuffix } from '../../../../utils/query-string'

const FRIENDS_CACHE_KEY = 'profile-friends'

export default defineEventHandler(async (event) => {
  const suffix = buildQuerySuffix(event)
  const cacheKey = buildProfileResourceCacheKey(FRIENDS_CACHE_KEY, suffix)
  const cachedFriends = await readProfileEndpointCache(event, cacheKey)

  if (cachedFriends) {
    return cachedFriends
  }

  const friends = await proxyAuthApiGet(event, `/api/v1/me/friends${suffix}`)
  const normalizedFriends = normalizeProfileCollectionPayload(friends)

  await writeProfileEndpointCache(event, cacheKey, normalizedFriends)

  return normalizedFriends
})
