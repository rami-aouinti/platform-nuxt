import {
  invalidateProfileMutationCaches,
} from '../../../utils/profile-endpoint-cache'
import { createProxyEntityHandler } from '../../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'id',
  method: 'DELETE',
  onSuccess: async (event, id) => {
    await invalidateProfileMutationCaches(event, { userId: id })
  },
  missingParamError: {
    statusMessage: 'Invalid user parameter.',
    message: 'User identifier is required.',
  },
  upstreamPathBuilder: id => `/api/api/v1/admin/users/${encodeURIComponent(id)}`,
})
