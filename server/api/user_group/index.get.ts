import { createProxyCollectionHandlerWithQuery } from '../../utils/proxy-handler-factory'

export default createProxyCollectionHandlerWithQuery({
  upstreamBasePath: '/api/api/v1/admin/user_group',
})
