import { createProxyCollectionHandler } from '../../utils/proxy-handler-factory'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

const markAllNotificationsAsRead = createProxyCollectionHandler({
  upstreamPath: '/api/notifications/read-all',
  method: 'PATCH',
})

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  return await markAllNotificationsAsRead(event)
})
