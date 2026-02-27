import { proxyAuthApiRequest } from '../../utils/auth-api-proxy'
import { buildQuerySuffix } from '../../utils/query-string'
import { requireAuthenticatedRequest } from '../../utils/require-auth'
import { normalizeListResponse } from '../../utils/normalize-list-response'

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  const suffix = buildQuerySuffix(event)

  const response = await proxyAuthApiRequest(event, `/api/v1/job-applications${suffix}`, 'GET')

  return normalizeListResponse(response)
})
