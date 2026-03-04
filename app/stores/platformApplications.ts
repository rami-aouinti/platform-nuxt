import {
  type PlatformApplication,
  usePlatformApplicationsApi,
} from '~/composables/api/usePlatformApplicationsApi'
import { Notify } from '~/stores/notification'

function mergeApplications(
  allApplications: PlatformApplication[],
  profileApplications: PlatformApplication[],
) {
  const profileById = new Map(profileApplications.map(application => [application.id, application]))

  return allApplications.map((application) => {
    const profileApplication = profileById.get(application.id)

    if (!profileApplication) {
      return {
        ...application,
        userApplicationId: null,
        enabled: null,
      }
    }

    return {
      ...application,
      userApplicationId: profileApplication.userApplicationId,
      enabled: profileApplication.enabled,
      active: profileApplication.active,
    }
  })
}

export const usePlatformApplicationsStore = defineStore('platformApplications', () => {
  const api = usePlatformApplicationsApi()

  const applications = ref<PlatformApplication[]>([])
  const loading = ref(false)
  const actionLoadingId = ref<string | null>(null)

  async function fetchApplications() {
    loading.value = true

    try {
      const [allApplications, profileApplications] = await Promise.all([
        api.listAll(),
        api.listProfile(),
      ])

      applications.value = mergeApplications(allApplications, profileApplications)
    }
    catch (error) {
      Notify.error(error)
    }
    finally {
      loading.value = false
    }
  }

  async function installApplication(id: string) {
    actionLoadingId.value = id

    try {
      const updated = await api.attach(id)
      const index = applications.value.findIndex(application => application.id === id)

      if (index >= 0) {
        applications.value[index] = {
          ...applications.value[index],
          userApplicationId: updated.userApplicationId,
          enabled: updated.enabled,
          active: updated.active,
        }
      }

      Notify.success('Application installée avec succès')
    }
    catch (error) {
      Notify.error(error)
    }
    finally {
      actionLoadingId.value = null
    }
  }

  async function uninstallApplication(id: string) {
    actionLoadingId.value = id

    try {
      await api.detach(id)
      await fetchApplications()
      Notify.success('Application désinstallée avec succès')
    }
    catch (error) {
      Notify.error(error)
    }
    finally {
      actionLoadingId.value = null
    }
  }

  return {
    applications,
    loading,
    actionLoadingId,
    fetchApplications,
    installApplication,
    uninstallApplication,
  }
})
