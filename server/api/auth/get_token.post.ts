export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string, password?: string }>(event)

  if (!body?.username || !body?.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing credentials.',
    })
  }

  const config = useRuntimeConfig(event)

  return await $fetch<{ token?: string }>('/api/v1/auth/get_token', {
    baseURL: config.public.authApiBase,
    method: 'POST',
    body,
  })
})
