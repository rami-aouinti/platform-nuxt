import { proxyAuthApiRequest } from '../../utils/auth-api-proxy'
import { requireAuthenticatedRequest } from '../../utils/require-auth'

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

  const rawQuery = getQuery(event)
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(rawQuery)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item))
        }
      }
      continue
    }

    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value))
    }
  }

  const queryString = searchParams.toString()
  const upstreamPath = queryString
    ? `/api/v1/${normalizedPath}?${queryString}`
    : `/api/v1/${normalizedPath}`

  return await proxyAuthApiRequest(event, upstreamPath, method)
})
