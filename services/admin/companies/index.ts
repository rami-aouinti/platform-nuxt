import { createAdminCrudService, type Id, type PatchPayload } from '../shared/index'

const COMPANIES_BASE_PATH = '/api/v1/companies'

export interface Company {
  id: Id
  legalName: string
  slug: string
  status: 'active' | 'suspended' | 'inactive'
  mainAddress: string
  owner: string
}

export interface CreateCompanyRequest {
  legalName: string
  slug: string
  status: Company['status']
  mainAddress: string
}

export interface UpdateCompanyRequest {
  legalName?: string
  slug?: string
  status?: Company['status']
  mainAddress?: string
}

export type PatchCompanyRequest = PatchPayload

export const companiesService = createAdminCrudService<
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  PatchCompanyRequest
>(COMPANIES_BASE_PATH)
