import { useProjectsApi } from '~/composables/api/useProjectsApi'
import type { Id } from '~/composables/api/httpUiErrors'
import { Notify } from '~/stores/notification'
import {
  createEntityPagination,
  createEntityQuery,
  createEntitySnapshot,
  createPostMutationSync,
  mergeEntityRow,
  restoreEntitySnapshot,
  toUiErrorMessage,
  type EntitySort,
} from '~/stores/_entity'
import type { CreateProjectPayload, PatchProjectPayload, Project, UpdateProjectPayload } from '~/types/crm'

export const useProjectsStore = defineStore('projects', () => {
  const api = useProjectsApi()

  const rows = ref<Project[]>([])
  const item = ref<Project | null>(null)
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

  const postMutationSyncMode = ref<'none' | 'background' | 'blocking'>('background')
  const postMutationSync = createPostMutationSync(refreshRowsSafe, 120)

  async function runPostMutationSync() {
    if (postMutationSyncMode.value === 'none') return
    if (postMutationSyncMode.value === 'blocking') {
      await postMutationSync.blocking()
      return
    }
    postMutationSync.background()
  }

  async function fetchRows(options: { silent?: boolean } = {}) {
    if (!options.silent) loading.value = true
    error.value = null

    try {
      const response = await api.list(query.value)
      rows.value = response.data
      pagination.value.total = response.meta?.total ?? response.data.length
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

  async function create(payload: CreateProjectPayload) {
    loading.value = true
    error.value = null

    try {
      const created = await api.create(payload)
      mergeEntityRow(rows, item, created)
      Notify.success('Projet créé avec succès.')
      await runPostMutationSync()
      return created
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function update(id: Id, payload: UpdateProjectPayload) {
    loading.value = true
    error.value = null

    const snapshot = createEntitySnapshot(rows, item)
    const current = rows.value.find((row) => row.id === id) ?? item.value
    if (current) mergeEntityRow(rows, item, { ...current, ...payload })

    try {
      const updated = await api.update(id, payload)
      mergeEntityRow(rows, item, updated)
      Notify.success('Projet mis à jour.')
      await runPostMutationSync()
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

  async function patch(id: Id, payload: PatchProjectPayload) {
    loading.value = true
    error.value = null

    const snapshot = createEntitySnapshot(rows, item)
    const current = rows.value.find((row) => row.id === id) ?? item.value
    if (current) mergeEntityRow(rows, item, { ...current, ...payload })

    try {
      const patched = await api.patch(id, payload)
      mergeEntityRow(rows, item, patched)
      Notify.success('Projet mis à jour.')
      await runPostMutationSync()
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
      Notify.success('Projet supprimé.')
      await runPostMutationSync()
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
    postMutationSyncMode,
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
