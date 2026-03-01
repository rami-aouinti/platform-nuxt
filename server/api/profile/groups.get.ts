import { proxyAuthApiWithPathFallback } from '../../utils/proxy-auth-api-with-fallback'
import { readProfileEndpointCache, writeProfileEndpointCache } from '../../utils/profile-endpoint-cache'
import { normalizeProfileGroups } from '../../utils/profile-response-normalizers'

const GROUPS_CACHE_KEY = 'profile-groups'

export default defineEventHandler(async (event) => {
  const cachedGroups = readProfileEndpointCache(event, GROUPS_CACHE_KEY)

  if (cachedGroups) {
    return cachedGroups
  }

  const groups = await proxyAuthApiWithPathFallback(event, ['/api/v1/me/profile/groups', '/api/v1/profile/groups', '/api/profile/groups'], 'GET')
  const normalizedGroups = normalizeProfileGroups(groups)
  writeProfileEndpointCache(event, GROUPS_CACHE_KEY, normalizedGroups)

  return normalizedGroups
})
