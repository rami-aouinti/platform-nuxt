import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from '../http/client'

export type Id = string

export type SortOrder = 'asc' | 'desc'

export type ListFilterValue = string | number | boolean | null | undefined

type LegacyFilters = Record<string, ListFilterValue>

export interface ListQuery {
  where?: Record<string, ListFilterValue>
  order?: string
  limit?: number
  offset?: number
  search?: string

  /**
   * Legacy params kept for backward compatibility.
   */
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: SortOrder
  filters?: LegacyFilters
}

export interface PaginatedResponse<T> {
  data: T[]
  meta?: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

export interface CountResponse {
  count: number
}

export interface PatchPayload {
  [key: string]: unknown
}

export interface BuildApiPlatformQueryInput {
  page: number
  pageSize: number
  search?: string
  sortBy?: string
  sortOrder?: SortOrder
  filters?: LegacyFilters
}

function cleanFilters(filters: LegacyFilters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

/**
 * Convention de query unifiée pour l'admin:
 * - pagination via `limit` et `offset`
 * - filtres via `where` JSON stringifié
 * - tri via `order` (`field:asc|desc`)
 * - recherche plein texte via `search`
 */
export function buildApiPlatformQuery(input: BuildApiPlatformQueryInput): ListQuery {
  const {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder = 'desc',
    filters = {},
  } = input

  const where = cleanFilters(filters)
  const trimmedSearch = search?.trim()

  return {
    limit: pageSize,
    offset: Math.max(page - 1, 0) * pageSize,
    search: trimmedSearch || undefined,
    where: Object.keys(where).length ? where : undefined,
    order: sortBy ? `${sortBy}:${sortOrder}` : undefined,
  }
}

export interface AdminCrudService<TItem, TCreate, TUpdate, TPatch extends PatchPayload> {
  list: (query?: ListQuery) => Promise<PaginatedResponse<TItem>>
  count: () => Promise<CountResponse>
  ids: () => Promise<Id[]>
  getById: (id: Id) => Promise<TItem>
  create: (payload: TCreate) => Promise<TItem>
  update: (id: Id, payload: TUpdate) => Promise<TItem>
  patch: (id: Id, payload: TPatch) => Promise<TItem>
  remove: (id: Id) => Promise<unknown>
}

export function normalizeListQuery(query: ListQuery = {}) {
  const {
    where,
    order,
    limit,
    offset,
    search,

    page,
    pageSize,
    sortBy,
    sortOrder,
    filters = {},
  } = query

  const resolvedLimit = limit ?? pageSize
  const resolvedOffset = offset ?? ((page && resolvedLimit) ? Math.max(page - 1, 0) * resolvedLimit : undefined)
  const resolvedOrder = order ?? (sortBy ? `${sortBy}:${sortOrder ?? 'asc'}` : undefined)

  const whereObject = {
    ...cleanFilters(filters),
    ...(where ?? {}),
  }

  const normalizedWhere = Object.keys(whereObject).length
    ? JSON.stringify(whereObject)
    : undefined

  return {
    ...(normalizedWhere ? { where: normalizedWhere } : {}),
    ...(resolvedOrder ? { order: resolvedOrder } : {}),
    ...(resolvedLimit ? { limit: resolvedLimit } : {}),
    ...(resolvedOffset !== undefined ? { offset: resolvedOffset } : {}),
    ...(search ? { search } : {}),
  }
}

export function createAdminCrudService<
  TItem,
  TCreate,
  TUpdate,
  TPatch extends PatchPayload,
>(basePath: string): AdminCrudService<TItem, TCreate, TUpdate, TPatch> {
  return {
    list(query: ListQuery = {}) {
      return httpGet<PaginatedResponse<TItem>>(basePath, {
        query: normalizeListQuery(query),
      })
    },
    count() {
      return httpGet<CountResponse>(`${basePath}/count`)
    },
    ids() {
      return httpGet<Id[]>(`${basePath}/ids`)
    },
    getById(id: Id) {
      return httpGet<TItem>(`${basePath}/${id}`)
    },
    create(payload: TCreate) {
      return httpPost<TItem, TCreate>(basePath, payload)
    },
    update(id: Id, payload: TUpdate) {
      return httpPut<TItem, TUpdate>(`${basePath}/${id}`, payload)
    },
    patch(id: Id, payload: TPatch) {
      return httpPatch<TItem, TPatch>(`${basePath}/${id}`, payload)
    },
    remove(id: Id) {
      return httpDelete<unknown>(`${basePath}/${id}`)
    },
  }
}
