import { createProxyEntityHandler } from '../../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'id',
  method: 'PATCH',
  missingParamError: {
    statusMessage: 'Invalid user group parameter.',
    message: 'User group identifier is required.',
  },
  upstreamPathBuilder: id => `/api/api/v1/admin/user_group/${encodeURIComponent(id)}`,
})
