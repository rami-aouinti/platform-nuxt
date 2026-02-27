import { apiRequest, normalizePaginatedResponse, type ApiListQuery, type ApiListResponse, type Id, type PaginatedResponse } from './httpUiErrors'
import { normalizeTask, type CreateTaskPayload, type PatchTaskPayload, type Task, type UpdateTaskPayload } from '~/types/crm'

function normalizeTaskPage(response: PaginatedResponse<Task>): PaginatedResponse<Task> {
  return {
    ...response,
    data: response.data.map(normalizeTask),
  }
}

export function useTasksApi() {
  const basePath = '/api/v1/tasks'

  return {
    list: async (query?: ApiListQuery) =>
      normalizeTaskPage(normalizePaginatedResponse(await apiRequest<ApiListResponse<Task>>('GET', basePath, { query }))),
    get: async (id: Id) => normalizeTask(await apiRequest<Task>('GET', `${basePath}/${id}`)),
    create: async (payload: CreateTaskPayload) => normalizeTask(await apiRequest<Task>('POST', basePath, { body: payload })),
    update: async (id: Id, payload: UpdateTaskPayload) => normalizeTask(await apiRequest<Task>('PUT', `${basePath}/${id}`, { body: payload })),
    patch: async (id: Id, payload: PatchTaskPayload) => normalizeTask(await apiRequest<Task>('PATCH', `${basePath}/${id}`, { body: payload })),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
    start: async (id: Id) => normalizeTask(await apiRequest<Task>('PATCH', `${basePath}/${id}/start`)),
    complete: async (id: Id) => normalizeTask(await apiRequest<Task>('PATCH', `${basePath}/${id}/complete`)),
    archive: async (id: Id) => normalizeTask(await apiRequest<Task>('PATCH', `${basePath}/${id}/archive`)),
    reopen: async (id: Id) => normalizeTask(await apiRequest<Task>('PATCH', `${basePath}/${id}/reopen`)),
  }
}
