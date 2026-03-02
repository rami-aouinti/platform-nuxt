import type { H3Event } from 'h3'

function isSecureCookie(event: H3Event) {
  const forwardedProto = getHeader(event, 'x-forwarded-proto')

  if (forwardedProto) {
    return forwardedProto.split(',')[0]?.trim().toLowerCase() === 'https'
  }

  const host = getHeader(event, 'host') ?? ''
  return !host.includes('localhost') && !host.includes('127.0.0.1')
}

export default defineEventHandler((event) => {
  const secure = isSecureCookie(event)

  deleteCookie(event, 'auth_token', {
    path: '/',
    sameSite: 'lax',
    secure,
    maxAge: 0,
  })

  return {
    ok: true,
  }
})
