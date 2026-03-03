import type { H3Event } from 'h3'
import { getAuthApiUpstreamCandidates } from '../../utils/auth-api-upstream'

function isSecureCookie(event: H3Event) {
  const forwardedProto = getHeader(event, 'x-forwarded-proto')

  if (forwardedProto) {
    return forwardedProto.split(',')[0]?.trim().toLowerCase() === 'https'
  }

  const host = getHeader(event, 'host') ?? ''
  return !host.includes('localhost') && !host.includes('127.0.0.1')
}

function clearLegacyClientCookie(event: H3Event, secure: boolean) {
  deleteCookie(event, 'auth_token', {
    path: '/',
    sameSite: 'lax',
    secure,
    maxAge: 0,
  })
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string, password?: string }>(event)

  if (!body?.username || !body?.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing credentials.',
    })
  }

  const upstreamCandidates = getAuthApiUpstreamCandidates(event)

  let lastError: unknown

  for (const baseURL of upstreamCandidates) {
    try {
      const response = await $fetch<{ token?: string }>('/api/v1/auth/get_token', {
        baseURL,
        method: 'POST',
        body,
      })

      const token = response?.token?.trim()
      const secure = isSecureCookie(event)

      if (token) {
        setCookie(event, 'auth_token', encodeURIComponent(token), {
          path: '/',
          httpOnly: true,
          secure,
          sameSite: 'lax',
          maxAge: 60 * 60 * 8,
        })
      }
      else {
        clearLegacyClientCookie(event, secure)
      }

      return response
    }
    catch (error) {
      lastError = error
    }
  }

  const errorMessage = lastError instanceof Error ? lastError.message : 'fetch failed'

  throw createError({
    statusCode: 502,
    statusMessage: 'Upstream auth API unreachable.',
    message: errorMessage,
  })
})
