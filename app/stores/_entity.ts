import type { ComputedRef, Ref } from 'vue'
import type { ApiListQuery, Id } from '~/composables/api/httpUiErrors'

export type EntitySort = { field: string; direction: 'asc' | 'desc' }
export type EntityPagination = { page: number; perPage: number; total: number }

export type EntitySnapshot<T> = {
  rows: T[]
  item: T | null
}

export function createEntityPagination(defaultPerPage = 10): Ref<EntityPagination> {
  return ref({
    page: 1,
    perPage: defaultPerPage,
    total: 0,
  })
}

export function createEntityQuery(
  pagination: Ref<EntityPagination>,
  search: Ref<string>,
  sort: Ref<EntitySort | null>,
): ComputedRef<ApiListQuery> {
  return computed(() => ({
    limit: pagination.value.perPage,
    offset: (pagination.value.page - 1) * pagination.value.perPage,
    ...(search.value ? { search: search.value } : {}),
    ...(sort.value ? { order: { [sort.value.field]: sort.value.direction } } : {}),
  }))
}

export function mergeEntityRow<T extends { id: Id }>(
  rows: Ref<T[]>,
  item: Ref<T | null>,
  next: T,
) {
  rows.value = rows.value.map((row) => (row.id === next.id ? next : row))
  if (!rows.value.some((row) => row.id === next.id)) rows.value = [next, ...rows.value]
  if (item.value?.id === next.id) item.value = next
}

export function createEntitySnapshot<T>(rows: Ref<T[]>, item: Ref<T | null>): EntitySnapshot<T> {
  return {
    rows: [...rows.value],
    item: item.value,
  }
}

export function restoreEntitySnapshot<T>(rows: Ref<T[]>, item: Ref<T | null>, snapshot: EntitySnapshot<T>) {
  rows.value = snapshot.rows
  item.value = snapshot.item
}

export function toUiErrorMessage(errorValue: unknown) {
  if (errorValue && typeof errorValue === 'object' && 'message' in errorValue && typeof errorValue.message === 'string') {
    return errorValue.message
  }
  if (errorValue instanceof Error) return errorValue.message
  return 'Une erreur est survenue.'
}

export type PostMutationSyncMode = 'none' | 'background' | 'blocking'

export function createPostMutationSync(refresh: () => Promise<void>, debounceMs = 120) {
  let inFlight: Promise<void> | null = null
  let hasPendingRefresh = false
  let timer: ReturnType<typeof setTimeout> | null = null

  async function runRefresh() {
    if (inFlight) {
      hasPendingRefresh = true
      return inFlight
    }

    inFlight = (async () => {
      try {
        await refresh()
      } finally {
        inFlight = null
        if (hasPendingRefresh) {
          hasPendingRefresh = false
          void runRefresh()
        }
      }
    })()

    return inFlight
  }

  function background() {
    if (debounceMs <= 0) {
      void runRefresh()
      return
    }

    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      void runRefresh()
    }, debounceMs)
  }

  async function blocking() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    await runRefresh()
  }

  return {
    background,
    blocking,
  }
}
