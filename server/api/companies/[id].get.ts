import { createProxyEntityHandler } from '../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'id',
  method: 'GET',
  missingParamError: {
    statusMessage: 'Invalid company parameter.',
    message: 'Company identifier is required.',
  },
  upstreamPathBuilder: id => `/api/companies/${encodeURIComponent(id)}`,
})
