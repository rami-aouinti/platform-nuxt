export type NormalizeListResult<T = unknown> = {
  rows: T[]
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

export function normalizeListResponse<T = unknown>(payload: unknown): NormalizeListResult<T> {
  if (Array.isArray(payload)) {
    return { rows: payload as T[], total: payload.length }
  }

  if (!payload || typeof payload !== 'object') {
    return { rows: [] }
  }

  const record = payload as Record<string, unknown>
  const rows = Array.isArray(record.data)
    ? (record.data as T[])
    : Array.isArray(record.items)
      ? (record.items as T[])
      : Array.isArray(record['hydra:member'])
        ? (record['hydra:member'] as T[])
        : []

  const meta = record.meta as Record<string, unknown> | undefined
  const total = toOptionalNumber(record.total ?? record.count ?? meta?.total ?? meta?.totalItems ?? record['hydra:totalItems'])

  return { rows, total }
}
