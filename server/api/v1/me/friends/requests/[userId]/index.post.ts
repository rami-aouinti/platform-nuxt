import { createProxyEntityHandler } from '../../../../../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'userId',
  method: 'POST',
  missingParamError: {
    statusMessage: 'Invalid user parameter.',
    message: 'User identifier is required.',
  },
  upstreamPathBuilder: userId => `/api/v1/me/friends/requests/${encodeURIComponent(userId)}`,
})
