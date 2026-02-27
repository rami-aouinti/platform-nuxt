import { extractCollectionFromPayload } from '~/utils/admin/extractCollectionFromPayload'

type AdminFilters = Record<string, string>

type AdminQueryContext<TFilters extends AdminFilters> = {
  page: number
  pageSize: number
  search: string
  filters: TFilters
}

type AdminResourceLoadResult = {
  payload: unknown
  total?: number
  countPayload?: unknown
}

type UseAdminResourcePageOptions<TRow, TFilters extends AdminFilters> = {
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
    if (!options.loadRows) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const context = getQueryContext()
      if (options.buildQuery) {
        options.buildQuery(context)
      }

      const result = resolveLoadResult(await options.loadRows(context))
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
    if (!options.saveEdit || mutationLoading.value) {
      return
    }

    mutationLoading.value = true
    try {
      await options.saveEdit(row)
    } finally {
      mutationLoading.value = false
    }
  }

  async function deleteRow(row: Record<string, unknown>) {
    if (!options.deleteRow || mutationLoading.value) {
      return
    }

    mutationLoading.value = true
    try {
      await options.deleteRow(row)
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
