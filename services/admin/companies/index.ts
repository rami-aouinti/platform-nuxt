import { createAdminCrudService, type Id, type PatchPayload } from '../_shared'

const COMPANIES_BASE_PATH = '/api/v1/companies'

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

export const companiesService = createAdminCrudService<
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  PatchCompanyRequest
>(COMPANIES_BASE_PATH)
