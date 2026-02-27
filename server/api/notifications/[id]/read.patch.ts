import { createProxyEntityHandler } from '../../../utils/proxy-handler-factory'
import { requireAuthenticatedRequest } from '../../../utils/require-auth'

const markNotificationAsRead = createProxyEntityHandler({
  paramName: 'id',
  method: 'PATCH',
  missingParamError: {
    statusMessage: 'Invalid notification parameter.',
    message: 'Notification identifier is required.',
  },
  upstreamPathBuilder: id => `/api/v1/notifications/${encodeURIComponent(id)}/read`,
})

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  return await markNotificationAsRead(event)
})
