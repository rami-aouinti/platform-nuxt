import type { H3Event } from 'h3'

export function requireAuthenticatedRequest(event: H3Event) {
  const authorization = getHeader(event, 'authorization')

  if (!authorization || !authorization.trim().toLowerCase().startsWith('bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized.',
      message: 'IS_AUTHENTICATED_FULLY: Bearer token requis.',
    })
  }
}
