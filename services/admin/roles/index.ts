import { createAdminCrudService, type Id, type PatchPayload } from '../_shared'

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

export const rolesService = createAdminCrudService<
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  PatchRoleRequest
>(ROLES_BASE_PATH)
