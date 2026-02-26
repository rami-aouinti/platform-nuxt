import { HttpRequestError, type HttpMethod, httpRequest } from '../../../services/http/client'

export type Id = string

export interface ApiListQuery {
  limit?: number
  offset?: number
  search?: string
  populate?: string[]
  order?: Record<string, 'asc' | 'desc'>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta?: {
    total?: number
    limit?: number
    offset?: number
    [key: string]: unknown
  }
}

export interface UiApiError {
  statusCode: number
  type: 'forbidden' | 'not-found' | 'validation' | 'server' | 'unknown'
  message: string
  fieldErrors: Record<string, string[]>
  details?: unknown
}

function normalizeListQuery(query: ApiListQuery = {}) {
  const normalized: Record<string, string | number | string[]> = {}

  if (query.limit !== undefined) {
    normalized.limit = query.limit
  }

  if (query.offset !== undefined) {
    normalized.offset = query.offset
  }

  if (query.search) {
    normalized.search = query.search
  }

  if (query.populate?.length) {
    normalized['populate[]'] = query.populate
  }

  if (query.order) {
    for (const [field, direction] of Object.entries(query.order)) {
      normalized[`order[${field}]`] = direction
    }
  }

  return normalized
}

function collectFieldErrors(details: unknown, parentKey?: string): Record<string, string[]> {
  if (!details) {
    return {}
  }

  if (typeof details === 'string') {
    return {
      [parentKey ?? 'general']: [details],
    }
  }

  if (Array.isArray(details)) {
    return details.reduce<Record<string, string[]>>((acc, detail) => {
      const next = collectFieldErrors(detail, parentKey)
      for (const [field, messages] of Object.entries(next)) {
        acc[field] = [...(acc[field] ?? []), ...messages]
      }
      return acc
    }, {})
  }

  if (typeof details !== 'object') {
    return {}
  }

  const objectDetails = details as Record<string, unknown>

  if (typeof objectDetails.field === 'string' && typeof objectDetails.message === 'string') {
    return {
      [objectDetails.field]: [objectDetails.message],
    }
  }

  return Object.entries(objectDetails).reduce<Record<string, string[]>>((acc, [key, value]) => {
    const nested = collectFieldErrors(value, key)

    for (const [field, messages] of Object.entries(nested)) {
      acc[field] = [...(acc[field] ?? []), ...messages]
    }

    return acc
  }, {})
}

export function toUiApiError(errorValue: unknown): UiApiError {
  if (!(errorValue instanceof HttpRequestError)) {
    return {
      statusCode: 0,
      type: 'unknown',
      message: errorValue instanceof Error ? errorValue.message : 'Une erreur inconnue est survenue.',
      fieldErrors: {},
      details: errorValue,
    }
  }

  if (errorValue.statusCode === 403) {
    return {
      statusCode: 403,
      type: 'forbidden',
      message: 'Vous n\'avez pas les droits pour effectuer cette action.',
      fieldErrors: {},
      details: errorValue.details,
    }
  }

  if (errorValue.statusCode === 404) {
    return {
      statusCode: 404,
      type: 'not-found',
      message: 'La ressource demandée est introuvable.',
      fieldErrors: {},
      details: errorValue.details,
    }
  }

  if (errorValue.statusCode === 422) {
    return {
      statusCode: 422,
      type: 'validation',
      message: 'Les données envoyées sont invalides.',
      fieldErrors: collectFieldErrors(errorValue.details),
      details: errorValue.details,
    }
  }

  if (errorValue.statusCode >= 500) {
    return {
      statusCode: errorValue.statusCode,
      type: 'server',
      message: 'Une erreur serveur est survenue. Veuillez réessayer plus tard.',
      fieldErrors: {},
      details: errorValue.details,
    }
  }

  return {
    statusCode: errorValue.statusCode,
    type: 'unknown',
    message: errorValue.message,
    fieldErrors: {},
    details: errorValue.details,
  }
}

export async function apiRequest<T>(method: HttpMethod, path: string, options: { query?: ApiListQuery; body?: unknown } = {}) {
  const headers = new Headers()
  headers.set('Content-Type', 'application/json')

  try {
    return await httpRequest<T>(method, path, {
      headers,
      ...(options.query ? { query: normalizeListQuery(options.query) } : {}),
      ...(options.body !== undefined ? { body: options.body } : {}),
    })
  } catch (errorValue) {
    throw toUiApiError(errorValue)
  }
}
