import { createAdminCrudService, type Id, type PatchPayload } from '../shared/index'

const COMPANIES_BASE_PATH = '/api/v1/admin/companies'

export interface Company {
  id: Id
  legalName: string
  status: 'active' | 'suspended' | 'inactive'
  mainAddress: unknown[]
  owner: {
    id: Id
    username?: string | null
    firstName?: string | null
    lastName?: string | null
    email?: string | null
  } | null
  photoUrl?: string | null
  photoMediaId?: Id | null
  photo?: string | null
  image?: string | null
}

export interface CreateCompanyRequest {
  legalName: string
  status: Company['status']
  mainAddress?: unknown[]
}

export interface UpdateCompanyRequest {
  legalName?: string
  status?: Company['status']
  mainAddress?: unknown[]
}

export type PatchCompanyRequest = PatchPayload

export const companiesService = createAdminCrudService<
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  PatchCompanyRequest
>(COMPANIES_BASE_PATH)
