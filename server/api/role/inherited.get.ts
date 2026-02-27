import { createProxyCollectionHandler } from '../../utils/proxy-handler-factory'

export default createProxyCollectionHandler({
  upstreamPath: '/api/v1/role/inherited',
  method: 'GET',
})
