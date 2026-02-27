import { createProxyEntityHandler } from '../../utils/proxy-handler-factory'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

const updateJobApplication = createProxyEntityHandler({
  paramName: 'id',
  method: 'PUT',
  missingParamError: {
    statusMessage: 'Invalid job application parameter.',
    message: 'Job application identifier is required.',
  },
  upstreamPathBuilder: id => `/api/v1/job-applications/${encodeURIComponent(id)}`,
})

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  return await updateJobApplication(event)
})
