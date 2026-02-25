import { proxyAuthApiRequest } from '../../utils/auth-api-proxy'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)

  return await proxyAuthApiRequest(event, '/api/v1/notifications/read-all', 'PATCH')
})
