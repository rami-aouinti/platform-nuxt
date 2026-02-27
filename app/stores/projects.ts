import { useProjectsApi } from '~/composables/api/useProjectsApi'
import { resolvePaginatedTotal, type Id } from '~/composables/api/httpUiErrors'
import { createCrudEntityStore } from '~/stores/_factories/createCrudEntityStore'
import { Notify } from '~/stores/notification'
import type { CreateProjectPayload, PatchProjectPayload, Project, UpdateProjectPayload } from '~/types/crm'

export const useProjectsStore = defineStore('projects', () => {
  const api = useProjectsApi()

  return createCrudEntityStore<Project, CreateProjectPayload, UpdateProjectPayload, PatchProjectPayload>({
    fetchRows: async (query) => {
      const response = await api.list(query)
      return {
        data: response.data,
        total: resolvePaginatedTotal(response.meta?.total, response.data.length),
      }
    },
    fetchItem: (id: Id) => api.get(id),
    create: (payload) => api.create(payload),
    update: (id: Id, payload) => api.update(id, payload),
    patch: (id: Id, payload) => api.patch(id, payload),
    remove: async (id: Id) => { await api.delete(id) },
    applyUpdate: (entity, payload) => ({ ...entity, ...payload }),
    applyPatch: (entity, payload) => ({ ...entity, ...payload }),
    notifications: {
      success: {
        create: 'Projet créé avec succès.',
        update: 'Projet mis à jour.',
        patch: 'Projet mis à jour.',
        remove: 'Projet supprimé.',
      },
      notifySuccess: (message) => Notify.success(message),
      notifyError: (message) => Notify.error(message),
    },
  })
})
