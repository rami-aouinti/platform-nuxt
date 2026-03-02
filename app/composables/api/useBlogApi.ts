import { apiRequest, normalizePaginatedResponse, type ApiListQuery, type ApiListResponse, type Id, type PaginatedResponse } from './httpUiErrors'
import type { BlogCommentWritePayload, BlogPostWritePayload } from '~/types/write-contract'

type JsonRecord = Record<string, unknown>

type BlogUserRef = {
  id: Id
  username?: string
  firstName?: string
  lastName?: string
  email?: string
}

type BlogCompanyRef = {
  id: Id
  legalName?: string
  name?: string
}

type BlogPostRef = {
  id: Id
  title?: string
}

export type BlogPost = {
  id: Id
  title?: string
  content?: string
  ownerId?: Id | null
  companyId?: Id | null
  owner?: BlogUserRef | null
  company?: BlogCompanyRef | null
}

export type BlogComment = {
  id: Id
  content?: string
  ownerId?: Id | null
  postId?: Id | null
  owner?: BlogUserRef | null
  post?: BlogPostRef | null
}

function normalizePage<T extends JsonRecord>(response: ApiListResponse<T>): PaginatedResponse<T> {
  return normalizePaginatedResponse(response)
}

function createEntityClient<TRead extends JsonRecord, TWrite extends JsonRecord>(basePath: string) {
  return {
    list: async (query?: ApiListQuery) =>
      normalizePage(await apiRequest<ApiListResponse<TRead>>('GET', basePath, { query })),
    get: (id: Id) => apiRequest<TRead>('GET', `${basePath}/${id}`),
    create: (payload: TWrite) => apiRequest<TRead>('POST', basePath, { body: payload }),
    update: (id: Id, payload: TWrite) => apiRequest<TRead>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: Partial<TWrite>) => apiRequest<TRead>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
  }
}

export function useBlogApi() {
  const posts = createEntityClient<BlogPost, BlogPostWritePayload>('/api/v1/blog-posts')
  const comments = createEntityClient<BlogComment, BlogCommentWritePayload>('/api/v1/blog-comments')
  const tags = createEntityClient<JsonRecord, JsonRecord>('/api/v1/blog-tags')
  const links = createEntityClient<JsonRecord, JsonRecord>('/api/v1/blog-post-links')

  return {
    posts,
    comments,
    tags,
    links,
    listTaskPosts: async (taskId: Id, query?: ApiListQuery) =>
      normalizePage(
        await apiRequest<ApiListResponse<BlogPost>>('GET', `/api/v1/tasks/${taskId}/blog-posts`, { query }),
      ),
    listTaskRequestPosts: async (taskRequestId: Id, query?: ApiListQuery) =>
      normalizePage(
        await apiRequest<ApiListResponse<BlogPost>>('GET', `/api/v1/task-requests/${taskRequestId}/blog-posts`, { query }),
      ),
  }
}
