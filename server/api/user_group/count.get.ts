import { createProxyCollectionHandler } from '../../utils/proxy-handler-factory'

export default createProxyCollectionHandler({
  upstreamPath: '/api/api/v1/admin/user_group/count',
  method: 'GET',
})
