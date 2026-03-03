import {
  invalidateProfileMutationCaches,
} from '../../../utils/profile-endpoint-cache'
import { createProxyEntityHandler } from '../../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'role',
  method: 'PATCH',
  onSuccess: async (event, role) => {
    await invalidateProfileMutationCaches(event, { roleId: role })
  },
  missingParamError: {
    statusMessage: 'Invalid role parameter.',
    message: 'Role identifier is required.',
  },
  upstreamPathBuilder: role => `/api/api/v1/admin/role/${encodeURIComponent(role)}`,
})
