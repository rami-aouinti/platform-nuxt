import { isError, type H3Event } from 'h3'
import { proxyAuthApiRequest } from './auth-api-proxy'

type ProxyHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export async function proxyAuthApiWithPathFallback(
  event: H3Event,
  paths: string[],
  method: ProxyHttpMethod,
) {
  let lastError: unknown

  for (const path of paths) {
    try {
      return await proxyAuthApiRequest(event, path, method)
    }
    catch (error) {
      lastError = error

      if (!isError(error) || error.statusCode !== 404) {
        throw error
      }
    }
  }

  throw lastError
}
