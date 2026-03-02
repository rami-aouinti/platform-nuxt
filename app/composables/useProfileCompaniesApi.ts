import { apiRequest, normalizePaginatedResponse, type ApiListQuery, type ApiListResponse, type Id } from '~/composables/api/httpUiErrors'
import { apiEndpoints } from '~/services/api/endpoints'

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
  const basePath = apiEndpoints.frontend.companies.base

  return {
    list: async (query?: ApiListQuery) =>
      normalizePaginatedResponse(await apiRequest<ApiListResponse<ProfileCompany>>('GET', basePath, { query })),
    get: (id: Id) => apiRequest<ProfileCompany>('GET', apiEndpoints.frontend.companies.companyById(id)),
    create: (payload: CreateProfileCompanyPayload) => apiRequest<ProfileCompany>('POST', basePath, { body: payload }),
    update: (id: Id, payload: UpdateProfileCompanyPayload) => apiRequest<ProfileCompany>('PUT', apiEndpoints.frontend.companies.companyById(id), { body: payload }),
    patch: (id: Id, payload: PatchProfileCompanyPayload) => apiRequest<ProfileCompany>('PATCH', apiEndpoints.frontend.companies.companyById(id), { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', apiEndpoints.frontend.companies.companyById(id)),
    getSchema: (method: ProfileCompanySchemaMethod) =>
      apiRequest<ProfileCompanySchema>('GET', apiEndpoints.frontend.companies.schemaByMethod(method)),
  }
}
