import { proxyAuthApiRequest } from '../../../../../utils/auth-api-proxy'

export default defineEventHandler(async (event) => {
  return await proxyAuthApiRequest(event, '/api/v1/me/profile/social-accounts/unlink', 'POST')
})
