import { createProxyEntityHandler } from '../../utils/proxy-handler-factory'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

const deleteJobApplication = createProxyEntityHandler({
  paramName: 'id',
  method: 'DELETE',
  missingParamError: {
    statusMessage: 'Invalid job application parameter.',
    message: 'Job application identifier is required.',
  },
  upstreamPathBuilder: id => `/api/job-applications/${encodeURIComponent(id)}`,
})

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  return await deleteJobApplication(event)
})
