import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from '../http/client'
import type {
  CountResponse,
  Id,
  PaginatedResponse,
  PaginationQuery,
  PatchPayload,
} from './_shared'

const COMPANIES_BASE_PATH = '/api/v1/admin/companies'

export interface Company {
  id: Id
  name: string
  legalName?: string
  vatNumber?: string
  status?: 'active' | 'inactive'
}

export interface CreateCompanyRequest {
  name: string
  legalName?: string
  vatNumber?: string
}

export interface UpdateCompanyRequest {
  name?: string
  legalName?: string
  vatNumber?: string
  status?: 'active' | 'inactive'
}

export type PatchCompanyRequest = PatchPayload

export const companiesService = {
  list(query: PaginationQuery = {}) {
    return httpGet<PaginatedResponse<Company>>(COMPANIES_BASE_PATH, { query })
  },
  count() {
    return httpGet<CountResponse>(`${COMPANIES_BASE_PATH}/count`)
  },
  ids() {
    return httpGet<Id[]>(`${COMPANIES_BASE_PATH}/ids`)
  },
  getById(id: Id) {
    return httpGet<Company>(`${COMPANIES_BASE_PATH}/${id}`)
  },
  create(payload: CreateCompanyRequest) {
    return httpPost<Company, CreateCompanyRequest>(COMPANIES_BASE_PATH, payload)
  },
  update(id: Id, payload: UpdateCompanyRequest) {
    return httpPut<Company, UpdateCompanyRequest>(`${COMPANIES_BASE_PATH}/${id}`, payload)
  },
  patch(id: Id, payload: PatchCompanyRequest) {
    return httpPatch<Company, PatchCompanyRequest>(`${COMPANIES_BASE_PATH}/${id}`, payload)
  },
  remove(id: Id) {
    return httpDelete<unknown>(`${COMPANIES_BASE_PATH}/${id}`)
  },
}
