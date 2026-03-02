import { createProxyEntityHandler } from '../../../../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'id',
  method: 'GET',
  missingParamError: {
    statusMessage: 'Invalid notification parameter.',
    message: 'Notification identifier is required.',
  },
  upstreamPathBuilder: id => `/api/v1/me/notifications/${encodeURIComponent(id)}`,
})
