import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  try {
    await authStore.ensureRolesLoaded()
  } catch {
    return navigateTo('/403?reason=error')
  }

  if (!authStore.hasAdminAccess) {
    return navigateTo('/403?reason=unauthorized')
  }
})
