import { proxyAuthApiGet } from '../../utils/auth-api-proxy'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)

  return await proxyAuthApiGet(event, '/api/v1/notifications/unread-count')
})
