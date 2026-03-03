import { proxyAuthApiGet } from '../../../../utils/auth-api-proxy'
import {
  buildProfileResourceCacheKey,
  LONG_LIVED_PROFILE_CACHE_TTL_MS,
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../../../utils/profile-endpoint-cache'
import { buildQuerySuffix } from '../../../../utils/query-string'

const CHAT_CONVERSATIONS_CACHE_KEY = 'v1-me-chat'

export default defineEventHandler(async (event) => {
  const suffix = buildQuerySuffix(event)
  const cacheKey = buildProfileResourceCacheKey(CHAT_CONVERSATIONS_CACHE_KEY, suffix)
  const cachedConversations = await readProfileEndpointCache(event, cacheKey)

  if (cachedConversations) {
    return cachedConversations
  }

  const conversations = await proxyAuthApiGet(event, `/api/v1/me/chat${suffix}`)

  await writeProfileEndpointCache(event, cacheKey, conversations, {
    ttlMs: LONG_LIVED_PROFILE_CACHE_TTL_MS,
  })

  return conversations
})
