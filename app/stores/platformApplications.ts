import {
  type PlatformApplication,
  usePlatformApplicationsApi,
} from '~/composables/api/usePlatformApplicationsApi'
import { Notify } from '~/stores/notification'

export const usePlatformApplicationsStore = defineStore('platformApplications', () => {
  const api = usePlatformApplicationsApi()

  const applications = ref<PlatformApplication[]>([])
  const loading = ref(false)

  async function fetchApplications() {
    loading.value = true

    try {
      const userApplications = await api.listUserApplications()
      applications.value = userApplications.filter(application => application.owner)
    }
    catch (error) {
      Notify.error(error)
    }
    finally {
      loading.value = false
    }
  }

  return {
    applications,
    loading,
    fetchApplications,
  }
})
