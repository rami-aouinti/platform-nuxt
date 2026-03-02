import { proxyAuthApiGet } from '../../../../utils/auth-api-proxy'
import {
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../../../utils/profile-endpoint-cache'
import { normalizeProfileRoles } from '../../../../utils/profile-response-normalizers'

const ROLES_CACHE_KEY = 'v1-me-profile-roles'

export default defineEventHandler(async (event) => {
  const cachedRoles = await readProfileEndpointCache(event, ROLES_CACHE_KEY)

  if (cachedRoles) {
    return cachedRoles
  }

  const roles = await proxyAuthApiGet(event, '/api/v1/me/profile/roles')
  const normalizedRoles = normalizeProfileRoles(roles)
  await writeProfileEndpointCache(event, ROLES_CACHE_KEY, normalizedRoles)

  return normalizedRoles
})
