import { invalidateSocialDataCaches } from '../../../../../../../utils/profile-endpoint-cache'
import { createProxyEntityHandler } from '../../../../../../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'id',
  method: 'POST',
  missingParamError: {
    statusMessage: 'Invalid request parameter.',
    message: 'Request identifier is required.',
  },
  upstreamPathBuilder: id => `/api/v1/me/friends/requests/${encodeURIComponent(id)}/accept`,
  onSuccess: async (event) => {
    await invalidateSocialDataCaches(event)
  },
})
