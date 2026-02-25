export type Id = string

export interface PaginationQuery {
  page?: number
  pageSize?: number
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
