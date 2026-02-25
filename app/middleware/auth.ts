import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  const { isAuthenticated } = storeToRefs(authStore)

  if (!isAuthenticated.value) {
    Notify.error('You need to log in to view this page')
    return navigateTo('/login')
  }
})
