import { apiRequest, type ApiListQuery, type Id } from './httpUiErrors'
import type { CreateSprintPayload, Sprint } from '~/types/crm'

export type UpdateSprintPayload = Partial<CreateSprintPayload> & {
  name: string
  company: string
}

export type PatchSprintPayload = Partial<UpdateSprintPayload>

export function useSprintsApi() {
  const basePath = '/api/v1/sprints'

  return {
    list: (query?: ApiListQuery) =>
      apiRequest<Sprint[] | { data?: Sprint[]; items?: Sprint[]; meta?: { total?: number } }>('GET', basePath, { query }),
    get: (id: Id) => apiRequest<Sprint>('GET', `${basePath}/${id}`),
    create: (payload: CreateSprintPayload) => apiRequest<Sprint>('POST', basePath, { body: payload }),
    update: (id: Id, payload: UpdateSprintPayload) => apiRequest<Sprint>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: PatchSprintPayload) => apiRequest<Sprint>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
  }
}
