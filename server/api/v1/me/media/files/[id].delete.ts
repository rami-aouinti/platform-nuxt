import { createProxyEntityHandler } from '../../../../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'id',
  upstreamPathBuilder: id => `/api/v1/me/media/files/${id}`,
  method: 'DELETE',
})
