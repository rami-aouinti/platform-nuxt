import { proxyAuthApiGet } from '../../utils/auth-api-proxy'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid candidate parameter.',
      message: 'Candidate identifier is required.',
    })
  }

  return await proxyAuthApiGet(event, `/api/v1/candidates/${encodeURIComponent(id)}`)
})
