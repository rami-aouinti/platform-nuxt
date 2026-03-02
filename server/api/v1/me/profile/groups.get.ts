import { proxyAuthApiGet } from '../../../../utils/auth-api-proxy'
import {
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../../../utils/profile-endpoint-cache'
import { normalizeProfileGroups } from '../../../../utils/profile-response-normalizers'

const GROUPS_CACHE_KEY = 'v1-me-profile-groups'

export default defineEventHandler(async (event) => {
  const cachedGroups = await readProfileEndpointCache(event, GROUPS_CACHE_KEY)

  if (cachedGroups) {
    return cachedGroups
  }

  const groups = await proxyAuthApiGet(event, '/api/v1/me/profile/groups')
  const normalizedGroups = normalizeProfileGroups(groups)
  await writeProfileEndpointCache(event, GROUPS_CACHE_KEY, normalizedGroups)

  return normalizedGroups
})
