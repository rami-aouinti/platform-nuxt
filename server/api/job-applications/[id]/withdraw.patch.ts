import { createProxyEntityHandler } from '../../../utils/proxy-handler-factory'
import { requireAuthenticatedRequest } from '../../../utils/require-auth'

const withdrawJobApplication = createProxyEntityHandler({
  paramName: 'id',
  method: 'PATCH',
  missingParamError: {
    statusMessage: 'Invalid job application parameter.',
    message: 'Job application identifier is required.',
  },
  upstreamPathBuilder: id => `/api/job-applications/${encodeURIComponent(id)}/withdraw`,
})

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  return await withdrawJobApplication(event)
})
