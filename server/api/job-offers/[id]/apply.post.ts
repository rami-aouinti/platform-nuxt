import { createProxyEntityHandler } from '../../../utils/proxy-handler-factory'
import { requireAuthenticatedRequest } from '../../../utils/require-auth'

const applyToJobOffer = createProxyEntityHandler({
  paramName: 'id',
  method: 'POST',
  missingParamError: {
    statusMessage: 'Invalid job offer parameter.',
    message: 'Job offer identifier is required.',
  },
  upstreamPathBuilder: id => `/api/job-offers/${encodeURIComponent(id)}/apply`,
})

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  return await applyToJobOffer(event)
})
