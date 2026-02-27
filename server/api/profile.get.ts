import { createProxyCollectionHandler } from '../utils/proxy-handler-factory'

export default createProxyCollectionHandler({
  upstreamPath: '/api/v1/profile',
  method: 'GET',
})
