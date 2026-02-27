import { apiRequest, normalizePaginatedResponse, type ApiListQuery, type ApiListResponse, type Id } from './httpUiErrors'
import type { Quiz, QuizPayload } from '~/types/quiz'

export function useQuizzesApi() {
  const basePath = '/api/v1/quizzes'

  return {
    list: async (query?: ApiListQuery) =>
      normalizePaginatedResponse(await apiRequest<ApiListResponse<Quiz>>('GET', basePath, { query })),
    get: (id: Id) => apiRequest<Quiz>('GET', `${basePath}/${id}`),
    create: (payload: QuizPayload) => apiRequest<Quiz>('POST', basePath, { body: payload }),
    update: (id: Id, payload: QuizPayload) => apiRequest<Quiz>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: Partial<QuizPayload>) => apiRequest<Quiz>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
  }
}
