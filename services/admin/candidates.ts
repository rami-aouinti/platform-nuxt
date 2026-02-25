import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from '../http/client'
import type {
  CountResponse,
  Id,
  PaginatedResponse,
  PaginationQuery,
  PatchPayload,
} from './_shared'

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

export const candidatesService = {
  list(query: PaginationQuery = {}) {
    return httpGet<PaginatedResponse<Candidate>>(CANDIDATES_BASE_PATH, { query })
  },
  count() {
    return httpGet<CountResponse>(`${CANDIDATES_BASE_PATH}/count`)
  },
  ids() {
    return httpGet<Id[]>(`${CANDIDATES_BASE_PATH}/ids`)
  },
  getById(id: Id) {
    return httpGet<Candidate>(`${CANDIDATES_BASE_PATH}/${id}`)
  },
  create(payload: CreateCandidateRequest) {
    return httpPost<Candidate, CreateCandidateRequest>(CANDIDATES_BASE_PATH, payload)
  },
  update(id: Id, payload: UpdateCandidateRequest) {
    return httpPut<Candidate, UpdateCandidateRequest>(`${CANDIDATES_BASE_PATH}/${id}`, payload)
  },
  patch(id: Id, payload: PatchCandidateRequest) {
    return httpPatch<Candidate, PatchCandidateRequest>(`${CANDIDATES_BASE_PATH}/${id}`, payload)
  },
  remove(id: Id) {
    return httpDelete<unknown>(`${CANDIDATES_BASE_PATH}/${id}`)
  },
}
