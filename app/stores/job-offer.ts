import {
  jobOffersService,
  listMyJobOffers,
  type JobOffer,
  type CreateJobOfferRequest,
  type UpdateJobOfferRequest,
  type PatchJobOfferRequest,
} from '../../services/admin/job-offers/index'
import { HttpRequestError } from '../../services/http/client'
import {
  asLabel,
  formatEmploymentType,
  formatRelativeDate,
  formatSalary,
  normalizeListQuery,
  resolveCompanyName,
  toCollectionArray,
  type FilterSelection,
} from '../domain/offers/helpers'

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
  const forbidden = ref(false)
  const selectedId = ref('')

  const selectedFilters = ref<FilterSelection>({})
  const search = ref('')
  const sort = ref('publishedAt:desc')
  const pagination = ref({ page: 1, pageSize: 10 })

  const pageState = computed(() => {
    if (forbidden.value) return 'forbidden'
    if (error.value) return 'error'
    if (loading.value) return 'loading'
    if (!rows.value.length) return 'empty'
    return 'ready'
  })

  const mappedOffers = computed(() =>
    rows.value.map((row, index) => ({
      id: String(row.id),
      title: row.title,
      company: resolveCompanyName(row),
      matchingScore: 76 + (index % 4) * 5,
      matchingLabel: 'Passt hervorragend',
      location:
        row.location ||
        [asLabel(row.city), asLabel(row.region)].filter(Boolean).join(', ') ||
        'Standort flexibel',
      workMode: row.remoteMode || formatEmploymentType(row),
      salary: formatSalary(row),
      publishedAtLabel: formatRelativeDate(row.publishedAt),
      tags: [
        asLabel(row.jobCategory),
        ...(row.skills || [])
          .slice(0, 2)
          .map((value) => asLabel(value))
          .filter(Boolean),
        ...(row.languages || [])
          .slice(0, 1)
          .map((value) => asLabel(value))
          .filter(Boolean),
      ].filter(Boolean) as string[],
      status: row.status === 'open' ? 'Offen' : row.status,
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
      const response = await jobOffersService.list(query ?? {})
      rows.value = toCollectionArray<JobOffer>(response)
      return rows.value
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function fetchMine(query?: Record<string, string | number | undefined>) {
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

  async function fetchWithFilters(mode: 'all' | 'mine' = 'all') {
    loading.value = true
    error.value = null
    forbidden.value = false

    try {
      const query = normalizeListQuery({
        selectedFilters: selectedFilters.value,
        search: search.value,
        sort: sort.value,
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        extraWhere: {
          ...(mode === 'all' ? { status: 'open' } : {}),
        },
      })

      const response =
        mode === 'mine'
          ? await listMyJobOffers(query)
          : await jobOffersService.list(query)

      rows.value = mode === 'mine' ? response.data : toCollectionArray<JobOffer>(response)

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
    return jobOffersService.getById(id)
  }

  async function create(payload: CreateJobOfferRequest) {
    saving.value = true
    error.value = null

    try {
      const created = await jobOffersService.create(payload)
      rows.value = [created, ...rows.value.filter((row) => row.id !== created.id)]
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
      rows.value = rows.value.map((row) => (row.id === updated.id ? updated : row))
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
    forbidden,
    selectedId,
    selectedFilters,
    search,
    sort,
    pagination,
    mappedOffers,
    selectedOffer,
    pageState,
    fetchAll,
    fetchMine,
    fetchWithFilters,
    fetchById,
    create,
    update,
    patch,
    remove,
  }
})
