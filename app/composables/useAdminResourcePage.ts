import { extractCollectionFromPayload } from '~/utils/admin/extractCollectionFromPayload'
import type { AdminResourceDescriptor, AdminResourceEndpoint, AdminResourceListEndpoint } from '~/types/admin-resource'

type AdminFilters = Record<string, string>

type AdminQueryContext<TFilters extends AdminFilters> = {
  page: number
  pageSize: number
  sortBy: readonly { key: string; order?: 'asc' | 'desc' | boolean }[]
  search: string
  filters: TFilters
}

type AdminResourceLoadResult = {
  payload: unknown
  total?: number
  countPayload?: unknown
}

type UseAdminResourcePageOptions<TRow, TFilters extends AdminFilters> = {
  resource?: AdminResourceDescriptor
  initialFilters: TFilters
  initialPage?: number
  initialPageSize?: number
  initialSearch?: string
  debounce?: number
  maxWait?: number
  loadRows?: (context: AdminQueryContext<TFilters>) => Promise<AdminResourceLoadResult | unknown>
  saveEdit?: (row: Record<string, unknown>) => Promise<void>
  deleteRow?: (row: Record<string, unknown>) => Promise<void>
  normalize?: (payload: unknown) => TRow[]
  buildQuery?: (context: AdminQueryContext<TFilters>) => Record<string, unknown>
}

function resolveEndpoint(endpoint: AdminResourceEndpoint | undefined, id?: string) {
  if (!endpoint) {
    return null
  }

  if (typeof endpoint === 'function') {
    return endpoint({ id })
  }

  return endpoint
}

function resolveListEndpoints(endpoint: AdminResourceListEndpoint) {
  if (typeof endpoint === 'string' || typeof endpoint === 'function') {
    return {
      listEndpoint: resolveEndpoint(endpoint),
      countEndpoint: null,
    }
  }

  return {
    listEndpoint: resolveEndpoint(endpoint.endpoint),
    countEndpoint: resolveEndpoint(endpoint.countEndpoint),
  }
}

export function useAdminResourcePage<TRow, TFilters extends AdminFilters>(
  options: UseAdminResourcePageOptions<TRow, TFilters>,
) {
  const rows = ref<TRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const page = ref(options.initialPage ?? 1)
  const pageSize = ref(options.initialPageSize ?? 10)
  const search = ref(options.initialSearch ?? '')
  const sortBy = ref<readonly { key: string; order?: 'asc' | 'desc' | boolean }[]>([])
  const filters = ref<TFilters>({ ...options.initialFilters })
  const mutationLoading = ref(false)
  const skipNextPaginationWatchLoad = ref(false)

  const normalize = options.normalize ?? ((payload: unknown) => extractCollectionFromPayload(payload) as TRow[])

  function toError(errorValue: unknown) {
    if (isError(errorValue) && typeof errorValue.statusMessage === 'string') {
      return errorValue.statusMessage
    }

    if (errorValue instanceof Error) {
      return errorValue.message
    }

    return 'Erreur API.'
  }

  function getQueryContext(): AdminQueryContext<TFilters> {
    return {
      page: page.value,
      pageSize: pageSize.value,
      sortBy: sortBy.value,
      search: search.value,
      filters: filters.value,
    }
  }

  function resolveLoadResult(result: AdminResourceLoadResult | unknown) {
    if (
      result
      && typeof result === 'object'
      && 'payload' in result
    ) {
      return result as AdminResourceLoadResult
    }

    return { payload: result }
  }

  async function loadRows() {
    if (!options.loadRows && !options.resource?.list) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const context = getQueryContext()
      if (options.buildQuery) {
        options.buildQuery(context)
      }

      let result: AdminResourceLoadResult
      if (options.loadRows) {
        result = resolveLoadResult(await options.loadRows(context))
      } else {
        const { listEndpoint, countEndpoint } = resolveListEndpoints(options.resource!.list)
        if (!listEndpoint) {
          throw new Error('List endpoint manquant pour cette ressource admin.')
        }

        const query = options.buildQuery ? options.buildQuery(context) : undefined

        const [payload, countPayload] = await Promise.all([
          $fetch(listEndpoint, { query }),
          countEndpoint ? $fetch(countEndpoint) : Promise.resolve(undefined),
        ])

        result = {
          payload,
          countPayload,
        }
      }

      rows.value = normalize(result.payload)

      if (typeof result.total === 'number') {
        total.value = result.total
      } else if (typeof result.countPayload === 'number') {
        total.value = result.countPayload
      } else if (
        result.countPayload
        && typeof result.countPayload === 'object'
        && 'count' in result.countPayload
      ) {
        total.value = Number((result.countPayload as { count?: number }).count ?? rows.value.length)
      } else {
        total.value = rows.value.length
      }

      const normalizedPageSize = Math.max(pageSize.value, 1)
      const totalPages = Math.max(Math.ceil(total.value / normalizedPageSize), 1)

      if (page.value > totalPages) {
        skipNextPaginationWatchLoad.value = true
        page.value = totalPages
        await loadRows()
      }
    } catch (errorValue) {
      error.value = toError(errorValue)
    } finally {
      loading.value = false
    }
  }

  async function saveEdit(row: Record<string, unknown>) {
    if (!options.saveEdit && !options.resource?.patch) {
      return
    }

    if (mutationLoading.value) {
      return
    }

    mutationLoading.value = true
    try {
      if (options.saveEdit) {
        await options.saveEdit(row)
      } else {
        const endpoint = resolveEndpoint(options.resource?.patch, String(row.id ?? ''))
        if (endpoint) {
          await $fetch(endpoint, {
            method: 'PATCH',
            body: row,
          })
        }
      }
    } finally {
      mutationLoading.value = false
    }
  }

  async function deleteRow(row: Record<string, unknown>) {
    if (!options.deleteRow && !options.resource?.delete) {
      return
    }

    if (mutationLoading.value) {
      return
    }

    mutationLoading.value = true
    try {
      if (options.deleteRow) {
        await options.deleteRow(row)
      } else {
        const endpoint = resolveEndpoint(options.resource?.delete, String(row.id ?? ''))
        if (endpoint) {
          await $fetch(endpoint, {
            method: 'DELETE',
          })
        }
      }
    } finally {
      mutationLoading.value = false
    }
  }

  watch([page, pageSize], () => {
    if (skipNextPaginationWatchLoad.value) {
      skipNextPaginationWatchLoad.value = false
      return
    }

    void loadRows()
  })


  watch(sortBy, () => {
    if (page.value !== 1) {
      skipNextPaginationWatchLoad.value = true
      page.value = 1
    }

    void loadRows()
  }, { deep: true })

  watchDebounced([search, filters], () => {
    if (page.value !== 1) {
      skipNextPaginationWatchLoad.value = true
      page.value = 1
    }

    void loadRows()
  }, { debounce: options.debounce ?? 300, maxWait: options.maxWait ?? 1000 })

  return {
    rows,
    loading,
    error,
    total,
    page,
    pageSize,
    sortBy,
    search,
    filters,
    mutationLoading,
    loadRows,
    saveEdit,
    deleteRow,
    buildQuery: options.buildQuery,
    normalize,
  }
}
