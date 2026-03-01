import { createProxyEntityHandler } from '../../../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'addressId',
  method: 'DELETE',
  missingParamError: {
    statusMessage: 'Invalid address parameter.',
    message: 'Address identifier is required.',
  },
  upstreamPathBuilder: addressId => `/api/v1/me/profile/addresses/${encodeURIComponent(addressId)}`,
})
