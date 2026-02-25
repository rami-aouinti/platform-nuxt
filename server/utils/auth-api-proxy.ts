import type { H3Event } from 'h3'

type ProxyHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

function parseUpstreamErrorPayload(payload: unknown): string | null {
  if (typeof payload === 'string' && payload.length > 0) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    const candidateKeys = ['message', 'detail', 'error', 'title'] as const

    for (const key of candidateKeys) {
      const value = (payload as Record<string, unknown>)[key]
      if (typeof value === 'string' && value.length > 0) {
        return value
      }
    }
  }

  return null
}

async function parseUpstreamResponse(response: Response) {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return await response.json()
  }

  return await response.text()
}

function getUpstreamCandidates(event: H3Event): string[] {
  const config = useRuntimeConfig(event)

  return [
    config.authApiBase,
    config.public.authApiBase,
    'http://host.docker.internal',
    'http://localhost',
  ].filter((value, index, values): value is string => {
    return Boolean(value) && values.indexOf(value) === index
  })
}

export async function proxyAuthApiGet(event: H3Event, path: string) {
  return await proxyAuthApiRequest(event, path, 'GET')
}

function resolveAuthorizationHeader(event: H3Event) {
  const authorization = getHeader(event, 'authorization')

  if (authorization && authorization.trim().length > 0) {
    return authorization
  }

  const tokenFromCookie = getCookie(event, 'auth_token')

  if (tokenFromCookie && tokenFromCookie.trim().length > 0) {
    return `Bearer ${tokenFromCookie}`
  }

  return undefined
}

export async function proxyAuthApiRequest(
  event: H3Event,
  path: string,
  method: ProxyHttpMethod,
) {
  const authorization = resolveAuthorizationHeader(event)
  const upstreamCandidates = getUpstreamCandidates(event)
  const body = ['GET', 'DELETE'].includes(method) ? undefined : await readBody(event)

  let lastError: unknown

  for (const baseURL of upstreamCandidates) {
    const targetURL = `${baseURL.replace(/\/$/, '')}${path}`

    try {
      const response = await fetch(targetURL, {
        method,
        headers: authorization
          ? {
              authorization,
              ...(body ? { 'content-type': 'application/json' } : {}),
            }
          : body
            ? { 'content-type': 'application/json' }
            : undefined,
        ...(body ? { body: JSON.stringify(body) } : {}),
      })

      if (response.status === 401) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized.',
          message: 'Upstream auth API rejected the Authorization header.',
        })
      }

      if (response.status === 403) {
        const errorPayload = await parseUpstreamResponse(response)
        throw createError({
          statusCode: 403,
          statusMessage: 'Forbidden.',
          message:
            parseUpstreamErrorPayload(errorPayload) ??
            'Vous n’êtes pas autorisé à effectuer cette action.',
        })
      }

      if (response.status >= 400 && response.status < 500) {
        const errorPayload = await parseUpstreamResponse(response)
        throw createError({
          statusCode: response.status,
          statusMessage: response.statusText || 'Upstream request failed.',
          message:
            parseUpstreamErrorPayload(errorPayload) ??
            `Upstream responded with HTTP ${response.status}.`,
        })
      }

      if (!response.ok) {
        lastError = new Error(`Upstream responded with HTTP ${response.status}.`)
        continue
      }

      return await parseUpstreamResponse(response)
    }
    catch (error) {
      if (isError(error) && error.statusCode && error.statusCode < 500) {
        throw error
      }

      lastError = error
    }
  }

  const errorMessage = lastError instanceof Error ? lastError.message : 'fetch failed'

  throw createError({
    statusCode: 502,
    statusMessage: 'Upstream auth API unreachable.',
    message: errorMessage,
  })
}
