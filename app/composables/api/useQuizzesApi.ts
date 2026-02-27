import { apiRequest, type ApiListQuery, type Id, type PaginatedResponse } from './httpUiErrors'
import type { Quiz, QuizPayload } from '~/types/quiz'

export function useQuizzesApi() {
  const basePath = '/api/v1/quizzes'

  return {
    list: (query?: ApiListQuery) => apiRequest<PaginatedResponse<Quiz> | Quiz[]>('GET', basePath, { query }),
    get: (id: Id) => apiRequest<Quiz>('GET', `${basePath}/${id}`),
    create: (payload: QuizPayload) => apiRequest<Quiz>('POST', basePath, { body: payload }),
    update: (id: Id, payload: QuizPayload) => apiRequest<Quiz>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: Partial<QuizPayload>) => apiRequest<Quiz>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
  }
}
