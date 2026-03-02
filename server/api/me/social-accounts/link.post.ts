import { createProxyCollectionHandler } from '../../../utils/proxy-handler-factory'

export default createProxyCollectionHandler({
  upstreamPath: '/api/v1/me/social-accounts/link',
  method: 'POST',
})
