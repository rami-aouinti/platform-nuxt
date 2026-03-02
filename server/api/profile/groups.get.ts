import { proxyAuthApiCanonical } from '../../utils/canonical-endpoint-resolver'
import {
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../utils/profile-endpoint-cache'
import { normalizeProfileGroups } from '../../utils/profile-response-normalizers'

const GROUPS_CACHE_KEY = 'profile-groups'

export default defineEventHandler(async (event) => {
  const cachedGroups = await readProfileEndpointCache(event, GROUPS_CACHE_KEY)

  if (cachedGroups) {
    return cachedGroups
  }

  const groups = await proxyAuthApiCanonical(event, 'profileGroups', 'GET')
  const normalizedGroups = normalizeProfileGroups(groups)
  await writeProfileEndpointCache(event, GROUPS_CACHE_KEY, normalizedGroups)

  return normalizedGroups
})
