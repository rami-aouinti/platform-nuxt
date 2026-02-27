import { apiRequest, type ApiListQuery, type Id } from './httpUiErrors'
import type { CreateSprintPayload, CrmSprint } from './useCrmApi'

export type UpdateSprintPayload = Partial<CreateSprintPayload> & {
  name: string
  company: string
}

export type PatchSprintPayload = Partial<UpdateSprintPayload>

export function useSprintsApi() {
  const basePath = '/api/v1/sprints'

  return {
    list: (query?: ApiListQuery) =>
      apiRequest<CrmSprint[] | { data?: CrmSprint[]; items?: CrmSprint[]; meta?: { total?: number } }>('GET', basePath, { query }),
    get: (id: Id) => apiRequest<CrmSprint>('GET', `${basePath}/${id}`),
    create: (payload: CreateSprintPayload) => apiRequest<CrmSprint>('POST', basePath, { body: payload }),
    update: (id: Id, payload: UpdateSprintPayload) => apiRequest<CrmSprint>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: PatchSprintPayload) => apiRequest<CrmSprint>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
  }
}
