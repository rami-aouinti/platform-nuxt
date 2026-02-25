import { proxyAuthApiGet } from '../../../utils/auth-api-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing user id.' })
  }

  return await proxyAuthApiGet(event, `/api/v1/user/${encodeURIComponent(id)}/roles`)
})
