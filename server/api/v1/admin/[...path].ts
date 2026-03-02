import { createError, defineEventHandler, getMethod, getQuery, getRouterParam } from 'h3'
import { proxyAuthApiGet, proxyAuthApiRequest } from '../../../utils/auth-api-proxy'
import { requireAuthenticatedRequest } from '../../../utils/require-auth'
import { buildQuerySuffixFromQuery } from '../../../utils/upstream-query'
import { mapAdminRouteToLegacyUpstreamPath } from '../../../utils/admin-path-convention'

const SUPPORTED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])

export default defineEventHandler(async (event) => {
  const method = getMethod(event).toUpperCase()

  if (!SUPPORTED_METHODS.has(method)) {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
      message: `Unsupported method: ${method}`,
    })
  }

  const normalizedPath = [getRouterParam(event, 'path')].flat().filter(Boolean).join('/')

  if (!normalizedPath) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid admin API path.',
      message: 'A target admin API path is required.',
    })
  }

  requireAuthenticatedRequest(event)

  const mappedUpstreamPath = mapAdminRouteToLegacyUpstreamPath(`admin/${normalizedPath}`)

  if (!mappedUpstreamPath) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Unsupported admin resource.',
      message: `No admin route mapping found for: ${normalizedPath}`,
    })
  }

  const upstreamPath = `${mappedUpstreamPath}${buildQuerySuffixFromQuery(getQuery(event))}`

  if (method === 'GET') {
    return await proxyAuthApiGet(event, upstreamPath)
  }

  return await proxyAuthApiRequest(event, upstreamPath, method)
})
