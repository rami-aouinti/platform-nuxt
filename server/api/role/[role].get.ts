import { proxyAuthApiGet } from '../../utils/auth-api-proxy'

const ROLE_PATTERN = /^(?!count$|ids$|inherited$)[A-Za-z][A-Za-z0-9_-]*$/

export default defineEventHandler(async (event) => {
  const role = getRouterParam(event, 'role')

  if (!role || !ROLE_PATTERN.test(role)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid role parameter.',
      message: 'Role must match the allowed pattern and cannot be a reserved endpoint name.',
    })
  }

  return await proxyAuthApiGet(event, `/api/v1/role/${encodeURIComponent(role)}`)
})
