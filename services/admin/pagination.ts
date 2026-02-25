export interface PaginatedMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta?: PaginatedMeta
}

interface LegacyPaginatedResponse<T> {
  data?: T[]
  items?: T[]
  total?: number
  totalItems?: number
}

export function normalizePaginatedResponse<TItem>(
  response: PaginatedResponse<TItem> | LegacyPaginatedResponse<TItem> | TItem[],
): PaginatedResponse<TItem> {
  if (Array.isArray(response)) {
    return {
      data: response,
      meta: {
        page: 1,
        pageSize: response.length,
        totalItems: response.length,
        totalPages: response.length ? 1 : 0,
      },
    }
  }

  const typedResponse = response as LegacyPaginatedResponse<TItem>
  const collection = typedResponse.data ?? typedResponse.items ?? []
  const totalItems = Number(
    typedResponse.totalItems ?? typedResponse.total ?? collection.length,
  )

  return {
    data: collection,
    meta: {
      page: 1,
      pageSize: collection.length,
      totalItems,
      totalPages: totalItems > 0 ? 1 : 0,
    },
  }
}
