import { createProxyEntityHandler } from '../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'role',
  method: 'GET',
  missingParamError: {
    statusMessage: 'Invalid role parameter.',
    message: 'Role identifier is required.',
  },
  upstreamPathBuilder: role => `/api/v1/role/${encodeURIComponent(role)}`,
})
