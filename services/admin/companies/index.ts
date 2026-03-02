import { createAdminCrudService, type Id, type PatchPayload } from '../shared/index'

const COMPANIES_BASE_PATH = '/api/v1/admin/companies'

export interface Company {
  id: Id
  legalName: string
  status: 'active' | 'suspended' | 'inactive'
  mainAddress: unknown[]
  ownerId?: Id | null
  owner: {
    id: Id
    username?: string | null
    firstName?: string | null
    lastName?: string | null
    email?: string | null
  } | null
  photoUrl?: string | null
  photoMediaId?: Id | null
}

export interface CreateCompanyRequest {
  legalName: string
  status: Company['status']
  mainAddress?: unknown[]
  ownerId?: Id
}

export interface UpdateCompanyRequest {
  legalName?: string
  status?: Company['status']
  mainAddress?: unknown[]
  ownerId?: Id
}

export type PatchCompanyRequest = PatchPayload

export const companiesService = createAdminCrudService<
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  PatchCompanyRequest
>(COMPANIES_BASE_PATH)
