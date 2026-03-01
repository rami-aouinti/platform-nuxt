import { createProxyEntityHandler } from '../../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'id',
  method: 'DELETE',
  missingParamError: {
    statusMessage: 'Invalid user parameter.',
    message: 'User identifier is required.',
  },
  upstreamPathBuilder: id => `/api/api/v1/admin/users/${encodeURIComponent(id)}`,
})
