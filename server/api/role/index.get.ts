import { proxyAuthApiGet } from '../../utils/auth-api-proxy'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item))
        }
      }
      continue
    }

    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value))
    }
  }

  const suffix = searchParams.toString()
  const path = suffix ? `/api/v1/role?${suffix}` : '/api/v1/role'

  return await proxyAuthApiGet(event, path)
})
