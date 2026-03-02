import { proxyAuthApiCanonical } from '../../utils/canonical-endpoint-resolver'
import {
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../utils/profile-endpoint-cache'
import { normalizeProfileRoles } from '../../utils/profile-response-normalizers'

const ROLES_CACHE_KEY = 'profile-roles'

export default defineEventHandler(async (event) => {
  const cachedRoles = await readProfileEndpointCache(event, ROLES_CACHE_KEY)

  if (cachedRoles) {
    return cachedRoles
  }

  const roles = await proxyAuthApiCanonical(event, 'profileRoles', 'GET')
  const normalizedRoles = normalizeProfileRoles(roles)
  await writeProfileEndpointCache(event, ROLES_CACHE_KEY, normalizedRoles)

  return normalizedRoles
})
