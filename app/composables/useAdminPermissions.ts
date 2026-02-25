import { useAuthStore } from '~/stores/auth'

const ROOT_ROLE = 'ROLE_ROOT'
const ADMIN_ROLE = 'ROLE_ADMIN'

function hasRole(roles: string[], role: string) {
  return roles.includes(role)
}

export function useAdminPermissions() {
  const authStore = useAuthStore()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isRoot = computed(() => hasRole(authStore.roles, ROOT_ROLE))
  const isAdmin = computed(() => hasRole(authStore.roles, ADMIN_ROLE))

  const rootOnly = computed(() => isRoot.value)
  const adminOnly = computed(() => isRoot.value || isAdmin.value)
  const authenticated = computed(() => isAuthenticated.value)

  const canListUsers = computed(() => adminOnly.value)
  const canEditUsers = computed(() => rootOnly.value)

  return {
    rootOnly,
    adminOnly,
    authenticated,
    canListUsers,
    canEditUsers,
  }
}
