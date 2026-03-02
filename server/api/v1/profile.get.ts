import { proxyAuthApiCanonical } from '../../utils/canonical-endpoint-resolver'
import {
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../utils/profile-endpoint-cache'
import { normalizeProfilePayload } from '../../utils/profile-response-normalizers'

const PROFILE_CACHE_KEY = 'v1-profile'

export default defineEventHandler(async (event) => {
  const cachedProfile = await readProfileEndpointCache(event, PROFILE_CACHE_KEY)

  if (cachedProfile) {
    return cachedProfile
  }

  const profile = await proxyAuthApiCanonical(event, 'profile', 'GET')
  const normalizedProfile = normalizeProfilePayload(profile)
  await writeProfileEndpointCache(event, PROFILE_CACHE_KEY, normalizedProfile)

  return normalizedProfile
})
