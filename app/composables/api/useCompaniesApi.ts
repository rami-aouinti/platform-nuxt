import { apiRequest, type ApiListQuery, type Id, type PaginatedResponse } from './httpUiErrors'
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
    list: (query?: ApiListQuery) => apiRequest<PaginatedResponse<Company>>('GET', basePath, { query }),
    get: (id: Id) => apiRequest<Company>('GET', `${basePath}/${id}`),
    create: (payload: CreateCompanyPayload) => apiRequest<Company>('POST', basePath, { body: payload }),
    update: (id: Id, payload: UpdateCompanyPayload) => apiRequest<Company>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: PatchCompanyPayload) => apiRequest<Company>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
  }
}
