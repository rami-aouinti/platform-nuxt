export const ROOT_ROLE = 'ROLE_ROOT'
export const ADMIN_ROLE = 'ROLE_ADMIN'

export type RolesInput = string[] | null | undefined
export type AdminPermission = 'admin' | 'manageUsers' | 'manageApiKeys'

function hasRole(roles: RolesInput, role: string) {
  return Array.isArray(roles) && roles.includes(role)
}

export function isRoot(roles: RolesInput) {
  return hasRole(roles, ROOT_ROLE)
}

export function isAdmin(roles: RolesInput) {
  return isRoot(roles) || hasRole(roles, ADMIN_ROLE)
}

export function canManageUsers(roles: RolesInput) {
  return isAdmin(roles)
}

export function canManageApiKeys(roles: RolesInput) {
  return isRoot(roles)
}

export function canAccessAdmin(roles: RolesInput) {
  return isAdmin(roles)
}

export function hasAdminPermission(
  roles: RolesInput,
  permission: AdminPermission = 'admin',
) {
  switch (permission) {
    case 'manageApiKeys':
      return canManageApiKeys(roles)
    case 'manageUsers':
      return canManageUsers(roles)
    case 'admin':
    default:
      return canAccessAdmin(roles)
  }
}

export function getPermissionDeniedMessage(permission: AdminPermission = 'admin') {
  if (permission === 'manageApiKeys') {
    return 'Accès refusé : cette action est réservée aux utilisateurs ROLE_ROOT.'
  }

  if (permission === 'manageUsers') {
    return 'Accès refusé : vous devez être ROLE_ADMIN ou ROLE_ROOT.'
  }

  return 'Accès refusé : vous ne disposez pas des permissions nécessaires.'
}
