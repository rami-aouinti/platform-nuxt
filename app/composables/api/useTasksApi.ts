import { apiRequest, type ApiListQuery, type Id, type PaginatedResponse } from './httpUiErrors'
import type { CreateTaskPayload, PatchTaskPayload, Task, UpdateTaskPayload } from '~/types/task-manager'

export function useTasksApi() {
  const basePath = '/api/v1/tasks'

  return {
    list: (query?: ApiListQuery) => apiRequest<PaginatedResponse<Task>>('GET', basePath, { query }),
    get: (id: Id) => apiRequest<Task>('GET', `${basePath}/${id}`),
    create: (payload: CreateTaskPayload) => apiRequest<Task>('POST', basePath, { body: payload }),
    update: (id: Id, payload: UpdateTaskPayload) => apiRequest<Task>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: PatchTaskPayload) => apiRequest<Task>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
    start: (id: Id) => apiRequest<Task>('PATCH', `${basePath}/${id}/start`),
    complete: (id: Id) => apiRequest<Task>('PATCH', `${basePath}/${id}/complete`),
    archive: (id: Id) => apiRequest<Task>('PATCH', `${basePath}/${id}/archive`),
    reopen: (id: Id) => apiRequest<Task>('PATCH', `${basePath}/${id}/reopen`),
  }
}
