import {
  invalidateProfileCacheForGroup,
} from '../../../utils/profile-endpoint-cache'
import { createProxyEntityHandler } from '../../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'id',
  method: 'DELETE',
  onSuccess: async (event, id) => {
    await invalidateProfileCacheForGroup(event, id)
  },
  missingParamError: {
    statusMessage: 'Invalid user group parameter.',
    message: 'User group identifier is required.',
  },
  upstreamPathBuilder: id => `/api/api/v1/admin/user_group/${encodeURIComponent(id)}`,
})
