import { proxyAuthApiRequest } from '../../utils/auth-api-proxy'
import { requireAuthenticatedRequest } from '../../utils/require-auth'
import { buildQuerySuffixFromQuery } from '../../utils/upstream-query'

type ProxyHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

function isSupportedMethod(method: string): method is ProxyHttpMethod {
  return method === 'GET' || method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE'
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event).toUpperCase()

  if (!isSupportedMethod(method)) {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
      message: `Unsupported method: ${method}`,
    })
  }

  const pathParam = getRouterParam(event, 'path')
  const normalizedPath = Array.isArray(pathParam)
    ? pathParam.join('/')
    : (pathParam ?? '')

  if (!normalizedPath) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid API path.',
      message: 'A target API path is required.',
    })
  }

  if (normalizedPath.startsWith('auth/')) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Auth endpoints are handled by dedicated routes.',
    })
  }

  requireAuthenticatedRequest(event)

  const suffix = buildQuerySuffixFromQuery(getQuery(event))
  const upstreamPath = `/api/v1/${normalizedPath}${suffix}`

  return await proxyAuthApiRequest(event, upstreamPath, method)
})
