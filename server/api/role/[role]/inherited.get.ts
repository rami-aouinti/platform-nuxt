import { proxyAuthApiGet } from '../../../utils/auth-api-proxy'

const UUID_PATTERN =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/

export default defineEventHandler(async (event) => {
  const role = getRouterParam(event, 'role')

  if (!role || !UUID_PATTERN.test(role)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid role parameter.',
      message: 'Role must be a valid UUID.',
    })
  }

  return await proxyAuthApiGet(
    event,
    `/api/v1/role/${encodeURIComponent(role)}/inherited`,
  )
})
