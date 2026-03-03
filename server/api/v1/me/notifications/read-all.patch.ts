import { invalidateSocialDataCaches } from '../../../../utils/profile-endpoint-cache'
import { createProxyCollectionHandler } from '../../../../utils/proxy-handler-factory'

export default createProxyCollectionHandler({
  upstreamPath: '/api/v1/me/notifications/read-all',
  method: 'PATCH',
  onSuccess: async (event) => {
    await invalidateSocialDataCaches(event)
  },
})
