import { createProxyCollectionHandler } from '../../utils/proxy-handler-factory'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

const unreadNotificationsCount = createProxyCollectionHandler({
  upstreamPath: '/api/v1/notifications/unread-count',
  method: 'GET',
})

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  return await unreadNotificationsCount(event)
})
