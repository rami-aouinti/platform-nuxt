import { createProxyEntityHandler } from '../../../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'provider',
  method: 'DELETE',
  upstreamPathBuilder: provider => `/api/v1/me/social-accounts/${encodeURIComponent(provider)}`,
})
