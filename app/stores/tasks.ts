import { useTasksApi } from '~/composables/api/useTasksApi'
import type { Id } from '~/composables/api/httpUiErrors'
import { createEntitySnapshot, mergeEntityRow, restoreEntitySnapshot, toUiErrorMessage } from '~/stores/_entity'
import { createCrudEntityStore } from '~/stores/_factories/createCrudEntityStore'
import { Notify } from '~/stores/notification'
import { TaskStatus, type CreateTaskPayload, type PatchTaskPayload, type Task, type UpdateTaskPayload } from '~/types/crm'

export const useTasksStore = defineStore('tasks', () => {
  const api = useTasksApi()

  const store = createCrudEntityStore<Task, CreateTaskPayload, UpdateTaskPayload, PatchTaskPayload>({
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
        create: 'Tâche créée avec succès.',
        update: 'Tâche mise à jour.',
        patch: 'Tâche mise à jour.',
        remove: 'Tâche supprimée.',
      },
      notifySuccess: (message) => Notify.success(message),
      notifyError: (message) => Notify.error(message),
    },
  })

  async function runWorkflowAction(
    id: Id,
    optimisticStatus: TaskStatus,
    request: (taskId: Id) => Promise<Task>,
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

  const start = (id: Id) => runWorkflowAction(id, TaskStatus.IN_PROGRESS, api.start, 'Tâche démarrée.')
  const complete = (id: Id) => runWorkflowAction(id, TaskStatus.COMPLETED, api.complete, 'Tâche terminée.')
  const archive = (id: Id) => runWorkflowAction(id, TaskStatus.ARCHIVED, api.archive, 'Tâche archivée.')
  const reopen = (id: Id) => runWorkflowAction(id, TaskStatus.TODO, api.reopen, 'Tâche rouverte.')

  return {
    ...store,
    start,
    complete,
    archive,
    reopen,
  }
})
