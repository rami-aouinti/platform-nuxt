import {
  type PlatformApplication,
  usePlatformApplicationsApi,
} from '~/composables/api/usePlatformApplicationsApi'
import { Notify } from '~/stores/notification'
import { readSessionCache, writeSessionCache } from '~/utils/session-cache'

const PLATFORM_APPLICATIONS_CACHE_KEY = 'platform_applications'
const PLATFORM_APPLICATIONS_CACHE_MAX_AGE_MS = 5 * 60 * 1000

export const usePlatformApplicationsStore = defineStore('platformApplications', () => {
  const api = usePlatformApplicationsApi()

  const applications = ref<PlatformApplication[]>([])
  const loading = ref(false)

  async function fetchApplications(options: { force?: boolean } = {}) {
    const shouldUseCache = !options.force

    if (shouldUseCache) {
      const cachedApplications = readSessionCache<PlatformApplication[]>(
        PLATFORM_APPLICATIONS_CACHE_KEY,
        PLATFORM_APPLICATIONS_CACHE_MAX_AGE_MS,
      )

      if (cachedApplications) {
        applications.value = cachedApplications
        return cachedApplications
      }
    }

    loading.value = true

    try {
      const userApplications = await api.listUserApplications()
      applications.value = userApplications.filter(application => application.owner)
      writeSessionCache(PLATFORM_APPLICATIONS_CACHE_KEY, applications.value)
      return applications.value
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
