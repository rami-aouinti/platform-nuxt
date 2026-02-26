import {
  companiesService,
  type Company,
  type CreateCompanyRequest,
  type UpdateCompanyRequest,
  type PatchCompanyRequest,
} from '../../services/admin/companies'
import { HttpRequestError } from '../../services/http/client'

function toCompaniesArray(payload: unknown): Company[] {
  if (Array.isArray(payload)) return payload as Company[]
  if (!payload || typeof payload !== 'object') return []

  const objectPayload = payload as {
    data?: unknown
    items?: unknown
    member?: unknown
    'hydra:member'?: unknown
  }

  const collection =
    objectPayload.data ??
    objectPayload.items ??
    objectPayload.member ??
    objectPayload['hydra:member']

  return Array.isArray(collection) ? (collection as Company[]) : []
}

function toErrorMessage(error: unknown) {
  if (error instanceof HttpRequestError) return error.message
  if (error instanceof Error) return error.message
  return 'Erreur API.'
}

export const useCompanyStore = defineStore('company', () => {
  const rows = ref<Company[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll(query?: Record<string, string | number | undefined>) {
    loading.value = true
    error.value = null

    try {
      const response = await companiesService.list(query ?? {})
      rows.value = toCompaniesArray(response)
      return rows.value
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    return companiesService.getById(id)
  }

  async function create(payload: CreateCompanyRequest) {
    saving.value = true
    error.value = null

    try {
      const created = await companiesService.create(payload)
      rows.value = [
        created,
        ...rows.value.filter((row) => row.id !== created.id),
      ]
      return created
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
      throw errorValue
    } finally {
      saving.value = false
    }
  }

  async function update(id: string, payload: UpdateCompanyRequest) {
    saving.value = true
    error.value = null

    try {
      const updated = await companiesService.update(id, payload)
      rows.value = rows.value.map((row) =>
        row.id === updated.id ? updated : row,
      )
      return updated
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
      throw errorValue
    } finally {
      saving.value = false
    }
  }

  async function patch(id: string, payload: PatchCompanyRequest) {
    saving.value = true
    error.value = null

    try {
      const patched = await companiesService.patch(id, payload)
      rows.value = rows.value.map((row) =>
        row.id === patched.id ? patched : row,
      )
      return patched
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
      throw errorValue
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string) {
    saving.value = true
    error.value = null

    try {
      await companiesService.remove(id)
      rows.value = rows.value.filter((row) => row.id !== id)
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
      throw errorValue
    } finally {
      saving.value = false
    }
  }

  return {
    rows,
    loading,
    saving,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    patch,
    remove,
  }
})
