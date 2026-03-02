import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { Notify } from '~/stores/notification'

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  const { isAuthenticated } = storeToRefs(authStore)

  if (!isAuthenticated.value) {
    Notify.error(String(useNuxtApp().$i18n.t('notifications.ui.authRequired')))
    return navigateTo('/login')
  }
})
