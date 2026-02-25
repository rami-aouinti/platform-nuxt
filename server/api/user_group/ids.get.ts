import { proxyAuthApiGet } from '../../utils/auth-api-proxy'

export default defineEventHandler(async (event) => {
  return await proxyAuthApiGet(event, '/api/v1/user_group/ids')
})
