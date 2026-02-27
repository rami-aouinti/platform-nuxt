import { createProxyEntityHandler } from '../../utils/proxy-handler-factory'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

const patchJobOffer = createProxyEntityHandler({
  paramName: 'id',
  method: 'PATCH',
  missingParamError: {
    statusMessage: 'Invalid job offer parameter.',
    message: 'Job offer identifier is required.',
  },
  upstreamPathBuilder: id => `/api/v1/job-offers/${encodeURIComponent(id)}`,
})

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  return await patchJobOffer(event)
})
