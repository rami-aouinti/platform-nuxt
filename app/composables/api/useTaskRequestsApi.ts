import { apiRequest, type ApiListQuery, type Id, type PaginatedResponse } from './httpUiErrors'
import type {
  CreateTaskRequestPayload,
  PatchTaskRequestPayload,
  TaskRequest,
  UpdateTaskRequestPayload,
} from '~/types/task-manager'

const basePath = '/api/v1/task-requests'

export function useTaskRequestsApi() {
  return {
    list: (query?: ApiListQuery) => apiRequest<PaginatedResponse<TaskRequest>>('GET', basePath, { query }),
    get: (id: Id) => apiRequest<TaskRequest>('GET', `${basePath}/${id}`),
    create: (payload: CreateTaskRequestPayload) => apiRequest<TaskRequest>('POST', basePath, { body: payload }),
    update: (id: Id, payload: UpdateTaskRequestPayload) => apiRequest<TaskRequest>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: PatchTaskRequestPayload) => apiRequest<TaskRequest>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),

    approve: (id: Id) => apiRequest<TaskRequest>('PATCH', `${basePath}/${id}/approve`),
    reject: (id: Id) => apiRequest<TaskRequest>('PATCH', `${basePath}/${id}/reject`),
    cancel: (id: Id) => apiRequest<TaskRequest>('PATCH', `${basePath}/${id}/cancel`),
  }
}
