import { ref } from 'vue'

type CrudAction = 'fetch' | 'create' | 'update' | 'patch' | 'remove'

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

  function syncDetailFromRows(entityId: string) {
    const found = rows.value.find((item) => options.getId(item) === entityId)
    if (found) detail.value = found
  }

  function replaceRow(next: TEntity) {
    const nextId = options.getId(next)
    rows.value = rows.value.map((item) => options.getId(item) === nextId ? next : item)
    syncDetailFromRows(nextId)
  }

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      rows.value = await options.fetch()
      if (detail.value) {
        syncDetailFromRows(options.getId(detail.value))
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
      rows.value = [...rows.value, created]
      detail.value = created
      notifySuccess('create')
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

    const current = rows.value.find((item) => options.getId(item) === id)
    if (current) {
      replaceRow(options.applyUpdate(current, payload))
    }

    saving.value = true
    error.value = null
    try {
      const updated = await options.update(id, payload)
      replaceRow(updated)
      notifySuccess('update')
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

    const current = rows.value.find((item) => options.getId(item) === id)
    if (current) {
      replaceRow(options.applyPatch(current, payload))
    }

    saving.value = true
    error.value = null
    try {
      const patched = await options.patch(id, payload)
      replaceRow(patched)
      notifySuccess('patch')
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

    rows.value = rows.value.filter((item) => options.getId(item) !== id)
    if (detail.value && options.getId(detail.value) === id) {
      detail.value = null
    }

    saving.value = true
    error.value = null
    try {
      await options.remove(id)
      notifySuccess('remove')
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
      syncDetailFromRows(options.getId(detail.value))
    }
  }

  function setDetail(nextDetail: TEntity | null) {
    detail.value = nextDetail
    if (nextDetail) {
      syncDetailFromRows(options.getId(nextDetail))
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
