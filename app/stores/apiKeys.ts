import { apiKeysV1Service, apiKeysV2Service } from '~~/services/admin'
import { Notify } from '~/stores/notification'
import type {
  ApiKey,
  ApiKeyCountResponse,
  ApiVersion,
  CreateApiKeyPayload,
  PatchApiKeyPayload,
  UpdateApiKeyPayload,
} from '~/types/api-key'
import { toUiErrorMessage } from '~/utils/errors/toUiErrorMessage'

type ApiKeysService = typeof apiKeysV1Service | typeof apiKeysV2Service

export const useApiKeysStore = defineStore('api-keys', () => {
  const preferredVersion = ref<ApiVersion>('v2')

  const rows = ref<ApiKey[]>([])
  const item = ref<ApiKey | null>(null)
  const ids = ref<string[]>([])

  const loading = ref(false)
  const busy = ref(false)
  const error = ref<string | null>(null)

  const pagination = ref({ page: 1, perPage: 10, total: 0 })
  const search = ref('')

  const activeVersion = ref<ApiVersion>('v2')

  const fallbackEnabled = computed(() => preferredVersion.value === 'v2')

  function resolveService(version: ApiVersion): ApiKeysService {
    return version === 'v1' ? apiKeysV1Service : apiKeysV2Service
  }

  async function runWithFallback<T>(run: (service: ApiKeysService) => Promise<T>): Promise<T> {
    const primaryService = resolveService(preferredVersion.value)

    try {
      activeVersion.value = preferredVersion.value
      return await run(primaryService)
    } catch (errorValue) {
      if (!fallbackEnabled.value || !isError(errorValue) || errorValue.statusCode !== 404) {
        throw errorValue
      }

      activeVersion.value = 'v1'
      return run(apiKeysV1Service)
    }
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
      const response = await runWithFallback((service) => service.list({
        page: pagination.value.page,
        pageSize: pagination.value.perPage,
        search: search.value || undefined,
      }))

      rows.value = response.data as ApiKey[]
      pagination.value.total = Number(response.meta?.totalItems ?? rows.value.length)
      return rows.value
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      if (!options.silent) Notify.error(error.value)
      throw errorValue
    } finally {
      if (!options.silent) loading.value = false
    }
  }

  async function fetchCount() {
    try {
      const response = await runWithFallback<ApiKeyCountResponse>((service) => service.count())
      pagination.value.total = Number(response.count)
      return response.count
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      throw errorValue
    }
  }

  async function fetchIds() {
    try {
      const response = await runWithFallback<string[]>((service) => service.ids())
      ids.value = response.map(String)
      return ids.value
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      throw errorValue
    }
  }

  async function fetchItem(id: string) {
    busy.value = true
    error.value = null

    try {
      const response = await runWithFallback<ApiKey>((service) => service.getById(id))
      item.value = response
      return response
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      busy.value = false
    }
  }

  async function create(payload: CreateApiKeyPayload) {
    busy.value = true
    error.value = null

    try {
      const created = await runWithFallback<ApiKey>((service) => service.create(payload))
      Notify.success('Clé API créée.')
      await refreshRowsSafe()
      return created
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      busy.value = false
    }
  }

  async function update(id: string, payload: UpdateApiKeyPayload) {
    busy.value = true
    error.value = null

    try {
      const updated = await runWithFallback<ApiKey>((service) => service.update(id, payload))
      Notify.success('Clé API mise à jour.')
      await refreshRowsSafe()
      return updated
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      busy.value = false
    }
  }

  async function patch(id: string, payload: PatchApiKeyPayload) {
    busy.value = true
    error.value = null

    try {
      const patched = await runWithFallback<ApiKey>((service) => service.patch(id, payload))
      Notify.success('Clé API mise à jour.')
      await refreshRowsSafe()
      return patched
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      busy.value = false
    }
  }

  async function remove(id: string) {
    busy.value = true
    error.value = null

    try {
      await runWithFallback((service) => service.remove(id))
      Notify.success('Clé API supprimée.')
      if (item.value?.id === id) item.value = null
      await refreshRowsSafe()
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      busy.value = false
    }
  }

  async function refreshInventory() {
    loading.value = true
    error.value = null

    try {
      await Promise.all([fetchRows({ silent: true }), fetchCount(), fetchIds()])
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  function setPage(value: number) {
    pagination.value.page = value
  }

  function setPerPage(value: number) {
    pagination.value.perPage = value
    pagination.value.page = 1
  }

  function setSearch(value: string) {
    search.value = value
    pagination.value.page = 1
  }

  return {
    rows,
    item,
    ids,
    loading,
    busy,
    error,
    search,
    pagination,
    preferredVersion,
    activeVersion,
    refreshInventory,
    fetchRows,
    fetchCount,
    fetchIds,
    fetchItem,
    create,
    update,
    patch,
    remove,
    setPage,
    setPerPage,
    setSearch,
  }
})
