import { defineEventHandler, readBody } from 'h3'
import { proxyAuthApiRequest } from '../../../../utils/auth-api-proxy'
import { normalizeAddressPayload, normalizeAddressResponse } from '../../../../utils/profile-address-contract'

export default defineEventHandler(async (event) => {
  const payload = normalizeAddressPayload(await readBody(event))
  event.context.requestBodyOverride = payload

  const response = await proxyAuthApiRequest(event, '/api/v1/me/profile/addresses', 'POST')

  return normalizeAddressResponse(response)
})
