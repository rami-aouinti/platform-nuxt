import { useTaskRequestsApi } from '~/composables/api/useTaskRequestsApi'
import { resolvePaginatedTotal, type Id } from '~/composables/api/httpUiErrors'
import { Notify } from '~/stores/notification'
import {
  createEntityPagination,
  createEntityQuery,
  createEntitySnapshot,
  mergeEntityRow,
  restoreEntitySnapshot,
  toUiErrorMessage,
  type EntitySort,
} from '~/stores/_entity'
import {
  TaskRequestStatus,
  type CreateTaskRequestPayload,
  type PatchTaskRequestPayload,
  type TaskRequest,
  type UpdateTaskRequestPayload,
} from '~/types/crm'

export const useTaskRequestsStore = defineStore('task-requests', () => {
  const api = useTaskRequestsApi()

  const rows = ref<TaskRequest[]>([])
  const item = ref<TaskRequest | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const pagination = createEntityPagination()
  const sort = ref<EntitySort | null>(null)
  const search = ref('')
  const query = createEntityQuery(pagination, search, sort)

  async function refreshRowsSafe() {
    try {
      await fetchRows({ silent: true })
    } catch {
      // no-op
    }
  }

  async function fetchRows(options: { silent?: boolean } = {}) {
    if (!options.silent) loading.value = true
    error.value = null

    try {
      const response = await api.list(query.value)
      rows.value = response.data
      pagination.value.total = resolvePaginatedTotal(response.meta?.total, response.data.length)
      return rows.value
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      if (!options.silent) Notify.error(error.value)
      throw errorValue
    } finally {
      if (!options.silent) loading.value = false
    }
  }

  async function fetchItem(id: Id) {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(id)
      item.value = response
      mergeEntityRow(rows, item, response)
      return response
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function create(payload: CreateTaskRequestPayload) {
    loading.value = true
    error.value = null

    try {
      const created = await api.create(payload)
      mergeEntityRow(rows, item, created)
      Notify.success('Demande de tâche créée.')
      await refreshRowsSafe()
      return created
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function update(id: Id, payload: UpdateTaskRequestPayload) {
    loading.value = true
    error.value = null

    const snapshot = createEntitySnapshot(rows, item)
    const current = rows.value.find((row) => row.id === id) ?? item.value
    if (current) mergeEntityRow(rows, item, { ...current, ...payload })

    try {
      const updated = await api.update(id, payload)
      mergeEntityRow(rows, item, updated)
      Notify.success('Demande de tâche mise à jour.')
      await refreshRowsSafe()
      return updated
    } catch (errorValue) {
      restoreEntitySnapshot(rows, item, snapshot)
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function patch(id: Id, payload: PatchTaskRequestPayload) {
    loading.value = true
    error.value = null

    const snapshot = createEntitySnapshot(rows, item)
    const current = rows.value.find((row) => row.id === id) ?? item.value
    if (current) mergeEntityRow(rows, item, { ...current, ...payload })

    try {
      const patched = await api.patch(id, payload)
      mergeEntityRow(rows, item, patched)
      Notify.success('Demande de tâche mise à jour.')
      await refreshRowsSafe()
      return patched
    } catch (errorValue) {
      restoreEntitySnapshot(rows, item, snapshot)
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function remove(id: Id) {
    loading.value = true
    error.value = null

    const snapshot = createEntitySnapshot(rows, item)
    rows.value = rows.value.filter((row) => row.id !== id)
    if (item.value?.id === id) item.value = null

    try {
      await api.delete(id)
      Notify.success('Demande de tâche supprimée.')
      await refreshRowsSafe()
    } catch (errorValue) {
      restoreEntitySnapshot(rows, item, snapshot)
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function runWorkflowAction(
    id: Id,
    optimisticStatus: TaskRequestStatus,
    request: (requestId: Id) => Promise<TaskRequest>,
    successMessage: string,
  ) {
    loading.value = true
    error.value = null

    const snapshot = createEntitySnapshot(rows, item)
    const current = rows.value.find((row) => row.id === id) ?? item.value
    if (current) mergeEntityRow(rows, item, { ...current, status: optimisticStatus })

    try {
      const updated = await request(id)
      mergeEntityRow(rows, item, updated)
      Notify.success(successMessage)
      await refreshRowsSafe()
      return updated
    } catch (errorValue) {
      restoreEntitySnapshot(rows, item, snapshot)
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  function setPage(page: number) { pagination.value.page = page }
  function setPerPage(perPage: number) { pagination.value.perPage = perPage; pagination.value.page = 1 }
  function setSort(field: string, direction: 'asc' | 'desc') { sort.value = { field, direction } }
  function setSearch(value: string) { search.value = value; pagination.value.page = 1 }

  const approve = (id: Id) => runWorkflowAction(id, TaskRequestStatus.APPROVED, api.approve, 'Demande approuvée.')
  const reject = (id: Id) => runWorkflowAction(id, TaskRequestStatus.REJECTED, api.reject, 'Demande rejetée.')
  const cancel = (id: Id) => runWorkflowAction(id, TaskRequestStatus.CANCELED, api.cancel, 'Demande annulée.')

  return {
    rows,
    item,
    loading,
    error,
    pagination,
    sort,
    search,
    fetchRows,
    fetchItem,
    setPage,
    setPerPage,
    setSort,
    setSearch,
    create,
    update,
    patch,
    remove,
    approve,
    reject,
    cancel,
  }
})
