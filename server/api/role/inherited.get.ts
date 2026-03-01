import { createProxyCollectionHandler } from '../../utils/proxy-handler-factory'

export default createProxyCollectionHandler({
  upstreamPath: '/api/api/v1/admin/role/inherited',
  method: 'GET',
})
