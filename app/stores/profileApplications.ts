import type { ProfileApplication } from '~/composables/api/useProfileApplicationsApi'
import { useProfileApplicationsApi } from '~/composables/api/useProfileApplicationsApi'
import { createCrudEntityStore } from '~/stores/_factories/createCrudEntityStore'
import { Notify } from '~/stores/notification'

type ProfileApplicationMutationPayload = {
  enabled: boolean
}

export const useProfileApplicationsStore = defineStore('profileApplications', () => {
  const api = useProfileApplicationsApi()

  return createCrudEntityStore<ProfileApplication, { id: string }, ProfileApplicationMutationPayload, Partial<ProfileApplicationMutationPayload>>({
    fetchRows: async () => {
      const data = await api.list()
      return { data, total: data.length }
    },
    fetchItem: async (id: string) => {
      const data = await api.list()
      const found = data.find(entry => entry.id === id)
      if (!found) throw new Error(`Profile application not found: ${id}`)
      return found
    },
    create: ({ id }) => api.activate(id),
    update: (id, payload) => payload.enabled ? api.activate(id) : api.deactivate(id),
    patch: (id, payload) => payload.enabled === false ? api.deactivate(id) : api.activate(id),
    remove: async (id) => { await api.deactivate(id) },
    applyUpdate: (entity, payload) => ({ ...entity, enabled: payload.enabled, active: payload.enabled }),
    applyPatch: (entity, payload) => ({ ...entity, enabled: payload.enabled ?? entity.enabled, active: payload.enabled ?? entity.active }),
    notifications: {
      success: {
        create: 'Application activée',
        update: 'Application mise à jour',
        patch: 'Application mise à jour',
        remove: 'Application désactivée',
      },
      notifySuccess: (message) => Notify.success(message),
      notifyError: (message) => Notify.error(message),
    },
  })
})
