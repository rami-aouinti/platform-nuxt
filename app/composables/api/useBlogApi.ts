import { apiRequest, normalizePaginatedResponse, type ApiListQuery, type ApiListResponse, type Id, type PaginatedResponse } from './httpUiErrors'

type JsonRecord = Record<string, unknown>

function normalizePage<T extends JsonRecord>(response: ApiListResponse<T>): PaginatedResponse<T> {
  return normalizePaginatedResponse(response)
}

function createEntityClient<T extends JsonRecord>(basePath: string) {
  return {
    list: async (query?: ApiListQuery) =>
      normalizePage(await apiRequest<ApiListResponse<T>>('GET', basePath, { query })),
    get: (id: Id) => apiRequest<T>('GET', `${basePath}/${id}`),
    create: (payload: JsonRecord) => apiRequest<T>('POST', basePath, { body: payload }),
    update: (id: Id, payload: JsonRecord) => apiRequest<T>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: JsonRecord) => apiRequest<T>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
  }
}

export function useBlogApi() {
  const posts = createEntityClient<JsonRecord>('/api/v1/blog-posts')
  const comments = createEntityClient<JsonRecord>('/api/v1/blog-comments')
  const tags = createEntityClient<JsonRecord>('/api/v1/blog-tags')
  const links = createEntityClient<JsonRecord>('/api/v1/blog-post-links')

  return {
    posts,
    comments,
    tags,
    links,
    listTaskPosts: async (taskId: Id, query?: ApiListQuery) =>
      normalizePage(
        await apiRequest<ApiListResponse<JsonRecord>>('GET', `/api/v1/tasks/${taskId}/blog-posts`, { query }),
      ),
    listTaskRequestPosts: async (taskRequestId: Id, query?: ApiListQuery) =>
      normalizePage(
        await apiRequest<ApiListResponse<JsonRecord>>('GET', `/api/v1/task-requests/${taskRequestId}/blog-posts`, { query }),
      ),
  }
}
