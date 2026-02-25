import type { H3Event } from 'h3'

function decodeTokenFromCookie(rawToken: string) {
  try {
    return decodeURIComponent(rawToken)
  }
  catch {
    return rawToken
  }
}

export function resolveAuthorizationHeader(event: H3Event) {
  const authorization = getHeader(event, 'authorization')

  if (authorization && authorization.trim().length > 0) {
    return authorization
  }

  const tokenFromCookie = getCookie(event, 'auth_token')

  if (tokenFromCookie && tokenFromCookie.trim().length > 0) {
    return `Bearer ${decodeTokenFromCookie(tokenFromCookie)}`
  }

  return undefined
}
