import { ref } from 'vue'

type CrudAction = 'fetch' | 'create' | 'update' | 'patch' | 'remove'
type PostMutationSyncMode = 'none' | 'background' | 'blocking'

interface CrudNotifier {
  success?: (action: CrudAction) => void
  error?: (action: CrudAction, error: unknown) => void
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Une erreur est survenue.'
}

interface CreateCrudEntityStoreOptions<TEntity, TCreatePayload, TUpdatePayload, TPatchPayload> {
  entityLabel: string
  fetch: () => Promise<TEntity[]>
  create: (payload: TCreatePayload) => Promise<TEntity>
  update: (id: string, payload: TUpdatePayload) => Promise<TEntity>
  patch: (id: string, payload: TPatchPayload) => Promise<TEntity>
  remove: (id: string) => Promise<void>
  getId: (entity: TEntity) => string
  applyUpdate: (entity: TEntity, payload: TUpdatePayload) => TEntity
  applyPatch: (entity: TEntity, payload: TPatchPayload) => TEntity
  notifier?: CrudNotifier
  postMutationSync?: {
    mode?: PostMutationSyncMode
    refresh: () => Promise<unknown>
    debounceMs?: number
  }
}

export function createCrudEntityStore<TEntity, TCreatePayload, TUpdatePayload, TPatchPayload>(
  options: CreateCrudEntityStoreOptions<TEntity, TCreatePayload, TUpdatePayload, TPatchPayload>,
) {
  const rows = ref<TEntity[]>([])
  const detail = ref<TEntity | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const notifySuccess = options.notifier?.success || (() => {})
  const notifyError = options.notifier?.error || (() => {})

  const postMutationSyncMode = options.postMutationSync?.mode ?? 'background'
  const postMutationSyncDebounce = options.postMutationSync?.debounceMs ?? 120
  let refreshInFlight: Promise<unknown> | null = null
  let refreshPending = false
  let refreshDebounceTimer: ReturnType<typeof setTimeout> | null = null

  function getEntityId(entity: unknown) {
    return options.getId(entity as TEntity)
  }

  function syncDetailFromRows(entityId: string) {
    const found = rows.value.find((item) => getEntityId(item) === entityId)
    if (found) detail.value = found
  }

  function replaceRow(next: TEntity) {
    const nextId = options.getId(next)
    rows.value = rows.value.map((item) => getEntityId(item) === nextId ? next : item)
    if (!rows.value.some((item) => getEntityId(item) === nextId)) {
      rows.value = [next, ...rows.value]
    }
    syncDetailFromRows(nextId)
  }

  async function executeRefresh() {
    if (!options.postMutationSync?.refresh) return

    if (refreshInFlight) {
      refreshPending = true
      await refreshInFlight
      return
    }

    refreshInFlight = (async () => {
      try {
        await options.postMutationSync?.refresh()
      } finally {
        refreshInFlight = null
        if (refreshPending) {
          refreshPending = false
          void executeRefresh()
        }
      }
    })()

    await refreshInFlight
  }

  function scheduleBackgroundRefresh() {
    if (!options.postMutationSync?.refresh) return

    if (refreshDebounceTimer) clearTimeout(refreshDebounceTimer)

    if (postMutationSyncDebounce <= 0) {
      void executeRefresh()
      return
    }

    refreshDebounceTimer = setTimeout(() => {
      refreshDebounceTimer = null
      void executeRefresh()
    }, postMutationSyncDebounce)
  }

  async function runPostMutationSync() {
    if (postMutationSyncMode === 'none') return

    if (postMutationSyncMode === 'blocking') {
      if (refreshDebounceTimer) {
        clearTimeout(refreshDebounceTimer)
        refreshDebounceTimer = null
      }
      await executeRefresh()
      return
    }

    scheduleBackgroundRefresh()
  }

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      rows.value = await options.fetch()
      if (detail.value) {
        syncDetailFromRows(getEntityId(detail.value))
      }
      notifySuccess('fetch')
      return rows.value
    } catch (errorValue) {
      error.value = getErrorMessage(errorValue)
      notifyError('fetch', errorValue)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function create(payload: TCreatePayload) {
    saving.value = true
    error.value = null
    try {
      const created = await options.create(payload)
      replaceRow(created)
      detail.value = created
      notifySuccess('create')
      await runPostMutationSync()
      return created
    } catch (errorValue) {
      error.value = getErrorMessage(errorValue)
      notifyError('create', errorValue)
      throw errorValue
    } finally {
      saving.value = false
    }
  }

  async function update(id: string, payload: TUpdatePayload) {
    const previousRows = [...rows.value]
    const previousDetail = detail.value

    const current = rows.value.find((item) => getEntityId(item) === id)
    if (current) {
      replaceRow(options.applyUpdate(current, payload))
    }

    saving.value = true
    error.value = null
    try {
      const updated = await options.update(id, payload)
      replaceRow(updated)
      notifySuccess('update')
      await runPostMutationSync()
      return updated
    } catch (errorValue) {
      rows.value = previousRows
      detail.value = previousDetail
      error.value = getErrorMessage(errorValue)
      notifyError('update', errorValue)
      throw errorValue
    } finally {
      saving.value = false
    }
  }

  async function patch(id: string, payload: TPatchPayload) {
    const previousRows = [...rows.value]
    const previousDetail = detail.value

    const current = rows.value.find((item) => getEntityId(item) === id)
    if (current) {
      replaceRow(options.applyPatch(current, payload))
    }

    saving.value = true
    error.value = null
    try {
      const patched = await options.patch(id, payload)
      replaceRow(patched)
      notifySuccess('patch')
      await runPostMutationSync()
      return patched
    } catch (errorValue) {
      rows.value = previousRows
      detail.value = previousDetail
      error.value = getErrorMessage(errorValue)
      notifyError('patch', errorValue)
      throw errorValue
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string) {
    const previousRows = [...rows.value]
    const previousDetail = detail.value

    rows.value = rows.value.filter((item) => getEntityId(item) !== id)
    if (detail.value && getEntityId(detail.value) === id) {
      detail.value = null
    }

    saving.value = true
    error.value = null
    try {
      await options.remove(id)
      notifySuccess('remove')
      await runPostMutationSync()
    } catch (errorValue) {
      rows.value = previousRows
      detail.value = previousDetail
      error.value = getErrorMessage(errorValue)
      notifyError('remove', errorValue)
      throw errorValue
    } finally {
      saving.value = false
    }
  }

  function setRows(nextRows: TEntity[]) {
    rows.value = nextRows
    if (detail.value) {
      syncDetailFromRows(getEntityId(detail.value))
    }
  }

  function setDetail(nextDetail: TEntity | null) {
    detail.value = nextDetail
    if (nextDetail) {
      syncDetailFromRows(getEntityId(nextDetail))
    }
  }

  return {
    rows,
    detail,
    loading,
    saving,
    error,
    fetch,
    create,
    update,
    patch,
    remove,
    setRows,
    setDetail,
  }
}
