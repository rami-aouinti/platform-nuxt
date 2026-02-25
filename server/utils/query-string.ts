import type { H3Event } from 'h3'

export function buildQuerySuffix(event: H3Event) {
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
  return suffix ? `?${suffix}` : ''
}
