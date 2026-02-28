import { sendRedirect } from 'h3'
import { getLegacyRedirect } from '~/utils/legacy-migration/validatedRedirects'

export default defineEventHandler((event) => {
  const pathname = event.path.split('?')[0]
  if (!pathname.startsWith('/legacy/')) {
    return
  }

  const redirect = getLegacyRedirect(pathname)
  if (!redirect) {
    return
  }

  return sendRedirect(event, redirect.targetRoute, redirect.statusCode)
})
