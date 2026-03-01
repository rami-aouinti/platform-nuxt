import { proxyAuthApiWithPathFallback } from '../../utils/proxy-auth-api-with-fallback'
import { readProfileEndpointCache, writeProfileEndpointCache } from '../../utils/profile-endpoint-cache'
import { normalizeProfilePayload } from '../../utils/profile-response-normalizers'

const PROFILE_CACHE_KEY = 'v1-profile'

export default defineEventHandler(async (event) => {
  const cachedProfile = readProfileEndpointCache(event, PROFILE_CACHE_KEY)

  if (cachedProfile) {
    return cachedProfile
  }

  const profile = await proxyAuthApiWithPathFallback(event, ['/api/v1/me/profile', '/api/v1/profile', '/api/profile'], 'GET')
  const normalizedProfile = normalizeProfilePayload(profile)
  writeProfileEndpointCache(event, PROFILE_CACHE_KEY, normalizedProfile)

  return normalizedProfile
})
