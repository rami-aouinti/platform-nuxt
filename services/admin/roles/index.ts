import { createAdminCrudService, type Id, type PatchPayload } from '../shared/index'

import { adminEndpoints } from '../endpoints'

const ROLES_BASE_PATH = adminEndpoints.roles.base

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

export const rolesService = createAdminCrudService<
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  PatchRoleRequest
>(ROLES_BASE_PATH)
