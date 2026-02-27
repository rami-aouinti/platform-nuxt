import { apiRequest, normalizePaginatedResponse, type ApiListQuery, type ApiListResponse, type Id } from './httpUiErrors'
import type { Company } from '~/types/crm'

export type CreateCompanyPayload = {
  name: string
  description?: string
}

export type UpdateCompanyPayload = CreateCompanyPayload
export type PatchCompanyPayload = Partial<UpdateCompanyPayload>

export function useCompaniesApi() {
  const basePath = '/api/v1/companies'

  return {
    list: async (query?: ApiListQuery) =>
      normalizePaginatedResponse(await apiRequest<ApiListResponse<Company>>('GET', basePath, { query })),
    get: (id: Id) => apiRequest<Company>('GET', `${basePath}/${id}`),
    create: (payload: CreateCompanyPayload) => apiRequest<Company>('POST', basePath, { body: payload }),
    update: (id: Id, payload: UpdateCompanyPayload) => apiRequest<Company>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: PatchCompanyPayload) => apiRequest<Company>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
  }
}
