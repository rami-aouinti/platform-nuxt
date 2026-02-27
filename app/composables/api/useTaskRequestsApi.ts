import { apiRequest, normalizePaginatedResponse, type ApiListQuery, type ApiListResponse, type Id, type PaginatedResponse } from './httpUiErrors'
import {
  normalizeTaskRequest,
  type CreateTaskRequestPayload,
  type PatchTaskRequestPayload,
  type TaskRequest,
  type UpdateTaskRequestPayload,
} from '~/types/crm'

function normalizeTaskRequestPage(response: PaginatedResponse<TaskRequest>): PaginatedResponse<TaskRequest> {
  return {
    ...response,
    data: response.data.map(normalizeTaskRequest),
  }
}

export function useTaskRequestsApi() {
  const basePath = '/api/v1/task-requests'

  return {
    list: async (query?: ApiListQuery) =>
      normalizeTaskRequestPage(normalizePaginatedResponse(await apiRequest<ApiListResponse<TaskRequest>>('GET', basePath, { query }))),
    get: async (id: Id) => normalizeTaskRequest(await apiRequest<TaskRequest>('GET', `${basePath}/${id}`)),
    create: async (payload: CreateTaskRequestPayload) => normalizeTaskRequest(await apiRequest<TaskRequest>('POST', basePath, { body: payload })),
    update: async (id: Id, payload: UpdateTaskRequestPayload) => normalizeTaskRequest(await apiRequest<TaskRequest>('PUT', `${basePath}/${id}`, { body: payload })),
    patch: async (id: Id, payload: PatchTaskRequestPayload) => normalizeTaskRequest(await apiRequest<TaskRequest>('PATCH', `${basePath}/${id}`, { body: payload })),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),

    approve: async (id: Id) => normalizeTaskRequest(await apiRequest<TaskRequest>('PATCH', `${basePath}/${id}/approve`)),
    reject: async (id: Id) => normalizeTaskRequest(await apiRequest<TaskRequest>('PATCH', `${basePath}/${id}/reject`)),
    cancel: async (id: Id) => normalizeTaskRequest(await apiRequest<TaskRequest>('PATCH', `${basePath}/${id}/cancel`)),
  }
}
