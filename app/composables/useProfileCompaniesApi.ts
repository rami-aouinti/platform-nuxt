import { apiRequest, normalizePaginatedResponse, type ApiListQuery, type ApiListResponse, type Id } from '~/composables/api/httpUiErrors'

export type ProfileCompany = {
  id: Id
  name: string
  role?: string | null
  description?: string | null
  [key: string]: unknown
}

export type CreateProfileCompanyPayload = {
  name: string
  role?: string | null
  description?: string | null
  [key: string]: unknown
}

export type UpdateProfileCompanyPayload = CreateProfileCompanyPayload
export type PatchProfileCompanyPayload = Partial<UpdateProfileCompanyPayload>

export type ProfileCompanySchemaMethod = 'post' | 'put' | 'patch'

export type ProfileCompanySchema = {
  properties?: Record<string, {
    type?: string
    title?: string
    description?: string
    default?: unknown
    enum?: unknown[]
    [key: string]: unknown
  }>
  required?: string[]
  [key: string]: unknown
}

export function useProfileCompaniesApi() {
  const basePath = '/api/v1/me/profile/companies'

  return {
    list: async (query?: ApiListQuery) =>
      normalizePaginatedResponse(await apiRequest<ApiListResponse<ProfileCompany>>('GET', basePath, { query })),
    get: (id: Id) => apiRequest<ProfileCompany>('GET', `${basePath}/${id}`),
    create: (payload: CreateProfileCompanyPayload) => apiRequest<ProfileCompany>('POST', basePath, { body: payload }),
    update: (id: Id, payload: UpdateProfileCompanyPayload) => apiRequest<ProfileCompany>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: PatchProfileCompanyPayload) => apiRequest<ProfileCompany>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
    getSchema: (method: ProfileCompanySchemaMethod) =>
      apiRequest<ProfileCompanySchema>('GET', `${basePath}/schema/${method}`),
  }
}
