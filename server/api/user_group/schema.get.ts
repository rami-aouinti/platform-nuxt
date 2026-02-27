import { createProxyCollectionHandler } from '../../utils/proxy-handler-factory'

export default createProxyCollectionHandler({
  upstreamPath: '/api/v1/user_group/schema',
  method: 'GET',
})
