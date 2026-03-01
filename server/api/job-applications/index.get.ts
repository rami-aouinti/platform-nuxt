import { proxyAuthApiRequest } from '../../utils/auth-api-proxy'
import { buildQuerySuffix } from '../../utils/query-string'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  const suffix = buildQuerySuffix(event)

  return await proxyAuthApiRequest(event, `/api/job-applications${suffix}`, 'GET')
})
