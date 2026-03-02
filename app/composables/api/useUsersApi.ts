import { apiRequest, normalizePaginatedResponse, type ApiListQuery, type ApiListResponse, type Id } from './httpUiErrors'
import type { CrmUser } from './useCrmApi'

export type CreateUserPayload = Partial<CrmUser> & {
  username: string
  email?: string
  firstName?: string
  lastName?: string
}

export type UpdateUserPayload = CreateUserPayload
export type PatchUserPayload = Partial<UpdateUserPayload>

export function useUsersApi() {
  const basePath = '/api/v1/admin/users'

  return {
    list: async (query?: ApiListQuery) =>
      normalizePaginatedResponse(await apiRequest<ApiListResponse<CrmUser>>('GET', basePath, { query })),
    get: (id: Id) => apiRequest<CrmUser>('GET', `${basePath}/${id}`),
    create: (payload: CreateUserPayload) => apiRequest<CrmUser>('POST', basePath, { body: payload }),
    update: (id: Id, payload: UpdateUserPayload) => apiRequest<CrmUser>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: PatchUserPayload) => apiRequest<CrmUser>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
  }
}
