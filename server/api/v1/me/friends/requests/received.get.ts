import { createProxyCollectionHandlerWithQuery } from '../../../../../utils/proxy-handler-factory'

export default createProxyCollectionHandlerWithQuery({
  upstreamBasePath: '/api/v1/me/friends/requests/received',
})
