import { createProxyEntityHandler } from '../../../../../../utils/proxy-handler-factory'

export default createProxyEntityHandler({
  paramName: 'resumeId',
  method: 'GET',
  upstreamPathBuilder: resumeId => `/api/v1/me/profile/resumes/${resumeId}/skills`,
})
