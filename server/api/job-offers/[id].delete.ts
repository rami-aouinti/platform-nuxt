import { createProxyEntityHandler } from '../../utils/proxy-handler-factory'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

const deleteJobOffer = createProxyEntityHandler({
  paramName: 'id',
  method: 'DELETE',
  missingParamError: {
    statusMessage: 'Invalid job offer parameter.',
    message: 'Job offer identifier is required.',
  },
  upstreamPathBuilder: id => `/api/job-offers/${encodeURIComponent(id)}`,
})

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  return await deleteJobOffer(event)
})
