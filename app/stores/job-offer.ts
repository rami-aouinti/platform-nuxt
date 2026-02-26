import {
  jobOffersService,
  listMyJobOffers,
  type JobOffer,
  type CreateJobOfferRequest,
  type UpdateJobOfferRequest,
  type PatchJobOfferRequest,
} from '../../services/admin/job-offers'
import { HttpRequestError } from '../../services/http/client'

function toJobOffersArray(payload: unknown): JobOffer[] {
  if (Array.isArray(payload)) return payload as JobOffer[]
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

  return Array.isArray(collection) ? (collection as JobOffer[]) : []
}

function toErrorMessage(error: unknown) {
  if (error instanceof HttpRequestError) return error.message
  if (error instanceof Error) return error.message
  return 'Erreur API.'
}

export const useJobOfferStore = defineStore('job-offer', () => {
  const rows = ref<JobOffer[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll(query?: Record<string, string | number | undefined>) {
    loading.value = true
    error.value = null

    try {
      const response = await jobOffersService.list(query ?? {})
      rows.value = toJobOffersArray(response)
      return rows.value
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function fetchMine(
    query?: Record<string, string | number | undefined>,
  ) {
    loading.value = true
    error.value = null

    try {
      const response = await listMyJobOffers(query ?? {})
      rows.value = response.data
      return rows.value
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    return jobOffersService.getById(id)
  }

  async function create(payload: CreateJobOfferRequest) {
    saving.value = true
    error.value = null

    try {
      const created = await jobOffersService.create(payload)
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

  async function update(id: string, payload: UpdateJobOfferRequest) {
    saving.value = true
    error.value = null

    try {
      const updated = await jobOffersService.update(id, payload)
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

  async function patch(id: string, payload: PatchJobOfferRequest) {
    saving.value = true
    error.value = null

    try {
      const patched = await jobOffersService.patch(id, payload)
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
      await jobOffersService.remove(id)
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
    fetchMine,
    fetchById,
    create,
    update,
    patch,
    remove,
  }
})
