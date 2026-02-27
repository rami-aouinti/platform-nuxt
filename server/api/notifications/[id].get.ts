import { createProxyEntityHandler } from '../../utils/proxy-handler-factory'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

const proxyNotificationById = createProxyEntityHandler({
  paramName: 'id',
  method: 'GET',
  missingParamError: {
    statusMessage: 'Invalid notification parameter.',
    message: 'Notification identifier is required.',
  },
  upstreamPathBuilder: id => `/api/v1/notifications/${encodeURIComponent(id)}`,
})

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  return await proxyNotificationById(event)
})
