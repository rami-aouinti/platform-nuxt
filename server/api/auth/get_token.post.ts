export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string, password?: string }>(event)

  if (!body?.username || !body?.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing credentials.',
    })
  }

  const config = useRuntimeConfig(event)

  const upstreamCandidates = [
    config.authApiBase,
    config.public.authApiBase,
    'http://host.docker.internal',
    'http://localhost',
  ].filter((value, index, values): value is string => {
    return Boolean(value) && values.indexOf(value) === index
  })

  let lastError: unknown

  for (const baseURL of upstreamCandidates) {
    try {
      return await $fetch<{ token?: string }>('/api/v1/auth/get_token', {
        baseURL,
        method: 'POST',
        body,
      })
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
