import { proxyAuthApiWithPathFallback } from '../../../utils/proxy-auth-api-with-fallback'
import {
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../../utils/profile-endpoint-cache'
import { normalizeProfileRoles } from '../../../utils/profile-response-normalizers'

const ROLES_CACHE_KEY = 'v1-profile-roles'

export default defineEventHandler(async (event) => {
  const cachedRoles = await readProfileEndpointCache(event, ROLES_CACHE_KEY)

  if (cachedRoles) {
    return cachedRoles
  }

  const roles = await proxyAuthApiWithPathFallback(
    event,
    ['/api/v1/me/profile/roles', '/api/v1/profile/roles', '/api/profile/roles'],
    'GET',
  )
  const normalizedRoles = normalizeProfileRoles(roles)
  await writeProfileEndpointCache(event, ROLES_CACHE_KEY, normalizedRoles)

  return normalizedRoles
})
