import { createProxyCollectionHandler } from '../../../../utils/proxy-handler-factory'

export default createProxyCollectionHandler({
  upstreamPath: '/api/v1/me/media/folders',
  method: 'GET',
})
