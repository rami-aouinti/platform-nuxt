import { defineEventHandler, getRequestURL, sendRedirect } from 'h3'

const LEGACY_ADMIN_PATH_RULES: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /^\/api\/user_group(?=\/|$)/, replacement: '/api/v1/admin/user-groups' },
  { pattern: /^\/api\/role(?=\/|$)/, replacement: '/api/v1/admin/roles' },
  { pattern: /^\/api\/user(?=\/|$)/, replacement: '/api/v1/admin/users' },
  { pattern: /^\/api\/api_key(?=\/|$)/, replacement: '/api/v1/admin/api-keys' },
  { pattern: /^\/api\/companies(?=\/|$)/, replacement: '/api/v1/admin/companies' },
  { pattern: /^\/api\/v1\/candidates(?=\/|$)/, replacement: '/api/v1/admin/candidates' },
  { pattern: /^\/api\/job-offers(?=\/|$)/, replacement: '/api/v1/admin/job-offers' },
  { pattern: /^\/api\/job-applications(?=\/|$)/, replacement: '/api/v1/admin/job-applications' },
  { pattern: /^\/api\/notifications(?=\/|$)/, replacement: '/api/v1/admin/notifications' },
]

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  for (const { pattern, replacement } of LEGACY_ADMIN_PATH_RULES) {
    if (!pattern.test(url.pathname)) {
      continue
    }

    const redirectedPath = url.pathname.replace(pattern, replacement)
    const target = `${redirectedPath}${url.search}`

    return await sendRedirect(event, target, 307)
  }
})
