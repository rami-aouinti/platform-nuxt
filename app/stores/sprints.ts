import { useSprintsApi, type PatchSprintPayload, type UpdateSprintPayload } from '~/composables/api/useSprintsApi'
import type { Id } from '~/composables/api/httpUiErrors'
import { createCrudEntityStore } from '~/stores/_factories/createCrudEntityStore'
import { Notify } from '~/stores/notification'
import type { CrmSprint, CreateSprintPayload } from '~/types/crm'

function normalizeRows(payload: CrmSprint[] | { data?: CrmSprint[]; items?: CrmSprint[]; meta?: { total?: number } }) {
  if (Array.isArray(payload)) return { data: payload, total: payload.length }
  const data = payload.items ?? payload.data ?? []
  return { data, total: payload.meta?.total ?? data.length }
}

export const useSprintsStore = defineStore('sprints', () => {
  const api = useSprintsApi()

  return createCrudEntityStore<CrmSprint, CreateSprintPayload, UpdateSprintPayload, PatchSprintPayload>({
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
        create: 'Sprint créé.',
        update: 'Sprint mis à jour.',
        patch: 'Sprint mis à jour.',
        remove: 'Sprint supprimé.',
      },
      notifySuccess: (message) => Notify.success(message),
      notifyError: (message) => Notify.error(message),
    },
  })
})
