import { proxyAuthApiRequest } from '../../../../../utils/auth-api-proxy'

export default defineEventHandler(async (event) => {
  const user = getRouterParam(event, 'id')
  const userGroup = getRouterParam(event, 'userGroup')

  if (!user || !userGroup) {
    throw createError({ statusCode: 400, statusMessage: 'Missing user or userGroup.' })
  }

  return await proxyAuthApiRequest(
    event,
    `/api/api/v1/admin/users/${encodeURIComponent(user)}/group/${encodeURIComponent(userGroup)}`,
    'DELETE',
  )
})
