import { createProxyEntityHandler } from '../../utils/proxy-handler-factory'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

const updateJobOffer = createProxyEntityHandler({
  paramName: 'id',
  method: 'PUT',
  missingParamError: {
    statusMessage: 'Invalid job offer parameter.',
    message: 'Job offer identifier is required.',
  },
  upstreamPathBuilder: id => `/api/job-offers/${encodeURIComponent(id)}`,
})

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  return await updateJobOffer(event)
})
