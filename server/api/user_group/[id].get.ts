import { createProxyEntityHandler } from '../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'id',
  method: 'GET',
  missingParamError: {
    statusMessage: 'Invalid user group parameter.',
    message: 'User group identifier is required.',
  },
  upstreamPathBuilder: id => `/api/v1/user_group/${encodeURIComponent(id)}`,
})
