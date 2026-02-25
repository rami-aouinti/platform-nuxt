import type { H3Event } from 'h3'
import { resolveAuthorizationHeader } from './authorization'

export function requireAuthenticatedRequest(event: H3Event) {
  const authorization = resolveAuthorizationHeader(event)

  if (!authorization) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized.',
      message: 'IS_AUTHENTICATED_FULLY: Bearer token requis.',
    })
  }
}
