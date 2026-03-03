import { invalidateSocialDataCaches } from '../../../../utils/profile-endpoint-cache'
import { createProxyEntityHandler } from '../../../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'userId',
  method: 'DELETE',
  missingParamError: {
    statusMessage: 'Invalid user parameter.',
    message: 'User identifier is required.',
  },
  upstreamPathBuilder: userId => `/api/v1/me/friends/${encodeURIComponent(userId)}`,
  onSuccess: async (event) => {
    await invalidateSocialDataCaches(event)
  },
})
