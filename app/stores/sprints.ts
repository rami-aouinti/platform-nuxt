import { useSprintsApi, type PatchSprintPayload, type UpdateSprintPayload } from '~/composables/api/useSprintsApi'
import type { Id } from '~/composables/api/httpUiErrors'
import type { CrmSprint, CreateSprintPayload } from '~/types/crm'
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

function normalizeRows(payload: CrmSprint[] | { data?: CrmSprint[]; items?: CrmSprint[]; meta?: { total?: number } }) {
  if (Array.isArray(payload)) return { data: payload, total: payload.length }
  const data = payload.items ?? payload.data ?? []
  return { data, total: payload.meta?.total ?? data.length }
}

export const useSprintsStore = defineStore('sprints', () => {
  const api = useSprintsApi()

  const rows = ref<CrmSprint[]>([])
  const item = ref<CrmSprint | null>(null)
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
      const normalized = normalizeRows(response)
      rows.value = normalized.data
      pagination.value.total = normalized.total
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

  async function create(payload: CreateSprintPayload) {
    loading.value = true
    error.value = null

    try {
      const created = await api.create(payload)
      mergeEntityRow(rows, item, created)
      Notify.success('Sprint créé.')
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

  async function update(id: Id, payload: UpdateSprintPayload) {
    loading.value = true
    error.value = null

    const snapshot = createEntitySnapshot(rows, item)
    const current = rows.value.find((row) => row.id === id) ?? item.value
    if (current) mergeEntityRow(rows, item, { ...current, ...payload })

    try {
      const updated = await api.update(id, payload)
      mergeEntityRow(rows, item, updated)
      Notify.success('Sprint mis à jour.')
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

  async function patch(id: Id, payload: PatchSprintPayload) {
    loading.value = true
    error.value = null

    const snapshot = createEntitySnapshot(rows, item)
    const current = rows.value.find((row) => row.id === id) ?? item.value
    if (current) mergeEntityRow(rows, item, { ...current, ...payload })

    try {
      const patched = await api.patch(id, payload)
      mergeEntityRow(rows, item, patched)
      Notify.success('Sprint mis à jour.')
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
      Notify.success('Sprint supprimé.')
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

  function setPage(page: number) { pagination.value.page = page }
  function setPerPage(perPage: number) { pagination.value.perPage = perPage; pagination.value.page = 1 }
  function setSort(field: string, direction: 'asc' | 'desc') { sort.value = { field, direction } }
  function setSearch(value: string) { search.value = value; pagination.value.page = 1 }

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
  }
})
