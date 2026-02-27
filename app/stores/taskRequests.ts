import { useTaskRequestsApi } from '~/composables/api/useTaskRequestsApi'
import type { Id } from '~/composables/api/httpUiErrors'
import { createEntitySnapshot, mergeEntityRow, restoreEntitySnapshot, toUiErrorMessage } from '~/stores/_entity'
import { createCrudEntityStore } from '~/stores/_factories/createCrudEntityStore'
import { Notify } from '~/stores/notification'
import {
  TaskRequestStatus,
  type CreateTaskRequestPayload,
  type PatchTaskRequestPayload,
  type TaskRequest,
  type UpdateTaskRequestPayload,
} from '~/types/crm'

export const useTaskRequestsStore = defineStore('task-requests', () => {
  const api = useTaskRequestsApi()

  const store = createCrudEntityStore<TaskRequest, CreateTaskRequestPayload, UpdateTaskRequestPayload, PatchTaskRequestPayload>({
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
    remove: async (id: Id) => { await api.delete(id) },
    applyUpdate: (entity, payload) => ({ ...entity, ...payload }),
    applyPatch: (entity, payload) => ({ ...entity, ...payload }),
    notifications: {
      success: {
        create: 'Demande de tâche créée.',
        update: 'Demande de tâche mise à jour.',
        patch: 'Demande de tâche mise à jour.',
        remove: 'Demande de tâche supprimée.',
      },
      notifySuccess: (message) => Notify.success(message),
      notifyError: (message) => Notify.error(message),
    },
  })

  async function runWorkflowAction(
    id: Id,
    optimisticStatus: TaskRequestStatus,
    request: (requestId: Id) => Promise<TaskRequest>,
    successMessage: string,
  ) {
    store.loading.value = true
    store.error.value = null

    const snapshot = createEntitySnapshot(store.rows, store.item)
    const current = store.rows.value.find((row) => row.id === id) ?? store.item.value
    if (current) mergeEntityRow(store.rows, store.item, { ...current, status: optimisticStatus })

    try {
      const updated = await request(id)
      mergeEntityRow(store.rows, store.item, updated)
      Notify.success(successMessage)
      await store.fetchRows({ silent: true })
      return updated
    } catch (errorValue) {
      restoreEntitySnapshot(store.rows, store.item, snapshot)
      store.error.value = toUiErrorMessage(errorValue)
      Notify.error(store.error.value)
      throw errorValue
    } finally {
      store.loading.value = false
    }
  }

  const approve = (id: Id) => runWorkflowAction(id, TaskRequestStatus.APPROVED, api.approve, 'Demande approuvée.')
  const reject = (id: Id) => runWorkflowAction(id, TaskRequestStatus.REJECTED, api.reject, 'Demande rejetée.')
  const cancel = (id: Id) => runWorkflowAction(id, TaskRequestStatus.CANCELED, api.cancel, 'Demande annulée.')

  return {
    ...store,
    approve,
    reject,
    cancel,
  }
})
