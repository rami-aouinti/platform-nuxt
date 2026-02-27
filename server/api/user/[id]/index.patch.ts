import { createProxyEntityHandler } from '../../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'id',
  method: 'PATCH',
  missingParamError: {
    statusMessage: 'Invalid user parameter.',
    message: 'User identifier is required.',
  },
  upstreamPathBuilder: id => `/api/v1/user/${encodeURIComponent(id)}`,
})
