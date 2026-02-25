import { useAuthStore } from '~/stores/auth'
import { hasAdminPermission, type AdminPermission } from '~/utils/permissions/admin'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    const tokenCookie = useCookie<string | null>('auth_token')

    if (tokenCookie.value) {
      authStore.token = decodeURIComponent(tokenCookie.value)
    }
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  try {
    await authStore.ensureRolesLoaded()
  } catch {
    return navigateTo('/403?reason=error')
  }

  const requiredPermission = (to.meta?.adminPermission as AdminPermission | undefined) ?? 'admin'

  if (!hasAdminPermission(authStore.roles, requiredPermission)) {
    return navigateTo(`/403?reason=unauthorized&permission=${requiredPermission}`)
  }
})
