export type NormalizedListResponse<T = unknown> = {
  data: T[]
  total?: number
}

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return undefined
}

export function normalizeListResponse<T = unknown>(payload: unknown): NormalizedListResponse<T> {
  if (Array.isArray(payload)) {
    return {
      data: payload as T[],
      total: payload.length,
    }
  }

  if (!payload || typeof payload !== 'object') {
    return { data: [] }
  }

  const record = payload as Record<string, unknown>
  const data = Array.isArray(record.data)
    ? (record.data as T[])
    : Array.isArray(record.items)
      ? (record.items as T[])
      : Array.isArray(record['hydra:member'])
        ? (record['hydra:member'] as T[])
        : []

  const total = toOptionalNumber(
    record.total
    ?? record.count
    ?? (record.meta as Record<string, unknown> | undefined)?.total
    ?? (record.meta as Record<string, unknown> | undefined)?.totalItems
    ?? record['hydra:totalItems'],
  )

  return {
    data,
    total,
  }
}
