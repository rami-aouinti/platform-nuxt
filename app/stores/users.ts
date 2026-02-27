import { useUsersApi, type CreateUserPayload, type PatchUserPayload, type UpdateUserPayload } from '~/composables/api/useUsersApi'
import type { Id } from '~/composables/api/httpUiErrors'
import { createCrudEntityStore } from '~/stores/_factories/createCrudEntityStore'
import { Notify } from '~/stores/notification'
import type { CrmUser } from '~/composables/api/useCrmApi'

function normalizeRows(payload: CrmUser[] | { data?: CrmUser[]; items?: CrmUser[]; meta?: { total?: number } }) {
  if (Array.isArray(payload)) return { data: payload, total: payload.length }
  const data = payload.items ?? payload.data ?? []
  return { data, total: payload.meta?.total ?? data.length }
}

export const useUsersStore = defineStore('users', () => {
  const api = useUsersApi()

  return createCrudEntityStore<CrmUser, CreateUserPayload, UpdateUserPayload, PatchUserPayload>({
    fetchRows: async (query) => {
      const response = await api.list(query)
      const normalized = normalizeRows(response)
      return {
        data: normalized.data,
        total: normalized.total,
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
        create: 'Utilisateur créé.',
        update: 'Utilisateur mis à jour.',
        patch: 'Utilisateur mis à jour.',
        remove: 'Utilisateur supprimé.',
      },
      notifySuccess: (message) => Notify.success(message),
      notifyError: (message) => Notify.error(message),
    },
  })
})
