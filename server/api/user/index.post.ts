import { getHeader } from 'h3'
import { invalidateProfileMutationCaches } from '../../utils/profile-endpoint-cache'
import { createProxyCollectionHandler } from '../../utils/proxy-handler-factory'

export default createProxyCollectionHandler({
  upstreamPath: '/api/api/v1/admin/users',
  method: 'POST',
  onSuccess: async (event) => {
    await invalidateProfileMutationCaches(event, {
      userId: getHeader(event, 'x-user-id'),
    })
  },
})
