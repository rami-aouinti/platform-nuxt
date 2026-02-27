import { apiRequest, type ApiListQuery, type Id, type PaginatedResponse } from './httpUiErrors'
import type {
  CreateProjectPayload,
  PatchProjectPayload,
  Project,
  UpdateProjectPayload,
} from '~/types/crm'

export function useProjectsApi() {
  const basePath = '/api/v1/projects'

  return {
    list: (query?: ApiListQuery) => apiRequest<PaginatedResponse<Project>>('GET', basePath, { query }),
    get: (id: Id) => apiRequest<Project>('GET', `${basePath}/${id}`),
    create: (payload: CreateProjectPayload) => apiRequest<Project>('POST', basePath, { body: payload }),
    update: (id: Id, payload: UpdateProjectPayload) => apiRequest<Project>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: PatchProjectPayload) => apiRequest<Project>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
  }
}
