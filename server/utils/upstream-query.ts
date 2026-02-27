function parseOrderExpression(value: string) {
  const separatorIndex = value.lastIndexOf(':')
  if (separatorIndex <= 0 || separatorIndex >= value.length - 1) {
    return null
  }

  const field = value.slice(0, separatorIndex).trim()
  const direction = value.slice(separatorIndex + 1).trim().toLowerCase()

  if (!field || (direction !== 'asc' && direction !== 'desc')) {
    return null
  }

  return { field, direction }
}

export function appendUpstreamQueryParam(searchParams: URLSearchParams, key: string, rawValue: unknown) {
  if (rawValue === undefined || rawValue === null) {
    return
  }

  const value = String(rawValue)

  if (key === 'order') {
    const parsedOrder = parseOrderExpression(value)
    if (parsedOrder) {
      searchParams.set(`order[${parsedOrder.field}]`, parsedOrder.direction)
      return
    }
  }

  searchParams.set(key, value)
}

export function buildQuerySuffixFromQuery(
  query: Record<string, unknown>,
) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        appendUpstreamQueryParam(searchParams, key, item)
      }
      continue
    }

    appendUpstreamQueryParam(searchParams, key, value)
  }

  const suffix = searchParams.toString()
  return suffix ? `?${suffix}` : ''
}
