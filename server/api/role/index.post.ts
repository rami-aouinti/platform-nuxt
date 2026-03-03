import { getHeader } from 'h3'
import { invalidateProfileMutationCaches } from '../../utils/profile-endpoint-cache'
import { createProxyCollectionHandler } from '../../utils/proxy-handler-factory'

export default createProxyCollectionHandler({
  upstreamPath: '/api/api/v1/admin/role',
  method: 'POST',
  onSuccess: async (event) => {
    await invalidateProfileMutationCaches(event, {
      roleId: getHeader(event, 'x-role-id'),
    })
  },
})
