import { useUsersApi, type CreateUserPayload, type PatchUserPayload, type UpdateUserPayload } from '~/composables/api/useUsersApi'
import { resolvePaginatedTotal, type ApiListQuery, type Id } from '~/composables/api/httpUiErrors'
import type { CrmUser } from '~/composables/api/useCrmApi'
import { Notify } from '~/stores/notification'

function toErrorMessage(errorValue: unknown) {
  if (errorValue && typeof errorValue === 'object' && 'message' in errorValue && typeof errorValue.message === 'string') {
    return errorValue.message
  }
  if (errorValue instanceof Error) return errorValue.message
  return 'Une erreur est survenue.'
}

export const useUsersStore = defineStore('users', () => {
  const api = useUsersApi()

  const rows = ref<CrmUser[]>([])
  const item = ref<CrmUser | null>(null)
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

  function mergeRow(next: CrmUser) {
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
      pagination.value.total = resolvePaginatedTotal(response.meta?.total, response.data.length)
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

  async function create(payload: CreateUserPayload) {
    loading.value = true
    error.value = null

    try {
      const created = await api.create(payload)
      mergeRow(created)
      Notify.success('Utilisateur créé.')
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

  async function update(id: Id, payload: UpdateUserPayload) {
    loading.value = true
    error.value = null

    const previousRows = [...rows.value]
    const previousItem = item.value
    const current = rows.value.find((row) => row.id === id) ?? item.value
    if (current) mergeRow({ ...current, ...payload })

    try {
      const updated = await api.update(id, payload)
      mergeRow(updated)
      Notify.success('Utilisateur mis à jour.')
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

  async function patch(id: Id, payload: PatchUserPayload) {
    loading.value = true
    error.value = null

    const previousRows = [...rows.value]
    const previousItem = item.value
    const current = rows.value.find((row) => row.id === id) ?? item.value
    if (current) mergeRow({ ...current, ...payload })

    try {
      const patched = await api.patch(id, payload)
      mergeRow(patched)
      Notify.success('Utilisateur mis à jour.')
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
      Notify.success('Utilisateur supprimé.')
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
