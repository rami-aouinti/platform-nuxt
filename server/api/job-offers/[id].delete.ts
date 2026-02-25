import { proxyAuthApiRequest } from '../../utils/auth-api-proxy'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid job offer parameter.',
      message: 'Job offer identifier is required.',
    })
  }

  return await proxyAuthApiRequest(event, `/api/v1/job-offers/${encodeURIComponent(id)}`, 'DELETE')
})
