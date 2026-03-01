import { proxyAuthApiGet } from '../../../utils/auth-api-proxy'

export default defineEventHandler(async (event) => {
  const userGroup = getRouterParam(event, 'userGroup')

  if (!userGroup) {
    throw createError({ statusCode: 400, statusMessage: 'Missing userGroup.' })
  }

  return await proxyAuthApiGet(event, `/api/api/v1/admin/user_group/${encodeURIComponent(userGroup)}/users`)
})
