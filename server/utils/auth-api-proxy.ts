import type { H3Event } from 'h3'
import { getHeader, readRawBody } from 'h3'
import { resolveAuthorizationHeader } from './authorization'
import { getAuthApiUpstreamCandidates } from './auth-api-upstream'

type ProxyHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

const DEFAULT_AUTH_API_TIMEOUT_MS = 8000
const PREFERRED_UPSTREAM_TTL_MS = 60_000

let preferredUpstream: { baseURL: string, expiresAt: number } | null = null

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
  const candidates = getAuthApiUpstreamCandidates(event)

  const now = Date.now()
  const cachedBaseURL = preferredUpstream?.expiresAt && preferredUpstream.expiresAt > now
    ? preferredUpstream.baseURL
    : null

  if (!cachedBaseURL) {
    preferredUpstream = null
    return candidates
  }

  if (!candidates.includes(cachedBaseURL)) {
    preferredUpstream = null
    return candidates
  }

  return [cachedBaseURL, ...candidates.filter(candidate => candidate !== cachedBaseURL)]
}

function getAuthApiTimeoutMs(event: H3Event): number {
  const timeout = Number(useRuntimeConfig(event).authApiTimeoutMs)

  if (!Number.isFinite(timeout) || timeout <= 0) {
    return DEFAULT_AUTH_API_TIMEOUT_MS
  }

  return timeout
}

function markPreferredUpstream(baseURL: string) {
  preferredUpstream = {
    baseURL,
    expiresAt: Date.now() + PREFERRED_UPSTREAM_TTL_MS,
  }
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  }
  finally {
    clearTimeout(timeout)
  }
}

export async function proxyAuthApiGet(event: H3Event, path: string) {
  return await proxyAuthApiRequest(event, path, 'GET')
}

export async function proxyAuthApiRequest(
  event: H3Event,
  path: string,
  method: ProxyHttpMethod,
) {
  const authorization = resolveAuthorizationHeader(event)
  const upstreamCandidates = getUpstreamCandidates(event)
  const timeoutMs = getAuthApiTimeoutMs(event)
  const overrideBody = (event.context as { requestBodyOverride?: unknown }).requestBodyOverride
  const requestContentType = getHeader(event, 'content-type') ?? ''
  const hasRawBody =
    requestContentType.includes('multipart/form-data') ||
    requestContentType.includes('application/octet-stream')

  const bodyType: 'none' | 'json' | 'raw' = ['GET', 'DELETE'].includes(method)
    ? 'none'
    : overrideBody !== undefined
      ? 'json'
      : hasRawBody
        ? 'raw'
        : 'json'

  const body = bodyType === 'none'
    ? undefined
    : bodyType === 'raw'
      ? await readRawBody(event, false)
      : (overrideBody ?? await readBody(event))

  let lastError: unknown
  let lastUnauthorizedError: unknown = null

  for (const baseURL of upstreamCandidates) {
    const targetURL = `${baseURL.replace(/\/$/, '')}${path}`
    const startedAt = Date.now()

    try {
      const response = await fetchWithTimeout(
        targetURL,
        {
          method,
          headers: {
            ...(authorization ? { authorization } : {}),
            ...(body && bodyType === 'json' ? { 'content-type': 'application/json' } : {}),
            ...(body && bodyType === 'raw' && requestContentType.length > 0
              ? { 'content-type': requestContentType }
              : {}),
          },
          ...(body
            ? {
                body: bodyType === 'json'
                  ? JSON.stringify(body)
                  : (body as BodyInit),
              }
            : {}),
        },
        timeoutMs,
      )

      const durationMs = Date.now() - startedAt
      console.debug(
        `[auth-api-proxy] candidate=${baseURL} durationMs=${durationMs} status=${response.status}`,
      )

      if (response.status === 401) {
        lastUnauthorizedError = createError({
          statusCode: 401,
          statusMessage: 'Unauthorized.',
          message: 'Upstream auth API rejected the Authorization header.',
        })

        continue
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

      markPreferredUpstream(baseURL)
      return await parseUpstreamResponse(response)
    }
    catch (error) {
      const durationMs = Date.now() - startedAt
      const status = isError(error) && error.statusCode ? error.statusCode : 'network'
      console.debug(`[auth-api-proxy] candidate=${baseURL} durationMs=${durationMs} status=${status}`)

      if (isError(error) && error.statusCode && error.statusCode < 500) {
        throw error
      }

      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error(`Upstream request timed out after ${timeoutMs}ms.`)
      }
      else {
        lastError = error
      }
    }
  }

  if (lastUnauthorizedError) {
    throw lastUnauthorizedError
  }

  const errorMessage = lastError instanceof Error ? lastError.message : 'fetch failed'

  throw createError({
    statusCode: 502,
    statusMessage: 'Upstream auth API unreachable.',
    message: errorMessage,
  })
}
