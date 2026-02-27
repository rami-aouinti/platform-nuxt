import { useCompaniesApi, type CreateCompanyPayload, type PatchCompanyPayload, type UpdateCompanyPayload } from '~/composables/api/useCompaniesApi'
import type { Id } from '~/composables/api/httpUiErrors'
import { createCrudEntityStore } from '~/stores/_factories/createCrudEntityStore'
import { Notify } from '~/stores/notification'
import type { Company } from '~/types/crm'

export const useCompanyStore = defineStore('company', () => {
  const api = useCompaniesApi()

  return createCrudEntityStore<Company, CreateCompanyPayload, UpdateCompanyPayload, PatchCompanyPayload>({
    fetchRows: async (query) => {
      const response = await api.list(query)
      return {
        data: response.data,
        total: response.meta?.total ?? response.data.length,
      }
    },
    fetchItem: (id: Id) => api.get(id),
    create: (payload) => api.create(payload),
    update: (id: Id, payload) => api.update(id, payload),
    patch: (id: Id, payload) => api.patch(id, payload),
    remove: (id: Id) => api.delete(id),
    applyUpdate: (entity, payload) => ({ ...entity, ...payload }),
    applyPatch: (entity, payload) => ({ ...entity, ...payload }),
    notifications: {
      success: {
        create: 'Entreprise créée avec succès.',
        update: 'Entreprise mise à jour.',
        patch: 'Entreprise mise à jour.',
        remove: 'Entreprise supprimée.',
      },
      notifySuccess: (message) => Notify.success(message),
      notifyError: (message) => Notify.error(message),
    },
  })
})
