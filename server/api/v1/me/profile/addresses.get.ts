import { defineEventHandler } from 'h3'
import { proxyAuthApiGet } from '../../../../utils/auth-api-proxy'
import { normalizeAddressResponse } from '../../../../utils/profile-address-contract'

export default defineEventHandler(async (event) => {
  const response = await proxyAuthApiGet(event, '/api/v1/me/profile/addresses')
  return normalizeAddressResponse(response)
})
