import { defineEventHandler, readBody } from 'h3'
import { proxyAuthApiRequest } from '../../../../../utils/auth-api-proxy'
import { normalizeAddressPayload, normalizeAddressResponse } from '../../../../../utils/profile-address-contract'
import { validateRequiredRouteParam } from '../../../../../utils/proxy-handler-factory'

export default defineEventHandler(async (event) => {
  const addressId = validateRequiredRouteParam(event, 'addressId', {
    statusMessage: 'Invalid address parameter.',
    message: 'Address identifier is required.',
  })

  const payload = normalizeAddressPayload(await readBody(event))
  event.context.requestBodyOverride = payload

  const response = await proxyAuthApiRequest(
    event,
    `/api/v1/me/profile/addresses/${encodeURIComponent(addressId)}`,
    'PATCH',
  )

  return normalizeAddressResponse(response)
})
