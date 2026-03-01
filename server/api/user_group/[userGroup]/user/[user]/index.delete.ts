import { proxyAuthApiRequest } from '../../../../../utils/auth-api-proxy'

export default defineEventHandler(async (event) => {
  const userGroup = getRouterParam(event, 'userGroup')
  const user = getRouterParam(event, 'user')

  if (!userGroup || !user) {
    throw createError({ statusCode: 400, statusMessage: 'Missing userGroup or user.' })
  }

  return await proxyAuthApiRequest(
    event,
    `/api/api/v1/admin/user_group/${encodeURIComponent(userGroup)}/user/${encodeURIComponent(user)}`,
    'DELETE',
  )
})
