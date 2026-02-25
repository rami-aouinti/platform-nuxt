import { proxyAuthApiRequest } from '../../../utils/auth-api-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user group parameter.',
      message: 'User group identifier is required.',
    })
  }

  return await proxyAuthApiRequest(event, `/api/v1/user_group/${encodeURIComponent(id)}`, 'DELETE')
})
