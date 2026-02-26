import {
  jobApplicationsService,
  type JobApplication,
  type CreateJobApplicationRequest,
  type UpdateJobApplicationRequest,
  type PatchJobApplicationRequest,
  type ApplyToJobOfferRequest,
} from '../../services/admin/job-applications'
import { HttpRequestError } from '../../services/http/client'

function toApplicationsArray(payload: unknown): JobApplication[] {
  if (Array.isArray(payload)) return payload as JobApplication[]
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

  return Array.isArray(collection) ? (collection as JobApplication[]) : []
}

function toErrorMessage(error: unknown) {
  if (error instanceof HttpRequestError) return error.message
  if (error instanceof Error) return error.message
  return 'Erreur API.'
}

export const useJobApplicationStore = defineStore('job-application', () => {
  const rows = ref<JobApplication[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll(query?: Record<string, string | number | undefined>) {
    loading.value = true
    error.value = null

    try {
      const response = await jobApplicationsService.list(query ?? {})
      rows.value = toApplicationsArray(response)
      return rows.value
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    return jobApplicationsService.getById(id)
  }

  async function create(payload: CreateJobApplicationRequest) {
    saving.value = true
    error.value = null

    try {
      const created = await jobApplicationsService.create(payload)
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

  async function apply(jobOffer: string, payload: ApplyToJobOfferRequest = {}) {
    saving.value = true
    error.value = null

    try {
      const created = await jobApplicationsService.apply(jobOffer, payload)
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

  async function update(id: string, payload: UpdateJobApplicationRequest) {
    saving.value = true
    error.value = null

    try {
      const updated = await jobApplicationsService.update(id, payload)
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

  async function patch(id: string, payload: PatchJobApplicationRequest) {
    saving.value = true
    error.value = null

    try {
      const patched = await jobApplicationsService.patch(id, payload)
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
      await jobApplicationsService.remove(id)
      rows.value = rows.value.filter((row) => row.id !== id)
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
      throw errorValue
    } finally {
      saving.value = false
    }
  }

  async function accept(id: string) {
    saving.value = true
    error.value = null

    try {
      const updated = await jobApplicationsService.accept(id)
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

  async function reject(id: string) {
    saving.value = true
    error.value = null

    try {
      const updated = await jobApplicationsService.reject(id)
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

  async function withdraw(id: string) {
    saving.value = true
    error.value = null

    try {
      const updated = await jobApplicationsService.withdraw(id)
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

  return {
    rows,
    loading,
    saving,
    error,
    fetchAll,
    fetchById,
    create,
    apply,
    update,
    patch,
    remove,
    accept,
    reject,
    withdraw,
  }
})
