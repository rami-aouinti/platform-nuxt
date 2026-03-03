import { defineEventHandler } from 'h3'
import { proxyAuthApiGet } from '../../../../utils/auth-api-proxy'
import {
  buildProfileResourceCacheKey,
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../../../utils/profile-endpoint-cache'
import { normalizeAddressResponse } from '../../../../utils/profile-address-contract'
import { buildQuerySuffix } from '../../../../utils/query-string'

const ADDRESSES_CACHE_KEY = 'profile-addresses'

export default defineEventHandler(async (event) => {
  const suffix = buildQuerySuffix(event)
  const cacheKey = buildProfileResourceCacheKey(ADDRESSES_CACHE_KEY, suffix)
  const cachedAddresses = await readProfileEndpointCache(event, cacheKey)

  if (cachedAddresses) {
    return cachedAddresses
  }

  const response = await proxyAuthApiGet(event, `/api/v1/me/profile/addresses${suffix}`)
  const normalizedAddresses = normalizeAddressResponse(response)

  await writeProfileEndpointCache(event, cacheKey, normalizedAddresses)

  return normalizedAddresses
})
