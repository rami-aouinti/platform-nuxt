import { createAdminCrudService, type Id, type PatchPayload } from '../_shared'

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

export const userGroupsService = createAdminCrudService<
  UserGroup,
  CreateUserGroupRequest,
  UpdateUserGroupRequest,
  PatchUserGroupRequest
>(USER_GROUPS_BASE_PATH)
