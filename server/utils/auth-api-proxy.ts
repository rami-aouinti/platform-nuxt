import type { H3Event } from 'h3'

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
  const authorization = getHeader(event, 'authorization')
  const upstreamCandidates = getUpstreamCandidates(event)

  let lastError: unknown

  for (const baseURL of upstreamCandidates) {
    const targetURL = `${baseURL.replace(/\/$/, '')}${path}`

    try {
      const response = await fetch(targetURL, {
        method: 'GET',
        headers: authorization
          ? {
              authorization,
            }
          : undefined,
      })

      if (response.status === 401) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized.',
          message: 'Upstream auth API rejected the Authorization header.',
        })
      }

      if (!response.ok) {
        lastError = new Error(`Upstream responded with HTTP ${response.status}.`)
        continue
      }

      if (response.status === 204) {
        return null
      }

      const contentType = response.headers.get('content-type') ?? ''

      if (contentType.includes('application/json')) {
        return await response.json()
      }

      return await response.text()
    }
    catch (error) {
      if (isError(error) && error.statusCode === 401) {
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
