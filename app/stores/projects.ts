import { useProjectsApi } from '~/composables/api/useProjectsApi'
import type { Id, ApiListQuery } from '~/composables/api/httpUiErrors'
import { Notify } from '~/stores/notification'
import { ProjectStatus, type CreateProjectPayload, type PatchProjectPayload, type Project, type UpdateProjectPayload } from '~/types/task-manager'

function toErrorMessage(errorValue: unknown) {
  if (errorValue && typeof errorValue === 'object' && 'message' in errorValue && typeof errorValue.message === 'string') {
    return errorValue.message
  }
  if (errorValue instanceof Error) return errorValue.message
  return 'Une erreur est survenue.'
}

export const useProjectsStore = defineStore('projects', () => {
  const api = useProjectsApi()

  const rows = ref<Project[]>([])
  const item = ref<Project | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const pagination = ref({ page: 1, perPage: 10, total: 0 })
  const sort = ref<{ field: string; direction: 'asc' | 'desc' } | null>(null)
  const search = ref('')

  const query = computed<ApiListQuery>(() => ({
    limit: pagination.value.perPage,
    offset: (pagination.value.page - 1) * pagination.value.perPage,
    ...(search.value ? { search: search.value } : {}),
    ...(sort.value ? { order: { [sort.value.field]: sort.value.direction } } : {}),
  }))

  function mergeRow(next: Project) {
    rows.value = rows.value.map((row) => (row.id === next.id ? next : row))
    if (!rows.value.some((row) => row.id === next.id)) rows.value = [next, ...rows.value]
    if (item.value?.id === next.id) item.value = next
  }

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
      pagination.value.total = response.meta?.total ?? response.data.length
      return rows.value
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
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
      mergeRow(response)
      return response
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
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
      mergeRow(created)
      Notify.success('Projet créé avec succès.')
      await refreshRowsSafe()
      return created
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function update(id: Id, payload: UpdateProjectPayload) {
    loading.value = true
    error.value = null

    const previousRows = [...rows.value]
    const previousItem = item.value
    const current = rows.value.find((row) => row.id === id) ?? item.value
    if (current) mergeRow({ ...current, ...payload })

    try {
      const updated = await api.update(id, payload)
      mergeRow(updated)
      Notify.success('Projet mis à jour.')
      await refreshRowsSafe()
      return updated
    } catch (errorValue) {
      rows.value = previousRows
      item.value = previousItem
      error.value = toErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function patch(id: Id, payload: PatchProjectPayload) {
    loading.value = true
    error.value = null

    const previousRows = [...rows.value]
    const previousItem = item.value
    const current = rows.value.find((row) => row.id === id) ?? item.value
    if (current) mergeRow({ ...current, ...payload })

    try {
      const patched = await api.patch(id, payload)
      mergeRow(patched)
      Notify.success('Projet mis à jour.')
      await refreshRowsSafe()
      return patched
    } catch (errorValue) {
      rows.value = previousRows
      item.value = previousItem
      error.value = toErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function remove(id: Id) {
    loading.value = true
    error.value = null

    const previousRows = [...rows.value]
    const previousItem = item.value
    rows.value = rows.value.filter((row) => row.id !== id)
    if (item.value?.id === id) item.value = null

    try {
      await api.delete(id)
      Notify.success('Projet supprimé.')
      await refreshRowsSafe()
    } catch (errorValue) {
      rows.value = previousRows
      item.value = previousItem
      error.value = toErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function runWorkflowAction(id: Id, status: ProjectStatus, successMessage: string) {
    loading.value = true
    error.value = null

    const previousRows = [...rows.value]
    const previousItem = item.value
    const current = rows.value.find((row) => row.id === id) ?? item.value
    if (current) mergeRow({ ...current, status })

    try {
      const updated = await api.patch(id, { status })
      mergeRow(updated)
      Notify.success(successMessage)
      await refreshRowsSafe()
      return updated
    } catch (errorValue) {
      rows.value = previousRows
      item.value = previousItem
      error.value = toErrorMessage(errorValue)
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

  const activate = (id: Id) => runWorkflowAction(id, ProjectStatus.ACTIVE, 'Projet activé.')
  const complete = (id: Id) => runWorkflowAction(id, ProjectStatus.COMPLETED, 'Projet complété.')
  const archive = (id: Id) => runWorkflowAction(id, ProjectStatus.ARCHIVED, 'Projet archivé.')
  const markAsDraft = (id: Id) => runWorkflowAction(id, ProjectStatus.DRAFT, 'Projet repassé en brouillon.')

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
    activate,
    complete,
    archive,
    markAsDraft,
  }
})
