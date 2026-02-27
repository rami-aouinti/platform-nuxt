import {
  jobApplicationsService,
  type JobApplication,
  type CreateJobApplicationRequest,
  type UpdateJobApplicationRequest,
  type PatchJobApplicationRequest,
  type ApplyToJobOfferRequest,
} from '../../services/admin/job-applications/index'
import { HttpRequestError } from '../../services/http/client'
import {
  applicationStatusMeta,
  canWithdrawApplication,
  normalizeListQuery,
  toCollectionArray,
  type FilterSelection,
} from '../domain/offers/helpers'

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
  const forbidden = ref(false)
  const selectedId = ref('')

  const selectedFilters = ref<FilterSelection>({})
  const search = ref('')
  const sort = ref('id:desc')
  const pagination = ref({ page: 1, pageSize: 10 })

  const pageState = computed(() => {
    if (forbidden.value) return 'forbidden'
    if (error.value) return 'error'
    if (loading.value) return 'loading'
    if (!rows.value.length) return 'empty'
    return 'ready'
  })

  const statusCounters = computed(() =>
    rows.value.reduce(
      (acc, application) => {
        const key = application.status || 'pending'
        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      {
        pending: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0,
      } as Record<string, number>,
    ),
  )

  const mappedOffers = computed(() =>
    rows.value.map((row, index) => ({
      id: String(row.id),
      title: `Candidature #${row.id}`,
      company: String(row.jobOffer),
      matchingScore: 72 + (index % 3) * 8,
      location: 'Remote',
      salary: row.cvUrl ? 'CV joint' : 'Sans CV',
      tags: [row.status, row.coverLetter ? 'Lettre jointe' : 'Sans lettre'],
      status: applicationStatusMeta(row.status).label,
    })),
  )

  const selectedOffer = computed(
    () =>
      mappedOffers.value.find((offer) => offer.id === selectedId.value) ??
      mappedOffers.value[0],
  )

  async function fetchAll(query?: Record<string, string | number | undefined>) {
    loading.value = true
    error.value = null

    try {
      const response = await jobApplicationsService.list(query ?? {})
      rows.value = toCollectionArray<JobApplication>(response)
      return rows.value
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function fetchWithFilters() {
    loading.value = true
    error.value = null
    forbidden.value = false

    try {
      const response = await jobApplicationsService.list(
        normalizeListQuery({
          selectedFilters: selectedFilters.value,
          search: search.value,
          sort: sort.value,
          page: pagination.value.page,
          pageSize: pagination.value.pageSize,
        }),
      )

      rows.value = toCollectionArray<JobApplication>(response)
      const firstOffer = rows.value.at(0)
      if (!selectedId.value && firstOffer) selectedId.value = String(firstOffer.id)

      return rows.value
    } catch (errorValue) {
      if (errorValue instanceof HttpRequestError && errorValue.statusCode === 403) {
        forbidden.value = true
        return []
      }

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
      rows.value = [created, ...rows.value.filter((row) => row.id !== created.id)]
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
      rows.value = [created, ...rows.value.filter((row) => row.id !== created.id)]
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
      rows.value = rows.value.map((row) => (row.id === updated.id ? updated : row))
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
      rows.value = rows.value.map((row) => (row.id === patched.id ? patched : row))
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
      rows.value = rows.value.map((row) => (row.id === updated.id ? updated : row))
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
      rows.value = rows.value.map((row) => (row.id === updated.id ? updated : row))
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
      rows.value = rows.value.map((row) => (row.id === updated.id ? updated : row))
      return updated
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
      throw errorValue
    } finally {
      saving.value = false
    }
  }

  function canTransition(id: string, action: 'accept' | 'reject' | 'withdraw') {
    const row = rows.value.find((item) => String(item.id) === id)
    if (!row) return false

    if (action === 'withdraw') return canWithdrawApplication(row)
    return row.status === 'pending'
  }

  async function transition(id: string, action: 'accept' | 'reject' | 'withdraw') {
    if (!canTransition(id, action)) return null

    if (action === 'accept') return accept(id)
    if (action === 'reject') return reject(id)
    return withdraw(id)
  }

  return {
    rows,
    loading,
    saving,
    error,
    forbidden,
    selectedId,
    selectedFilters,
    search,
    sort,
    pagination,
    mappedOffers,
    selectedOffer,
    pageState,
    statusCounters,
    fetchAll,
    fetchWithFilters,
    fetchById,
    create,
    apply,
    update,
    patch,
    remove,
    accept,
    reject,
    withdraw,
    canTransition,
    transition,
  }
})
