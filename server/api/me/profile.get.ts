import { proxyAuthApiGet } from '../../utils/auth-api-proxy'
import { readProfileEndpointCache, writeProfileEndpointCache } from '../../utils/profile-endpoint-cache'
import { normalizeProfilePayload } from '../../utils/profile-response-normalizers'

const PROFILE_CACHE_KEY = 'me-profile'

export default defineEventHandler(async (event) => {
  const cachedProfile = readProfileEndpointCache(event, PROFILE_CACHE_KEY)

  if (cachedProfile) {
    return cachedProfile
  }

  const profile = await proxyAuthApiGet(event, '/api/v1/me/profile')
  const normalizedProfile = normalizeProfilePayload(profile)
  writeProfileEndpointCache(event, PROFILE_CACHE_KEY, normalizedProfile)

  return normalizedProfile
})
