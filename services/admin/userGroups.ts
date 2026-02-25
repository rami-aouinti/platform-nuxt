import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from '../http/client'
import type {
  CountResponse,
  Id,
  PaginatedResponse,
  PaginationQuery,
  PatchPayload,
} from './_shared'

const USER_GROUPS_BASE_PATH = '/api/v1/admin/user-groups'

export interface UserGroup {
  id: Id
  name: string
  description?: string
  roleIds?: Id[]
}

export interface CreateUserGroupRequest {
  name: string
  description?: string
  roleIds?: Id[]
}

export interface UpdateUserGroupRequest {
  name?: string
  description?: string
  roleIds?: Id[]
}

export type PatchUserGroupRequest = PatchPayload

export const userGroupsService = {
  list(query: PaginationQuery = {}) {
    return httpGet<PaginatedResponse<UserGroup>>(USER_GROUPS_BASE_PATH, { query })
  },
  count() {
    return httpGet<CountResponse>(`${USER_GROUPS_BASE_PATH}/count`)
  },
  ids() {
    return httpGet<Id[]>(`${USER_GROUPS_BASE_PATH}/ids`)
  },
  getById(id: Id) {
    return httpGet<UserGroup>(`${USER_GROUPS_BASE_PATH}/${id}`)
  },
  create(payload: CreateUserGroupRequest) {
    return httpPost<UserGroup, CreateUserGroupRequest>(USER_GROUPS_BASE_PATH, payload)
  },
  update(id: Id, payload: UpdateUserGroupRequest) {
    return httpPut<UserGroup, UpdateUserGroupRequest>(`${USER_GROUPS_BASE_PATH}/${id}`, payload)
  },
  patch(id: Id, payload: PatchUserGroupRequest) {
    return httpPatch<UserGroup, PatchUserGroupRequest>(`${USER_GROUPS_BASE_PATH}/${id}`, payload)
  },
  remove(id: Id) {
    return httpDelete<unknown>(`${USER_GROUPS_BASE_PATH}/${id}`)
  },
}
