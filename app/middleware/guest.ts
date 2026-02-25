import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  const { isAuthenticated } = storeToRefs(authStore)

  if (isAuthenticated.value) {
    return navigateTo('/homepage')
  }
})
