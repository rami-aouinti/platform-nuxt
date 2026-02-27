import { createProxyEntityHandler } from '../../utils/proxy-handler-factory'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

const proxyCandidateById = createProxyEntityHandler({
  paramName: 'id',
  method: 'GET',
  missingParamError: {
    statusMessage: 'Invalid candidate parameter.',
    message: 'Candidate identifier is required.',
  },
  upstreamPathBuilder: id => `/api/v1/candidates/${encodeURIComponent(id)}`,
})

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  return await proxyCandidateById(event)
})
