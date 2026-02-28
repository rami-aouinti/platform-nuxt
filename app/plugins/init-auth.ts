import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async (nuxtApp) => {
  await nuxtApp.runWithContext(async () => {
    const authStore = useAuthStore()
    await authStore.initAuth()
  })
})
