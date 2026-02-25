import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from '../http/client'
import type {
  CountResponse,
  Id,
  PaginatedResponse,
  PaginationQuery,
  PatchPayload,
} from './_shared'

const ROLES_BASE_PATH = '/api/v1/admin/roles'

export interface Role {
  id: Id
  label: string
  description?: string
  permissions?: string[]
}

export interface CreateRoleRequest {
  label: string
  description?: string
  permissions?: string[]
}

export interface UpdateRoleRequest {
  label?: string
  description?: string
  permissions?: string[]
}

export type PatchRoleRequest = PatchPayload

export const rolesService = {
  list(query: PaginationQuery = {}) {
    return httpGet<PaginatedResponse<Role>>(ROLES_BASE_PATH, { query })
  },
  count() {
    return httpGet<CountResponse>(`${ROLES_BASE_PATH}/count`)
  },
  ids() {
    return httpGet<Id[]>(`${ROLES_BASE_PATH}/ids`)
  },
  getById(id: Id) {
    return httpGet<Role>(`${ROLES_BASE_PATH}/${id}`)
  },
  create(payload: CreateRoleRequest) {
    return httpPost<Role, CreateRoleRequest>(ROLES_BASE_PATH, payload)
  },
  update(id: Id, payload: UpdateRoleRequest) {
    return httpPut<Role, UpdateRoleRequest>(`${ROLES_BASE_PATH}/${id}`, payload)
  },
  patch(id: Id, payload: PatchRoleRequest) {
    return httpPatch<Role, PatchRoleRequest>(`${ROLES_BASE_PATH}/${id}`, payload)
  },
  remove(id: Id) {
    return httpDelete<unknown>(`${ROLES_BASE_PATH}/${id}`)
  },
}
