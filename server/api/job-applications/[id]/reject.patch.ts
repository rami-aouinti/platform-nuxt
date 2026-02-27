import { createProxyEntityHandler } from '../../../utils/proxy-handler-factory'
import { requireAuthenticatedRequest } from '../../../utils/require-auth'

const rejectJobApplication = createProxyEntityHandler({
  paramName: 'id',
  method: 'PATCH',
  missingParamError: {
    statusMessage: 'Invalid job application parameter.',
    message: 'Job application identifier is required.',
  },
  upstreamPathBuilder: id => `/api/v1/job-applications/${encodeURIComponent(id)}/reject`,
})

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  return await rejectJobApplication(event)
})
