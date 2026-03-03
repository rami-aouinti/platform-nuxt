import { createError, defineEventHandler, getRouterParam, type H3Event } from 'h3'
import { resolveAuthorizationHeader } from '../../../../../../utils/authorization'
import { requireAuthenticatedRequest } from '../../../../../../utils/require-auth'

function getMercurePublicUrl(event: H3Event): string {
  const config = useRuntimeConfig(event)
  const configuredPublicUrl = [
    config.mercurePublicUrl,
    config.public.mercurePublicUrl,
  ].find((value): value is string => typeof value === 'string' && value.trim().length > 0)

  if (!configuredPublicUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Mercure configuration missing.',
      message: 'Mercure public URL is not configured.',
    })
  }

  return configuredPublicUrl.trim()
}

export default defineEventHandler(async (event) => {
  requireAuthenticatedRequest(event)

  const conversationId = getRouterParam(event, 'id')

  if (!conversationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid conversation id.',
      message: 'Conversation id is required.',
    })
  }

  const authorization = resolveAuthorizationHeader(event)

  if (!authorization) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized.',
      message: 'Bearer token requis pour souscrire au flux Mercure.',
    })
  }

  const mercureUrl = new URL(getMercurePublicUrl(event))
  mercureUrl.searchParams.append('topic', `/conversations/${conversationId}`)

  const upstreamResponse = await fetch(mercureUrl.toString(), {
    method: 'GET',
    headers: {
      authorization,
      accept: 'text/event-stream',
      'cache-control': 'no-cache',
    },
  })

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    const errorPayload = await upstreamResponse.text().catch(() => '')

    throw createError({
      statusCode: upstreamResponse.status || 502,
      statusMessage: upstreamResponse.statusText || 'Mercure connection failed.',
      message: errorPayload || 'Impossible d’ouvrir le flux Mercure.',
    })
  }

  const responseHeaders = new Headers()
  responseHeaders.set('content-type', upstreamResponse.headers.get('content-type') ?? 'text/event-stream')
  responseHeaders.set('cache-control', upstreamResponse.headers.get('cache-control') ?? 'no-cache')
  responseHeaders.set('connection', 'keep-alive')

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  })
})
