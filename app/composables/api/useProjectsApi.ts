import { apiRequest, normalizePaginatedResponse, type ApiListQuery, type ApiListResponse, type Id } from './httpUiErrors'
import type {
  CreateProjectPayload,
  PatchProjectPayload,
  Project,
  UpdateProjectPayload,
} from '~/types/crm'

export function useProjectsApi() {
  const basePath = '/api/v1/projects'

  return {
    list: async (query?: ApiListQuery) =>
      normalizePaginatedResponse(await apiRequest<ApiListResponse<Project>>('GET', basePath, { query })),
    get: (id: Id) => apiRequest<Project>('GET', `${basePath}/${id}`),
    create: (payload: CreateProjectPayload) => apiRequest<Project>('POST', basePath, { body: payload }),
    update: (id: Id, payload: UpdateProjectPayload) => apiRequest<Project>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: PatchProjectPayload) => apiRequest<Project>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
  }
}
