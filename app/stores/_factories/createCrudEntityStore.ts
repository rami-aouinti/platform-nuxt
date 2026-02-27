import { ref, type Ref } from 'vue'
import { resolvePaginatedTotal, type ApiListQuery } from '~/composables/api/httpUiErrors'
import {
  createEntityPagination,
  createEntityQuery,
  createEntitySnapshot,
  mergeEntityRow,
  removeEntityRow,
  restoreEntitySnapshot,
  toUiErrorMessage,
  type EntitySort,
} from '../_entity'

export type CrudAction = 'fetchRows' | 'fetchItem' | 'create' | 'update' | 'patch' | 'remove'

type NotificationMessages = Partial<Record<CrudAction, string | false>>

interface NotificationStrategy {
  success?: NotificationMessages
  error?: NotificationMessages
  notifySuccess?: (message: string, action: CrudAction) => void
  notifyError?: (message: string, action: CrudAction, error: unknown) => void
}

interface OptimisticStrategy {
  update?: boolean
  patch?: boolean
  remove?: boolean
}

interface RefreshStrategy {
  create?: boolean
  update?: boolean
  patch?: boolean
  remove?: boolean
}

interface FetchRowsResult<TEntity> {
  data: TEntity[]
  total?: number
}

interface CreateCrudEntityStoreOptions<TEntity extends { id: string }, TCreatePayload, TUpdatePayload, TPatchPayload> {
  fetchRows: (query: ApiListQuery) => Promise<FetchRowsResult<TEntity>>
  fetchItem?: (id: string) => Promise<TEntity>
  create: (payload: TCreatePayload) => Promise<TEntity>
  update: (id: string, payload: TUpdatePayload) => Promise<TEntity>
  patch: (id: string, payload: TPatchPayload) => Promise<TEntity>
  remove: (id: string) => Promise<void>
  applyUpdate: (entity: TEntity, payload: TUpdatePayload) => TEntity
  applyPatch: (entity: TEntity, payload: TPatchPayload) => TEntity
  pagination?: {
    perPage?: number
  }
  notifications?: NotificationStrategy
  optimistic?: OptimisticStrategy
  refreshAfterMutation?: boolean | RefreshStrategy
}

function shouldRefresh(strategy: boolean | RefreshStrategy | undefined, action: keyof RefreshStrategy) {
  if (typeof strategy === 'boolean') return strategy
  if (!strategy) return true
  return strategy[action] ?? true
}

function shouldUseOptimistic(strategy: OptimisticStrategy | undefined, action: keyof OptimisticStrategy) {
  if (!strategy) return true
  return strategy[action] ?? true
}

export function createCrudEntityStore<TEntity extends { id: string }, TCreatePayload, TUpdatePayload, TPatchPayload>(
  options: CreateCrudEntityStoreOptions<TEntity, TCreatePayload, TUpdatePayload, TPatchPayload>,
) {
  const rows: Ref<TEntity[]> = ref([])
  const item: Ref<TEntity | null> = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const pagination = createEntityPagination(options.pagination?.perPage)
  const sort = ref<EntitySort | null>(null)
  const search = ref('')
  const query = createEntityQuery(pagination, search, sort)

  const notifications = options.notifications

  function notifySuccess(action: CrudAction) {
    const message = notifications?.success?.[action]
    if (message && notifications?.notifySuccess) {
      notifications.notifySuccess(message, action)
    }
  }

  function notifyError(action: CrudAction, errorValue: unknown) {
    const defaultMessage = toUiErrorMessage(errorValue)
    const message = notifications?.error?.[action]
    if (message === false) return
    const finalMessage = typeof message === 'string' ? message : defaultMessage
    notifications?.notifyError?.(finalMessage, action, errorValue)
  }

  function setRows(nextRows: TEntity[]) {
    rows.value = nextRows
    if (item.value) {
      const nextItem = rows.value.find((row) => row.id === item.value?.id)
      if (nextItem) item.value = nextItem
    }
  }

  function setItem(nextItem: TEntity | null) {
    item.value = nextItem
    if (nextItem) mergeEntityRow(rows, item, nextItem)
  }

  async function refreshRowsSafe() {
    try {
      await fetchRows({ silent: true })
    } catch {
      // no-op
    }
  }

  async function fetchRows(fetchOptions: { silent?: boolean } = {}) {
    if (!fetchOptions.silent) loading.value = true
    error.value = null

    try {
      const response = await options.fetchRows(query.value)
      setRows(response.data)
      pagination.value.total = resolvePaginatedTotal(response.total, response.data.length)
      notifySuccess('fetchRows')
      return rows.value
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      if (!fetchOptions.silent) notifyError('fetchRows', errorValue)
      throw errorValue
    } finally {
      if (!fetchOptions.silent) loading.value = false
    }
  }

  async function fetchItem(id: string) {
    if (!options.fetchItem) {
      throw new Error('fetchItem is not configured for this store.')
    }

    loading.value = true
    error.value = null

    try {
      const response = await options.fetchItem(id)
      setItem(response)
      notifySuccess('fetchItem')
      return response
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      notifyError('fetchItem', errorValue)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function create(payload: TCreatePayload) {
    loading.value = true
    error.value = null

    try {
      const created = await options.create(payload)
      setItem(created)
      notifySuccess('create')
      if (shouldRefresh(options.refreshAfterMutation, 'create')) await refreshRowsSafe()
      return created
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      notifyError('create', errorValue)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function update(id: string, payload: TUpdatePayload) {
    loading.value = true
    error.value = null

    const snapshot = createEntitySnapshot(rows, item)
    const current = rows.value.find(row => row.id === id) ?? item.value
    if (current && shouldUseOptimistic(options.optimistic, 'update')) {
      mergeEntityRow(rows, item, options.applyUpdate(current, payload))
    }

    try {
      const updated = await options.update(id, payload)
      mergeEntityRow(rows, item, updated)
      notifySuccess('update')
      if (shouldRefresh(options.refreshAfterMutation, 'update')) await refreshRowsSafe()
      return updated
    } catch (errorValue) {
      restoreEntitySnapshot(rows, item, snapshot)
      error.value = toUiErrorMessage(errorValue)
      notifyError('update', errorValue)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function patch(id: string, payload: TPatchPayload) {
    loading.value = true
    error.value = null

    const snapshot = createEntitySnapshot(rows, item)
    const current = rows.value.find(row => row.id === id) ?? item.value
    if (current && shouldUseOptimistic(options.optimistic, 'patch')) {
      mergeEntityRow(rows, item, options.applyPatch(current, payload))
    }

    try {
      const patched = await options.patch(id, payload)
      mergeEntityRow(rows, item, patched)
      notifySuccess('patch')
      if (shouldRefresh(options.refreshAfterMutation, 'patch')) await refreshRowsSafe()
      return patched
    } catch (errorValue) {
      restoreEntitySnapshot(rows, item, snapshot)
      error.value = toUiErrorMessage(errorValue)
      notifyError('patch', errorValue)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function remove(id: string) {
    loading.value = true
    error.value = null

    const snapshot = createEntitySnapshot(rows, item)
    if (shouldUseOptimistic(options.optimistic, 'remove')) {
      removeEntityRow(rows, item, id)
    }

    try {
      await options.remove(id)
      notifySuccess('remove')
      if (shouldRefresh(options.refreshAfterMutation, 'remove')) await refreshRowsSafe()
    } catch (errorValue) {
      restoreEntitySnapshot(rows, item, snapshot)
      error.value = toUiErrorMessage(errorValue)
      notifyError('remove', errorValue)
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
    setRows,
    setItem,
  }
}
