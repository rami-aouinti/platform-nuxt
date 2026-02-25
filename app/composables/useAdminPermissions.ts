import { useAuthStore } from '~/stores/auth'
import {
  canAccessAdmin,
  canManageApiKeys,
  canManageUsers,
  isRoot,
} from '~/utils/permissions/admin'

export function useAdminPermissions() {
  const authStore = useAuthStore()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const rootOnly = computed(() => isRoot(authStore.roles))
  const adminOnly = computed(() => canAccessAdmin(authStore.roles))
  const authenticated = computed(() => isAuthenticated.value)

  const canListUsers = computed(() => canManageUsers(authStore.roles))
  const canEditUsers = computed(() => isRoot(authStore.roles))
  const canUseApiKeys = computed(() => canManageApiKeys(authStore.roles))

  return {
    rootOnly,
    adminOnly,
    authenticated,
    canListUsers,
    canEditUsers,
    canUseApiKeys,
  }
}
