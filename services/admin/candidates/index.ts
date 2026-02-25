import { createAdminCrudService, type Id, type PatchPayload } from '../_shared'

const CANDIDATES_BASE_PATH = '/api/v1/admin/candidates'

export interface Candidate {
  id: Id
  firstName: string
  lastName: string
  email: string
  status?: 'new' | 'in_review' | 'accepted' | 'rejected'
  companyId?: Id
}

export interface CreateCandidateRequest {
  firstName: string
  lastName: string
  email: string
  companyId?: Id
}

export interface UpdateCandidateRequest {
  firstName?: string
  lastName?: string
  email?: string
  status?: Candidate['status']
  companyId?: Id
}

export type PatchCandidateRequest = PatchPayload

export const candidatesService = createAdminCrudService<
  Candidate,
  CreateCandidateRequest,
  UpdateCandidateRequest,
  PatchCandidateRequest
>(CANDIDATES_BASE_PATH)
