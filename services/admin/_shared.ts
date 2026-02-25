import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from '../http/client'

export type Id = string

export type SortOrder = 'asc' | 'desc'

export interface ListQuery {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: SortOrder
  filters?: Record<string, string | number | boolean | null | undefined>
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
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    filters = {},
  } = query

  return {
    ...(page ? { page } : {}),
    ...(pageSize ? { pageSize } : {}),
    ...(search ? { search } : {}),
    ...(sortBy ? { sortBy } : {}),
    ...(sortOrder ? { sortOrder } : {}),
    ...filters,
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
